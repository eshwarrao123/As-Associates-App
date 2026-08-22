import apiClient from '../api/client';
import type { BadgeVariant } from '../../types';

// ─── Response Types ───────────────────────────────────────────────────────────

interface ProjectResponse {
  id: string;
  name: string;
  clientName: string;
  location: string;
  description?: string;
  startDate: string; // YYYY-MM-DD
  endDate?: string; // YYYY-MM-DD
  status: 'ACTIVE' | 'COMPLETED' | 'ON_HOLD';
  progressPercent: number;
}

interface ProjectDetailResponse extends ProjectResponse {
  team?: Array<{
    id: string;
    firstName: string;
    lastName: string;
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
    case 'ACTIVE':
      return 'ongoing';
    case 'COMPLETED':
      return 'completed';
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
    progress: project.progressPercent,
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
  const response = await apiClient.get<{ data: ProjectResponse[] }>(
    '/projects/my',
  );

  // Map API response to local Project type
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
    progress: project.progressPercent,
    team: project.team ?? [],
  };
}
