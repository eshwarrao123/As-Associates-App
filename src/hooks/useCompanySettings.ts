import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../services/api/queryKeys';
import * as companySettingsService from '../services/company-settings/companySettingsService';

/**
 * Hook to fetch company settings.
 */
export function useCompanySettings() {
  return useQuery({
    queryKey: queryKeys.companySettings.get,
    queryFn: companySettingsService.getCompanySettings,
  });
}

/**
 * Hook to update company settings (admin only).
 */
export function useUpdateCompanySettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: companySettingsService.updateCompanySettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.companySettings.get });
    },
  });
}
