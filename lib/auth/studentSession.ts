import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export interface StudentSessionPayload {
  id: string; // student row id or user id
  userId: string;
  studentId: string;
  fullName: string;
  email: string;
  phone?: string;
  batchId?: string;
  batchName?: string;
  role: 'STUDENT';
  avatarUrl?: string;
  issuedAt: number;
}

const COOKIE_NAME = 'isp_student_session';
const MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days

/**
 * Encodes student session payload into a secure cookie value
 */
export function encodeSession(payload: StudentSessionPayload): string {
  const json = JSON.stringify(payload);
  return Buffer.from(json).toString('base64url');
}

/**
 * Decodes session string from cookie value
 */
export function decodeSession(cookieValue: string): StudentSessionPayload | null {
  try {
    const json = Buffer.from(cookieValue, 'base64url').toString('utf8');
    const parsed = JSON.parse(json);
    if (parsed && parsed.studentId && parsed.role === 'STUDENT') {
      return parsed as StudentSessionPayload;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Sets student session cookie on a NextResponse object
 */
export function setStudentSessionCookie(response: NextResponse, payload: StudentSessionPayload): void {
  const encoded = encodeSession(payload);
  response.cookies.set({
    name: COOKIE_NAME,
    value: encoded,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: MAX_AGE_SECONDS,
  });
}

/**
 * Clears student session cookie on a NextResponse object
 */
export function clearStudentSessionCookie(response: NextResponse): void {
  response.cookies.set({
    name: COOKIE_NAME,
    value: '',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
}

/**
 * Retrieves current student session from cookies (Server Components or Route Handlers)
 */
export async function getStudentSession(): Promise<StudentSessionPayload | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(COOKIE_NAME);
  if (!sessionCookie || !sessionCookie.value) {
    return null;
  }
  return decodeSession(sessionCookie.value);
}

/**
 * Retrieves student session from NextRequest (Middleware / Route Handlers)
 */
export function getStudentSessionFromRequest(request: NextRequest): StudentSessionPayload | null {
  const sessionCookie = request.cookies.get(COOKIE_NAME);
  if (!sessionCookie || !sessionCookie.value) {
    return null;
  }
  return decodeSession(sessionCookie.value);
}
