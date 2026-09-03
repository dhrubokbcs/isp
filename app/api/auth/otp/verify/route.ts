import { NextResponse } from 'next/server';
import { verifyOtpAndExecute } from '@/lib/email/otpService';
import { checkRateLimit, getClientIp } from '@/lib/security/rateLimit';
import { requireUser } from '@/lib/auth/requireSession';

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const rateLimit = checkRateLimit(`otp_verify:${ip}`, 10, 10 * 60 * 1000);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: `Too many verification attempts. Please wait ${rateLimit.resetInSeconds} seconds before trying again.`,
        },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { email, code, purpose, newPassword, newEmail } = body;

    if (!code || !purpose) {
      return NextResponse.json(
        { success: false, error: 'OTP code and purpose are required.' },
        { status: 400 }
      );
    }

    let targetOldEmail = email;

    if (purpose === 'EMAIL_CHANGE') {
      const auth = await requireUser(request);
      if (auth.errorResponse) return auth.errorResponse;
      targetOldEmail = auth.user.email;
    } else {
      if (!email) {
        return NextResponse.json({ success: false, error: 'Email is required.' }, { status: 400 });
      }
    }

    const result = await verifyOtpAndExecute({
      email: targetOldEmail,
      code,
      purpose,
      newPassword,
      newEmail,
    });

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
