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
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required.' },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();

    // 1. Fetch user from Supabase public.users
    const userRes = await fetch(
      `${SUPABASE_URL}/rest/v1/users?email=eq.${encodeURIComponent(cleanEmail)}&select=*`,
      { headers: getHeaders() }
    );

    if (!userRes.ok) {
      return NextResponse.json(
        { success: false, error: 'Authentication service unavailable.' },
        { status: 500 }
      );
    }

    const users = await userRes.json();
    if (!users || users.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No account found with this email address.' },
        { status: 401 }
      );
    }

    const user = users[0];

    // 2. Check status
    if (user.status !== 'ACTIVE') {
      return NextResponse.json(
        { success: false, error: 'This account has been deactivated or suspended.' },
        { status: 403 }
      );
    }

    // 3. Cryptographically verify password (bcrypt)
    const { matches, needsRehash } = await verifyPassword(password, user.password_hash || '');

    if (!matches) {
      return NextResponse.json(
        { success: false, error: 'Incorrect password. Please try again.' },
        { status: 401 }
      );
    }

    // 4. If password was plaintext legacy, automatically upgrade to bcrypt hash!
    if (needsRehash) {
      try {
        const secureHash = await hashPassword(password);
        await fetch(`${SUPABASE_URL}/rest/v1/users?id=eq.${user.id}`, {
          method: 'PATCH',
          headers: getHeaders(),
          body: JSON.stringify({
            password_hash: secureHash,
            updated_at: new Date().toISOString(),
          }),
        });
        console.log(`[Security] Upgraded legacy plaintext password to bcrypt hash for user: ${cleanEmail}`);
      } catch (rehashErr) {
        console.error('Failed to auto-upgrade legacy password hash:', rehashErr);
      }
    }

    // 5. If teacher, query linked teacher table
    let employeeId = user.metadata?.employeeId || '';
    let designation = user.metadata?.designation || (user.role === 'TEACHER' ? 'Faculty Member' : 'Administrator');

    if (user.role === 'TEACHER') {
      try {
        const tRes = await fetch(`${SUPABASE_URL}/rest/v1/teachers?user_id=eq.${user.id}&select=*&limit=1`, {
          headers: getHeaders(),
        });
        if (tRes.ok) {
          const tRows = await tRes.json();
          if (Array.isArray(tRows) && tRows.length > 0) {
            if (tRows[0].employee_id) employeeId = tRows[0].employee_id;
            if (tRows[0].designation) designation = tRows[0].designation;
          }
        }
      } catch (tErr) {
        console.warn('Could not fetch teacher metadata on login:', tErr);
      }
    }

    // 6. Success: return user profile (excluding password_hash)
    const res = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        role: user.role,
        status: user.status,
        designation,
        employeeId: employeeId || undefined,
      },
    });

    // Set cookie for session isolation across browser profiles / tabs
    res.cookies.set('isp_console_uid', user.id, {
      path: '/',
      httpOnly: false,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
    });
    res.cookies.set('isp_console_role', user.role, {
      path: '/',
      httpOnly: false,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
    });

    return res;
  } catch (err: any) {
    console.error('Login error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
