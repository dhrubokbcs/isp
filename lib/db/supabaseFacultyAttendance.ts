import {
  FacultyAttendanceRecord,
  AttendanceStats,
  parseDurationToMinutes,
  calculateDurationString,
} from '@/lib/types/facultyAttendance';

export type { FacultyAttendanceRecord, AttendanceStats };
export { parseDurationToMinutes, calculateDurationString };

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://lzckoyeouimyrjzcefkp.supabase.co';
const SERVICE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  '';

function getHeaders() {
  return {
    apikey: SERVICE_KEY,
    Authorization: `Bearer ${SERVICE_KEY}`,
    'Content-Type': 'application/json',
  };
}

function mapRow(r: any): FacultyAttendanceRecord {
  return {
    id: r.id,
    date: r.date ? String(r.date).split('T')[0] : new Date().toISOString().split('T')[0],
    batchName: r.batch_name || '',
    slotStart: r.slot_start || '',
    slotEnd: r.slot_end || '',
    facultyName: r.faculty_name || '',
    entryTime: r.entry_time || null,
    exitTime: r.exit_time || null,
    totalStudents: Number(r.total_students) || 0,
    signature: r.signature || undefined,
    remark: r.remark || undefined,
    examBatch: r.exam_batch || undefined,
    duration: r.duration || undefined,
    status: r.status || 'PRESENT',
    createdAt: r.created_at || new Date().toISOString(),
    updatedAt: r.updated_at || new Date().toISOString(),
  };
}

/**
 * Fetch Faculty Attendance Records with filters & statistics via Supabase REST
 */
export async function fetchFacultyAttendance(params: {
  date?: string;
  startDate?: string;
  endDate?: string;
  facultyName?: string;
  batchName?: string;
  status?: string;
  search?: string;
  limit?: number;
  offset?: number;
}): Promise<{ records: FacultyAttendanceRecord[]; totalCount: number; stats: AttendanceStats }> {
  try {
    const queryParts: string[] = ['select=*'];

    if (params.date) {
      queryParts.push(`date=eq.${encodeURIComponent(params.date)}`);
    } else {
      if (params.startDate) {
        queryParts.push(`date=gte.${encodeURIComponent(params.startDate)}`);
      }
      if (params.endDate) {
        queryParts.push(`date=lte.${encodeURIComponent(params.endDate)}`);
      }
    }

    if (params.facultyName && params.facultyName !== 'ALL') {
      queryParts.push(`faculty_name=ilike.*${encodeURIComponent(params.facultyName)}*`);
    }
    if (params.batchName && params.batchName !== 'ALL') {
      queryParts.push(`batch_name=ilike.*${encodeURIComponent(params.batchName)}*`);
    }
    if (params.status && params.status !== 'ALL') {
      queryParts.push(`status=eq.${encodeURIComponent(params.status)}`);
    }
    if (params.search) {
      const q = encodeURIComponent(`*${params.search}*`);
      queryParts.push(`or=(faculty_name.ilike.${q},batch_name.ilike.${q},remark.ilike.${q})`);
    }

    queryParts.push('order=date.desc,slot_start.asc');

    const limit = params.limit || 100;
    const offset = params.offset || 0;
    queryParts.push(`limit=${limit}`);
    queryParts.push(`offset=${offset}`);

    const res = await fetch(`${SUPABASE_URL}/rest/v1/faculty_attendance?${queryParts.join('&')}`, {
      headers: {
        ...getHeaders(),
        Prefer: 'count=exact',
      },
      cache: 'no-store',
    });

    if (!res.ok) {
      console.warn('Supabase fetchFacultyAttendance notice:', await res.text());
      return {
        records: [],
        totalCount: 0,
        stats: {
          totalSessions: 0,
          completedSessions: 0,
          inProgressSessions: 0,
          scheduledUpcoming: 0,
          totalStudentsFootfall: 0,
          totalDurationMinutes: 0,
          totalDurationFormatted: '0h 0m',
          cancelledOrSuspended: 0,
          facultyBreakdown: [],
        },
      };
    }

    const contentRange = res.headers.get('content-range');
    const totalCount = contentRange ? parseInt(contentRange.split('/')[1] || '0', 10) : 0;
    const rows = await res.json();
    const records: FacultyAttendanceRecord[] = Array.isArray(rows) ? rows.map(mapRow) : [];

    // Calculate aggregated stats
    let totalStudentsFootfall = 0;
    let totalDurationMinutes = 0;
    let completedSessions = 0;
    let inProgressSessions = 0;
    let scheduledUpcoming = 0;
    let cancelledOrSuspended = 0;
    const facultyMap: Record<string, { sessions: number; minutes: number; students: number }> = {};

    records.forEach((r) => {
      totalStudentsFootfall += r.totalStudents || 0;
      const mins = parseDurationToMinutes(r.duration);
      totalDurationMinutes += mins;

      if (r.status === 'PRESENT' || (r.entryTime && r.exitTime)) {
        completedSessions++;
      } else if (r.status === 'IN_PROGRESS' || (r.entryTime && !r.exitTime)) {
        inProgressSessions++;
      } else if (r.status === 'CANCELLED' || r.status === 'SUSPENDED') {
        cancelledOrSuspended++;
      } else {
        scheduledUpcoming++;
      }

      const fName = r.facultyName || 'Unknown Educator';
      if (!facultyMap[fName]) {
        facultyMap[fName] = { sessions: 0, minutes: 0, students: 0 };
      }
      facultyMap[fName].sessions += 1;
      facultyMap[fName].minutes += mins;
      facultyMap[fName].students += r.totalStudents || 0;
    });

    const hours = Math.floor(totalDurationMinutes / 60);
    const minsRem = totalDurationMinutes % 60;
    const totalDurationFormatted = `${hours}h ${minsRem}m`;

    const facultyBreakdown = Object.entries(facultyMap).map(([faculty, data]) => ({
      faculty,
      sessions: data.sessions,
      minutes: data.minutes,
    }));

    const stats: AttendanceStats = {
      totalSessions: totalCount || records.length,
      completedSessions,
      inProgressSessions,
      scheduledUpcoming,
      totalStudentsFootfall,
      totalDurationMinutes,
      totalDurationFormatted,
      cancelledOrSuspended,
      facultyBreakdown,
    };

    return { records, totalCount: totalCount || records.length, stats };
  } catch (err) {
    console.error('Error in fetchFacultyAttendance:', err);
    return {
      records: [],
      totalCount: 0,
      stats: {
        totalSessions: 0,
        completedSessions: 0,
        inProgressSessions: 0,
        scheduledUpcoming: 0,
        totalStudentsFootfall: 0,
        totalDurationMinutes: 0,
        totalDurationFormatted: '0h 0m',
        cancelledOrSuspended: 0,
        facultyBreakdown: [],
      },
    };
  }
}

