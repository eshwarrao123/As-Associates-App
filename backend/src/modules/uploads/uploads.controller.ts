import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  ParseUUIDPipe,
  UseInterceptors,
  UploadedFile,
  Body,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { UploadsService } from './uploads.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Role } from '@prisma/client';

@Controller('uploads')
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  @Post()
  @Roles(Role.EMPLOYEE)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
    }),
  )
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body('projectId') projectId: string,
    @Body('progressLogId') progressLogId: string | undefined,
    @CurrentUser('sub') userId: string,
  ) {
    try {
      return await this.uploadsService.uploadFile(file, projectId, progressLogId, userId);
    } catch (error) {
      console.error('=== UPLOAD ERROR ===', error?.message, error?.stack);
      throw error;
    }
  }

  @Get()
  @Roles(Role.ADMIN)
  listUploads(
    @Query('projectId') projectId?: string,
    @Query('userId') userId?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.uploadsService.listUploads({
      projectId,
      userId,
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
    });
  }

  @Get('my')
  @Roles(Role.EMPLOYEE)
  getMyUploads(
    @CurrentUser('sub') userId: string,
    @Query('projectId') projectId?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.uploadsService.getMyUploads(userId, {
      projectId,
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
    });
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  deleteUpload(@Param('id', ParseUUIDPipe) id: string) {
    return this.uploadsService.deleteUpload(id);
  }
}
