import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../services/api/queryKeys';
import * as requestsService from '../services/requests/requestsService';

/**
 * Hook to fetch all requests with optional status filter (admin view).
 */
export function useAllRequests(status?: string) {
  return useQuery({
    queryKey: queryKeys.requests.admin(status),
    queryFn: () => requestsService.getAllRequests(status),
  });
}

/**
 * Hook to fetch a single request by ID (admin view).
 */
export function useAdminRequest(id: string) {
  return useQuery({
    queryKey: queryKeys.requests.detail(id),
    queryFn: () => requestsService.getRequestById(id),
    enabled: !!id,
  });
}

/**
 * Hook to update a request status (approve or reject).
 */
export function useUpdateRequestStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      status,
      reviewNote,
    }: {
      id: string;
      status: 'APPROVED' | 'REJECTED';
      reviewNote?: string;
    }) => requestsService.updateRequestStatus(id, status, reviewNote),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.requests.admin() });
      queryClient.invalidateQueries({
        queryKey: queryKeys.requests.detail(variables.id),
      });
    },
  });
}
