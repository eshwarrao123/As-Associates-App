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
 * Hook to approve a request.
 */
export function useApproveRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: requestsService.approveRequest,
    onSuccess: (data, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.requests.admin() });
      queryClient.invalidateQueries({ queryKey: queryKeys.requests.detail(id) });
    },
  });
}

/**
 * Hook to reject a request.
 */
export function useRejectRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      requestsService.rejectRequest(id, reason),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.requests.admin() });
      queryClient.invalidateQueries({
        queryKey: queryKeys.requests.detail(variables.id),
      });
    },
  });
}
