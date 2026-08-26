import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../services/api/queryKeys';
import * as usersService from '../services/users/usersService';

/**
 * Hook to fetch all employees with pagination.
 */
export function useEmployees(
  page: number = 1,
  status?: 'PENDING' | 'ACTIVE' | 'DEACTIVATED',
) {
  return useQuery({
    queryKey: [...queryKeys.users.all(page), status],
    queryFn: () => usersService.getUsers(page, 20, status),
  });
}

/**
 * Hook to fetch a single employee by ID.
 */
export function useEmployee(id: string) {
  return useQuery({
    queryKey: queryKeys.users.detail(id),
    queryFn: () => usersService.getUserById(id),
    enabled: !!id,
  });
}

/**
 * Hook to fetch projects assigned to an employee.
 */
export function useEmployeeProjects(id: string) {
  return useQuery({
    queryKey: queryKeys.users.employeeProjects(id),
    queryFn: () => usersService.getEmployeeProjects(id),
    enabled: !!id,
  });
}

/**
 * Hook to create a new employee.
 */
export function useCreateEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: usersService.createEmployee,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all(1) });
    },
  });
}

/**
 * Hook to update an employee's information.
 */
export function useUpdateEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Parameters<typeof usersService.updateEmployee>[1];
    }) => usersService.updateEmployee(id, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all(1) });
      queryClient.invalidateQueries({
        queryKey: queryKeys.users.detail(variables.id),
      });
    },
  });
}

/**
 * Hook to update an employee's status (activate/deactivate).
 */
export function useUpdateEmployeeStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      status,
    }: {
      id: string;
      status: 'ACTIVE' | 'DEACTIVATED';
    }) => usersService.updateEmployeeStatus(id, status),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all(1) });
      queryClient.invalidateQueries({
        queryKey: queryKeys.users.detail(variables.id),
      });
    },
  });
}
