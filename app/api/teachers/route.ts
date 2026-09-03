import { NextResponse } from 'next/server';
import {
  fetchTeachersFromSupabase,
  createTeacherInSupabase,
  getNextEmployeeIdFromSupabase,
  updateTeacherInSupabase,
} from '@/lib/db/supabaseTeachers';
import { sendUserCredentialsWelcomeEmail } from '@/lib/email/mailer';
import { requireAdmin, requireUser } from '@/lib/auth/requireSession';

export async function GET(request: Request) {
  try {
    const auth = await requireUser(request);
    if (auth.errorResponse) return auth.errorResponse;

    const teachers = await fetchTeachersFromSupabase();
    const nextEmployeeId = await getNextEmployeeIdFromSupabase();

    return NextResponse.json({
      success: true,
      source: 'database',
      count: teachers.length,
      nextEmployeeId,
      teachers,
    });
  } catch (err: any) {
    console.error('Error in GET /api/teachers:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to fetch teachers from database' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const auth = await requireAdmin(request);
    if (auth.errorResponse) return auth.errorResponse;

    const body = await request.json();
    const {
      fullName,
      nickname,
      designation,
      dob,
      gender,
      bio,
      educationalDetails,
      experience,
      mobile,
      whatsapp,
      email,
      initialPassword,
    } = body;

    if (!fullName || !email || !mobile) {
      return NextResponse.json(
        { success: false, error: 'Full Name, Email, and Mobile number are required.' },
        { status: 400 }
      );
    }

    const createdTeacher = await createTeacherInSupabase({
      fullName,
      nickname,
      designation,
      dob,
      gender,
      bio,
      educationalDetails,
      experience,
      mobile,
      whatsapp,
      email,
      initialPassword,
    });

    // Send Welcome Email with credentials & password change instructions
    try {
      await sendUserCredentialsWelcomeEmail({
        to: createdTeacher.email,
        fullName: createdTeacher.fullName,
        role: 'TEACHER',
        employeeId: createdTeacher.employeeId,
        initialPassword: createdTeacher.initialPassword,
      });
    } catch (mailErr) {
      console.warn('Welcome email dispatch notice for teacher:', mailErr);
    }

    return NextResponse.json(
      {
        success: true,
        source: 'database',
        message: `Teacher saved in database with Employee ID ${createdTeacher.employeeId}`,
        teacher: createdTeacher,
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to register teacher in database' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const auth = await requireAdmin(request);
    if (auth.errorResponse) return auth.errorResponse;

    const body = await request.json();
    const { employeeId, ...updates } = body;
    if (!employeeId) {
      return NextResponse.json(
        { success: false, error: 'Employee ID is required' },
        { status: 400 }
      );
    }

    const ok = await updateTeacherInSupabase(employeeId, updates);

    return NextResponse.json({
      success: ok,
      message: ok ? `Teacher updated successfully` : 'Teacher not found',
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
