import { NextResponse } from 'next/server';
import { requireStudent } from '@/lib/auth/requireSession';

export async function GET(request: Request) {
  try {
    const auth = await requireStudent(request);
    if (auth.errorResponse) return auth.errorResponse;

    return NextResponse.json({
      success: true,
      student: auth.user,
    });
  } catch (err: any) {
    console.error('Error fetching student session:', err);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve session profile.' },
      { status: 500 }
    );
  }
}
