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
  reviewedBy?: string;
  reviewedAt?: string;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    employeeCode: string;
  };
  reviewer?: {
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
  const response = await apiClient.get<{ data: RequestResponse }>(
    `/requests/${id}`,
  );
  return response.data.data;
}
