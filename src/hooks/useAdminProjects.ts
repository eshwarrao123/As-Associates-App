import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../services/api/queryKeys';
import * as projectsService from '../services/projects/projectsService';

/**
 * Hook to fetch all projects with pagination (admin view).
 */
export function useAllProjects(page: number = 1) {
  return useQuery({
    queryKey: queryKeys.projects.all(page),
    queryFn: () => projectsService.getAllProjects(page, 20),
  });
}

/**
 * Hook to fetch a single project by ID (admin view).
 */
export function useAdminProject(id: string) {
  return useQuery({
    queryKey: queryKeys.projects.detail(id),
    queryFn: () => projectsService.getProjectById(id),
    enabled: !!id,
  });
}

/**
 * Hook to fetch project assignments.
 */
export function useProjectAssignments(projectId: string) {
  return useQuery({
    queryKey: queryKeys.projects.assignments(projectId),
    queryFn: () => projectsService.getProjectAssignments(projectId),
    enabled: !!projectId,
  });
}

/**
 * Hook to create a new project.
 */
export function useCreateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: projectsService.createProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.all(1) });
    },
  });
}

/**
 * Hook to update a project.
 */
export function useUpdateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Parameters<typeof projectsService.updateProject>[1];
    }) => projectsService.updateProject(id, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.all(1) });
      queryClient.invalidateQueries({
        queryKey: queryKeys.projects.detail(variables.id),
      });
    },
  });
}

/**
 * Hook to delete a project.
 */
export function useDeleteProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: projectsService.deleteProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.all(1) });
    },
  });
}

/**
 * Hook to assign employees to a project.
 */
export function useAssignEmployees() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      projectId,
      employeeIds,
    }: {
      projectId: string;
      employeeIds: string[];
    }) => projectsService.assignEmployees(projectId, employeeIds),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.projects.assignments(variables.projectId),
      });
    },
  });
}

/**
 * Hook to unassign an employee from a project.
 */
export function useUnassignEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      projectId,
      employeeId,
    }: {
      projectId: string;
      employeeId: string;
    }) => projectsService.unassignEmployee(projectId, employeeId),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.projects.assignments(variables.projectId),
      });
    },
  });
}
