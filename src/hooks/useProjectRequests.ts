import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../services/api/queryKeys';
import apiClient from '../services/api/client';
import type { RequestResponse } from '../services/requests/requestsService';

/**
 * Hook to fetch requests for a specific project (employee view - own requests only).
 * @param projectId - Project ID
 * @returns Requests for the project
 */
export function useProjectRequests(projectId: string) {
  return useQuery({
    queryKey: queryKeys.requests.myProject(projectId),
    queryFn: async () => {
      const response = await apiClient.get<{ data: RequestResponse[]; meta: unknown }>(
        `/requests/my?projectId=${projectId}`,
      );
      return response.data.data;
    },
    enabled: !!projectId,
  });
}
