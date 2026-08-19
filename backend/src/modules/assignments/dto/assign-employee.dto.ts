import { IsUUID, IsString, IsOptional, MaxLength } from 'class-validator';

export class AssignEmployeeDto {
  @IsUUID()
  userId: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  notes?: string;
}
