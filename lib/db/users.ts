/**
 * ISP Digital Campus: User Types Repository
 */

export type UserRole = 'SUPERADMIN' | 'ADMIN' | 'TEACHER' | 'STAFF' | 'STUDENT' | 'GUARDIAN';
export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  fullName: string;
  phone?: string;
  role: UserRole;
  status: UserStatus;
  avatarUrl?: string;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

// Strictly empty — all user authentication & management is 100% database-driven in PostgreSQL/Supabase
export const USER_DATABASE: Record<string, User> = {};
