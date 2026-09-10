import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateMeDto } from './dto/update-me.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { ListUsersDto } from './dto/list-users.dto';
import { UserStatus } from '@prisma/client';
import * as argon2 from 'argon2';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    @Inject('CLOUDINARY') private cloudinaryConfig: any,
  ) {}

  // ─── Employee code generator ───────────────────────────────────────────────
  private async generateEmployeeCode(): Promise<string> {
    const year = new Date().getFullYear();
    const count = await this.prisma.user.count({
      where: { role: 'EMPLOYEE' },
    });
    const seq = String(count + 1).padStart(3, '0');
    return `ASA-${year}-${seq}`;
  }

  // ─── Admin: Create employee ─────────────────────────────────────────────────
  async createEmployee(dto: CreateUserDto, createdById: string) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existing) {
      throw new ConflictException('An account with this email already exists');
    }

    const employeeCode = await this.generateEmployeeCode();

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        firstName: dto.firstName,
        lastName: dto.lastName,
        phone: dto.phone,
        designation: dto.designation,
        role: 'EMPLOYEE',
        status: 'PENDING',
        employeeCode,
        mustChangePassword: true,
        createdById,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        status: true,
        employeeCode: true,
        phone: true,
        designation: true,
        createdAt: true,
      },
    });

    return user;
  }

  // ─── Admin: List employees ──────────────────────────────────────────────────
  async listUsers(query: ListUsersDto) {
    const { status, search, page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    const where: any = {
      role: 'EMPLOYEE',
    };

    if (status) where.status = status;

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { employeeCode: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Calculate current month date range (UTC)
    const now = new Date();
    const currentMonthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
    const currentMonthEnd = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0, 23, 59, 59, 999));

    const [users, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          status: true,
          employeeCode: true,
          phone: true,
          designation: true,
          photoUrl: true,
          createdAt: true,
          _count: {
            select: {
              assignments: true,
              attendanceLogs: {
                where: {
                  AND: [
                    {
                      OR: [
                        { status: 'PRESENT' },
                        { status: 'HALF_DAY' },
                      ],
                    },
                    {
                      date: {
                        gte: currentMonthStart,
                        lte: currentMonthEnd,
                      },
                    },
                  ],
                },
              },
            },
          },
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data: users,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // ─── Admin: Get one employee ────────────────────────────────────────────────
  async getUserById(id: string) {
    // Calculate current month date range (UTC)
    const now = new Date();
    const currentMonthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
    const currentMonthEnd = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0, 23, 59, 59, 999));

    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        status: true,
        employeeCode: true,
        phone: true,
        designation: true,
        photoUrl: true,
        mustChangePassword: true,
        createdAt: true,
        updatedAt: true,
        assignments: {
          where: { isActive: true },
          select: {
            project: {
              select: {
                id: true,
                name: true,
                status: true,
              },
            },
          },
        },
        _count: {
          select: {
            assignments: { where: { isActive: true } },
            attendanceLogs: {
              where: {
                AND: [
                  {
                    OR: [
                      { status: 'PRESENT' },
                      { status: 'HALF_DAY' },
                    ],
                  },
                  {
                    date: {
                      gte: currentMonthStart,
                      lte: currentMonthEnd,
                    },
                  },
                ],
              },
            },
            progressLogs: true,
            uploads: true,
          },
        },
      },
    });

    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  // ─── Admin: Update employee status ─────────────────────────────────────────
  async updateStatus(id: string, dto: UpdateStatusDto, adminId: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    if (user.role === 'ADMIN') {
      throw new BadRequestException('Cannot change status of an admin account');
    }

    // Validate allowed transitions
    const allowedTransitions: Record<UserStatus, UserStatus[]> = {
      PENDING: ['ACTIVE'],
      ACTIVE: ['DEACTIVATED'],
      DEACTIVATED: ['ACTIVE'],
    };

    if (!allowedTransitions[user.status].includes(dto.status)) {
      throw new BadRequestException(
        `Cannot transition from ${user.status} to ${dto.status}`,
      );
    }

    let tempCredential: string | undefined;
    let updateData: any = { status: dto.status };

    // When activating a PENDING account — generate temp password
    if (user.status === 'PENDING' && dto.status === 'ACTIVE') {
      tempCredential = `ASA-${uuidv4().split('-')[0].toUpperCase()}`;
      const tempHash = await argon2.hash(tempCredential);
      updateData.passwordHash = tempHash;
      updateData.mustChangePassword = true;
    }

    // When deactivating — revoke all refresh tokens
    if (dto.status === 'DEACTIVATED') {
      await this.prisma.refreshToken.updateMany({
        where: { userId: id, revokedAt: null },
        data: { revokedAt: new Date() },
      });
    }

    const updated = await this.prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        status: true,
        employeeCode: true,
      },
    });

    return {
      ...updated,
      ...(tempCredential && {
        tempCredential,
        message:
          'Share this temporary password with the employee. They must change it on first login.',
      }),
    };
  }

  // ─── Employee: Get own profile ──────────────────────────────────────────────
  async getMe(userId: string) {
    // Calculate current month date range (UTC)
    const now = new Date();
    const currentMonthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
    const currentMonthEnd = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0, 23, 59, 59, 999));

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        status: true,
        employeeCode: true,
        phone: true,
        designation: true,
        photoUrl: true,
        mustChangePassword: true,
        createdAt: true,
        _count: {
          select: {
            assignments: { where: { isActive: true } },
            attendanceLogs: {
              where: {
                AND: [
                  {
                    OR: [
                      { status: 'PRESENT' },
                      { status: 'HALF_DAY' },
                    ],
                  },
                  {
                    date: {
                      gte: currentMonthStart,
                      lte: currentMonthEnd,
                    },
                  },
                ],
              },
            },
            progressLogs: true,
            uploads: true,
          },
        },
      },
    });

    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  // ─── Employee: Update own profile ──────────────────────────────────────────
  async updateMe(userId: string, dto: UpdateMeDto) {
    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: {
        phone: dto.phone,
        photoUrl: dto.photoUrl,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        photoUrl: true,
      },
    });
    return updated;
  }

  // ─── Employee: Upload profile photo ─────────────────────────────────────────
  async uploadProfilePhoto(file: Express.Multer.File, userId: string) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    // Validate file type
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        'Invalid file type. Allowed: JPEG, PNG, WebP',
      );
    }

    // Validate file size (5MB limit for profile photos)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new BadRequestException('File size exceeds 5MB limit');
    }

    // Configure Cloudinary
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { v2: cloudinaryV2 } = require('cloudinary');
    cloudinaryV2.config(this.cloudinaryConfig);

    // Upload to Cloudinary in a dedicated profile folder
    const result: any = await new Promise((resolve, reject) => {
      const stream = cloudinaryV2.uploader.upload_stream(
        {
          folder: `as-associates/profiles`,
          resource_type: 'image',
          transformation: [
            { width: 400, height: 400, crop: 'fill', gravity: 'face' },
          ],
        },
        (error: any, res: any) => {
          if (error) reject(error);
          else resolve(res);
        },
      );
      stream.end(file.buffer);
    });

    // Get user's old photo URL to potentially delete
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { photoUrl: true },
    });

    // Update user's photoUrl in database
    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: { photoUrl: result.secure_url },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        photoUrl: true,
      },
    });

    // Optionally delete old photo from Cloudinary
    if (user?.photoUrl && user.photoUrl.includes('cloudinary.com')) {
      try {
        const urlParts = user.photoUrl.split('/');
        const uploadIndex = urlParts.indexOf('upload');
        if (uploadIndex !== -1 && uploadIndex < urlParts.length - 1) {
          const pathAfterUpload = urlParts.slice(uploadIndex + 2).join('/');
          const publicIdWithExt = pathAfterUpload.split('.')[0];
          await cloudinaryV2.uploader.destroy(publicIdWithExt);
        }
      } catch {
        // Log but don't fail — DB record is already updated
      }
    }

    return updated;
  }

  // ─── Admin: Update employee ─────────────────────────────────────────────────
  async updateUser(id: string, dto: UpdateUserDto) {
    const existing = await this.prisma.user.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('User not found');

    // Check email uniqueness if email is being changed
    if (dto.email && dto.email !== existing.email) {
      const emailTaken = await this.prisma.user.findUnique({
        where: { email: dto.email },
      });
      if (emailTaken) {
        throw new ConflictException('Email is already in use');
      }
    }

    const updated = await this.prisma.user.update({
      where: { id },
      data: {
        firstName: dto.firstName,
        lastName: dto.lastName,
        phone: dto.phone,
        email: dto.email,
        designation: dto.designation,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        status: true,
        employeeCode: true,
        phone: true,
        designation: true,
        photoUrl: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return updated;
  }
}
