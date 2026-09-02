import { NextResponse } from 'next/server';
import {
  fetchTimetableFromSupabase,
  createTimetableSessionInSupabase,
  updateTimetableSessionInSupabase,
  deleteTimetableSessionInSupabase,
} from '@/lib/db/supabaseAcademics';

export async function GET() {
  try {
    const sessions = await fetchTimetableFromSupabase();
    return NextResponse.json({
      success: true,
      source: 'supabase',
      count: sessions.length,
      sessions,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { batchId, batchName, subject, teacherName, roomNumber, dayOfWeek, startTime, endTime } = body;
    if (!subject) {
      return NextResponse.json(
        { success: false, error: 'Subject is required' },
        { status: 400 }
      );
    }
    const created = await createTimetableSessionInSupabase({
      batchId,
      batchName,
      subject,
      teacherName,
      roomNumber: roomNumber || 'Room 101',
      dayOfWeek: dayOfWeek || 'SATURDAY',
      startTime: startTime || '08:00',
      endTime: endTime || '09:30',
    });
    return NextResponse.json({ success: true, session: created }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, action, ...updates } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Session ID is required' }, { status: 400 });
    }

    if (action === 'TOGGLE_STATUS') {
      const { isActive } = body;
      const ok = await updateTimetableSessionInSupabase(id, { isActive });
      return NextResponse.json({ success: ok });
    }

    const ok = await updateTimetableSessionInSupabase(id, updates);
    return NextResponse.json({ success: ok });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Session ID is required' }, { status: 400 });
    }

    const ok = await deleteTimetableSessionInSupabase(id);
    return NextResponse.json({ success: ok });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
