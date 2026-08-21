// ─── User & Auth Types ────────────────────────────────────────────────────────

export type UserRole = 'employee' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department?: string;
  avatarInitials: string;
  mustChangePassword?: boolean;
}

export interface AuthCredentials {
  email: string;
  password: string;
}

// ─── API Types ────────────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}

export interface ApiError {
  message: string;
  statusCode: number;
  errors?: Record<string, string[]>;
}

// ─── Status / Badge Types ─────────────────────────────────────────────────────

export type BadgeVariant =
  | 'ongoing'
  | 'completed'
  | 'onhold'
  | 'upcoming'
  | 'pending'
  | 'approved'
  | 'rejected';

// ─── Navigation Types ─────────────────────────────────────────────────────────

export type RootRoutes = '/(auth)/login' | '/(employee)' | '/(admin)';
