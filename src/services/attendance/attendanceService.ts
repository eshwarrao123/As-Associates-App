import apiClient from '../api/client';

// ─── Response Types ───────────────────────────────────────────────────────────

interface CheckInResponse {
  id: string;
  userId: string;
  date: string;
  checkInTime: string; // ISO 8601
  checkOutTime: string | null;
  status: 'PRESENT' | 'ABSENT' | 'HALF_DAY';
  createdAt: string;
}

interface CheckOutResponse {
  id: string;
  userId: string;
  date: string;
  checkInTime: string;
  checkOutTime: string;
  status: 'PRESENT' | 'ABSENT' | 'HALF_DAY';
  createdAt: string;
}

interface AttendanceRecord {
  date: string; // ISO 8601 datetime from backend (e.g., "2026-09-02T00:00:00.000Z")
  status: 'PRESENT' | 'ABSENT' | 'HALF_DAY';
  checkInTime?: string;
  checkOutTime?: string;
}

interface AttendanceCalendarResponse {
  data: AttendanceRecord[];
}

// ─── Attendance Service Functions ─────────────────────────────────────────────

/**
 * Mark attendance check-in for today.
 * @param projectId - ID of the project to clock in for
 * @returns Check-in details with ID, time, and status
 */
export async function checkIn(projectId: string): Promise<CheckInResponse> {
  const response = await apiClient.post<CheckInResponse>(
    '/attendance/clock-in',
    { projectId },
  );
  return response.data;
}

/**
 * Mark attendance check-out for today.
 * @returns Check-out details with times and status
 */
export async function checkOut(): Promise<CheckOutResponse> {
  const response = await apiClient.post<CheckOutResponse>(
    '/attendance/clock-out',
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
  // Calculate first and last day of the month
  const firstDay = new Date(Date.UTC(year, month - 1, 1));
  const lastDay = new Date(Date.UTC(year, month, 0));

  // Format as YYYY-MM-DD using UTC (matches backend @db.Date)
  const formatUTCDateKey = (d: Date): string => {
    const y = d.getUTCFullYear();
    const m = String(d.getUTCMonth() + 1).padStart(2, '0');
    const day = String(d.getUTCDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const startDate = formatUTCDateKey(firstDay);
  const endDate = formatUTCDateKey(lastDay);

  const response = await apiClient.get<AttendanceCalendarResponse>(
    `/attendance/my`,
    {
      params: {
        startDate,
        endDate,
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
  status: 'PRESENT' | 'ABSENT' | 'HALF_DAY';
  checkInTime?: string;
  checkOutTime?: string;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    employeeCode?: string;
  };
}
