import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateProgressLogDto } from './dto/create-progress-log.dto';
import { UpdateProgressLogDto } from './dto/update-progress-log.dto';
import { ListProgressLogsDto } from './dto/list-progress-logs.dto';
import { Role } from '@prisma/client';

@Injectable()
export class ProgressLogsService {
  constructor(private prisma: PrismaService) {}

  // ─── Employee: Create progress log ─────────────────────────────────────────
  async createProgressLog(dto: CreateProgressLogDto, userId: string) {
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
      throw new BadRequestException('Not assigned to this project');
    }

    // Create progress log
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const progressLog = await this.prisma.progressLog.create({
      data: {
        userId,
        projectId: dto.projectId,
        title: dto.title,
        description: dto.description,
        workStage: dto.workStage || '',
        date: today,
      },
      select: {
        id: true,
        userId: true,
        projectId: true,
        title: true,
        description: true,
        workStage: true,
        date: true,
        createdAt: true,
      },
    });

    return progressLog;
  }

  // ─── Employee: Get own progress logs ────────────────────────────────────────
  async getMyProgressLogs(query: ListProgressLogsDto, userId: string) {
    const { projectId, startDate, endDate, page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    const where: any = {
      userId,
    };

    if (projectId) where.projectId = projectId;

    if (startDate) {
      where.date = { ...where.date, gte: new Date(startDate) };
    }

    if (endDate) {
      where.date = { ...where.date, lte: new Date(endDate) };
    }

    const [logs, total] = await this.prisma.$transaction([
      this.prisma.progressLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { date: 'desc' },
        select: {
          id: true,
          userId: true,
          projectId: true,
          title: true,
          description: true,
          workStage: true,
          date: true,
          createdAt: true,
          project: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      }),
      this.prisma.progressLog.count({ where }),
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

  // ─── Admin: List all progress logs ──────────────────────────────────────────
  async listProgressLogs(query: ListProgressLogsDto) {
    const { userId, projectId, startDate, endDate, page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (userId) where.userId = userId;
    if (projectId) where.projectId = projectId;

    if (startDate) {
      where.date = { ...where.date, gte: new Date(startDate) };
    }

    if (endDate) {
      where.date = { ...where.date, lte: new Date(endDate) };
    }

    const [logs, total] = await this.prisma.$transaction([
      this.prisma.progressLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { date: 'desc' },
        select: {
          id: true,
          title: true,
          description: true,
          workStage: true,
          date: true,
          createdAt: true,
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              employeeCode: true,
            },
          },
          project: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      }),
      this.prisma.progressLog.count({ where }),
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

  // ─── Get one progress log (role-aware) ──────────────────────────────────────
  async getProgressLogById(id: string, userId: string, userRole: string) {
    const log = await this.prisma.progressLog.findUnique({
      where: { id },
      select: {
        id: true,
        userId: true,
        projectId: true,
        title: true,
        description: true,
        workStage: true,
        date: true,
        createdAt: true,
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            employeeCode: true,
          },
        },
        project: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!log) throw new NotFoundException('Progress log not found');

    // EMPLOYEE: can only access their own log
    if (userRole === Role.EMPLOYEE && log.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return log;
  }

  // ─── Employee: Update own progress log ──────────────────────────────────────
  async updateProgressLog(id: string, dto: UpdateProgressLogDto, userId: string) {
    const log = await this.prisma.progressLog.findUnique({
      where: { id },
    });

    if (!log) throw new NotFoundException('Progress log not found');

    // Employee can only update their own log
    if (log.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    const updated = await this.prisma.progressLog.update({
      where: { id },
      data: {
        title: dto.title,
        description: dto.description,
        workStage: dto.workStage,
      },
      select: {
        id: true,
        userId: true,
        projectId: true,
        title: true,
        description: true,
        workStage: true,
        date: true,
        createdAt: true,
      },
    });

    return updated;
  }
}
