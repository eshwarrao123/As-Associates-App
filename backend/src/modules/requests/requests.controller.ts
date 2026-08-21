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
import { RequestsService } from './requests.service';
import { CreateRequestDto } from './dto/create-request.dto';
import { UpdateRequestDto } from './dto/update-request.dto';
import { ListRequestsDto } from './dto/list-requests.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Role } from '@prisma/client';

@Controller('requests')
export class RequestsController {
  constructor(private readonly requestsService: RequestsService) {}

  @Post()
  @Roles(Role.EMPLOYEE)
  createRequest(
    @Body() dto: CreateRequestDto,
    @CurrentUser('sub') userId: string,
  ) {
    return this.requestsService.createRequest(dto, userId);
  }

  @Get('my')
  @Roles(Role.EMPLOYEE)
  getMyRequests(
    @Query() query: ListRequestsDto,
    @CurrentUser('sub') userId: string,
  ) {
    return this.requestsService.getMyRequests(query, userId);
  }

  @Get()
  @Roles(Role.ADMIN)
  listRequests(@Query() query: ListRequestsDto) {
    return this.requestsService.listRequests(query);
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.EMPLOYEE)
  getRequestById(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('sub') userId: string,
    @CurrentUser('role') userRole: string,
  ) {
    return this.requestsService.getRequestById(id, userId, userRole);
  }

  @Patch(':id/status')
  @Roles(Role.ADMIN)
  updateRequestStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateRequestDto,
    @CurrentUser('sub') adminId: string,
  ) {
    return this.requestsService.updateRequestStatus(id, dto, adminId);
  }
}
