import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../services/api/queryKeys';
import * as attendanceService from '../services/attendance/attendanceService';

/**
 * Hook to fetch attendance calendar for a specific month.
 * @param month - Month number (1-12)
 * @param year - Year (e.g., 2026)
 */
export function useAttendanceCalendar(month: number, year: number) {
  return useQuery({
    queryKey: queryKeys.attendance.calendar(month, year),
    queryFn: () => attendanceService.getMyAttendanceCalendar(month, year),
  });
}

/**
 * Hook to mark attendance check-in.
 * Invalidates the calendar query on success to refresh today's status.
 */
export function useCheckIn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (projectId: string) => attendanceService.checkIn(projectId),
    onSuccess: () => {
      const now = new Date();
      const month = now.getMonth() + 1;
      const year = now.getFullYear();

      // Invalidate current month's calendar to refresh
      void queryClient.invalidateQueries({
        queryKey: queryKeys.attendance.calendar(month, year),
      });
    },
  });
}

/**
 * Hook to mark attendance check-out.
 * Invalidates the calendar query on success to refresh today's status.
 */
export function useCheckOut() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: attendanceService.checkOut,
    onSuccess: () => {
      const now = new Date();
      const month = now.getMonth() + 1;
      const year = now.getFullYear();

      // Invalidate current month's calendar to refresh
      void queryClient.invalidateQueries({
        queryKey: queryKeys.attendance.calendar(month, year),
      });
    },
  });
}
