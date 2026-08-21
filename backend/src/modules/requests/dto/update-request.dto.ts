import { IsEnum, IsString, IsOptional, MaxLength } from 'class-validator';
import { RequestStatus } from '@prisma/client';

export class UpdateRequestDto {
  @IsEnum(RequestStatus)
  status: RequestStatus;

  @IsString()
  @IsOptional()
  @MaxLength(1000)
  reviewNote?: string;
}
