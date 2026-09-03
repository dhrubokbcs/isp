import { NextResponse } from 'next/server';
import { clearStudentSessionCookie } from '@/lib/auth/studentSession';

export async function POST() {
  const response = NextResponse.json({
    success: true,
    message: 'Logged out successfully.',
  });

  clearStudentSessionCookie(response);
  return response;
}
