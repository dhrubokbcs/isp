/**
 * ISP Digital Campus: User Management Database Repository
 * References: MASTER_PLAN.md (Section 4 & 5)
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

/**
 * Seeded User Database
 * Includes the Superadmin account requested by the director
 */
export const USER_DATABASE: Record<string, User> = {
  'sadiworkmail@gmail.com': {
    id: 'bdb8b059-c893-47d6-a142-1d27dd0fd210',
    email: 'sadiworkmail@gmail.com',
    passwordHash: 's01836650S@&',
    fullName: 'Tanvir Hasan Sadi',
    phone: '01836650000',
    role: 'SUPERADMIN',
    status: 'ACTIVE',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  'admin@ispctg.live': {
    id: 'u-admin-001',
    email: 'admin@ispctg.live',
    passwordHash: 'admin1234',
    fullName: 'ISP Operations Admin',
    role: 'ADMIN',
    status: 'ACTIVE',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  'teacher.rahman@ispctg.live': {
    id: 'u-teacher-001',
    email: 'teacher.rahman@ispctg.live',
    passwordHash: 'teacher1234',
    fullName: 'Prof. M. Rahman',
    role: 'TEACHER',
    status: 'ACTIVE',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
};

/**
 * Find user by email (case-insensitive)
 */
export function getUserByEmail(email: string): User | null {
  const normalized = email.trim().toLowerCase();
  for (const [key, user] of Object.entries(USER_DATABASE)) {
    if (key.toLowerCase() === normalized) {
      return user;
    }
  }
  return null;
}

/**
 * Authenticate user credentials against the user database
 */
export function authenticateUser(
  emailInput: string,
  passwordInput: string
): { success: true; user: User } | { success: false; error: string } {
  const user = getUserByEmail(emailInput);

  if (!user) {
    return { success: false, error: 'No account found with this email address.' };
  }

  if (user.status !== 'ACTIVE') {
    return { success: false, error: 'This account has been suspended or deactivated.' };
  }

  if (user.passwordHash !== passwordInput) {
    return { success: false, error: 'Incorrect password. Please try again.' };
  }

  // Update last login
  user.lastLoginAt = new Date().toISOString();

  return { success: true, user };
}

