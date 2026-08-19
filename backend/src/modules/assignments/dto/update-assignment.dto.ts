import { IsString, IsOptional, MaxLength } from 'class-validator';

export class UpdateAssignmentDto {
  @IsString()
  @IsOptional()
  @MaxLength(500)
  notes?: string;
}
