import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../services/api/queryKeys';
import * as progressLogsService from '../services/progressLogs/progressLogsService';

/**
 * Hook to fetch all progress logs for the current employee.
 * Returns the full TanStack Query result including data, loading, and error states.
 */
export function useMyProgressLogs() {
  return useQuery({
    queryKey: queryKeys.progressLogs.my,
    queryFn: progressLogsService.getMyProgressLogs,
  });
}

/**
 * Hook to create a new progress log entry.
 * Automatically invalidates the progress logs query on success.
 */
export function useCreateProgressLog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: progressLogsService.createProgressLog,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.progressLogs.my });
      // Also invalidate admin progress logs so admin sees the new entry
      queryClient.invalidateQueries({ queryKey: queryKeys.progressLogs.admin() });
    },
  });
}

/**
 * Hook to fetch all progress logs (admin view).
 * @param projectId - Optional project filter
 */
export function useAdminProgressLogs(projectId?: string) {
  return useQuery({
    queryKey: queryKeys.progressLogs.admin(projectId),
    queryFn: () => progressLogsService.getAdminProgressLogs(
      projectId ? { projectId } : undefined,
    ),
  });
}
