import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { ListProjectsDto } from './dto/list-projects.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Role } from '@prisma/client';

@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  @Roles(Role.ADMIN)
  createProject(
    @Body() dto: CreateProjectDto,
    @CurrentUser('sub') adminId: string,
  ) {
    return this.projectsService.createProject(dto, adminId);
  }

  @Get()
  @Roles(Role.ADMIN, Role.EMPLOYEE)
  listProjects(
    @Query() query: ListProjectsDto,
    @CurrentUser('sub') userId: string,
    @CurrentUser('role') userRole: string,
  ) {
    return this.projectsService.listProjects(query, userId, userRole);
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.EMPLOYEE)
  getProjectById(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('sub') userId: string,
    @CurrentUser('role') userRole: string,
  ) {
    return this.projectsService.getProjectById(id, userId, userRole);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  updateProject(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateProjectDto,
  ) {
    return this.projectsService.updateProject(id, dto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  cancelProject(@Param('id', ParseUUIDPipe) id: string) {
    return this.projectsService.cancelProject(id);
  }
}
