import { NextResponse } from 'next/server';
import { getStudentSession } from '@/lib/auth/studentSession';

export async function GET() {
  try {
    const student = await getStudentSession();

    if (!student) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: No active student session.' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      student,
    });
  } catch (err: any) {
    console.error('Error fetching student session:', err);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve session profile.' },
      { status: 500 }
    );
  }
}
