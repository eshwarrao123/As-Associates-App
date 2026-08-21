import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD, APP_FILTER } from '@nestjs/core';
import { PrismaService } from './prisma/prisma.service';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { ProjectsModule } from './modules/projects/projects.module';
import { AssignmentsModule } from './modules/assignments/assignments.module';
import { AttendanceModule } from './modules/attendance/attendance.module';
import { ProgressLogsModule } from './modules/progress-logs/progress-logs.module';
import { UploadsModule } from './modules/uploads/uploads.module';
import { RequestsModule } from './modules/requests/requests.module';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { AccountActiveGuard } from './common/guards/account-active.guard';
import { MustChangePasswordGuard } from './common/guards/must-change-password.guard';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
    AuthModule,
    UsersModule,
    ProjectsModule,
    AssignmentsModule,
    AttendanceModule,
    ProgressLogsModule,
    UploadsModule,
    RequestsModule,
  ],
  providers: [
    PrismaService,
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
    { provide: APP_GUARD, useClass: AccountActiveGuard },
    { provide: APP_GUARD, useClass: MustChangePasswordGuard },
  ],
  exports: [PrismaService],
})
export class AppModule {}
