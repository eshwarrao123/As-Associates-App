import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../services/api/queryKeys';
import apiClient from '../services/api/client';

/**
 * Hook to fetch uploads for a specific project (admin view - all uploads).
 * @param projectId - Project ID
 * @returns Uploads for the project
 */
export function useAdminProjectUploads(projectId: string) {
  return useQuery({
    queryKey: ['uploads', 'admin', projectId],
    queryFn: async () => {
      const response = await apiClient.get<{
        data: Array<{
          id: string;
          storageKey: string;
          fileUrl: string;
          fileType: string;
          mimeType: string;
          fileName: string;
          fileSizeBytes: number;
          createdAt: string;
          user: {
            id: string;
            firstName: string;
            lastName: string;
            employeeCode?: string;
          };
          project: {
            id: string;
            name: string;
          };
        }>;
        meta: unknown;
      }>(`/uploads?projectId=${projectId}`);
      return response.data.data;
    },
    enabled: !!projectId,
  });
}
