import { generateRandomPassword } from './teachers';
import { hashPassword } from '@/lib/security/password';
import { sendAdminPasswordResetEmail } from '@/lib/email/mailer';

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

export interface SystemUser {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  role: 'SUPERADMIN' | 'ADMIN' | 'TEACHER' | 'STUDENT' | 'STAFF';
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  avatarUrl?: string;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export function mapUserRow(row: any): SystemUser {
  return {
    id: row.id,
    email: row.email,
    fullName: row.full_name || 'Unnamed User',
    phone: row.phone || row.metadata?.mobile || '',
    role: row.role || 'STAFF',
    status: row.status || 'ACTIVE',
    avatarUrl: row.avatar_url || undefined,
    metadata: row.metadata || {},
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function fetchUsersFromSupabase(): Promise<SystemUser[]> {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/users?select=*&order=created_at.asc`, {
      method: 'GET',
      headers: getHeaders(),
      cache: 'no-store',
    });

    if (!res.ok) {
      console.error('Failed to fetch users from Supabase:', res.status, await res.text());
      return [];
    }

    const rows = await res.json();
    if (!Array.isArray(rows)) return [];

    return rows.map(mapUserRow);
  } catch (err) {
    console.error('Error in fetchUsersFromSupabase:', err);
    return [];
  }
}

export async function createAdminInSupabase(data: {
  fullName: string;
  email: string;
  phone?: string;
  password?: string;
}): Promise<{ user: SystemUser; initialPassword: string }> {
  const initialPassword = data.password || generateRandomPassword(10);
  const passwordHash = await hashPassword(initialPassword);
  const now = new Date().toISOString();

  const payload = {
    email: data.email.trim().toLowerCase(),
    password_hash: passwordHash,
    full_name: data.fullName.trim(),
    phone: data.phone ? data.phone.trim() : null,
    role: 'ADMIN',
    status: 'ACTIVE',
    metadata: {
      createdVia: 'CONSOLE_USERS_MODULE',
    },
    created_at: now,
    updated_at: now,
  };

  const res = await fetch(`${SUPABASE_URL}/rest/v1/users`, {
    method: 'POST',
    headers: {
      ...getHeaders(),
      Prefer: 'return=representation',
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Failed to create admin in Supabase: ${errText}`);
  }

  const rows = await res.json();
  const created = Array.isArray(rows) ? rows[0] : rows;
  return { user: mapUserRow(created), initialPassword };
}

export async function updateUserStatusInSupabase(
  id: string,
  newStatus: 'ACTIVE' | 'INACTIVE'
): Promise<{ success: boolean; message?: string }> {
  // 1. Fetch user to verify they are not SUPERADMIN
  const userRes = await fetch(`${SUPABASE_URL}/rest/v1/users?id=eq.${id}&select=id,role,email`, {
    headers: getHeaders(),
  });
  const users = await userRes.json();
  const target = users?.[0];

  if (!target) {
    return { success: false, message: 'User not found' };
  }

  if (target.role === 'SUPERADMIN') {
    return { success: false, message: 'Protected: Superadmin account cannot be paused or deactivated.' };
  }

  // 2. Perform status update
  const res = await fetch(`${SUPABASE_URL}/rest/v1/users?id=eq.${id}`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify({
      status: newStatus,
      updated_at: new Date().toISOString(),
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    return { success: false, message: `Failed to update user status: ${err}` };
  }

  return { success: true };
}

export async function updateUserRoleInSupabase(
  id: string,
  newRole: 'ADMIN' | 'TEACHER'
): Promise<{ success: boolean; message?: string }> {
  // 1. Fetch user to verify not SUPERADMIN
  const userRes = await fetch(`${SUPABASE_URL}/rest/v1/users?id=eq.${id}&select=id,role,email`, {
    headers: getHeaders(),
  });
  const users = await userRes.json();
  const target = users?.[0];

  if (!target) {
    return { success: false, message: 'User not found' };
  }

  if (target.role === 'SUPERADMIN') {
    return { success: false, message: 'Protected: Superadmin role cannot be altered.' };
  }

  // 2. Perform role update
  const res = await fetch(`${SUPABASE_URL}/rest/v1/users?id=eq.${id}`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify({
      role: newRole,
      updated_at: new Date().toISOString(),
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    return { success: false, message: `Failed to update role: ${err}` };
  }

  return { success: true };
}

export async function updateUserPasswordInSupabase(
  id: string,
  newPassword: string
): Promise<{ success: boolean; message?: string }> {
  const userRes = await fetch(`${SUPABASE_URL}/rest/v1/users?id=eq.${id}&select=id,role,email,full_name,metadata`, {
    headers: getHeaders(),
  });
  const users = await userRes.json();
  const target = users?.[0];

  if (!target) {
    return { success: false, message: 'User not found' };
  }

  const existingMeta = (typeof target.metadata === 'object' && target.metadata !== null) ? { ...target.metadata } : {};
  delete existingMeta.initialPassword;

  const passwordHash = await hashPassword(newPassword);

  const res = await fetch(`${SUPABASE_URL}/rest/v1/users?id=eq.${id}`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify({
      password_hash: passwordHash,
      metadata: {
        ...existingMeta,
        lastPasswordReset: new Date().toISOString(),
      },
      updated_at: new Date().toISOString(),
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    return { success: false, message: `Failed to update password: ${err}` };
  }

  // Automatically dispatch email notification to the user with the new password and instructions
  if (target.email) {
    try {
      await sendAdminPasswordResetEmail({
        to: target.email,
        userName: target.full_name || 'Valued User',
        newPassword: newPassword.trim(),
      });
    } catch (emailErr) {
      console.error('Failed to dispatch password reset email to user:', emailErr);
    }
  }

  return { success: true };
}

export async function deleteUserInSupabase(
  id: string
): Promise<{ success: boolean; message?: string }> {
  // 1. Fetch user to verify not SUPERADMIN
  const userRes = await fetch(`${SUPABASE_URL}/rest/v1/users?id=eq.${id}&select=id,role,email`, {
    headers: getHeaders(),
  });
  const users = await userRes.json();
  const target = users?.[0];

  if (!target) {
    return { success: false, message: 'User not found' };
  }

  if (target.role === 'SUPERADMIN') {
    return { success: false, message: 'Protected: Superadmin account cannot be deleted.' };
  }

  // 2. Cascade delete from teachers or other related tables if needed
  await fetch(`${SUPABASE_URL}/rest/v1/teachers?user_id=eq.${id}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });

  // 3. Delete from public.users
  const res = await fetch(`${SUPABASE_URL}/rest/v1/users?id=eq.${id}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });

  if (!res.ok) {
    const err = await res.text();
    return { success: false, message: `Failed to delete user: ${err}` };
  }

  return { success: true };
}
