import { Controller, Get, Patch, Body } from '@nestjs/common';
import { CompanySettingsService } from './company-settings.service';
import { UpdateCompanySettingsDto } from './dto/update-company-settings.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('company-settings')
export class CompanySettingsController {
  constructor(
    private readonly companySettingsService: CompanySettingsService,
  ) {}

  @Get()
  @Roles(Role.ADMIN)
  getCompanySettings() {
    return this.companySettingsService.getCompanySettings();
  }

  @Patch()
  @Roles(Role.ADMIN)
  updateCompanySettings(@Body() dto: UpdateCompanySettingsDto) {
    return this.companySettingsService.updateCompanySettings(dto);
  }
}
