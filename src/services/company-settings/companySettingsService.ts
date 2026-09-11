import apiClient from '../api/client';

// ─── Request Types ────────────────────────────────────────────────────────────

export interface UpdateCompanySettingsData {
  companyName: string;
  registrationNumber: string;
  primaryAddress: string;
}

// ─── Response Types ───────────────────────────────────────────────────────────

export interface CompanySettingsResponse {
  id: string;
  companyName: string;
  registrationNumber: string;
  primaryAddress: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Company Settings Service Functions ───────────────────────────────────────

/**
 * Fetches the company settings.
 * @returns Company settings
 */
export async function getCompanySettings() {
  const response = await apiClient.get<CompanySettingsResponse>(
    '/company-settings',
  );
  return response.data;
}

/**
 * Updates the company settings (admin only).
 * @param data - Updated company settings
 * @returns Updated company settings
 */
export async function updateCompanySettings(data: UpdateCompanySettingsData) {
  const response = await apiClient.patch<CompanySettingsResponse>(
    '/company-settings',
    data,
  );
  return response.data;
}
