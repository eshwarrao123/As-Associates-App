import apiClient from '../api/client';

// ─── Response Types ───────────────────────────────────────────────────────────

interface CheckInResponse {
  id: string;
  checkInTime: string; // ISO 8601
  status: 'PRESENT' | 'LATE';
}

interface CheckOutResponse {
  id: string;
  checkInTime: string;
  checkOutTime: string;
  status: 'PRESENT' | 'LATE';
}

interface AttendanceRecord {
  date: string; // YYYY-MM-DD
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'HALF_DAY' | 'LEAVE';
  checkInTime?: string;
  checkOutTime?: string;
}

interface AttendanceCalendarResponse {
  data: AttendanceRecord[];
  summary?: {
    present: number;
    absent: number;
    late: number;
    totalWorkingDays: number;
  };
}

// ─── Attendance Service Functions ─────────────────────────────────────────────

/**
 * Mark attendance check-in for today.
 * @returns Check-in details with ID, time, and status
 */
export async function checkIn(): Promise<CheckInResponse> {
  const response = await apiClient.post<CheckInResponse>(
    '/attendance/check-in',
    {},
  );
  return response.data;
}

/**
 * Mark attendance check-out for today.
 * @returns Check-out details with times and status
 */
export async function checkOut(): Promise<CheckOutResponse> {
  const response = await apiClient.post<CheckOutResponse>(
    '/attendance/check-out',
    {},
  );
  return response.data;
}

/**
 * Fetches attendance calendar for a specific month.
 * @param month - Month number (1-12)
 * @param year - Year (e.g., 2026)
 * @returns Attendance records for the month
 */
export async function getMyAttendanceCalendar(
  month: number,
  year: number,
): Promise<AttendanceCalendarResponse> {
  const response = await apiClient.get<AttendanceCalendarResponse>(
    `/attendance/my`,
    {
      params: {
        month: `${year}-${String(month).padStart(2, '0')}`,
      },
    },
  );
  return response.data;
}

/**
 * Admin endpoint: Fetches attendance records for all employees.
 * @param params - Optional filters (userId, date)
 * @returns Array of attendance records with user info
 */
export async function getAdminAttendance(params?: {
  userId?: string;
  date?: string;
}) {
  const queryParams: Record<string, string> = {};
  if (params?.userId) queryParams.userId = params.userId;
  if (params?.date) queryParams.date = params.date;

  const response = await apiClient.get<{ data: AdminAttendanceRecord[] }>(
    '/attendance/admin',
    { params: queryParams },
  );
  return response.data.data;
}

// ─── Admin Response Types ─────────────────────────────────────────────────────

export interface AdminAttendanceRecord {
  id: string;
  userId: string;
  date: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'HALF_DAY' | 'LEAVE';
  checkInTime?: string;
  checkOutTime?: string;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    employeeCode?: string;
  };
}
