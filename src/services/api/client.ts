import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { router } from 'expo-router';
import {
  getAccessToken,
  setAccessToken,
  setRefreshToken,
  clearTokens,
} from './tokenStore';
import { ApiError } from './types';
import { API_BASE_URL } from '../../config/env';

/**
 * Axios client configured with:
 * - Base URL pointing to the backend API
 * - Default JSON headers
 * - Request interceptor to attach Authorization header
 * - Response interceptor for 401 handling with silent token refresh
 */
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30_000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// ─── Request Interceptor: Attach Access Token ────────────────────────────────

apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const accessToken = await getAccessToken();
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error),
);

// ─── Response Interceptor: 401 Handling with Silent Refresh ─────────────────

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

/**
 * Process all queued requests after token refresh completes.
 */
function processQueue(error: Error | null, token: string | null = null) {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else {
      promise.resolve(token);
    }
  });
  failedQueue = [];
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // If 401 and we haven't tried refreshing yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      // If already refreshing, queue this request
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers && token) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Attempt silent token refresh
        const { getRefreshToken: getRefresh } = await import('./tokenStore');
        const refreshToken = await getRefresh();

        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        // Call refresh endpoint
        const response = await axios.post<{
          accessToken: string;
          refreshToken: string;
        }>(`${API_BASE_URL}/auth/refresh`, { refreshToken });

        const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
          response.data;

        // Persist new tokens
        await setAccessToken(newAccessToken);
        await setRefreshToken(newRefreshToken);

        // Retry original request with new token
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        }

        processQueue(null, newAccessToken);
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh failed — clear tokens and redirect to login
        processQueue(refreshError as Error, null);
        await clearTokens();

        // Redirect to login via Expo Router
        // Use replace to prevent back navigation to authenticated screen
        router.replace('/login');

        return Promise.reject(
          new ApiError(401, 'Session expired. Please log in again.'),
        );
      } finally {
        isRefreshing = false;
      }
    }

    // For non-401 errors, wrap in ApiError if it's a server response
    if (error.response) {
      const { status, data } = error.response;
      const message =
        (data as { message?: string })?.message ?? 'An error occurred';
      const errorType = (data as { error?: string })?.error;
      return Promise.reject(new ApiError(status, message, errorType));
    }

    // Network or other non-response error
    return Promise.reject(error);
  },
);

export default apiClient;
