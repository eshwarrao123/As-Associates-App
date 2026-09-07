import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../services/api/queryKeys';
import apiClient from '../services/api/client';
import type { ProgressLogResponse } from '../services/progressLogs/progressLogsService';

/**
 * Hook to fetch progress logs for a specific project (employee view - own logs only).
 * @param projectId - Project ID
 * @returns Progress logs for the project
 */
export function useProjectProgressLogs(projectId: string) {
  return useQuery({
    queryKey: [...queryKeys.progressLogs.my, projectId],
    queryFn: async () => {
      const response = await apiClient.get<{ data: ProgressLogResponse[]; meta: unknown }>(
        `/progress-logs/my?projectId=${projectId}`,
      );
      return response.data.data;
    },
    enabled: !!projectId,
  });
}
