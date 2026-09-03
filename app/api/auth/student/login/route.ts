import { NextResponse } from 'next/server';
import { verifyPassword, hashPassword } from '@/lib/security/password';
import { setStudentSessionCookie, StudentSessionPayload } from '@/lib/auth/studentSession';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://lzckoyeouimyrjzcefkp.supabase.co';
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '';

const getHeaders = () => ({
  apikey: SERVICE_KEY,
  Authorization: `Bearer ${SERVICE_KEY}`,
  'Content-Type': 'application/json',
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const studentIdRaw = body.studentId || body.identifier;
    const password = body.password;

    if (!studentIdRaw || !password) {
      return NextResponse.json(
        { success: false, error: 'Student ID and password are required.' },
        { status: 400 }
      );
    }

    const cleanStudentId = String(studentIdRaw).trim();

    // Check if user accidentally typed an email
    if (cleanStudentId.includes('@')) {
      return NextResponse.json(
        {
          success: false,
          error: 'Please sign in using your permanent Student ID (e.g. 20280001). For Google accounts, please click "Continue with Google".',
        },
        { status: 400 }
      );
    }

    // 1. Look up student strictly by permanent Student ID in Supabase
    const studentRes = await fetch(
      `${SUPABASE_URL}/rest/v1/students?student_id=eq.${encodeURIComponent(cleanStudentId)}&select=*,user:users(*),batches(id,name,code)&limit=1`,
      { headers: getHeaders() }
    );

    let studentRow: any = null;
    let userRow: any = null;

    if (studentRes.ok) {
      const rows = await studentRes.json();
      if (Array.isArray(rows) && rows.length > 0) {
        studentRow = rows[0];
        userRow = rows[0].user;
      }
    }

    // Fallback: Case-insensitive match if student ID has letters/prefixes
    if (!studentRow) {
      const fallbackRes = await fetch(
        `${SUPABASE_URL}/rest/v1/students?select=*,user:users(*),batches(id,name,code)&limit=100`,
        { headers: getHeaders() }
      );
      if (fallbackRes.ok) {
        const allStudents = await fallbackRes.json();
        const found = allStudents.find(
          (s: any) => s.student_id?.toLowerCase() === cleanStudentId.toLowerCase()
        );
        if (found) {
          studentRow = found;
          userRow = found.user;
        }
      }
    }

    if (!studentRow || !userRow) {
      return NextResponse.json(
        { success: false, error: 'No student found with Student ID: ' + cleanStudentId },
        { status: 401 }
      );
    }

    // 2. Check account status
    if (userRow.status !== 'ACTIVE') {
      return NextResponse.json(
        { success: false, error: 'Student portal access for this account is inactive or suspended.' },
        { status: 403 }
      );
    }

    // 3. Verify password
    const passwordHash = userRow.password_hash || '';
    const { matches, needsRehash } = await verifyPassword(password, passwordHash);

    if (!matches) {
      return NextResponse.json(
        { success: false, error: 'Incorrect password for Student ID: ' + cleanStudentId },
        { status: 401 }
      );
    }

    // 4. Upgrade password hash if plaintext legacy was found
    if (needsRehash) {
      try {
        const secureHash = await hashPassword(password);
        await fetch(`${SUPABASE_URL}/rest/v1/users?id=eq.${userRow.id}`, {
          method: 'PATCH',
          headers: getHeaders(),
          body: JSON.stringify({
            password_hash: secureHash,
            updated_at: new Date().toISOString(),
          }),
        });
      } catch (err) {
        console.error('Failed to auto-upgrade student password hash:', err);
      }
    }

    // 5. Construct student session payload
    const batch = studentRow.batches || {};
    const meta = (typeof userRow.metadata === 'object' && userRow.metadata !== null) ? userRow.metadata : {};

    const sessionPayload: StudentSessionPayload = {
      id: studentRow.id,
      userId: userRow.id,
      studentId: studentRow.student_id,
      fullName: userRow.full_name || 'Enrolled Student',
      email: userRow.email,
      phone: userRow.phone || undefined,
      batchId: studentRow.batch_id || undefined,
      batchName: batch.name || meta.batchName || 'General Batch',
      role: 'STUDENT',
      avatarUrl: userRow.avatar_url || meta.avatarUrl || undefined,
      issuedAt: Date.now(),
    };

    // 6. Create Response and set secure HTTP-only cookie
    const response = NextResponse.json({
      success: true,
      message: 'Student authentication successful.',
      student: sessionPayload,
    });

    setStudentSessionCookie(response, sessionPayload);
    return response;
  } catch (err: any) {
    console.error('Student login error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Internal authentication error.' },
      { status: 500 }
    );
  }
}
