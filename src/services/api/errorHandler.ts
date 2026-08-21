import { isAxiosError } from 'axios';
import { ApiError } from './types';

/**
 * Parses any error into a structured ApiError instance.
 * Handles Axios errors, ApiError instances, and generic errors.
 *
 * @param error - The error to parse
 * @returns A structured ApiError instance
 */
export function parseApiError(error: unknown): ApiError {
  // Already an ApiError — return as-is
  if (error instanceof ApiError) {
    return error;
  }

  // Axios error with response data
  if (isAxiosError(error) && error.response) {
    const { status, data } = error.response;
    const message = (data as { message?: string })?.message ?? 'An error occurred';
    const errorType = (data as { error?: string })?.error;

    return new ApiError(status, message, errorType);
  }

  // Axios error without response (network error)
  if (isAxiosError(error) && !error.response) {
    return new ApiError(0, 'Network error. Check your connection.');
  }

  // Generic error
  const message = error instanceof Error ? error.message : 'An unexpected error occurred';
  return new ApiError(500, message);
}

/**
 * Extracts a user-friendly error message from any error.
 * Maps common HTTP status codes to readable messages.
 *
 * @param error - The error to extract a message from
 * @returns A user-friendly error message string
 */
export function getErrorMessage(error: unknown): string {
  const apiError = parseApiError(error);

  switch (apiError.statusCode) {
    case 0:
      return 'Cannot connect to server. Check your connection.';
    case 401:
      return 'Session expired. Please log in again.';
    case 403:
      return "You don't have permission to do this.";
    case 404:
      return 'The requested item was not found.';
    case 422:
      // Use backend validation message for 422
      return apiError.message;
    case 500:
      return 'Server error. Please try again later.';
    default:
      return apiError.message;
  }
}
