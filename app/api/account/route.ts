import { NextResponse } from 'next/server';
import { fetchUserAccount, updateUserAccount } from '@/lib/db/supabaseAccount';
import { requireUser } from '@/lib/auth/requireSession';

export async function GET(request: Request) {
  try {
    const auth = await requireUser(request);
    if (auth.errorResponse) return auth.errorResponse;

    const { searchParams } = new URL(request.url);
    const queryUserId = searchParams.get('userId');

    let targetUserId = auth.user.id;
    let targetRole = auth.user.role;

    // Allow Admin/Superadmin to view other users' accounts if requested
    if (queryUserId && (auth.user.role === 'SUPERADMIN' || auth.user.role === 'ADMIN')) {
      targetUserId = queryUserId;
      targetRole = (searchParams.get('role') as any) || undefined;
    }

    const account = await fetchUserAccount(targetUserId, targetRole, auth.user.email);
    if (!account) {
      return NextResponse.json({ success: false, error: 'User account not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      account,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const auth = await requireUser(request);
    if (auth.errorResponse) return auth.errorResponse;

    const body = await request.json();
    const { userId, ...data } = body;

    const targetUserId = userId || auth.user.id;

    // Users can only edit their own account unless they are Superadmin / Admin
    if (targetUserId !== auth.user.id && auth.user.role !== 'SUPERADMIN' && auth.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Forbidden. You can only update your own account.' },
        { status: 403 }
      );
    }

    // Validate MFS number if provided in payout
    if (data.payout && data.payout.method === 'MFS' && data.payout.mfs?.number) {
      const mfsNum = data.payout.mfs.number.trim();
      const mfsRegex = /^01[3-9]\d{8}$/;
      if (!mfsRegex.test(mfsNum)) {
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid MFS Mobile Number. Must start with 01 and contain exactly 11 digits.',
          },
          { status: 400 }
        );
      }
    }

    const ok = await updateUserAccount(targetUserId, data);
    if (!ok) {
      return NextResponse.json({ success: false, error: 'Failed to update account' }, { status: 500 });
    }

    const updated = await fetchUserAccount(targetUserId);
    return NextResponse.json({ success: true, account: updated });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
