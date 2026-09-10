import apiClient from '../api/client';

// ─── Response Types ───────────────────────────────────────────────────────────

export interface MeResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  status: string;
  employeeCode: string;
  phone?: string;
  designation?: string;
  photoUrl?: string;
  mustChangePassword: boolean;
  createdAt: string;
  _count?: {
    assignments?: number;
    attendanceLogs?: number;
    progressLogs?: number;
    uploads?: number;
  };
}

export interface UserResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  status: string;
  employeeCode: string;
  phone?: string;
  designation?: string;
  photoUrl?: string;
  createdAt: string;
  _count?: {
    assignments?: number;
    attendanceLogs?: number;
  };
}

// ─── Users Service Functions ──────────────────────────────────────────────────

/**
 * Fetches the current authenticated user's profile.
 * @returns User profile
 */
export async function getMe(): Promise<MeResponse> {
  const response = await apiClient.get<MeResponse>('/users/me');
  return response.data;
}

/**
 * Updates the current user's profile.
 * @param data - Profile update data
 * @returns Updated profile
 */
export async function updateMe(data: {
  phone?: string;
  photoUrl?: string;
}): Promise<MeResponse> {
  const response = await apiClient.put<MeResponse>('/users/me', data);
  return response.data;
}

/**
 * Uploads a profile photo for the current user.
 * @param file - File data with uri, name, type
 * @returns Updated user with new photoUrl
 */
export async function uploadProfilePhoto(file: {
  uri: string;
  name: string;
  type: string;
}): Promise<MeResponse> {
  const formData = new FormData();

  // Append file to FormData
  formData.append('file', {
    uri: file.uri,
    name: file.name,
    type: file.type,
  } as any);

  const response = await apiClient.post<MeResponse>(
    '/users/me/profile-photo',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    },
  );

  return response.data;
}

// ─── Admin Users Service Functions ────────────────────────────────────────────

/**
 * Fetches users list (admin only).
 */
export async function getUsers(
  page: number = 1,
  limit: number = 20,
  status?: string,
  search?: string,
) {
  const params = new URLSearchParams();
  params.append('page', String(page));
  params.append('limit', String(limit));
  if (status) params.append('status', status);
  if (search) params.append('search', search);

  const response = await apiClient.get<{ data: UserResponse[]; meta: any }>(
    `/users?${params.toString()}`,
  );
  return response.data;
}

/**
 * Fetches a single user by ID (admin only).
 */
export async function getUserById(id: string) {
  const response = await apiClient.get<any>(`/users/${id}`);
  return response.data;
}

/**
 * Fetches employee's assigned projects (admin only).
 */
export async function getEmployeeProjects(userId: string) {
  const response = await apiClient.get<any>(`/users/${userId}/projects`);
  return response.data;
}

/**
 * Creates a new employee (admin only).
 */
export async function createEmployee(data: {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  designation?: string;
}) {
  const response = await apiClient.post<any>('/users', data);
  return response.data;
}

/**
 * Updates an employee (admin only).
 */
export async function updateEmployee(id: string, data: {
  firstName?: string;
  lastName?: string;
  phone?: string;
  email?: string;
  designation?: string;
}) {
  const response = await apiClient.patch<any>(`/users/${id}`, data);
  return response.data;
}

/**
 * Updates employee status (admin only).
 */
export async function updateEmployeeStatus(id: string, status: string) {
  const response = await apiClient.patch<any>(`/users/${id}/status`, { status });
  return response.data;
}

