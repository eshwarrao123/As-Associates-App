import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../services/api/queryKeys';
import * as projectsService from '../services/projects/projectsService';

/**
 * Hook to fetch all projects assigned to the current employee.
 * Returns the full TanStack Query result including data, loading, and error states.
 */
export function useMyProjects() {
  return useQuery({
    queryKey: queryKeys.projects.my,
    queryFn: projectsService.getMyProjects,
  });
}
