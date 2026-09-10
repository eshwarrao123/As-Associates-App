import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../services/api/queryKeys';
import * as attendanceService from '../services/attendance/attendanceService';
import * as progressLogsService from '../services/progressLogs/progressLogsService';
import * as requestsService from '../services/requests/requestsService';

/**
 * Hook to fetch admin attendance data with optional filters.
 */
export function useAdminAttendance(params?: {
  userId?: string;
  startDate?: string;
  endDate?: string;
}) {
  return useQuery({
    queryKey: [...queryKeys.attendance.adminList(params?.userId), params?.startDate, params?.endDate],
    queryFn: () => attendanceService.getAdminAttendance(params),
    enabled: true,
  });
}

/**
 * Hook to fetch admin progress logs with optional project filter.
 */
export function useAdminProgressLogs(params?: { projectId?: string }) {
  return useQuery({
    queryKey: queryKeys.progressLogs.admin(params?.projectId),
    queryFn: () => progressLogsService.getAdminProgressLogs(params),
  });
}

/**
 * Hook to fetch all requests (admin view) with optional status filter.
 */
export function useAdminRequests(status?: string) {
  return useQuery({
    queryKey: queryKeys.requests.admin(status),
    queryFn: () => requestsService.getAllRequests(status),
  });
}
