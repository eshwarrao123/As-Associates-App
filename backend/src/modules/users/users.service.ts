import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateMeDto } from './dto/update-me.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { ListUsersDto } from './dto/list-users.dto';
import { UserStatus } from '@prisma/client';
import * as argon2 from 'argon2';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

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
          photoUrl: true,
          createdAt: true,
          _count: {
            select: { assignments: true },
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
            attendanceLogs: true,
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
        photoUrl: true,
        mustChangePassword: true,
        createdAt: true,
        _count: {
          select: {
            assignments: { where: { isActive: true } },
            attendanceLogs: true,
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
}
