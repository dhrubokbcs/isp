import { fetchStudentsFromSupabase, StudentFullProfile } from './supabaseStudents';
import { fetchBatchesFromSupabase, fetchSubjectsFromSupabase } from './supabaseAcademics';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const getHeaders = () => ({
  apikey: SUPABASE_SERVICE_ROLE_KEY,
  Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
  'Content-Type': 'application/json',
});

export interface AttendanceStudentRow {
  studentDbId: string;
  studentId: string;
  fullName: string;
  phone?: string;
  batchName?: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';
}

export interface ClassSessionRecord {
  id: string;
  batchId: string;
  subjectName: string;
  sessionDate: string;
  startTime: string;
  endTime: string;
  status: string;
}

export async function getOrCreateSession(
  batchId: string,
  subjectName: string,
  date: string,
  startTime: string = '10:00:00',
  endTime: string = '11:30:00'
): Promise<ClassSessionRecord | null> {
  try {
    // 1. Check existing session for this batch, date, and subject
    const checkRes = await fetch(
      `${SUPABASE_URL}/rest/v1/class_sessions?batch_id=eq.${batchId}&session_date=eq.${date}&subject_name=eq.${encodeURIComponent(
        subjectName
      )}&select=*`,
      { headers: getHeaders() }
    );

    if (checkRes.ok) {
      const existing = await checkRes.json();
      if (existing && existing.length > 0) {
        const row = existing[0];
        return {
          id: row.id,
          batchId: row.batch_id,
          subjectName: row.subject_name,
          sessionDate: row.session_date,
          startTime: row.start_time,
          endTime: row.end_time,
          status: row.status,
        };
      }
    }

    // 2. Create session if not found
    const createRes = await fetch(`${SUPABASE_URL}/rest/v1/class_sessions`, {
      method: 'POST',
      headers: {
        ...getHeaders(),
        Prefer: 'return=representation',
      },
      body: JSON.stringify({
        batch_id: batchId,
        subject_name: subjectName,
        session_date: date,
        start_time: startTime,
        end_time: endTime,
        status: 'SCHEDULED',
      }),
    });

    if (!createRes.ok) {
      console.error('Failed to create class_session:', await createRes.text());
      return null;
    }

    const created = (await createRes.json())[0];
    return {
      id: created.id,
      batchId: created.batch_id,
      subjectName: created.subject_name,
      sessionDate: created.session_date,
      startTime: created.start_time,
      endTime: created.end_time,
      status: created.status,
    };
  } catch (err) {
    console.error('Error in getOrCreateSession:', err);
    return null;
  }
}

export async function getExistingAttendance(sessionId: string): Promise<Record<string, 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED'>> {
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/attendance_records?session_id=eq.${sessionId}&select=student_id,status`,
      { headers: getHeaders() }
    );

    if (!res.ok) return {};

    const rows = await res.json();
    const map: Record<string, 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED'> = {};
    for (const r of rows) {
      map[r.student_id] = r.status;
    }
    return map;
  } catch (err) {
    console.error('Error in getExistingAttendance:', err);
    return {};
  }
}

export async function saveAttendanceToSupabase(
  sessionId: string,
  records: { studentDbId: string; status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED' }[]
): Promise<boolean> {
  try {
    if (!sessionId || records.length === 0) return true;

    const payload = records.map((r) => ({
      session_id: sessionId,
      student_id: r.studentDbId,
      status: r.status,
      marked_at: new Date().toISOString(),
    }));

    // Upsert into public.attendance_records using on_conflict (session_id, student_id)
    const res = await fetch(`${SUPABASE_URL}/rest/v1/attendance_records?on_conflict=session_id,student_id`, {
      method: 'POST',
      headers: {
        ...getHeaders(),
        Prefer: 'resolution=merge-duplicates,return=representation',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      console.error('Failed to upsert attendance_records:', await res.text());
      return false;
    }

    return true;
  } catch (err) {
    console.error('Error in saveAttendanceToSupabase:', err);
    return false;
  }
}
