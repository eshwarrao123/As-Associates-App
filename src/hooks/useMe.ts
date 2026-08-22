import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../services/api/queryKeys';
import * as usersService from '../services/users/usersService';

/**
 * Hook to fetch the current authenticated user's profile.
 * Returns the full TanStack Query result including data, loading, and error states.
 */
export function useMe() {
  return useQuery({
    queryKey: queryKeys.auth.me,
    queryFn: usersService.getMe,
  });
}
