import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateRequestDto } from './dto/create-request.dto';
import { UpdateRequestDto } from './dto/update-request.dto';
import { ListRequestsDto } from './dto/list-requests.dto';
import { Role } from '@prisma/client';

@Injectable()
export class RequestsService {
  constructor(private prisma: PrismaService) {}

  // ─── Employee: Create request ───────────────────────────────────────────────
  async createRequest(dto: CreateRequestDto, userId: string) {
    // Validate project exists
    const project = await this.prisma.project.findUnique({
      where: { id: dto.projectId },
    });
    if (!project) throw new NotFoundException('Project not found');

    // Validate employee has active assignment on this project
    const assignment = await this.prisma.assignment.findFirst({
      where: {
        userId,
        projectId: dto.projectId,
        isActive: true,
      },
    });
    if (!assignment) {
      throw new BadRequestException('Not assigned to this project');
    }

    const request = await this.prisma.request.create({
      data: {
        userId,
        projectId: dto.projectId,
        type: dto.type,
        priority: dto.priority ?? 'MEDIUM',
        status: 'PENDING',
        subject: dto.subject,
        description: dto.description,
      },
      select: {
        id: true,
        userId: true,
        projectId: true,
        type: true,
        priority: true,
        status: true,
        subject: true,
        description: true,
        reviewNote: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return request;
  }

  // ─── Employee: Get own requests ─────────────────────────────────────────────
  async getMyRequests(query: ListRequestsDto, userId: string) {
    const { projectId, status, page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    const where: any = { userId };

    if (projectId) where.projectId = projectId;
    if (status) where.status = status;

    const [requests, total] = await this.prisma.$transaction([
      this.prisma.request.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          type: true,
          priority: true,
          status: true,
          subject: true,
          description: true,
          reviewNote: true,
          createdAt: true,
          updatedAt: true,
          project: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      }),
      this.prisma.request.count({ where }),
    ]);

    return {
      data: requests,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // ─── Admin: List all requests ───────────────────────────────────────────────
  async listRequests(query: ListRequestsDto) {
    const { userId, projectId, status, type, page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (userId) where.userId = userId;
    if (projectId) where.projectId = projectId;
    if (status) where.status = status;
    if (type) where.type = type;

    const [requests, total] = await this.prisma.$transaction([
      this.prisma.request.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          type: true,
          priority: true,
          status: true,
          subject: true,
          description: true,
          reviewNote: true,
          reviewedAt: true,
          createdAt: true,
          updatedAt: true,
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
      this.prisma.request.count({ where }),
    ]);

    return {
      data: requests,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // ─── Get one request (role-aware) ───────────────────────────────────────────
  async getRequestById(id: string, userId: string, userRole: string) {
    const request = await this.prisma.request.findUnique({
      where: { id },
      select: {
        id: true,
        userId: true,
        type: true,
        priority: true,
        status: true,
        subject: true,
        description: true,
        reviewNote: true,
        reviewedAt: true,
        createdAt: true,
        updatedAt: true,
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
            location: true,
          },
        },
        reviewedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!request) throw new NotFoundException('Request not found');

    // EMPLOYEE: can only access their own request
    if (userRole === Role.EMPLOYEE && request.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return request;
  }

  // ─── Admin: Update request status ──────────────────────────────────────────
  async updateRequestStatus(
    id: string,
    dto: UpdateRequestDto,
    adminId: string,
  ) {
    const existing = await this.prisma.request.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Request not found');

    const updated = await this.prisma.request.update({
      where: { id },
      data: {
        status: dto.status,
        reviewNote: dto.reviewNote,
        reviewedById: adminId,
        reviewedAt: new Date(),
      },
      select: {
        id: true,
        userId: true,
        type: true,
        priority: true,
        status: true,
        subject: true,
        description: true,
        reviewNote: true,
        reviewedAt: true,
        updatedAt: true,
        reviewedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return updated;
  }
}
