import { Teacher, generateRandomPassword } from './teachers';
import { hashPassword } from '@/lib/security/password';

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

export function mapSupabaseRow(row: any): Teacher {
  const u = row.user || {};
  const meta = (typeof u.metadata === 'object' && u.metadata !== null) ? u.metadata : {};

  return {
    id: row.id,
    employeeId: row.employee_id || meta.employeeId || 'ISP1001',
    fullName: row.full_name || u.full_name || '',
    nickname: '',
    designation: row.designation || meta.designation || '',
    dob: row.dob || meta.dob || undefined,
    gender: (row.gender || meta.gender || 'Male') as 'Male' | 'Female' | 'Other',
    bio: row.bio || meta.bio || '',
    educationalDetails: row.educational_details || meta.educationalDetails || row.specialization || '',
    experience: row.experience || meta.experience || '',
    mobile: row.mobile || u.phone || '',
    whatsapp: row.whatsapp || meta.whatsapp || u.phone || '',
    email: row.email || u.email || '',
    initialPassword: row.initial_password || meta.initialPassword || undefined,
    status: (row.status || u.status || 'ACTIVE') as 'ACTIVE' | 'INACTIVE',
    avatarUrl: u.avatar_url || undefined,
    createdAt: row.created_at || u.created_at || new Date().toISOString(),
    updatedAt: row.updated_at || u.updated_at || new Date().toISOString(),
  };
}

