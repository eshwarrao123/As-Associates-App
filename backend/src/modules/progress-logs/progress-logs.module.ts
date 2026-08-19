import { Module } from '@nestjs/common';
import { ProgressLogsController } from './progress-logs.controller';
import { ProgressLogsService } from './progress-logs.service';
import { PrismaService } from '../../prisma/prisma.service';

@Module({
  controllers: [ProgressLogsController],
  providers: [ProgressLogsService, PrismaService],
  exports: [ProgressLogsService],
})
export class ProgressLogsModule {}
