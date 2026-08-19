import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { ClockInDto } from './dto/clock-in.dto';
import { ListAttendanceDto } from './dto/list-attendance.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Role } from '@prisma/client';

@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post('clock-in')
  @Roles(Role.EMPLOYEE)
  clockIn(
    @Body() dto: ClockInDto,
    @CurrentUser('sub') userId: string,
  ) {
    return this.attendanceService.clockIn(dto, userId);
  }

  @Post('clock-out')
  @Roles(Role.EMPLOYEE)
  clockOut(@CurrentUser('sub') userId: string) {
    return this.attendanceService.clockOut(userId);
  }

  @Get('my')
  @Roles(Role.EMPLOYEE)
  getMyAttendance(
    @Query() query: ListAttendanceDto,
    @CurrentUser('sub') userId: string,
  ) {
    return this.attendanceService.getMyAttendance(query, userId);
  }

  @Get()
  @Roles(Role.ADMIN)
  listAttendance(@Query() query: ListAttendanceDto) {
    return this.attendanceService.listAttendance(query);
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.EMPLOYEE)
  getAttendanceById(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('sub') userId: string,
    @CurrentUser('role') userRole: string,
  ) {
    return this.attendanceService.getAttendanceById(id, userId, userRole);
  }
}
