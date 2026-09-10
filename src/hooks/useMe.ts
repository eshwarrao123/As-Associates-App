import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
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

/**
 * Hook to update the current user's profile.
 */
export function useUpdateMe() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: usersService.updateMe,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.me });
    },
  });
}

/**
 * Hook to upload profile photo.
 */
export function useUploadProfilePhoto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: usersService.uploadProfilePhoto,
    onSuccess: () => {
      // Invalidate own profile
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.me });
      // Also invalidate users list (for admin views)
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}
