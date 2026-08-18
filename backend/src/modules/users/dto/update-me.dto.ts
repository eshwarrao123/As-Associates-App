import { IsString, IsOptional, Matches } from 'class-validator';

export class UpdateMeDto {
  @IsString()
  @IsOptional()
  @Matches(/^\+?[0-9]{10,15}$/, { message: 'Invalid phone number' })
  phone?: string;

  @IsString()
  @IsOptional()
  photoUrl?: string;
}
