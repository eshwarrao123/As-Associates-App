/**
 * Centralized query keys for TanStack Query.
 * Each key is a typed tuple that uniquely identifies a query.
 *
 * Usage:
 * - Static keys: queryKeys.auth.me
 * - Dynamic keys: queryKeys.users.detail('user-id-123')
 */

export const queryKeys = {
  auth: {
    me: ['auth', 'me'] as const,
  },
  users: {
    all: (page: number = 1) => ['users', 'list', page] as const,
    detail: (id: string) => ['users', 'detail', id] as const,
    employeeProjects: (id: string) => ['users', 'projects', id] as const,
  },
  projects: {
    all: (page: number = 1) => ['projects', 'list', page] as const,
    my: ['projects', 'my'] as const,
    detail: (id: string) => ['projects', 'detail', id] as const,
    assignments: (projectId: string) => ['projects', 'assignments', projectId] as const,
  },
  attendance: {
    calendar: (month: number, year: number) => ['attendance', 'calendar', month, year] as const,
    adminList: (userId?: string) => ['attendance', 'admin', userId ?? 'all'] as const,
  },
  progressLogs: {
    my: ['progressLogs', 'my'] as const,
    admin: (projectId?: string) => ['progressLogs', 'admin', projectId ?? 'all'] as const,
  },
  requests: {
    my: ['requests', 'my'] as const,
    admin: (status?: string) => ['requests', 'admin', status ?? 'all'] as const,
    detail: (id: string) => ['requests', 'detail', id] as const,
  },
  uploads: {
    my: ['uploads', 'my'] as const,
  },
} as const;
