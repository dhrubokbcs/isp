import { NextResponse } from 'next/server';
import {
  updateFacultyAttendanceRecord,
  createFacultyAttendanceRecord,
} from '@/lib/db/supabaseFacultyAttendance';
import { getAttendanceSettings } from '@/lib/db/supabaseSettings';
import { calculateDurationString } from '@/lib/types/facultyAttendance';
import { requireAdmin, requireRole } from '@/lib/auth/requireSession';
import { checkRateLimit, getClientIp } from '@/lib/security/rateLimit';
import { verifyPassword } from '@/lib/security/password';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const getHeaders = () => {
  if (!SERVICE_KEY) {
    throw new Error('Server configuration error: SUPABASE_SERVICE_ROLE_KEY is required.');
  }
  return {
    apikey: SERVICE_KEY,
    Authorization: `Bearer ${SERVICE_KEY}`,
    'Content-Type': 'application/json',
  };
};

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const body = await request.json();
    const action = body.action; // 'CHECK_IN' | 'CHECK_OUT' | 'ASSIGN_SUBSTITUTE' | 'UPDATE_STATUS'
    const checkInMethod = body.checkInMethod || 'ADMIN_RECEPTION';
    const settings = await getAttendanceSettings();

    let authorizedFacultyName = body.facultyName;

    // 1. Authorization checks based on checkInMethod
    if (checkInMethod === 'QR_PUNCH') {
      const rateLimit = checkRateLimit(`qr_punch:${ip}`, 15, 5 * 60 * 1000);
      if (!rateLimit.allowed) {
        return NextResponse.json(
          { success: false, error: `Too many punch requests. Please wait ${rateLimit.resetInSeconds}s.` },
          { status: 429 }
        );
      }
      if (!settings.allowQrAttendance) {
        return NextResponse.json(
          { success: false, error: 'Frontdesk QR self-attendance is currently disabled by Admin.' },
          { status: 403 }
        );
      }

      // Server-side Teacher Identity & PIN verification
      const teacherId = body.teacherId;
      const pin = body.pin ? String(body.pin).trim() : '';

      if (!teacherId || !pin) {
        return NextResponse.json(
          { success: false, error: 'Teacher profile ID and 4-digit PIN are required for kiosk punch.' },
          { status: 400 }
        );
      }

      // Verify teacher in database
      const tRes = await fetch(`${SUPABASE_URL}/rest/v1/teachers?id=eq.${encodeURIComponent(teacherId)}&select=*,user:users(*)&limit=1`, {
        headers: getHeaders(),
      });

      if (!tRes.ok) {
        return NextResponse.json({ success: false, error: 'Teacher verification failed.' }, { status: 401 });
      }

      const rows = await tRes.json();
      if (!Array.isArray(rows) || rows.length === 0) {
        return NextResponse.json({ success: false, error: 'Teacher profile not found.' }, { status: 404 });
      }

      const teacher = rows[0];
      const user = teacher.user || {};
      if (user.status !== 'ACTIVE') {
        return NextResponse.json({ success: false, error: 'Teacher profile is not active.' }, { status: 403 });
      }

      // Cryptographically verify teacher's credentials (account password or dedicated kiosk PIN)
      const userPasswordHash = user.password_hash || '';
      const dedicatedPinHash = teacher.metadata?.kiosk_pin_hash || user.metadata?.kiosk_pin_hash || '';

      let isValidCredentials = false;

      if (dedicatedPinHash) {
        const pinCheck = await verifyPassword(pin, dedicatedPinHash);
        isValidCredentials = pinCheck.matches;
      }

      if (!isValidCredentials && userPasswordHash) {
        const passCheck = await verifyPassword(pin, userPasswordHash);
        isValidCredentials = passCheck.matches;
      }

      if (!isValidCredentials) {
        return NextResponse.json({ success: false, error: 'Invalid educator credentials. Please enter your account password or assigned security PIN.' }, { status: 401 });
      }

      authorizedFacultyName = user.full_name || teacher.full_name || body.facultyName;
    } else if (checkInMethod === 'TEACHER_PORTAL') {
      const auth = await requireRole(['TEACHER', 'ADMIN', 'SUPERADMIN'], request);
      if (auth.errorResponse) return auth.errorResponse;

      if (!settings.allowTeacherSelfAttendance) {
        return NextResponse.json(
          {
            success: false,
            error: 'Teacher self-attendance is currently disabled by Admin. Attendance is marked by Campus Reception.',
          },
          { status: 403 }
        );
      }

      // If user is a TEACHER, bind punch name strictly to authenticated user's name
      if (auth.user.role === 'TEACHER') {
        authorizedFacultyName = auth.user.fullName;
      }
    } else {
      // Default: ADMIN_RECEPTION & administrative overrides require Admin
      const auth = await requireAdmin(request);
      if (auth.errorResponse) return auth.errorResponse;
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
          checkInMethod,
          facultyName: authorizedFacultyName,
        });
        return NextResponse.json({ success: true, record: updated });
      } else {
        const created = await createFacultyAttendanceRecord({
          date: body.date || new Date().toISOString().split('T')[0],
          batchName: body.batchName || 'Campus Session',
          slotStart: body.slotStart || '08:00 AM',
          slotEnd: body.slotEnd || '08:00 PM',
          facultyName: authorizedFacultyName,
          entryTime: nowTimeStr,
          exitTime: null,
          totalStudents: 0,
          status: 'IN_PROGRESS',
          checkInMethod,
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
      const auth = await requireAdmin(request);
      if (auth.errorResponse) return auth.errorResponse;

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
      const auth = await requireAdmin(request);
      if (auth.errorResponse) return auth.errorResponse;

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
