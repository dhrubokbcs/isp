import { NextResponse } from 'next/server';
import {
  findExistingSession,
  getOrCreateSession,
  getExistingAttendance,
  saveAttendanceToSupabase,
} from '@/lib/db/supabaseAttendance';
import { fetchStudentsFromSupabase } from '@/lib/db/supabaseStudents';
import { requireTeacherOrAdmin } from '@/lib/auth/requireSession';

export async function GET(request: Request) {
  try {
    const auth = await requireTeacherOrAdmin(request);
    if (auth.errorResponse) return auth.errorResponse;

    const { searchParams } = new URL(request.url);
    const batchId = searchParams.get('batchId');
    const subjectName = searchParams.get('subjectName') || 'General Session';
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0];

    if (!batchId) {
      return NextResponse.json({ success: false, error: 'batchId is required' }, { status: 400 });
    }

    // 1. Find existing session (pure read-only)
    const session = await findExistingSession(batchId, subjectName, date);

    // 2. Fetch students
    const allStudents = await fetchStudentsFromSupabase();
    let batchStudents = allStudents.filter((s) => s.batchId === batchId);
    if (batchStudents.length === 0 && allStudents.length > 0) {
      batchStudents = allStudents;
    }

    // 3. Fetch existing attendance records if session exists
    const existing = session ? await getExistingAttendance(session.id) : {};

    // 4. Construct roster
    const roster = batchStudents.map((s) => ({
      studentDbId: s.id,
      studentId: s.studentId,
      fullName: s.fullName,
      phone: s.phone,
      batchName: s.batchName,
      status: existing[s.id] || 'PRESENT',
    }));

    return NextResponse.json({
      success: true,
      session: session || {
        id: null,
        batchId,
        subjectName,
        sessionDate: date,
        status: 'DRAFT',
      },
      roster,
      isPreviouslySaved: Object.keys(existing).length > 0,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const auth = await requireTeacherOrAdmin(request);
    if (auth.errorResponse) return auth.errorResponse;

    const body = await request.json();
    let { sessionId } = body;
    const { batchId, subjectName, date, startTime, endTime, records } = body;

    if (!Array.isArray(records)) {
      return NextResponse.json(
        { success: false, error: 'records array is required' },
        { status: 400 }
      );
    }

    // If session does not exist yet, create it on save
    if (!sessionId) {
      if (!batchId || !subjectName || !date) {
        return NextResponse.json(
          { success: false, error: 'batchId, subjectName, and date are required to initialize session.' },
          { status: 400 }
        );
      }
      const session = await getOrCreateSession(batchId, subjectName, date, startTime, endTime);
      if (!session) {
        return NextResponse.json({ success: false, error: 'Failed to create session in database.' }, { status: 500 });
      }
      sessionId = session.id;
    }

    const ok = await saveAttendanceToSupabase(sessionId, records);
    return NextResponse.json({ success: ok, sessionId });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
