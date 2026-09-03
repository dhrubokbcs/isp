import { fetchStudentsFromSupabase, StudentFullProfile } from './supabaseStudents';
import { fetchBatchesFromSupabase, fetchSubjectsFromSupabase } from './supabaseAcademics';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const getHeaders = () => {
  if (!SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Server configuration error: SUPABASE_SERVICE_ROLE_KEY is required.');
  }
  return {
    apikey: SUPABASE_SERVICE_ROLE_KEY,
    Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
    'Content-Type': 'application/json',
  };
};

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

/**
 * Pure read-only query to find existing session without state mutation
 */
export async function findExistingSession(
  batchId: string,
  subjectName: string,
  date: string
): Promise<ClassSessionRecord | null> {
  try {
    const checkRes = await fetch(
      `${SUPABASE_URL}/rest/v1/class_sessions?batch_id=eq.${encodeURIComponent(batchId)}&session_date=eq.${encodeURIComponent(date)}&subject_name=eq.${encodeURIComponent(
        subjectName
      )}&select=*&limit=1`,
      { headers: getHeaders(), cache: 'no-store' }
    );

    if (checkRes.ok) {
      const existing = await checkRes.json();
      if (Array.isArray(existing) && existing.length > 0) {
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
    return null;
  } catch (err) {
    console.error('Error in findExistingSession:', err);
    return null;
  }
}

export async function getOrCreateSession(
  batchId: string,
  subjectName: string,
  date: string,
  startTime: string = '10:00:00',
  endTime: string = '11:30:00'
): Promise<ClassSessionRecord | null> {
  try {
    const existing = await findExistingSession(batchId, subjectName, date);
    if (existing) return existing;

    // Create session
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
      `${SUPABASE_URL}/rest/v1/attendance_records?session_id=eq.${encodeURIComponent(sessionId)}&select=student_id,status`,
      { headers: getHeaders(), cache: 'no-store' }
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
  records: Array<{ studentId: string; status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED' }>
): Promise<boolean> {
  try {
    // 1. Delete previous records for this session
    await fetch(`${SUPABASE_URL}/rest/v1/attendance_records?session_id=eq.${encodeURIComponent(sessionId)}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });

    // 2. Insert new records in batch
    const payload = records.map((r) => ({
      session_id: sessionId,
      student_id: r.studentId,
      status: r.status,
      timestamp: new Date().toISOString(),
    }));

    const insertRes = await fetch(`${SUPABASE_URL}/rest/v1/attendance_records`, {
      method: 'POST',
      headers: {
        ...getHeaders(),
        Prefer: 'return=minimal',
      },
      body: JSON.stringify(payload),
    });

    return insertRes.ok;
  } catch (err) {
    console.error('Error in saveAttendanceToSupabase:', err);
    return false;
  }
}
