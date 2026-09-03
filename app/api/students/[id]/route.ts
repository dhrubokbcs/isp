import { NextResponse } from 'next/server';
import { getStudentById, updateStudentInSupabase, deleteStudentInSupabase } from '@/lib/db/supabaseStudents';
import { requireUser, requireAdmin } from '@/lib/auth/requireSession';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireUser(request);
    if (auth.errorResponse) return auth.errorResponse;

    const { id } = await params;
    const student = await getStudentById(id);

    if (!student) {
      return NextResponse.json({ success: false, error: 'Student not found' }, { status: 404 });
    }

    // Role check: Admin and Teachers can view all; Students can only view their own record
    if (auth.user.role === 'STUDENT' && auth.user.id !== student.id && auth.user.studentId !== student.studentId) {
      return NextResponse.json(
        { success: false, error: 'Forbidden. You cannot view other student records.' },
        { status: 403 }
      );
    }

    return NextResponse.json({ success: true, student });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAdmin(request);
    if (auth.errorResponse) return auth.errorResponse;

    const { id } = await params;
    const body = await request.json();

    const ok = await updateStudentInSupabase(id, body);
    if (!ok) {
      return NextResponse.json({ success: false, error: 'Failed to update student' }, { status: 400 });
    }

    const updated = await getStudentById(id);
    return NextResponse.json({ success: true, student: updated });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAdmin(request);
    if (auth.errorResponse) return auth.errorResponse;

    const { id } = await params;
    const ok = await deleteStudentInSupabase(id);
    return NextResponse.json({ success: ok });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
