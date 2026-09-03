import { NextResponse } from 'next/server';
import {
  updateFacultyAttendanceRecord,
  createFacultyAttendanceRecord,
} from '@/lib/db/supabaseFacultyAttendance';
import { getAttendanceSettings } from '@/lib/db/supabaseSettings';
import { calculateDurationString } from '@/lib/types/facultyAttendance';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const action = body.action; // 'CHECK_IN' | 'CHECK_OUT' | 'ASSIGN_SUBSTITUTE' | 'UPDATE_STATUS'
    const settings = await getAttendanceSettings();

    // Check if Teacher self-checkin is requested
    if (body.checkInMethod === 'TEACHER_PORTAL' && !settings.allowTeacherSelfAttendance) {
      return NextResponse.json(
        {
          success: false,
          error: 'Teacher self-attendance is currently disabled by Admin. Attendance is marked by Campus Reception.',
        },
        { status: 403 }
      );
    }

    if (body.checkInMethod === 'QR_PUNCH' && !settings.allowQrAttendance) {
      return NextResponse.json(
        {
          success: false,
          error: 'Frontdesk QR self-attendance is currently disabled by Admin.',
        },
        { status: 403 }
      );
    }

    const nowTimeStr =
      body.time ||
      new Date().toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      });

    if (action === 'CHECK_IN') {
      if (body.id) {
        const updated = await updateFacultyAttendanceRecord(body.id, {
          entryTime: nowTimeStr,
          status: 'IN_PROGRESS',
          checkInMethod: body.checkInMethod || 'ADMIN_RECEPTION',
          facultyName: body.facultyName,
        });
        return NextResponse.json({ success: true, record: updated });
      } else {
        const created = await createFacultyAttendanceRecord({
          date: body.date || new Date().toISOString().split('T')[0],
          batchName: body.batchName,
          slotStart: body.slotStart,
          slotEnd: body.slotEnd,
          facultyName: body.facultyName,
          entryTime: nowTimeStr,
          exitTime: null,
          totalStudents: 0,
          status: 'IN_PROGRESS',
          checkInMethod: body.checkInMethod || 'ADMIN_RECEPTION',
        });
        return NextResponse.json({ success: true, record: created });
      }
    }

    if (action === 'CHECK_OUT') {
      if (!body.id) {
        return NextResponse.json({ success: false, error: 'Session ID required for Check-out' }, { status: 400 });
      }

      const duration = calculateDurationString(body.entryTime, nowTimeStr);
      const updated = await updateFacultyAttendanceRecord(body.id, {
        exitTime: nowTimeStr,
        duration: duration || body.duration,
        totalStudents: body.totalStudents ? parseInt(body.totalStudents, 10) : undefined,
        topicCovered: body.topicCovered,
        remark: body.remark,
        status: body.status || 'PRESENT',
      });
      return NextResponse.json({ success: true, record: updated });
    }

    if (action === 'ASSIGN_SUBSTITUTE') {
      if (!body.id || !body.substituteFacultyName) {
        return NextResponse.json(
          { success: false, error: 'Session ID and Substitute Faculty Name are required.' },
          { status: 400 }
        );
      }
      const updated = await updateFacultyAttendanceRecord(body.id, {
        substituteFacultyName: body.substituteFacultyName,
        remark: `Substitute assigned: ${body.substituteFacultyName} (Original: ${body.originalFacultyName || 'Scheduled'})`,
      });
      return NextResponse.json({ success: true, record: updated });
    }

    if (action === 'UPDATE_STATUS') {
      if (!body.id) {
        return NextResponse.json({ success: false, error: 'Session ID required.' }, { status: 400 });
      }
      const updated = await updateFacultyAttendanceRecord(body.id, {
        status: body.status,
        remark: body.remark,
      });
      return NextResponse.json({ success: true, record: updated });
    }

    return NextResponse.json({ success: false, error: 'Invalid punch action' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
