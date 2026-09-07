import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../services/api/queryKeys';
import * as uploadsService from '../services/uploads/uploadsService';

/**
 * Hook to fetch all uploads for the current employee.
 */
export function useMyUploads() {
  return useQuery({
    queryKey: queryKeys.uploads.my,
    queryFn: uploadsService.getMyUploads,
  });
}

/**
 * Hook to upload a file.
 */
export function useUploadFile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: uploadsService.uploadFile,
    onSuccess: (_data, variables) => {
      // Invalidate employee's own uploads (gallery)
      queryClient.invalidateQueries({ queryKey: queryKeys.uploads.my });

      // Invalidate project-specific uploads for both employee and admin views
      const projectId = variables.projectId;
      if (projectId) {
        // Employee project uploads
        queryClient.invalidateQueries({
          queryKey: [...queryKeys.uploads.my, projectId]
        });
        // Admin project uploads
        queryClient.invalidateQueries({
          queryKey: ['uploads', 'admin', projectId]
        });
      }
    },
  });
}
