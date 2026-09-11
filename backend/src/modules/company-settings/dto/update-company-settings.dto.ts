import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateCompanySettingsDto {
  @IsString()
  @IsNotEmpty()
  companyName: string;

  @IsString()
  @IsNotEmpty()
  registrationNumber: string;

  @IsString()
  @IsNotEmpty()
  primaryAddress: string;
}
