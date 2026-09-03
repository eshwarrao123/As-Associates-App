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
  _count?: {
    assignments: number;
    attendanceLogs: number;
    progressLogs: number;
    uploads: number;
  };
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
  _count?: {
    assignments: number;
    attendanceLogs: number;
  };
}

interface UserDetailResponse extends UserResponse {
  assignments?: {
    project: {
      id: string;
      name: string;
      status: 'ONGOING' | 'COMPLETED' | 'ON_HOLD' | 'UPCOMING';
    };
  }[];
  _count?: {
    assignments: number;
    attendanceLogs: number;
    progressLogs: number;
    uploads: number;
  };
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
 * @param status - Filter by user status (optional)
 * @returns Paginated list of users
 */
export async function getUsers(
  page: number = 1,
  limit: number = 10,
  status?: 'PENDING' | 'ACTIVE' | 'DEACTIVATED',
) {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  if (status) params.append('status', status);

  const response = await apiClient.get<PaginatedResponse<UserResponse>>(
    `/users?${params.toString()}`,
  );
  return response.data;
}

/**
 * Fetches a single user by ID with extended admin details.
 * @param id - User ID
 * @returns User detail with counts and admin-specific fields
 */
export async function getUserById(id: string): Promise<UserDetailResponse> {
  const response = await apiClient.get<UserDetailResponse>(`/users/${id}`);
  return response.data;
}

/**
 * Creates a new employee.
 * @param data - Employee creation data
 * @returns Created employee
 */
export async function createEmployee(data: {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role?: 'EMPLOYEE' | 'ADMIN';
  designation?: string;
  department?: string;
  employeeCode?: string;
}): Promise<UserResponse> {
  const response = await apiClient.post<UserResponse>('/users', data);
  return response.data;
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
  // Split name into firstName and lastName (DTO whitelist requires separate fields)
  const [firstName, ...lastNameParts] = (data.name || '').trim().split(/\s+/);
  const lastName = lastNameParts.join(' ') || '';

  const payload: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    email?: string;
    designation?: string;
  } = {};

  if (data.name) {
    payload.firstName = firstName;
    payload.lastName = lastName;
  }
  if (data.phone !== undefined) payload.phone = data.phone;
  if (data.email !== undefined) payload.email = data.email;
  if (data.designation !== undefined) payload.designation = data.designation;

  const response = await apiClient.patch<UserResponse>(
    `/users/${id}`,
    payload,
  );
  return response.data;
}

/**
 * Updates an employee's status.
 * @param id - User ID
 * @param status - New status
 * @returns Updated user with optional tempCredential (when activating from PENDING)
 */
export async function updateEmployeeStatus(
  id: string,
  status: 'ACTIVE' | 'DEACTIVATED',
): Promise<UserResponse & { tempCredential?: string; message?: string }> {
  const response = await apiClient.patch<
    UserResponse & { tempCredential?: string; message?: string }
  >(`/users/${id}/status`, { status });
  return response.data;
}

/**
 * Fetches projects assigned to a specific employee.
 * @param id - User ID
 * @returns Array of projects
 */
export async function getEmployeeProjects(id: string) {
  const user = await getUserById(id);
  return user.assignments?.map((a) => a.project) ?? [];
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
  status: 'ONGOING' | 'COMPLETED' | 'ON_HOLD' | 'UPCOMING';
  progressPercent: number;
}
