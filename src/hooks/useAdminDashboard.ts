import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../services/api/queryKeys';
import * as usersService from '../services/users/usersService';
import * as projectsService from '../services/projects/projectsService';

/**
 * Hook to fetch employee count from the API.
 * Fetches only the first page with limit=1 to get meta.total efficiently.
 */
export function useEmployeeCount() {
  return useQuery({
    queryKey: queryKeys.users.all(1),
    queryFn: () => usersService.getUsers(1, 1),
  });
}

/**
 * Hook to fetch project count from the API.
 * Fetches only the first page with limit=1 to get meta.total efficiently.
 */
export function useProjectCount() {
  return useQuery({
    queryKey: queryKeys.projects.all(1),
    queryFn: () => projectsService.getAllProjects(1, 1),
  });
}
