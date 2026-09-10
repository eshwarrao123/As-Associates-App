import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateMeDto } from './dto/update-me.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { ListUsersDto } from './dto/list-users.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Role } from '@prisma/client';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // ─── Own profile (any authenticated user) ──────────────────────────────────
  @Get('me')
  @Roles(Role.ADMIN, Role.EMPLOYEE)
  getMe(@CurrentUser('sub') userId: string) {
    return this.usersService.getMe(userId);
  }

  @Put('me')
  @Roles(Role.ADMIN, Role.EMPLOYEE)
  updateMe(
    @CurrentUser('sub') userId: string,
    @Body() dto: UpdateMeDto,
  ) {
    return this.usersService.updateMe(userId, dto);
  }

  @Post('me/profile-photo')
  @Roles(Role.ADMIN, Role.EMPLOYEE)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
    }),
  )
  async uploadProfilePhoto(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser('sub') userId: string,
  ) {
    return this.usersService.uploadProfilePhoto(file, userId);
  }

  // ─── Admin: Employee management ─────────────────────────────────────────────
  @Post()
  @Roles(Role.ADMIN)
  createEmployee(
    @Body() dto: CreateUserDto,
    @CurrentUser('sub') adminId: string,
  ) {
    return this.usersService.createEmployee(dto, adminId);
  }

  @Get()
  @Roles(Role.ADMIN)
  listUsers(@Query() query: ListUsersDto) {
    return this.usersService.listUsers(query);
  }

  @Get(':id')
  @Roles(Role.ADMIN)
  getUserById(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.getUserById(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  updateUser(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateUserDto,
  ) {
    return this.usersService.updateUser(id, dto);
  }

  @Patch(':id/status')
  @Roles(Role.ADMIN)
  updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateStatusDto,
    @CurrentUser('sub') adminId: string,
  ) {
    return this.usersService.updateStatus(id, dto, adminId);
  }
}
