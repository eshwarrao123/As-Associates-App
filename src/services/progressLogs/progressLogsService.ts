import apiClient from '../api/client';

// ─── Request Types ────────────────────────────────────────────────────────────

export interface CreateProgressLogData {
  projectId: string;
  title: string;
  description: string;
  workStage?: string;
}

// ─── Response Types ───────────────────────────────────────────────────────────

export interface ProgressLogResponse {
  id: string;
  projectId: string;
  userId: string;
  title: string;
  description: string;
  workStage?: string;
  date: string;
  createdAt: string;
  project?: {
    id: string;
    name: string;
  };
  user?: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

// ─── Progress Logs Service Functions ──────────────────────────────────────────

/**
 * Creates a new progress log entry.
 * @param data - Progress log data
 * @returns The created progress log
 */
export async function createProgressLog(data: CreateProgressLogData) {
  const response = await apiClient.post<ProgressLogResponse>(
    '/progress-logs',
    data,
  );
  return response.data;
}

/**
 * Fetches all progress logs for the current employee.
 * @returns Array of progress logs with pagination metadata
 */
export async function getMyProgressLogs() {
  const response = await apiClient.get<{ data: ProgressLogResponse[]; meta: unknown }>(
    '/progress-logs/my',
  );
  return response.data.data;
}

/**
 * Admin endpoint: Fetches all progress logs with optional project filter.
 * @param params - Optional filters (projectId)
 * @returns Array of progress logs with user and project info
 */
export async function getAdminProgressLogs(params?: { projectId?: string }) {
  const queryParams: Record<string, string> = {};
  if (params?.projectId) queryParams.projectId = params.projectId;

  const response = await apiClient.get<{ data: ProgressLogResponse[] }>(
    '/progress-logs/admin',
    { params: queryParams },
  );
  return response.data.data;
}
