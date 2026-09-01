export type UserRole = 'SUPERADMIN' | 'ADMIN' | 'TEACHER' | 'STUDENT' | 'GUARDIAN';

// Roles allowed exclusively on console.domain.com
export const CONSOLE_ALLOWED_ROLES: UserRole[] = ['SUPERADMIN', 'ADMIN', 'TEACHER'];

// Roles allowed exclusively on root domain (ispctg.live)
export const ROOT_ALLOWED_ROLES: UserRole[] = ['STUDENT', 'GUARDIAN'];

export function isConsoleRole(role: UserRole): boolean {
  return CONSOLE_ALLOWED_ROLES.includes(role);
}

export function isRootRole(role: UserRole): boolean {
  return ROOT_ALLOWED_ROLES.includes(role);
}

