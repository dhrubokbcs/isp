import { NextResponse } from 'next/server';
import { getConsoleSession, getConsoleSessionFromRequest } from './consoleSession';
import { getStudentSession, getStudentSessionFromRequest } from './studentSession';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

export interface AuthenticatedUser {
  id: string;
  email: string;
  fullName: string;
  role: 'SUPERADMIN' | 'ADMIN' | 'TEACHER' | 'STUDENT';
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  designation?: string;
  employeeId?: string;
  studentId?: string;
  batchId?: string;
  batchName?: string;
}

export type AuthResult =
  | { user: AuthenticatedUser; errorResponse: null }
  | { user: null; errorResponse: NextResponse };

/**
 * Validates active user in database to guarantee real-time revocation
 */
async function verifyUserInDatabase(userId: string): Promise<AuthenticatedUser | null> {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !userId) return null;

  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/users?id=eq.${encodeURIComponent(userId)}&select=*&limit=1`, {
      headers: {
        apikey: SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!res.ok) return null;
    const rows = await res.json();
    if (!Array.isArray(rows) || rows.length === 0) return null;

    const u = rows[0];
    if (u.status !== 'ACTIVE') return null;

    return {
      id: u.id,
      email: u.email,
      fullName: u.full_name,
      role: u.role,
      status: u.status,
      designation: u.metadata?.designation,
      employeeId: u.metadata?.employeeId,
      studentId: u.metadata?.studentId,
      batchId: u.metadata?.batchId,
      batchName: u.metadata?.batchName,
    };
  } catch {
    return null;
  }
}

/**
 * Revalidates student account in database
 */
async function verifyStudentInDatabase(userId: string, studentId: string): Promise<AuthenticatedUser | null> {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || (!userId && !studentId)) return null;

  try {
    const query = userId
      ? `id=eq.${encodeURIComponent(userId)}`
      : `student_id=eq.${encodeURIComponent(studentId)}`;

    const res = await fetch(`${SUPABASE_URL}/rest/v1/users?${query}&select=*&limit=1`, {
      headers: {
        apikey: SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!res.ok) return null;
    const rows = await res.json();
    if (!Array.isArray(rows) || rows.length === 0) return null;

    const u = rows[0];
    if (u.status !== 'ACTIVE' || u.role !== 'STUDENT') return null;

    return {
      id: u.id,
      email: u.email,
      fullName: u.full_name,
      role: 'STUDENT',
      status: u.status,
      studentId: u.metadata?.studentId || studentId,
      batchId: u.metadata?.batchId,
      batchName: u.metadata?.batchName,
    };
  } catch {
    return null;
  }
}

/**
 * Validates request Origin/Host against cross-site request forgery on mutations
 */
export function validateCsrfOrigin(request: Request): boolean {
  const method = request.method.toUpperCase();
  // Safe read-only methods
  if (method === 'GET' || method === 'HEAD' || method === 'OPTIONS') return true;

  const origin = request.headers.get('origin');
  const host = request.headers.get('host');
  if (!origin || !host) return true; // Standard direct API / non-browser requests

  try {
    const originHost = new URL(origin).host.toLowerCase();
    const currentHost = host.toLowerCase();

    // Allow root domain & subdomains (e.g. console.ispctg.live, ispctg.live, localhost:3000)
    const cleanOrigin = originHost.replace(/^console\./, '').replace(/^www\./, '');
    const cleanHost = currentHost.replace(/^console\./, '').replace(/^www\./, '');

    return cleanOrigin === cleanHost;
  } catch {
    return false;
  }
}

/**
 * Requires a valid authenticated user of any role
 */
export async function requireUser(request?: Request): Promise<AuthResult> {
  if (request && !validateCsrfOrigin(request)) {
    return {
      user: null,
      errorResponse: NextResponse.json({ success: false, error: 'Cross-origin request blocked (CSRF protection).' }, { status: 403 }),
    };
  }

  // 1. Check Console Session (Admin / Superadmin / Teacher)
  const consoleSession = request ? getConsoleSessionFromRequest(request) : await getConsoleSession();
  if (consoleSession && consoleSession.uid) {
    const dbUser = await verifyUserInDatabase(consoleSession.uid);
    if (dbUser) {
      return { user: dbUser, errorResponse: null };
    }
  }

  // 2. Check Student Session
  const studentSession = request ? getStudentSessionFromRequest(request) : await getStudentSession();
  if (studentSession && (studentSession.userId || studentSession.id)) {
    const dbStudent = await verifyStudentInDatabase(studentSession.userId || studentSession.id, studentSession.studentId);
    if (dbStudent) {
      return { user: dbStudent, errorResponse: null };
    }
  }

  return {
    user: null,
    errorResponse: NextResponse.json(
      { success: false, error: 'Unauthorized. Valid authenticated session required.' },
      { status: 401 }
    ),
  };
}

/**
 * Requires an authenticated user with one of the allowed roles
 */
export async function requireRole(
  allowedRoles: Array<'SUPERADMIN' | 'ADMIN' | 'TEACHER' | 'STUDENT'>,
  request?: Request
): Promise<AuthResult> {
  const { user, errorResponse } = await requireUser(request);
  if (errorResponse) return { user: null, errorResponse };

  if (!allowedRoles.includes(user.role)) {
    return {
      user: null,
      errorResponse: NextResponse.json(
        { success: false, error: `Forbidden. Requires one of: [${allowedRoles.join(', ')}] permissions.` },
        { status: 403 }
      ),
    };
  }

  return { user, errorResponse: null };
}

/**
 * Strict Superadmin Gate
 */
export async function requireSuperAdmin(request?: Request): Promise<AuthResult> {
  return requireRole(['SUPERADMIN'], request);
}

/**
 * Admin Gate (Allows SUPERADMIN or ADMIN)
 */
export async function requireAdmin(request?: Request): Promise<AuthResult> {
  return requireRole(['SUPERADMIN', 'ADMIN'], request);
}

/**
 * Teacher or Admin Gate (Allows SUPERADMIN, ADMIN, or TEACHER)
 */
export async function requireTeacherOrAdmin(request?: Request): Promise<AuthResult> {
  return requireRole(['SUPERADMIN', 'ADMIN', 'TEACHER'], request);
}

/**
 * Student Gate (Requires valid, DB-revalidated student session)
 */
export async function requireStudent(request?: Request): Promise<AuthResult> {
  return requireRole(['STUDENT'], request);
}
