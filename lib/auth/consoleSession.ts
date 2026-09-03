import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { signToken, verifyToken } from './sessionTokens';

export interface ConsoleSessionPayload {
  uid: string;
  email: string;
  fullName: string;
  role: 'SUPERADMIN' | 'ADMIN' | 'TEACHER';
  designation?: string;
  employeeId?: string;
  issuedAt: number;
  expiresAt: number;
}

export const CONSOLE_SESSION_COOKIE = 'isp_console_session';
const MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days

/**
 * Sets a cryptographically signed, HttpOnly console session cookie
 */
export function setConsoleSessionCookie(response: NextResponse, payload: Omit<ConsoleSessionPayload, 'issuedAt' | 'expiresAt'>): void {
  const fullPayload: ConsoleSessionPayload = {
    ...payload,
    issuedAt: Date.now(),
    expiresAt: Date.now() + MAX_AGE_SECONDS * 1000,
  };

  const token = signToken(fullPayload);

  response.cookies.set({
    name: CONSOLE_SESSION_COOKIE,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: MAX_AGE_SECONDS,
  });
}

/**
 * Clears console session cookie
 */
export function clearConsoleSessionCookie(response: NextResponse): void {
  response.cookies.set({
    name: CONSOLE_SESSION_COOKIE,
    value: '',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
}

/**
 * Retrieves and validates the console session from server cookies
 */
export async function getConsoleSession(): Promise<ConsoleSessionPayload | null> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(CONSOLE_SESSION_COOKIE);
    if (!sessionCookie || !sessionCookie.value) return null;

    const payload = verifyToken<ConsoleSessionPayload>(sessionCookie.value);
    if (!payload || !payload.uid || !payload.role) return null;

    if (Date.now() > payload.expiresAt) return null;
    return payload;
  } catch {
    return null;
  }
}

/**
 * Retrieves and validates the console session from a NextRequest
 */
export function getConsoleSessionFromRequest(request: Request | NextRequest): ConsoleSessionPayload | null {
  try {
    let cookieHeader = '';
    if ('cookies' in request && typeof (request as NextRequest).cookies?.get === 'function') {
      const cookie = (request as NextRequest).cookies.get(CONSOLE_SESSION_COOKIE);
      if (cookie?.value) {
        return verifyToken<ConsoleSessionPayload>(cookie.value);
      }
    }

    // Standard header check
    cookieHeader = request.headers.get('cookie') || '';
    const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${CONSOLE_SESSION_COOKIE}=([^;]*)`));
    if (!match || !match[1]) return null;

    const token = decodeURIComponent(match[1]);
    const payload = verifyToken<ConsoleSessionPayload>(token);
    if (!payload || !payload.uid || !payload.role) return null;
    if (Date.now() > payload.expiresAt) return null;

    return payload;
  } catch {
    return null;
  }
}
