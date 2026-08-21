/**
 * API error class extending Error with structured HTTP error details.
 * Matches the backend's global exception filter shape.
 */
export class ApiError extends Error {
  statusCode: number;
  error?: string;

  constructor(statusCode: number, message: string, error?: string) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.error = error;

    // Maintains proper stack trace for where our error was thrown (V8 only)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApiError);
    }
  }
}

/**
 * Generic API response wrapper.
 * Used for endpoints that return a single resource or success message.
 */
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

/**
 * Paginated API response shape.
 * Used for list endpoints that support pagination.
 */
export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
