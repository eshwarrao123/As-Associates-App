import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AssignEmployeeDto } from './dto/assign-employee.dto';
import { UpdateAssignmentDto } from './dto/update-assignment.dto';
import { Role } from '@prisma/client';

@Injectable()
export class AssignmentsService {
  constructor(private prisma: PrismaService) {}

  // ─── Admin: Assign employee to project ──────────────────────────────────────
  async assignEmployee(
    projectId: string,
    dto: AssignEmployeeDto,
    assignedById: string,
  ) {
    // Validate project exists and is not COMPLETED
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });
    if (!project) throw new NotFoundException('Project not found');
    if (project.status === 'COMPLETED') {
      throw new BadRequestException('Cannot assign to a completed project');
    }

    // Validate user exists, is EMPLOYEE, and is ACTIVE
    const user = await this.prisma.user.findUnique({
      where: { id: dto.userId },
    });
    if (!user) throw new NotFoundException('User not found');
    if (user.role !== Role.EMPLOYEE) {
      throw new BadRequestException('Only employees can be assigned to projects');
    }
    if (user.status !== 'ACTIVE') {
      throw new BadRequestException('Cannot assign inactive employee');
    }

    // Check for existing active assignment
    const existingAssignment = await this.prisma.assignment.findUnique({
      where: {
        userId_projectId: {
          userId: dto.userId,
          projectId,
        },
      },
    });

    if (existingAssignment && existingAssignment.isActive) {
      throw new BadRequestException('Employee already assigned to this project');
    }

    // Create or reactivate assignment
    const assignment = await this.prisma.assignment.upsert({
      where: {
        userId_projectId: {
          userId: dto.userId,
          projectId,
        },
      },
      update: {
        isActive: true,
        unassignedAt: null,
      },
      create: {
        userId: dto.userId,
        projectId,
        assignedById,
        isActive: true,
      },
      select: {
        id: true,
        isActive: true,
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

    return assignment;
  }

  // ─── List project assignments (role-aware) ──────────────────────────────────
  async listAssignments(projectId: string, userId: string, userRole: string) {
    // Validate project exists
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });
    if (!project) throw new NotFoundException('Project not found');

    // EMPLOYEE: check if assigned
    if (userRole === Role.EMPLOYEE) {
      const isAssigned = await this.prisma.assignment.findFirst({
        where: {
          projectId,
          userId,
          isActive: true,
        },
      });
      if (!isAssigned) {
        throw new ForbiddenException('Access denied');
      }
    }

    const assignments = await this.prisma.assignment.findMany({
      where: {
        projectId,
        isActive: true,
      },
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
      orderBy: { createdAt: 'desc' },
    });

    return assignments;
  }

  // ─── Admin: Update assignment ───────────────────────────────────────────────
  async updateAssignment(
    projectId: string,
    assignmentId: string,
    dto: UpdateAssignmentDto,
  ) {
    const assignment = await this.prisma.assignment.findUnique({
      where: { id: assignmentId },
    });

    if (!assignment || assignment.projectId !== projectId) {
      throw new NotFoundException('Assignment not found');
    }

    const updated = await this.prisma.assignment.update({
      where: { id: assignmentId },
      data: {},
      select: {
        id: true,
        isActive: true,
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

    return updated;
  }

  // ─── Admin: Remove employee from project (soft delete) ─────────────────────
  async removeAssignment(projectId: string, assignmentId: string) {
    const assignment = await this.prisma.assignment.findUnique({
      where: { id: assignmentId },
    });

    if (!assignment || assignment.projectId !== projectId) {
      throw new NotFoundException('Assignment not found');
    }

    await this.prisma.assignment.update({
      where: { id: assignmentId },
      data: {
        isActive: false,
        unassignedAt: new Date(),
      },
    });

    return { message: 'Employee removed from project' };
  }
}
