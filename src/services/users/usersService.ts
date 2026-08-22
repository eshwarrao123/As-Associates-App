import apiClient from '../api/client';
import type { PaginatedResponse } from '../api/types';

// ─── Response Types ───────────────────────────────────────────────────────────

interface GetMeResponse {
  id: string;
  email: string;
  role: 'ADMIN' | 'EMPLOYEE';
  status: 'PENDING' | 'ACTIVE' | 'DEACTIVATED';
  firstName: string;
  lastName: string;
  phone?: string;
  employeeCode?: string;
  designation?: string;
  department?: string;
  profilePhoto?: string | null;
}

interface UserResponse {
  id: string;
  email: string;
  role: 'ADMIN' | 'EMPLOYEE';
  status: 'PENDING' | 'ACTIVE' | 'DEACTIVATED';
  firstName: string;
  lastName: string;
  phone?: string;
  employeeCode?: string;
  designation?: string;
  department?: string;
  profilePhoto?: string | null;
  createdAt: string;
  updatedAt: string;
}

// ─── User Service Functions ───────────────────────────────────────────────────

/**
 * Fetches the current authenticated user's full profile.
 * @returns The authenticated user's data
 */
export async function getMe(): Promise<GetMeResponse> {
  const response = await apiClient.get<GetMeResponse>('/users/me');
  return response.data;
}

/**
 * Fetches all users with pagination.
 * @param page - Page number (default: 1)
 * @param limit - Items per page (default: 10)
 * @returns Paginated list of users
 */
export async function getUsers(page: number = 1, limit: number = 10) {
  const response = await apiClient.get<PaginatedResponse<UserResponse>>(
    `/users?page=${page}&limit=${limit}`,
  );
  return response.data;
}

/**
 * Fetches a single user by ID.
 * @param id - User ID
 * @returns User detail
 */
export async function getUserById(id: string) {
  const response = await apiClient.get<{ data: UserResponse }>(`/users/${id}`);
  return response.data.data;
}

/**
 * Creates a new employee.
 * @param data - Employee creation data
 * @returns Created employee and temporary credential
 */
export async function createEmployee(data: {
  name: string;
  phone: string;
  email?: string;
  role: 'EMPLOYEE' | 'ADMIN';
  designation?: string;
}) {
  const response = await apiClient.post<{
    data: { user: UserResponse; tempCredential: string };
  }>('/users', data);
  return response.data.data;
}

/**
 * Updates an employee's information.
 * @param id - User ID
 * @param data - Update data
 * @returns Updated user
 */
export async function updateEmployee(
  id: string,
  data: {
    name?: string;
    phone?: string;
    email?: string;
    designation?: string;
  },
) {
  const response = await apiClient.patch<{ data: UserResponse }>(
    `/users/${id}`,
    data,
  );
  return response.data.data;
}

/**
 * Updates an employee's status.
 * @param id - User ID
 * @param status - New status
 * @returns Updated user
 */
export async function updateEmployeeStatus(
  id: string,
  status: 'ACTIVE' | 'DEACTIVATED',
) {
  const response = await apiClient.patch<{ data: UserResponse }>(
    `/users/${id}/status`,
    { status },
  );
  return response.data.data;
}

/**
 * Fetches projects assigned to a specific employee.
 * @param id - User ID
 * @returns Array of projects
 */
export async function getEmployeeProjects(id: string) {
  const response = await apiClient.get<{ data: ProjectResponse[] }>(
    `/users/${id}/projects`,
  );
  return response.data.data;
}

// ─── Project Response Type ────────────────────────────────────────────────────

interface ProjectResponse {
  id: string;
  name: string;
  clientName: string;
  location: string;
  description?: string;
  startDate: string;
  endDate?: string;
  status: 'ACTIVE' | 'COMPLETED' | 'ON_HOLD';
  progressPercent: number;
}
