import { IsUUID, IsString, IsOptional, MaxLength } from 'class-validator';

export class ClockInDto {
  @IsUUID()
  projectId: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  notes?: string;
}