/**
 * Create a new Attendance Record in Supabase
 */
export async function createFacultyAttendanceRecord(payload: {
  date: string;
  batchName: string;
  slotStart: string;
  slotEnd: string;
  facultyName: string;
  entryTime?: string | null;
  exitTime?: string | null;
  totalStudents?: number;
  signature?: string;
  remark?: string;
  examBatch?: string;
  duration?: string;
  status?: string;
  checkInMethod?: string;
}): Promise<FacultyAttendanceRecord> {
  const dbPayload: any = {
    date: payload.date || new Date().toISOString().split('T')[0],
    batch_name: payload.batchName,
    slot_start: payload.slotStart,
    slot_end: payload.slotEnd,
    faculty_name: payload.facultyName,
    entry_time: payload.entryTime || null,
    exit_time: payload.exitTime || null,
    total_students: payload.totalStudents || 0,
    signature: payload.signature || null,
    remark: payload.remark || null,
    exam_batch: payload.examBatch || null,
    duration: payload.duration || null,
    status: payload.status || 'PRESENT',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const res = await fetch(`${SUPABASE_URL}/rest/v1/faculty_attendance`, {
    method: 'POST',
    headers: {
      ...getHeaders(),
      Prefer: 'return=representation',
    },
    body: JSON.stringify(dbPayload),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Failed to create attendance in Supabase: ${errText}`);
  }

  const rows = await res.json();
  const r = Array.isArray(rows) ? rows[0] : rows;
  if (!r) throw new Error('Failed to create attendance record');
  return mapRow(r);
}

/**
 * Update an existing Attendance Record in Supabase
 */
export async function updateFacultyAttendanceRecord(
  id: string,
  payload: Partial<FacultyAttendanceRecord> & { checkInMethod?: string; substituteFacultyName?: string; topicCovered?: string }
): Promise<FacultyAttendanceRecord> {
  let duration = payload.duration;
  if (!duration && payload.entryTime && payload.exitTime) {
    duration = calculateDurationString(payload.entryTime, payload.exitTime);
  }

  const dbPayload: any = {
    updated_at: new Date().toISOString(),
  };

  if (payload.date !== undefined) dbPayload.date = payload.date;
  if (payload.batchName !== undefined) dbPayload.batch_name = payload.batchName;
  if (payload.slotStart !== undefined) dbPayload.slot_start = payload.slotStart;
  if (payload.slotEnd !== undefined) dbPayload.slot_end = payload.slotEnd;
  if (payload.facultyName !== undefined) dbPayload.faculty_name = payload.facultyName;
  if (payload.entryTime !== undefined) dbPayload.entry_time = payload.entryTime;
  if (payload.exitTime !== undefined) dbPayload.exit_time = payload.exitTime;
  if (payload.totalStudents !== undefined) dbPayload.total_students = payload.totalStudents;
  if (payload.signature !== undefined) dbPayload.signature = payload.signature;
  if (payload.remark !== undefined) dbPayload.remark = payload.remark;
  if (payload.examBatch !== undefined) dbPayload.exam_batch = payload.examBatch;
  if (duration !== undefined) dbPayload.duration = duration;
  if (payload.status !== undefined) dbPayload.status = payload.status;

  const res = await fetch(`${SUPABASE_URL}/rest/v1/faculty_attendance?id=eq.${encodeURIComponent(id)}`, {
    method: 'PATCH',
    headers: {
      ...getHeaders(),
      Prefer: 'return=representation',
    },
    body: JSON.stringify(dbPayload),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Failed to update attendance in Supabase: ${errText}`);
  }

  const rows = await res.json();
  const r = Array.isArray(rows) ? rows[0] : rows;
  if (!r) throw new Error('Record not found in Supabase');
  return mapRow(r);
}

/**
 * Delete an Attendance Record in Supabase
 */
export async function deleteFacultyAttendanceRecord(id: string): Promise<boolean> {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/faculty_attendance?id=eq.${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  return res.ok;
}
