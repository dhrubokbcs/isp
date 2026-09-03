import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { signToken, verifyToken } from './sessionTokens';

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
  expiresAt: number;
}

const COOKIE_NAME = 'isp_student_session';
const MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days

/**
 * Encodes student session payload into a cryptographically signed HMAC SHA-256 token
 */
export function encodeSession(payload: StudentSessionPayload): string {
  const finalPayload: StudentSessionPayload = {
    ...payload,
    issuedAt: payload.issuedAt || Date.now(),
    expiresAt: payload.expiresAt || Date.now() + MAX_AGE_SECONDS * 1000,
  };
  return signToken(finalPayload);
}

/**
 * Decodes and cryptographically verifies session string from cookie value with expiry validation
 */
export function decodeSession(cookieValue: string): StudentSessionPayload | null {
  if (!cookieValue) return null;
  const payload = verifyToken<StudentSessionPayload>(cookieValue);
  if (!payload || !payload.studentId || payload.role !== 'STUDENT') {
    return null;
  }

  // Server-side expiry validation
  if (payload.expiresAt && Date.now() > payload.expiresAt) {
    return null;
  }

  return payload;
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
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(COOKIE_NAME);
    if (!sessionCookie || !sessionCookie.value) {
      return null;
    }
    return decodeSession(sessionCookie.value);
  } catch {
    return null;
  }
}

/**
 * Retrieves student session from NextRequest (Middleware / Route Handlers)
 */
export function getStudentSessionFromRequest(request: Request | NextRequest): StudentSessionPayload | null {
  try {
    if ('cookies' in request && typeof (request as NextRequest).cookies?.get === 'function') {
      const sessionCookie = (request as NextRequest).cookies.get(COOKIE_NAME);
      if (sessionCookie?.value) {
        return decodeSession(sessionCookie.value);
      }
    }

    const cookieHeader = request.headers.get('cookie') || '';
    const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${COOKIE_NAME}=([^;]*)`));
    if (!match || !match[1]) return null;

    const token = decodeURIComponent(match[1]);
    return decodeSession(token);
  } catch {
    return null;
  }
}