export async function fetchTeachersFromSupabase(): Promise<Teacher[]> {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/teachers?select=*,user:users(*)&order=created_at.desc`, {
      method: 'GET',
      headers: getHeaders(),
      cache: 'no-store',
    });

    if (!res.ok) {
      console.error('Failed to fetch teachers from Supabase:', res.status, await res.text());
      return [];
    }

    const rows = await res.json();
    if (!Array.isArray(rows)) return [];

    return rows.map(mapSupabaseRow);
  } catch (err) {
    console.error('Error in fetchTeachersFromSupabase:', err);
    return [];
  }
}

export async function getNextEmployeeIdFromSupabase(): Promise<string> {
  try {
    const teachers = await fetchTeachersFromSupabase();
    const ids = teachers
      .map((t) => {
        const match = t.employeeId?.match(/^ISP(\d+)$/i);
        return match ? parseInt(match[1], 10) : 0;
      })
      .filter((n) => !isNaN(n));

    const max = ids.length > 0 ? Math.max(...ids) : 1000;
    return `ISP${max + 1}`;
  } catch {
    return 'ISP1001';
  }
}

export async function createTeacherInSupabase(data: {
  fullName: string;
  nickname?: string;
  designation?: string;
  dob?: string;
  gender?: 'Male' | 'Female' | 'Other';
  bio?: string;
  educationalDetails?: string;
  experience?: string;
  mobile: string;
  whatsapp?: string;
  email: string;
  initialPassword?: string;
}): Promise<Teacher> {
  const employeeId = await getNextEmployeeIdFromSupabase();
  const initialPassword = data.initialPassword || generateRandomPassword();
  const passwordHash = await hashPassword(initialPassword);
  const now = new Date().toISOString();

  // 1. Create or update user record in public.users
  const userPayload = {
    email: data.email.trim().toLowerCase(),
    password_hash: passwordHash,
    full_name: data.fullName.trim(),
    phone: data.mobile.trim(),
    role: 'TEACHER',
    status: 'ACTIVE',
    metadata: {
      employeeId,
      nickname: data.nickname || '',
      designation: data.designation || 'Faculty Member',
      gender: data.gender || 'Male',
      dob: data.dob || '',
      bio: data.bio || '',
      educationalDetails: data.educationalDetails || '',
      experience: data.experience || '',
      whatsapp: data.whatsapp || data.mobile.trim(),
    },
    created_at: now,
    updated_at: now,
  };

  const userRes = await fetch(`${SUPABASE_URL}/rest/v1/users`, {
    method: 'POST',
    headers: {
      ...getHeaders(),
      Prefer: 'return=representation',
    },
    body: JSON.stringify(userPayload),
  });

  if (!userRes.ok) {
    const errText = await userRes.text();
    throw new Error(`Failed to create user in Supabase: ${errText}`);
  }

  const userRows = await userRes.json();
  const createdUser = Array.isArray(userRows) ? userRows[0] : userRows;

  // 2. Create teacher profile in public.teachers
  const teacherPayload = {
    user_id: createdUser.id,
    designation: data.designation || 'Faculty Member',
    specialization: data.educationalDetails || '',
    bio: data.bio || '',
    created_at: now,
    updated_at: now,
  };

  const teacherRes = await fetch(`${SUPABASE_URL}/rest/v1/teachers`, {
    method: 'POST',
    headers: {
      ...getHeaders(),
      Prefer: 'return=representation',
    },
    body: JSON.stringify(teacherPayload),
  });

  if (!teacherRes.ok) {
    const errText = await teacherRes.text();
    throw new Error(`Failed to create teacher profile in Supabase: ${errText}`);
  }

  const teacherRows = await teacherRes.json();
  const createdTeacher = Array.isArray(teacherRows) ? teacherRows[0] : teacherRows;

  return {
    id: createdTeacher.id,
    employeeId,
    fullName: data.fullName.trim(),
    nickname: data.nickname || '',
    designation: data.designation || 'Faculty Member',
    dob: data.dob,
    gender: data.gender || 'Male',
    bio: data.bio || '',
    educationalDetails: data.educationalDetails || '',
    experience: data.experience || '',
    mobile: data.mobile.trim(),
    whatsapp: data.whatsapp || data.mobile.trim(),
    email: data.email.trim().toLowerCase(),
    initialPassword,
    status: 'ACTIVE',
    createdAt: now,
    updatedAt: now,
  };
}

export async function updateTeacherInSupabase(
  employeeId: string,
  data: Partial<Teacher>
): Promise<boolean> {
  const teachers = await fetchTeachersFromSupabase();
  const teacher = teachers.find((t) => t.employeeId === employeeId);
  if (!teacher) return false;

  const now = new Date().toISOString();

  const teacherUpdates: any = { updated_at: now };
  if (data.designation !== undefined) teacherUpdates.designation = data.designation;
  if (data.educationalDetails !== undefined) teacherUpdates.specialization = data.educationalDetails;
  if (data.bio !== undefined) teacherUpdates.bio = data.bio;

  await fetch(`${SUPABASE_URL}/rest/v1/teachers?id=eq.${teacher.id}`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify(teacherUpdates),
  });

  const tRes = await fetch(`${SUPABASE_URL}/rest/v1/teachers?id=eq.${teacher.id}&select=user_id`, {
    headers: getHeaders(),
  });
  if (tRes.ok) {
    const tRows = await tRes.json();
    const userId = tRows[0]?.user_id;
    if (userId) {
      const uRes = await fetch(`${SUPABASE_URL}/rest/v1/users?id=eq.${userId}&select=metadata`, { headers: getHeaders() });
      const uRows = await uRes.json();
      const existingMeta = (uRows && uRows[0]?.metadata) || {};

      const newMeta = {
        ...existingMeta,
        ...(data.experience !== undefined ? { experience: data.experience } : {}),
        ...(data.educationalDetails !== undefined ? { educationalDetails: data.educationalDetails } : {}),
        ...(data.designation !== undefined ? { designation: data.designation } : {}),
        ...(data.whatsapp !== undefined ? { whatsapp: data.whatsapp } : {}),
        ...(data.dob !== undefined ? { dob: data.dob } : {}),
        ...(data.gender !== undefined ? { gender: data.gender } : {}),
        ...(data.bio !== undefined ? { bio: data.bio } : {}),
        ...(data.nickname !== undefined ? { nickname: data.nickname } : {}),
      };

      const userUpdates: any = { updated_at: now, metadata: newMeta };
      if (data.fullName) userUpdates.full_name = data.fullName;
      if (data.email) userUpdates.email = data.email.trim().toLowerCase();
      if (data.mobile) userUpdates.phone = data.mobile.trim();
      if (data.status) userUpdates.status = data.status;

      await fetch(`${SUPABASE_URL}/rest/v1/users?id=eq.${userId}`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify(userUpdates),
      });
    }
  }

  return true;
}

export async function updateTeacherStatusInSupabase(
  employeeId: string,
  status: 'ACTIVE' | 'INACTIVE'
): Promise<boolean> {
  return updateTeacherInSupabase(employeeId, { status });
}
