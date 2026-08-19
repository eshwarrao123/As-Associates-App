import { IsUUID, IsString, IsNotEmpty, MaxLength, IsOptional } from 'class-validator';

export class CreateProgressLogDto {
  @IsUUID()
  projectId: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  description: string;

  @IsString()
  @IsOptional()
  @MaxLength(1000)
  workStage?: string;
}
