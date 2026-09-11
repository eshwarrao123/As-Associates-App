import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateCompanySettingsDto } from './dto/update-company-settings.dto';

@Injectable()
export class CompanySettingsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Get or initialize company settings.
   * Returns the single company settings record.
   * If none exists, creates one with default values.
   */
  async getCompanySettings() {
    // Try to find existing settings
    const existing = await this.prisma.companySettings.findFirst();

    if (existing) {
      return existing;
    }

    // Create default settings if none exist
    const defaultSettings = await this.prisma.companySettings.create({
      data: {
        companyName: 'AS Associates',
        registrationNumber: 'CRN-2023-98471',
        primaryAddress: 'Unit 4, Andheri Industrial Estate, Mumbai 400053',
      },
    });

    return defaultSettings;
  }

  /**
   * Update company settings.
   * Updates the single company settings record.
   */
  async updateCompanySettings(dto: UpdateCompanySettingsDto) {
    // Get the existing settings (or create default if not exists)
    const existing = await this.getCompanySettings();

    // Update the existing record
    const updated = await this.prisma.companySettings.update({
      where: { id: existing.id },
      data: {
        companyName: dto.companyName,
        registrationNumber: dto.registrationNumber,
        primaryAddress: dto.primaryAddress,
      },
    });

    return updated;
  }
}
