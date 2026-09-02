import { NextResponse } from 'next/server';
import { verifyPassword, hashPassword } from '@/lib/security/password';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const getHeaders = () => ({
  apikey: SUPABASE_SERVICE_ROLE_KEY,
  Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
  'Content-Type': 'application/json',
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, currentPassword, newPassword } = body;

    if (!userId || !currentPassword || !newPassword) {
      return NextResponse.json(
        { success: false, error: 'User ID, current password, and new password are required.' },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { success: false, error: 'New password must be at least 6 characters long.' },
        { status: 400 }
      );
    }

    // 1. Fetch user from Supabase
    const userRes = await fetch(`${SUPABASE_URL}/rest/v1/users?id=eq.${userId}&select=*`, {
      headers: getHeaders(),
    });

    if (!userRes.ok) {
      return NextResponse.json(
        { success: false, error: 'User lookup failed.' },
        { status: 500 }
      );
    }

    const users = await userRes.json();
    if (!users || users.length === 0) {
      return NextResponse.json(
        { success: false, error: 'User account not found.' },
        { status: 404 }
      );
    }

    const user = users[0];

    // 2. Verify current password
    const { matches } = await verifyPassword(currentPassword, user.password_hash || '');
    if (!matches) {
      return NextResponse.json(
        { success: false, error: 'Current password is incorrect.' },
        { status: 400 }
      );
    }

    // 3. Cryptographically hash new password with bcrypt
    const secureHash = await hashPassword(newPassword);

    const updatedMeta = { ...(user.metadata || {}) };
    delete updatedMeta.initialPassword;
    updatedMeta.lastPasswordReset = new Date().toISOString();

    // 4. Update Supabase
    const patchRes = await fetch(`${SUPABASE_URL}/rest/v1/users?id=eq.${userId}`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({
        password_hash: secureHash,
        metadata: updatedMeta,
        updated_at: new Date().toISOString(),
      }),
    });

    if (!patchRes.ok) {
      return NextResponse.json(
        { success: false, error: 'Failed to update password in database.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Password changed successfully and securely hashed.',
    });
  } catch (err: any) {
    console.error('Password change error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
