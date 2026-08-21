import {
  IsUUID,
  IsEnum,
  IsString,
  IsNotEmpty,
  MaxLength,
  IsOptional,
} from 'class-validator';
import { RequestType, RequestPriority } from '@prisma/client';

export class CreateRequestDto {
  @IsUUID()
  projectId: string;

  @IsEnum(RequestType)
  type: RequestType;

  @IsEnum(RequestPriority)
  @IsOptional()
  priority?: RequestPriority;

  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  subject: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  description: string;
}
