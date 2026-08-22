import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../services/api/queryKeys';
import * as projectsService from '../services/projects/projectsService';

/**
 * Hook to fetch a single project by ID with full details.
 * @param id - Project ID
 * @returns Full TanStack Query result
 */
export function useProject(id: string) {
  return useQuery({
    queryKey: queryKeys.projects.detail(id),
    queryFn: () => projectsService.getProjectById(id),
    enabled: !!id,
  });
}
