import { NextResponse } from 'next/server';
import { requireAdmin, requireUser } from '@/lib/auth/requireSession';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

function getHeaders() {
  if (!SERVICE_KEY) {
    throw new Error('Server configuration error: SUPABASE_SERVICE_ROLE_KEY is required.');
  }
  return {
    apikey: SERVICE_KEY,
    Authorization: `Bearer ${SERVICE_KEY}`,
    'Content-Type': 'application/json',
  };
}

export async function GET(request: Request) {
  try {
    const auth = await requireUser(request);
    if (auth.errorResponse) return auth.errorResponse;

    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/class_sessions?select=*,batch:batches(id,name),teacher:teachers(id,designation,user:users(id,full_name))&order=created_at.desc`,
      {
        headers: getHeaders(),
        cache: 'no-store',
      }
    );

    if (!res.ok) {
      return NextResponse.json({ success: true, count: 0, sessions: [] });
    }

    const rows = await res.json();
    if (!Array.isArray(rows)) {
      return NextResponse.json({ success: true, count: 0, sessions: [] });
    }

    const sessions = rows.map((cs: any) => {
      const batchName = cs.batch?.name || 'SSC 2028 Science Morning A';
      const teacherName = cs.teacher?.user?.full_name || 'Mohammad Sakib';
      const roomNumber = cs.room_name || 'Room 101';
      const subject = cs.subject_name || 'General Subject';
      const dayOfWeek = cs.session_date ? getDayName(cs.session_date) : 'SATURDAY';

      return {
        id: cs.id,
        batchId: cs.batch_id,
        batchName,
        cohort: batchName,
        subject,
        teacherName,
        roomNumber,
        dayOfWeek,
        startTime: formatTime(cs.start_time || '10:00:00'),
        endTime: formatTime(cs.end_time || '11:30:00'),
        isActive: cs.status !== 'CANCELLED',
      };
    });

    return NextResponse.json({
      success: true,
      count: sessions.length,
      sessions,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

function getDayName(dateStr: string): string {
  try {
    const days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
    const d = new Date(dateStr);
    return days[d.getDay()] || 'SATURDAY';
  } catch {
    return 'SATURDAY';
  }
}

function formatTime(timeStr: string): string {
  if (!timeStr) return '10:00 AM';
  if (timeStr.includes('AM') || timeStr.includes('PM')) return timeStr;
  try {
    const parts = timeStr.split(':');
    let h = parseInt(parts[0], 10);
    const m = parts[1] || '00';
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12;
    if (h === 0) h = 12;
    return `${h.toString().padStart(2, '0')}:${m} ${ampm}`;
  } catch {
    return timeStr;
  }
}

export async function POST(request: Request) {
  try {
    const auth = await requireAdmin(request);
    if (auth.errorResponse) return auth.errorResponse;

    const body = await request.json();
    const { batchId, subject, teacherName, roomNumber, startTime, endTime } = body;

    const payload = {
      batch_id: batchId || null,
      subject_name: subject || 'General Subject',
      room_name: roomNumber || 'Room 101',
      session_date: new Date().toISOString().split('T')[0],
      start_time: startTime || '10:00:00',
      end_time: endTime || '11:30:00',
      status: 'SCHEDULED',
    };

    const res = await fetch(`${SUPABASE_URL}/rest/v1/class_sessions`, {
      method: 'POST',
      headers: {
        ...getHeaders(),
        Prefer: 'return=representation',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Failed to create class session in Supabase: ${err}`);
    }

    const rows = await res.json();
    const created = Array.isArray(rows) ? rows[0] : rows;

    return NextResponse.json({
      success: true,
      session: {
        id: created.id,
        batchId: created.batch_id,
        batchName: 'SSC 2028 Science Morning A',
        subject: created.subject_name,
        teacherName: teacherName || 'Mohammad Sakib',
        roomNumber: created.room_name || 'Room 101',
        dayOfWeek: 'TODAY',
        startTime: created.start_time,
        endTime: created.end_time,
        isActive: true,
      },
    }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const auth = await requireAdmin(request);
    if (auth.errorResponse) return auth.errorResponse;

    const body = await request.json();
    const { id, action, isActive, subject, roomNumber, startTime, endTime } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Session ID is required' }, { status: 400 });
    }

    const payload: any = {};
    if (action === 'TOGGLE_STATUS') {
      payload.status = isActive ? 'SCHEDULED' : 'CANCELLED';
    } else {
      if (subject) payload.subject_name = subject;
      if (roomNumber) payload.room_name = roomNumber;
      if (startTime) payload.start_time = startTime;
      if (endTime) payload.end_time = endTime;
    }

    const res = await fetch(`${SUPABASE_URL}/rest/v1/class_sessions?id=eq.${id}`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });

    return NextResponse.json({ success: res.ok });
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
      return NextResponse.json({ success: false, error: 'Session ID is required' }, { status: 400 });
    }

    const res = await fetch(`${SUPABASE_URL}/rest/v1/class_sessions?id=eq.${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });

    return NextResponse.json({ success: res.ok });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
