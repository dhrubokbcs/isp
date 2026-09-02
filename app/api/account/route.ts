import { NextResponse } from 'next/server';
import { fetchUserAccount, updateUserAccount } from '@/lib/db/supabaseAccount';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || undefined;

    const account = await fetchUserAccount(userId);
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
    const body = await request.json();
    const { userId, ...data } = body;

    if (!userId) {
      return NextResponse.json({ success: false, error: 'userId is required' }, { status: 400 });
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

    const ok = await updateUserAccount(userId, data);
    if (!ok) {
      return NextResponse.json({ success: false, error: 'Failed to update account' }, { status: 500 });
    }

    const updated = await fetchUserAccount(userId);
    return NextResponse.json({ success: true, account: updated });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
