import apiClient from '../api/client';

// ─── Request/Response Types ───────────────────────────────────────────────────

interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  mustChangePassword: boolean;
  user: {
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
  };
}

interface RefreshTokenRequest {
  refreshToken: string;
}

interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}

interface LogoutRequest {
  refreshToken: string;
}

interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

interface ChangePasswordResponse {
  message: string;
}

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

// ─── Auth Service Functions ───────────────────────────────────────────────────

/**
 * Authenticates a user with email and password.
 * @param email - User's email address
 * @param password - User's password
 * @returns Login response containing tokens and user data
 */
export async function login(
  email: string,
  password: string,
): Promise<LoginResponse> {
  const response = await apiClient.post<LoginResponse>('/auth/login', {
    email,
    password,
  } satisfies LoginRequest);

  return response.data;
}

/**
 * Logs out the current user by revoking their refresh token.
 * Fire-and-forget — errors are silently swallowed to avoid blocking logout.
 * @param refreshToken - The user's current refresh token
 */
export async function logout(refreshToken: string): Promise<void> {
  try {
    await apiClient.post('/auth/logout', {
      refreshToken,
    } satisfies LogoutRequest);
  } catch {
    // Logout failures are non-blocking — token cleanup happens client-side
  }
}

/**
 * Exchanges a refresh token for a new access token.
 * Used by the axios interceptor for silent token refresh.
 * @param token - The current refresh token
 * @returns New access and refresh token pair
 */
export async function refreshToken(token: string): Promise<RefreshTokenResponse> {
  const response = await apiClient.post<RefreshTokenResponse>('/auth/refresh', {
    refreshToken: token,
  } satisfies RefreshTokenRequest);

  return response.data;
}

/**
 * Changes the authenticated user's password.
 * @param currentPassword - User's current password
 * @param newPassword - User's new password
 * @returns Success message
 */
export async function changePassword(
  currentPassword: string,
  newPassword: string,
): Promise<ChangePasswordResponse> {
  const response = await apiClient.post<ChangePasswordResponse>(
    '/auth/change-password',
    {
      currentPassword,
      newPassword,
    } satisfies ChangePasswordRequest,
  );

  return response.data;
}

/**
 * Fetches the current authenticated user's profile.
 * Used for startup auth check and profile refresh.
 * @returns The authenticated user's data
 */
export async function getMe(): Promise<GetMeResponse> {
  const response = await apiClient.get<GetMeResponse>('/users/me');
  return response.data;
}
