import apiClient from '../api/client';
import type { BadgeVariant } from '../../types';
import type { PaginatedResponse } from '../api/types';

// ─── Response Types ───────────────────────────────────────────────────────────

interface ProjectResponse {
  id: string;
  name: string;
  clientName: string;
  location: string;
  description?: string;
  startDate: string; // YYYY-MM-DD
  endDate?: string; // YYYY-MM-DD
  status: 'ONGOING' | 'COMPLETED' | 'UPCOMING' | 'ON_HOLD';
}

interface ProjectDetailResponse extends ProjectResponse {
  assignments?: Array<{
    id: string;
    createdAt: string;
    user: {
      id: string;
      firstName: string;
      lastName: string;
      employeeCode?: string;
    };
  }>;
  recentProgressLogs?: unknown[];
  recentUploads?: unknown[];
}

// ─── Helper Functions ─────────────────────────────────────────────────────────

/**
 * Maps API status to badge variant used in the UI.
 */
function mapStatusToBadgeVariant(status: string): BadgeVariant {
  switch (status) {
    case 'ONGOING':
      return 'ongoing';
    case 'COMPLETED':
      return 'completed';
    case 'UPCOMING':
      return 'upcoming';
    case 'ON_HOLD':
      return 'onhold';
    default:
      return 'ongoing';
  }
}

/**
 * Maps API project response to the local Project type.
 */
function mapProjectResponse(project: ProjectResponse) {
  return {
    id: project.id,
    name: project.name,
    client: project.clientName,
    location: project.location,
    status: mapStatusToBadgeVariant(project.status),
    progress: 0, // Backend does not return progressPercent yet
    startDate: project.startDate,
    endDate: project.endDate ?? '',
  };
}

// ─── Project Service Functions ────────────────────────────────────────────────

/**
 * Fetches all projects assigned to the current employee.
 * @returns Array of projects
 */
export async function getMyProjects() {
  // Backend GET /projects is role-aware — filters by assignments for employees
  const response = await apiClient.get<{ data: ProjectResponse[]; meta: unknown }>(
    '/projects',
  );

  // Backend returns { data: [...], meta: {...} }
  // So we access response.data.data (the array)
  return response.data.data.map(mapProjectResponse);
}

/**
 * Fetches a single project by ID with full details.
 * @param id - Project ID
 * @returns Project detail
 */
export async function getProjectById(id: string) {
  const response = await apiClient.get<ProjectDetailResponse>(
    `/projects/${id}`,
  );

  const project = response.data;

  return {
    id: project.id,
    name: project.name,
    client: project.clientName,
    location: project.location,
    status: mapStatusToBadgeVariant(project.status),
    scope: project.description ?? 'No description provided.',
    startDate: project.startDate,
    targetEnd: project.endDate ?? 'Not set',
    progress: 0, // Backend does not return progressPercent yet
    team: project.assignments?.map((a) => a.user) ?? [],
  };
}

/**
 * Fetches all projects with pagination.
 * @param page - Page number (default: 1)
 * @param limit - Items per page (default: 10)
 * @returns Paginated list of projects
 */
export async function getAllProjects(page: number = 1, limit: number = 10) {
  const response = await apiClient.get<PaginatedResponse<ProjectResponse>>(
    `/projects?page=${page}&limit=${limit}`,
  );
  return response.data;
}

/**
 * Creates a new project.
 * @param data - Project creation data
 * @returns Created project
 */
export async function createProject(data: {
  name: string;
  description?: string;
  location?: string;
  startDate: string; // ISO date string
  endDate?: string;
  budget?: number;
}) {
  const response = await apiClient.post<{ data: ProjectResponse }>(
    '/projects',
    data,
  );
  return response.data.data;
}

/**
 * Updates a project.
 * @param id - Project ID
 * @param data - Update data
 * @returns Updated project
 */
export async function updateProject(
  id: string,
  data: {
    name?: string;
    description?: string;
    location?: string;
    startDate?: string;
    endDate?: string;
    budget?: number;
    status?: string;
  },
) {
  const response = await apiClient.patch<{ data: ProjectResponse }>(
    `/projects/${id}`,
    data,
  );
  return response.data.data;
}

/**
 * Deletes a project.
 * @param id - Project ID
 * @returns void
 */
export async function deleteProject(id: string) {
  await apiClient.delete(`/projects/${id}`);
}

/**
 * Fetches assignments for a project.
 * @param projectId - Project ID
 * @returns Array of assigned users
 */
export async function getProjectAssignments(projectId: string) {
  const response = await apiClient.get<AssignmentResponse[]>(
    `/projects/${projectId}/assignments`,
  );
  return response.data;
}

/**
 * Assigns employees to a project.
 * Backend only supports one assignment at a time, so we loop through all IDs.
 * @param projectId - Project ID
 * @param employeeIds - Array of employee IDs to assign
 * @returns Updated assignments
 */
export async function assignEmployees(
  projectId: string,
  employeeIds: string[],
) {
  // Backend POST /projects/:id/assignments expects { userId: string } (one at a time)
  // So we call it multiple times via Promise.all
  const results = await Promise.all(
    employeeIds.map((userId) =>
      apiClient.post<AssignmentResponse>(
        `/projects/${projectId}/assignments`,
        { userId },
      ),
    ),
  );

  // Return array of assignment responses
  return results.map((res) => res.data);
}

// ─── Assignment Response Type ─────────────────────────────────────────────────

interface AssignmentResponse {
  id: string;
  isActive: boolean;
  createdAt: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    employeeCode?: string;
  };
}

/**
 * Unassigns an employee from a project.
 * @param projectId - Project ID
 * @param employeeId - Employee ID to unassign
 * @returns void
 */
export async function unassignEmployee(projectId: string, employeeId: string) {
  await apiClient.delete(`/projects/${projectId}/assignments/${employeeId}`);
}

// ─── User Assignment Response Type ────────────────────────────────────────────

interface UserAssignmentResponse {
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
}
