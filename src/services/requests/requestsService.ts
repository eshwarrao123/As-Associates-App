import apiClient from '../api/client';

// ─── Request Types ────────────────────────────────────────────────────────────

export interface CreateRequestData {
  type: string; // e.g. 'MATERIAL', 'ISSUE', 'LEAVE', 'ADVANCE', 'OTHER'
  description: string;
  date?: string; // optional ISO date string
}

// ─── Response Types ───────────────────────────────────────────────────────────

export interface RequestResponse {
  id: string;
  userId: string;
  type: string;
  description: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  date?: string;
  reviewNote?: string;
  reviewedAt?: string;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    employeeCode: string;
  };
  reviewedBy?: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

// ─── Requests Service Functions ───────────────────────────────────────────────

/**
 * Creates a new request.
 * @param data - Request data
 * @returns The created request
 */
export async function createRequest(data: CreateRequestData) {
  const response = await apiClient.post<{ data: RequestResponse }>(
    '/requests',
    data,
  );
  return response.data.data;
}

/**
 * Fetches all requests for the current employee.
 * @returns Array of requests
 */
export async function getMyRequests() {
  const response = await apiClient.get<{ data: RequestResponse[] }>(
    '/requests/my',
  );
  return response.data.data;
}

/**
 * Fetches a single request by ID with full details.
 * @param id - Request ID
 * @returns Request detail
 */
export async function getRequestById(id: string) {
  const response = await apiClient.get<RequestResponse>(
    `/requests/${id}`,
  );
  return response.data;
}

/**
 * Fetches all requests (admin view).
 * @param status - Optional status filter ('PENDING', 'APPROVED', 'REJECTED')
 * @returns Array of all requests
 */
export async function getAllRequests(status?: string) {
  const url = status ? `/requests?status=${status}` : '/requests';
  const response = await apiClient.get<{ data: RequestResponse[] }>(url);
  return response.data.data;
}

/**
 * Updates a request status (admin only).
 * @param id - Request ID
 * @param status - New status ('APPROVED' or 'REJECTED')
 * @param reviewNote - Optional review note (e.g., rejection reason)
 * @returns Updated request
 */
export async function updateRequestStatus(
  id: string,
  status: 'APPROVED' | 'REJECTED',
  reviewNote?: string,
) {
  const response = await apiClient.patch<RequestResponse>(
    `/requests/${id}/status`,
    {
      status,
      ...(reviewNote && { reviewNote }),
    },
  );
  return response.data;
}
