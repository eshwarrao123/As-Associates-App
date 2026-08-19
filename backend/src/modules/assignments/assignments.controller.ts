import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  ParseUUIDPipe,
} from '@nestjs/common';
import { AssignmentsService } from './assignments.service';
import { AssignEmployeeDto } from './dto/assign-employee.dto';
import { UpdateAssignmentDto } from './dto/update-assignment.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Role } from '@prisma/client';

@Controller('projects/:projectId/assignments')
export class AssignmentsController {
  constructor(private readonly assignmentsService: AssignmentsService) {}

  @Post()
  @Roles(Role.ADMIN)
  assignEmployee(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Body() dto: AssignEmployeeDto,
    @CurrentUser('sub') adminId: string,
  ) {
    return this.assignmentsService.assignEmployee(projectId, dto, adminId);
  }

  @Get()
  @Roles(Role.ADMIN, Role.EMPLOYEE)
  listAssignments(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @CurrentUser('sub') userId: string,
    @CurrentUser('role') userRole: string,
  ) {
    return this.assignmentsService.listAssignments(projectId, userId, userRole);
  }

  @Patch(':assignmentId')
  @Roles(Role.ADMIN)
  updateAssignment(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Param('assignmentId', ParseUUIDPipe) assignmentId: string,
    @Body() dto: UpdateAssignmentDto,
  ) {
    return this.assignmentsService.updateAssignment(projectId, assignmentId, dto);
  }

  @Delete(':assignmentId')
  @Roles(Role.ADMIN)
  removeAssignment(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Param('assignmentId', ParseUUIDPipe) assignmentId: string,
  ) {
    return this.assignmentsService.removeAssignment(projectId, assignmentId);
  }
}
