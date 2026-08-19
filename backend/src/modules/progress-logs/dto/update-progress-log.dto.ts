import { IsString, IsOptional, MaxLength } from 'class-validator';

export class UpdateProgressLogDto {
  @IsString()
  @IsOptional()
  @MaxLength(200)
  title?: string;

  @IsString()
  @IsOptional()
  @MaxLength(2000)
  description?: string;

  @IsString()
  @IsOptional()
  @MaxLength(1000)
  workStage?: string;
}
