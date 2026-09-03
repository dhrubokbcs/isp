import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { setStudentSessionCookie, StudentSessionPayload } from '@/lib/auth/studentSession';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const getHeaders = () => {
  if (!SERVICE_KEY) {
    throw new Error('Server configuration error: SUPABASE_SERVICE_ROLE_KEY is required.');
  }
  return {
    apikey: SERVICE_KEY,
    Authorization: `Bearer ${SERVICE_KEY}`,
    'Content-Type': 'application/json',
  };
};

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') || '/student/dashboard';

  if (code) {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {
              // Ignored
            }
          },
        },
      }
    );

    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data?.user?.email) {
      const googleEmail = data.user.email.trim().toLowerCase();

      // Look up student in Supabase
      const userRes = await fetch(
        `${SUPABASE_URL}/rest/v1/users?email=eq.${encodeURIComponent(googleEmail)}&select=*&limit=1`,
        { headers: getHeaders() }
      );

      if (userRes.ok) {
        const users = await userRes.json();
        if (Array.isArray(users) && users.length > 0) {
          const userRow = users[0];

          // Fetch student row
          const studentRes = await fetch(
            `${SUPABASE_URL}/rest/v1/students?user_id=eq.${userRow.id}&select=*,batches(id,name,code)&limit=1`,
            { headers: getHeaders() }
          );

          if (studentRes.ok) {
            const sRows = await studentRes.json();
            if (Array.isArray(sRows) && sRows.length > 0) {
              const studentRow = sRows[0];
              const batch = studentRow.batches || {};
              const meta = typeof userRow.metadata === 'object' && userRow.metadata !== null ? userRow.metadata : {};

              const sessionPayload: StudentSessionPayload = {
                id: studentRow.id,
                userId: userRow.id,
                studentId: studentRow.student_id,
                fullName: userRow.full_name || data.user.user_metadata?.full_name || 'Enrolled Student',
                email: userRow.email,
                phone: userRow.phone || undefined,
                batchId: studentRow.batch_id || undefined,
                batchName: batch.name || meta.batchName || 'General Batch',
                role: 'STUDENT',
                avatarUrl: data.user.user_metadata?.avatar_url || userRow.avatar_url || undefined,
                issuedAt: Date.now(),
                expiresAt: Date.now() + 60 * 60 * 24 * 7 * 1000,
              };

              const response = NextResponse.redirect(`${origin}${next}`);
              setStudentSessionCookie(response, sessionPayload);
              return response;
            }
          }
        }
      }

      // If no enrolled student matches this Google account:
      await supabase.auth.signOut();
      return NextResponse.redirect(
        `${origin}/student/login?error=not_enrolled&email=${encodeURIComponent(googleEmail)}`
      );
    }
  }

  // Return the user to login with an error
  return NextResponse.redirect(`${origin}/student/login?error=oauth_failed`);
}
