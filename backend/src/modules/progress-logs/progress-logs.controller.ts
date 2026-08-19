import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ProgressLogsService } from './progress-logs.service';
import { CreateProgressLogDto } from './dto/create-progress-log.dto';
import { UpdateProgressLogDto } from './dto/update-progress-log.dto';
import { ListProgressLogsDto } from './dto/list-progress-logs.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Role } from '@prisma/client';

@Controller('progress-logs')
export class ProgressLogsController {
  constructor(private readonly progressLogsService: ProgressLogsService) {}

  @Post()
  @Roles(Role.EMPLOYEE)
  createProgressLog(
    @Body() dto: CreateProgressLogDto,
    @CurrentUser('sub') userId: string,
  ) {
    return this.progressLogsService.createProgressLog(dto, userId);
  }

  @Get('my')
  @Roles(Role.EMPLOYEE)
  getMyProgressLogs(
    @Query() query: ListProgressLogsDto,
    @CurrentUser('sub') userId: string,
  ) {
    return this.progressLogsService.getMyProgressLogs(query, userId);
  }

  @Get()
  @Roles(Role.ADMIN)
  listProgressLogs(@Query() query: ListProgressLogsDto) {
    return this.progressLogsService.listProgressLogs(query);
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.EMPLOYEE)
  getProgressLogById(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('sub') userId: string,
    @CurrentUser('role') userRole: string,
  ) {
    return this.progressLogsService.getProgressLogById(id, userId, userRole);
  }

  @Patch(':id')
  @Roles(Role.EMPLOYEE)
  updateProgressLog(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateProgressLogDto,
    @CurrentUser('sub') userId: string,
  ) {
    return this.progressLogsService.updateProgressLog(id, dto, userId);
  }
}
