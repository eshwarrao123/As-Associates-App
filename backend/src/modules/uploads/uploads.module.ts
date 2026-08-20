import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UploadsController } from './uploads.controller';
import { UploadsService } from './uploads.service';
import { PrismaService } from '../../prisma/prisma.service';
import { CloudinaryProvider } from './cloudinary.provider';

@Module({
  imports: [ConfigModule],
  controllers: [UploadsController],
  providers: [UploadsService, PrismaService, CloudinaryProvider],
  exports: [UploadsService],
})
export class UploadsModule {}
