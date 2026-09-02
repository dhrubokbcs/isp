import { Teacher, generateRandomPassword } from './teachers';
import { hashPassword } from '@/lib/security/password';

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

export function mapSupabaseRow(row: any): Teacher {
  const u = row.user || {};
  const meta = (typeof u.metadata === 'object' && u.metadata !== null) ? u.metadata : {};

  return {
    id: row.id,
    employeeId: row.employee_id || meta.employeeId || 'ISP1001',
    fullName: row.full_name || u.full_name || 'Unnamed Teacher',
    nickname: row.nickname || meta.nickname || row.designation || '',
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

  // 1. Insert into public.users table
  const userPayload = {
    email: data.email.trim().toLowerCase(),
    password_hash: passwordHash,
    full_name: data.fullName.trim(),
    phone: data.mobile.trim(),
    role: 'TEACHER',
    status: 'ACTIVE',
    metadata: {
      employeeId,
      nickname: data.nickname ? data.nickname.trim() : '',
      dob: data.dob || null,
      gender: data.gender || 'Male',
      bio: data.bio ? data.bio.trim() : '',
      educationalDetails: data.educationalDetails ? data.educationalDetails.trim() : '',
      experience: data.experience ? data.experience.trim() : '',
      whatsapp: data.whatsapp ? data.whatsapp.trim() : data.mobile.trim(),
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
    throw new Error(`Failed to create user record in Supabase: ${errText}`);
  }

  const createdUsers = await userRes.json();
  const createdUser = Array.isArray(createdUsers) ? createdUsers[0] : createdUsers;
  const userId = createdUser?.id;

  if (!userId) {
    throw new Error('User record was created but no user ID returned.');
  }

  // 2. Insert into public.teachers table
  const teacherPayload = {
    user_id: userId,
    designation: data.nickname ? data.nickname.trim() : 'Mentor',
    specialization: data.educationalDetails ? data.educationalDetails.trim() : '',
    bio: data.bio ? data.bio.trim() : '',
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
    console.error('Failed to create teacher entry in Supabase:', errText);
    throw new Error(`Failed to create teacher entry: ${errText}`);
  }

  const createdTeachers = await teacherRes.json();
  const createdTeacherRow = Array.isArray(createdTeachers) ? createdTeachers[0] : createdTeachers;

  return mapSupabaseRow({
    ...createdTeacherRow,
    user: createdUser,
  });
}

export async function updateTeacherStatusInSupabase(employeeId: string, status: 'ACTIVE' | 'INACTIVE'): Promise<boolean> {
  try {
    const teachers = await fetchTeachersFromSupabase();
    const target = teachers.find((t) => t.employeeId === employeeId);
    if (!target) return false;

    const res = await fetch(`${SUPABASE_URL}/rest/v1/teachers?id=eq.${target.id}&select=user_id`, {
      headers: getHeaders(),
    });
    const rows = await res.json();
    const userId = rows?.[0]?.user_id;
    if (!userId) return false;

    await fetch(`${SUPABASE_URL}/rest/v1/users?id=eq.${userId}`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({
        status,
        updated_at: new Date().toISOString(),
      }),
    });

    return true;
  } catch (err) {
    console.error('Error updating teacher status in Supabase:', err);
    return false;
  }
}
