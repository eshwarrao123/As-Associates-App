import apiClient from '../api/client';

// ─── Request Types ────────────────────────────────────────────────────────────

export interface CreateProgressLogData {
  projectId: string;
  description: string;
  hoursWorked: number;
  date: string; // ISO date string: "2026-08-22"
}

// ─── Response Types ───────────────────────────────────────────────────────────

export interface ProgressLogResponse {
  id: string;
  projectId: string;
  userId: string;
  description: string;
  hoursWorked: number;
  date: string;
  createdAt: string;
  updatedAt: string;
  project?: {
    id: string;
    name: string;
    clientName: string;
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
  const response = await apiClient.post<{ data: ProgressLogResponse }>(
    '/progress-logs',
    data,
  );
  return response.data.data;
}

/**
 * Fetches all progress logs for the current employee.
 * @returns Array of progress logs
 */
export async function getMyProgressLogs() {
  const response = await apiClient.get<{ data: ProgressLogResponse[] }>(
    '/progress-logs/my',
  );
  return response.data.data;
}
