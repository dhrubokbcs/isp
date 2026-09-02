import { NextResponse } from 'next/server';
import {
  getOrCreateSession,
  getExistingAttendance,
  saveAttendanceToSupabase,
} from '@/lib/db/supabaseAttendance';
import { fetchStudentsFromSupabase } from '@/lib/db/supabaseStudents';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const batchId = searchParams.get('batchId');
    const subjectName = searchParams.get('subjectName') || 'General Session';
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0];
    const startTime = searchParams.get('startTime') || '10:00:00';
    const endTime = searchParams.get('endTime') || '11:30:00';

    if (!batchId) {
      return NextResponse.json({ success: false, error: 'batchId is required' }, { status: 400 });
    }

    // 1. Get or create session
    const session = await getOrCreateSession(batchId, subjectName, date, startTime, endTime);
    if (!session) {
      return NextResponse.json({ success: false, error: 'Failed to find or create session' }, { status: 500 });
    }

    // 2. Fetch students
    const allStudents = await fetchStudentsFromSupabase();
    // Filter by batch, or if batch has none, allow all
    let batchStudents = allStudents.filter((s) => s.batchId === batchId);
    if (batchStudents.length === 0 && allStudents.length > 0) {
      // Fallback: If no student specifically assigned to this batch yet, list all active students
      batchStudents = allStudents;
    }

    // 3. Fetch existing attendance records for this session
    const existing = await getExistingAttendance(session.id);

    // 4. Construct roster
    const roster = batchStudents.map((s) => ({
      studentDbId: s.id,
      studentId: s.studentId,
      fullName: s.fullName,
      phone: s.phone,
      batchName: s.batchName,
      status: existing[s.id] || 'PRESENT', // default to PRESENT if not marked yet
    }));

    return NextResponse.json({
      success: true,
      session,
      roster,
      isPreviouslySaved: Object.keys(existing).length > 0,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { sessionId, records } = body;

    if (!sessionId || !Array.isArray(records)) {
      return NextResponse.json(
        { success: false, error: 'sessionId and records array are required' },
        { status: 400 }
      );
    }

    const ok = await saveAttendanceToSupabase(sessionId, records);
    return NextResponse.json({ success: ok });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
