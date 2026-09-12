import {
  Injectable,
  UnauthorizedException,
  ForbiddenException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import * as argon2 from 'argon2';
import { v4 as uuidv4 } from 'uuid';
import { createHash, randomBytes } from 'crypto';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
    private emailService: EmailService,
  ) {}

  async login(dto: LoginDto) {
    // 1. Find user by email
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    // 2. Verify password — same error message for both cases (timing-safe)
    const passwordValid =
      user?.passwordHash
        ? await argon2.verify(user.passwordHash, dto.password)
        : false;

    if (!user || !passwordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // 3. Check account status
    if (user.status !== 'ACTIVE') {
      throw new ForbiddenException('Account is not active');
    }

    // 4. Issue tokens
    const tokens = await this.issueTokens(user.id, user.email, user.role, user.mustChangePassword);

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        employeeCode: user.employeeCode,
        mustChangePassword: user.mustChangePassword,
      },
    };
  }

  async refresh(userId: string, refreshToken: string) {
    const stored = await this.prisma.refreshToken.findFirst({
      where: {
        userId,
        revokedAt: null,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!stored) {
      // Possible token reuse — revoke entire family
      await this.prisma.refreshToken.updateMany({
        where: { userId },
        data: { revokedAt: new Date() },
      });
      throw new UnauthorizedException('Invalid refresh token');
    }

    const tokenMatches = await argon2.verify(stored.tokenHash, refreshToken);
    if (!tokenMatches) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // Revoke the used token
    await this.prisma.refreshToken.update({
      where: { id: stored.id },
      data: { revokedAt: new Date() },
    });

    // Get fresh user data
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.status !== 'ACTIVE') {
      throw new ForbiddenException('Account is not active');
    }

    return this.issueTokens(user.id, user.email, user.role, user.mustChangePassword);
  }

  async logout(userId: string) {
    await this.prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
    return { message: 'Logged out successfully' };
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user?.passwordHash) {
      throw new BadRequestException('No password set for this account');
    }

    const currentValid = await argon2.verify(user.passwordHash, dto.currentPassword);
    if (!currentValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    if (dto.currentPassword === dto.newPassword) {
      throw new BadRequestException('New password must differ from current password');
    }

    const newHash = await argon2.hash(dto.newPassword);

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: userId },
        data: { passwordHash: newHash, mustChangePassword: false },
      }),
      // Revoke all refresh tokens (password change = full re-login)
      this.prisma.refreshToken.updateMany({
        where: { userId, revokedAt: null },
        data: { revokedAt: new Date() },
      }),
    ]);

    return { message: 'Password changed successfully' };
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    // Always return the same generic response to prevent email enumeration
    const genericResponse = {
      message:
        'If an admin account exists for this email, reset instructions have been sent.',
    };

    // 1. Normalize email (already done by DTO transformer)
    const email = dto.email;

    // 2. Look up user by email
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    // 3. Return generic response if no user found
    if (!user) {
      return genericResponse;
    }

    // 4. Return generic response if not an ADMIN
    if (user.role !== 'ADMIN') {
      return genericResponse;
    }

    // 5. Return generic response if not ACTIVE
    if (user.status !== 'ACTIVE') {
      return genericResponse;
    }

    // User is a valid ACTIVE ADMIN — proceed with password reset

    try {
      // 6. Invalidate all existing unused reset tokens for this user
      await this.prisma.passwordResetToken.deleteMany({
        where: {
          userId: user.id,
          usedAt: null,
        },
      });

      // 7. Generate cryptographically secure random reset token (256 bits)
      const rawToken = randomBytes(32).toString('base64url');

      // 8. Hash the token for database storage using SHA-256
      const tokenHash = createHash('sha256').update(rawToken).digest('hex');

      // 9. Set expiration to 20 minutes from now
      const expiresAt = new Date(Date.now() + 20 * 60 * 1000);

      // Store the hashed token in the database
      await this.prisma.passwordResetToken.create({
        data: {
          userId: user.id,
          tokenHash,
          expiresAt,
        },
      });

      // 10. Build the reset URL
      // Using deep link custom scheme for mobile app
      const resetUrl = `asassociates://reset-password?token=${rawToken}`;

      // 11. Send password reset email
      await this.emailService.sendPasswordResetEmail(
        user.email,
        resetUrl,
        20, // expires in 20 minutes
        user.firstName,
      );

      this.logger.log('Password reset email sent for admin account');
    } catch (error) {
      // 12. If email delivery fails, log server-side but still return generic response
      this.logger.error(
        'Password reset email delivery failed',
        error instanceof Error ? error.message : 'Unknown error',
      );
      // Do not expose failure to client
    }

    // Always return generic response
    return genericResponse;
  }

  async resetPassword(dto: ResetPasswordDto) {
    // Step 1: Hash the incoming token to compare with database
    const tokenHash = createHash('sha256').update(dto.token).digest('hex');

    // Step 2: Find the reset token record
    const resetToken = await this.prisma.passwordResetToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });

    // Generic error for all invalid/expired/used token scenarios
    const invalidTokenError = new BadRequestException(
      'Invalid or expired reset token',
    );

    // Step 2: Validate token existence
    if (!resetToken) {
      throw invalidTokenError;
    }

    // Step 3: Validate single-use (token not already used)
    if (resetToken.usedAt !== null) {
      throw invalidTokenError;
    }

    // Step 4: Validate expiration
    if (resetToken.expiresAt <= new Date()) {
      throw invalidTokenError;
    }

    // Step 5: Load and validate the user
    const user = resetToken.user;

    if (!user) {
      throw invalidTokenError;
    }

    if (user.role !== 'ADMIN') {
      throw invalidTokenError;
    }

    if (user.status !== 'ACTIVE') {
      throw invalidTokenError;
    }

    // Step 6: Hash the new password using Argon2 (same as existing implementation)
    const newPasswordHash = await argon2.hash(dto.newPassword);

    // Step 9: Perform all security-critical writes in a single transaction
    const results = await this.prisma.$transaction([
      // Update user's password and clear mustChangePassword flag
      this.prisma.user.update({
        where: { id: user.id },
        data: {
          passwordHash: newPasswordHash,
          mustChangePassword: false,
        },
      }),
      // Mark the reset token as used - ONLY if it is still unused (concurrency-safe)
      // This conditional update atomically enforces single-use at the database level
      this.prisma.passwordResetToken.updateMany({
        where: {
          id: resetToken.id,
          usedAt: null, // Only update if still unused
        },
        data: { usedAt: new Date() },
      }),
      // Revoke all refresh tokens (invalidate all existing sessions)
      this.prisma.refreshToken.updateMany({
        where: { userId: user.id, revokedAt: null },
        data: { revokedAt: new Date() },
      }),
    ]);

    // Step 10: Verify the token was actually marked as used
    // If count is 0, another concurrent request already consumed this token
    const tokenUpdateCount = results[1].count;
    if (tokenUpdateCount === 0) {
      throw invalidTokenError;
    }

    this.logger.log('Admin password reset completed');

    return {
      message: 'Password reset successful. Please log in.',
    };
  }

  private async issueTokens(
    userId: string,
    email: string,
    role: string,
    mustChangePassword: boolean,
  ) {
    const payload = { sub: userId, email, role, mustChangePassword };

    const accessToken = this.jwt.sign(payload, {
      secret: this.config.get('JWT_ACCESS_SECRET'),
      expiresIn: this.config.get('JWT_ACCESS_EXPIRES_IN') ?? '15m',
    });

    const refreshTokenPlain = uuidv4();
    const refreshTokenHash = await argon2.hash(refreshTokenPlain);

    await this.prisma.refreshToken.create({
      data: {
        userId,
        tokenHash: refreshTokenHash,
        familyId: uuidv4(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return { accessToken, refreshToken: refreshTokenPlain };
  }
}
