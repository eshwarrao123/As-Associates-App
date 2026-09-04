import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ClockInDto } from './dto/clock-in.dto';
import { ListAttendanceDto } from './dto/list-attendance.dto';
import { Role } from '@prisma/client';

@Injectable()
export class AttendanceService {
  constructor(private prisma: PrismaService) {}

  // ─── Employee: Clock in ─────────────────────────────────────────────────────
  async clockIn(dto: ClockInDto, userId: string) {
    // Validate project exists
    const project = await this.prisma.project.findUnique({
      where: { id: dto.projectId },
    });
    if (!project) throw new NotFoundException('Project not found');

    // Validate employee has active assignment on this project
    const assignment = await this.prisma.assignment.findUnique({
      where: {
        userId_projectId: {
          userId,
          projectId: dto.projectId,
        },
      },
    });

    if (!assignment || !assignment.isActive) {
      throw new BadRequestException(
        'You are not assigned to this project',
      );
    }

    // Check if already clocked in today
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);

    const existingLog = await this.prisma.attendanceLog.findFirst({
      where: {
        userId,
        date: {
          gte: today,
          lt: tomorrow,
        },
      },
    });

    if (existingLog) {
      throw new BadRequestException('Already clocked in today');
    }

    // Create attendance log
    const attendanceLog = await this.prisma.attendanceLog.create({
      data: {
        userId,
        date: today,
        checkInTime: new Date(),
        status: 'PRESENT',
      },
      select: {
        id: true,
        userId: true,
        date: true,
        checkInTime: true,
        checkOutTime: true,
        status: true,
        createdAt: true,
      },
    });

    return attendanceLog;
  }

  // ─── Employee: Clock out ────────────────────────────────────────────────────
  async clockOut(userId: string) {
    // Find today's attendance log with no checkout
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);

    const attendanceLog = await this.prisma.attendanceLog.findFirst({
      where: {
        userId,
        date: {
          gte: today,
          lt: tomorrow,
        },
        checkOutTime: null,
      },
    });

    if (!attendanceLog) {
      throw new BadRequestException('No active clock-in found for today');
    }

    // Update with checkout time
    const updated = await this.prisma.attendanceLog.update({
      where: { id: attendanceLog.id },
      data: {
        checkOutTime: new Date(),
      },
      select: {
        id: true,
        userId: true,
        date: true,
        checkInTime: true,
        checkOutTime: true,
        status: true,
        createdAt: true,
      },
    });

    return updated;
  }

  // ─── Employee: Get own attendance logs ──────────────────────────────────────
  async getMyAttendance(query: ListAttendanceDto, userId: string) {
    const { startDate, endDate, projectId, page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    const where: any = {
      userId,
    };

    if (startDate) {
      where.date = { ...where.date, gte: new Date(startDate) };
    }

    if (endDate) {
      where.date = { ...where.date, lte: new Date(endDate) };
    }

    const [logs, total] = await this.prisma.$transaction([
      this.prisma.attendanceLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { date: 'desc' },
        select: {
          id: true,
          userId: true,
          date: true,
          checkInTime: true,
          checkOutTime: true,
          status: true,
          createdAt: true,
        },
      }),
      this.prisma.attendanceLog.count({ where }),
    ]);

    return {
      data: logs,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // ─── Admin: List all attendance logs ────────────────────────────────────────
  async listAttendance(query: ListAttendanceDto) {
    const { userId, projectId, startDate, endDate, status, page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (userId) where.userId = userId;
    if (status) where.status = status;

    if (startDate) {
      where.date = { ...where.date, gte: new Date(startDate) };
    }

    if (endDate) {
      where.date = { ...where.date, lte: new Date(endDate) };
    }

    const [logs, total] = await this.prisma.$transaction([
      this.prisma.attendanceLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { date: 'desc' },
        select: {
          id: true,
          date: true,
          checkInTime: true,
          checkOutTime: true,
          status: true,
          createdAt: true,
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              employeeCode: true,
            },
          },
        },
      }),
      this.prisma.attendanceLog.count({ where }),
    ]);

    return {
      data: logs,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // ─── Get one attendance log (role-aware) ────────────────────────────────────
  async getAttendanceById(id: string, userId: string, userRole: string) {
    const log = await this.prisma.attendanceLog.findUnique({
      where: { id },
      select: {
        id: true,
        userId: true,
        date: true,
        checkInTime: true,
        checkOutTime: true,
        status: true,
        latitude: true,
        longitude: true,
        createdAt: true,
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            employeeCode: true,
          },
        },
      },
    });

    if (!log) throw new NotFoundException('Attendance log not found');

    // EMPLOYEE: can only access their own log
    if (userRole === Role.EMPLOYEE && log.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return log;
  }
}
