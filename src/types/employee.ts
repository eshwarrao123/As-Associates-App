import { BadgeVariant } from './index';

// ─── Project ──────────────────────────────────────────────────────────────────

export interface Project {
  id: string;
  name: string;
  client: string;
  location: string;
  status: BadgeVariant;
  progress: number; // 0–100
  startDate: string;
  endDate: string;
  department?: string;
}

// ─── Recent Upload ────────────────────────────────────────────────────────────

export interface RecentUpload {
  id: string;
  filename: string;
  projectName: string;
  uploadedAt: string; // ISO date string
  fileType: 'image' | 'pdf' | 'doc' | 'other';
}

// ─── Attendance Summary ───────────────────────────────────────────────────────

export interface AttendanceSummary {
  present: number;
  absent: number;
  late: number;
  totalWorkingDays: number;
}

// ─── Quick Action ─────────────────────────────────────────────────────────────

export interface QuickAction {
  id: string;
  label: string;
  icon: string; // icon name — resolved by the caller
  route: string;
}
