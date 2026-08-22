import apiClient from '../api/client';

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

// ─── User Service Functions ───────────────────────────────────────────────────

/**
 * Fetches the current authenticated user's full profile.
 * @returns The authenticated user's data
 */
export async function getMe(): Promise<GetMeResponse> {
  const response = await apiClient.get<GetMeResponse>('/users/me');
  return response.data;
}
