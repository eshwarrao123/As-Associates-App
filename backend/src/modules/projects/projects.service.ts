import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { ListProjectsDto } from './dto/list-projects.dto';
import { Role } from '@prisma/client';

@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService) {}

  // ─── Admin: Create project ──────────────────────────────────────────────────
  async createProject(dto: CreateProjectDto, createdById: string) {
    const project = await this.prisma.project.create({
      data: {
        name: dto.name,
        description: dto.description,
        location: dto.location || '',
        clientName: '',
        status: 'ONGOING',
        startDate: dto.startDate || new Date(),
        endDate: dto.endDate,
      },
      select: {
        id: true,
        name: true,
        description: true,
        location: true,
        status: true,
        startDate: true,
        endDate: true,
        createdAt: true,
      },
    });

    return project;
  }

  // ─── List projects (role-aware) ─────────────────────────────────────────────
  async listProjects(query: ListProjectsDto, userId: string, userRole: string) {
    const { status, search, page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (status) where.status = status;

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { location: { contains: search, mode: 'insensitive' } },
      ];
    }

    // EMPLOYEE: only projects they are assigned to
    if (userRole === Role.EMPLOYEE) {
      where.assignments = {
        some: {
          userId,
          isActive: true,
        },
      };
    }

    const [projects, total] = await this.prisma.$transaction([
      this.prisma.project.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          description: true,
          location: true,
          status: true,
          startDate: true,
          endDate: true,
          createdAt: true,
          _count: {
            select: { assignments: { where: { isActive: true } } },
          },
        },
      }),
      this.prisma.project.count({ where }),
    ]);

    return {
      data: projects,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // ─── Get one project (role-aware) ───────────────────────────────────────────
  async getProjectById(id: string, userId: string, userRole: string) {
    const project = await this.prisma.project.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        description: true,
        location: true,
        status: true,
        startDate: true,
        endDate: true,
        clientName: true,
        createdAt: true,
        updatedAt: true,
        assignments: {
          where: { isActive: true },
          select: {
            id: true,
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
        },
      },
    });

    if (!project) throw new NotFoundException('Project not found');

    // EMPLOYEE: check if assigned
    if (userRole === Role.EMPLOYEE) {
      const isAssigned = project.assignments.some((a: any) => a.user.id === userId);
      if (!isAssigned) {
        throw new ForbiddenException('Access denied');
      }
    }

    return project;
  }

  // ─── Admin: Update project ──────────────────────────────────────────────────
  async updateProject(id: string, dto: UpdateProjectDto) {
    const existing = await this.prisma.project.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Project not found');

    const updated = await this.prisma.project.update({
      where: { id },
      data: {
        name: dto.name,
        description: dto.description,
        location: dto.location,
        status: dto.status,
        startDate: dto.startDate,
        endDate: dto.endDate,
      },
      select: {
        id: true,
        name: true,
        description: true,
        location: true,
        status: true,
        startDate: true,
        endDate: true,
        updatedAt: true,
      },
    });

    return updated;
  }

  // ─── Admin: Cancel project (soft delete) ────────────────────────────────────
  async cancelProject(id: string) {
    const existing = await this.prisma.project.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Project not found');

    await this.prisma.project.update({
      where: { id },
      data: { status: 'COMPLETED' },
    });

    return { message: 'Project cancelled successfully' };
  }
}
