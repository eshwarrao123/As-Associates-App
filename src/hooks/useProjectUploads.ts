import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../services/api/queryKeys';
import apiClient from '../services/api/client';
import type { MyUploadResponse } from '../services/uploads/uploadsService';

/**
 * Hook to fetch uploads for a specific project (employee view).
 * Shows all project uploads from any team member.
 * @param projectId - Project ID
 * @returns Uploads for the project
 */
export function useProjectUploads(projectId: string) {
  return useQuery({
    queryKey: [...queryKeys.uploads.my, 'project', projectId],
    queryFn: async () => {
      const response = await apiClient.get<{ data: any[]; meta: unknown }>(
        `/uploads/project/${projectId}`,
      );
      return response.data.data.map((upload: any) => ({
        id: upload.id,
        url: upload.fileUrl,
        publicId: upload.storageKey,
        resourceType: upload.fileType,
        createdAt: upload.createdAt,
        user: upload.user,
      })) as (MyUploadResponse & { user?: { id: string; firstName: string; lastName: string } })[];
    },
    enabled: !!projectId,
  });
}
