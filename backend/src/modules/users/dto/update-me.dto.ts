import {
  IsString,
  IsOptional,
  IsEmail,
  MinLength,
  MaxLength,
  Matches,
  ValidateIf,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateMeDto {
  // ─── Self-service profile fields ─────────────────────────────────────────────

  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(50)
  firstName?: string;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  lastName?: string;

  @IsEmail()
  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  email?: string;

  /**
   * Required when email is being changed.
   * Verified against the stored Argon2 hash.
   */
  @ValidateIf((o) => o.email !== undefined)
  @IsString()
  @MinLength(1, { message: 'currentPassword is required when changing email' })
  currentPassword?: string;

  // ─── Existing mutable fields ──────────────────────────────────────────────────

  @IsString()
  @IsOptional()
  @Matches(/^\+?[0-9]{10,15}$/, { message: 'Invalid phone number' })
  phone?: string;

  @IsString()
  @IsOptional()
  photoUrl?: string;
}
