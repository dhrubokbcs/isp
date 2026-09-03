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

export interface AcademicYearRecord {
  id: string;
  name: string;
  year: number;
  startDate: string;
  endDate: string;
  status: 'ACTIVE' | 'UPCOMING' | 'ARCHIVED';
  nextStudentSerial: number;
  totalBatches?: number;
  totalStudents?: number;
  createdAt?: string;
  updatedAt?: string;
}

export function mapYearRow(row: any): AcademicYearRecord {
  return {
    id: row.id,
    name: row.name,
    year: row.year,
    startDate: row.start_date,
    endDate: row.end_date,
    status: row.status || 'UPCOMING',
    nextStudentSerial: row.next_student_serial || 1,
    totalBatches: 0,
    totalStudents: 0,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function fetchAcademicYearsFromSupabase(): Promise<AcademicYearRecord[]> {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/academic_years?select=*&order=year.desc`, {
      method: 'GET',
      headers: getHeaders(),
      cache: 'no-store',
    });

    if (!res.ok) {
      console.error('Failed to fetch academic years:', res.status, await res.text());
      return [];
    }

    const rows = await res.json();
    if (!Array.isArray(rows)) return [];

    return rows.map(mapYearRow);
  } catch (err) {
    console.error('Error in fetchAcademicYearsFromSupabase:', err);
    return [];
  }
}

export async function createAcademicYearInSupabase(data: {
  name: string;
  year: number;
  startDate?: string;
  endDate?: string;
  status?: 'ACTIVE' | 'UPCOMING' | 'ARCHIVED';
}): Promise<AcademicYearRecord> {
  const payload = {
    name: data.name.trim(),
    year: data.year,
    start_date: data.startDate || `${data.year}-01-01`,
    end_date: data.endDate || `${data.year}-12-31`,
    status: data.status || 'UPCOMING',
    next_student_serial: 1,
    updated_at: new Date().toISOString(),
  };

  const res = await fetch(`${SUPABASE_URL}/rest/v1/academic_years`, {
    method: 'POST',
    headers: {
      ...getHeaders(),
      Prefer: 'return=representation',
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Failed to create academic year: ${err}`);
  }

  const rows = await res.json();
  const created = Array.isArray(rows) ? rows[0] : rows;
  return mapYearRow(created);
}

export async function updateAcademicYearStatusInSupabase(
  id: string,
  status: 'ACTIVE' | 'UPCOMING' | 'ARCHIVED'
): Promise<boolean> {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/academic_years?id=eq.${id}`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify({
      status,
      updated_at: new Date().toISOString(),
    }),
  });

  return res.ok;
}
