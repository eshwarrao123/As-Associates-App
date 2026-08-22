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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.uploads.my });
    },
  });
}
