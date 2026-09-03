import { NextResponse } from 'next/server';
import {
  fetchStudentsFromSupabase,
  createStudentInSupabase,
  updateStudentInSupabase,
  deleteStudentInSupabase,
} from '@/lib/db/supabaseStudents';
import { sendStudentAdmissionWelcomeEmail } from '@/lib/email/mailer';
import { requireAdmin, requireTeacherOrAdmin } from '@/lib/auth/requireSession';

export async function GET(request: Request) {
  try {
    const auth = await requireTeacherOrAdmin(request);
    if (auth.errorResponse) return auth.errorResponse;

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || undefined;

    const students = await fetchStudentsFromSupabase(query);
    return NextResponse.json({
      success: true,
      source: 'supabase',
      count: students.length,
      students,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const auth = await requireAdmin(request);
    if (auth.errorResponse) return auth.errorResponse;

    const body = await request.json();
    const { fullName, admissionYear } = body;

    if (!fullName || !fullName.trim()) {
      return NextResponse.json({ success: false, error: 'Full Name is required' }, { status: 400 });
    }

    const created = await createStudentInSupabase({
      ...body,
      admissionYear: parseInt(admissionYear, 10) || 2028,
    });

    if (created?.email && created.email.includes('@')) {
      sendStudentAdmissionWelcomeEmail({
        to: created.email,
        studentName: created.fullName,
        studentId: created.studentId,
        batchName: created.batchName,
        admissionYear: created.admissionAcademicYear,
      }).catch((e) => console.warn('[Welcome Email Notice]:', e.message));
    }

    return NextResponse.json({ success: true, student: created }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const auth = await requireAdmin(request);
    if (auth.errorResponse) return auth.errorResponse;

    const body = await request.json();
    const { id, action, ...updates } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Student ID is required' }, { status: 400 });
    }

    if (action === 'TOGGLE_STATUS') {
      const { status } = body;
      const ok = await updateStudentInSupabase(id, { status });
      return NextResponse.json({ success: ok });
    }

    const ok = await updateStudentInSupabase(id, updates);
    return NextResponse.json({ success: ok });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const auth = await requireAdmin(request);
    if (auth.errorResponse) return auth.errorResponse;

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Student ID is required' }, { status: 400 });
    }

    const ok = await deleteStudentInSupabase(id);
    return NextResponse.json({ success: ok });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
