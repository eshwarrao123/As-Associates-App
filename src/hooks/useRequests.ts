import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../services/api/queryKeys';
import * as requestsService from '../services/requests/requestsService';

/**
 * Hook to fetch all requests for the current employee.
 * Returns the full TanStack Query result including data, loading, and error states.
 */
export function useMyRequests() {
  return useQuery({
    queryKey: queryKeys.requests.my,
    queryFn: requestsService.getMyRequests,
  });
}

/**
 * Hook to fetch a single request by ID.
 * Only runs when the ID is provided (enabled: !!id).
 */
export function useRequest(id: string) {
  return useQuery({
    queryKey: queryKeys.requests.detail(id),
    queryFn: () => requestsService.getRequestById(id),
    enabled: !!id,
  });
}

/**
 * Hook to create a new request.
 * Automatically invalidates the requests query on success.
 */
export function useCreateRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: requestsService.createRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.requests.my });
    },
  });
}
