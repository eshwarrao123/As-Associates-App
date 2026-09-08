import { IsString, IsNotEmpty, IsOptional, MaxLength, IsNumber, IsPositive, IsArray } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateProjectDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  name: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  clientName: string;

  @IsString()
  @IsOptional()
  @MaxLength(1000)
  description?: string;

  @IsString()
  @IsOptional()
  @MaxLength(300)
  location?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  services?: string[];

  @IsString()
  @IsOptional()
  @MaxLength(200)
  customService?: string;

  @IsOptional()
  @Type(() => Date)
  startDate?: Date;

  @IsOptional()
  @Type(() => Date)
  endDate?: Date;

  @IsNumber()
  @IsPositive()
  @IsOptional()
  budget?: number;
}
