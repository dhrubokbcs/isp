import { NextResponse } from 'next/server';
import { generateAndSendOtp } from '@/lib/email/otpService';
import { checkRateLimit, getClientIp } from '@/lib/security/rateLimit';
import { requireUser } from '@/lib/auth/requireSession';

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const rateLimit = checkRateLimit(`otp_send:${ip}`, 5, 10 * 60 * 1000);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: `Too many OTP requests. Please wait ${rateLimit.resetInSeconds} seconds before requesting again.`,
        },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { email, purpose, newEmail, userName } = body;

    if (!purpose || (purpose !== 'PASSWORD_RESET' && purpose !== 'EMAIL_CHANGE')) {
      return NextResponse.json(
        { success: false, error: 'Valid purpose is required (PASSWORD_RESET or EMAIL_CHANGE).' },
        { status: 400 }
      );
    }

    let targetOldEmail = email;

    // Security check: EMAIL_CHANGE strictly requires an authenticated session
    if (purpose === 'EMAIL_CHANGE') {
      const auth = await requireUser(request);
      if (auth.errorResponse) return auth.errorResponse;
      targetOldEmail = auth.user.email;

      if (!newEmail || !newEmail.includes('@')) {
        return NextResponse.json(
          { success: false, error: 'Valid newEmail is required for email change.' },
          { status: 400 }
        );
      }
    } else {
      // PASSWORD_RESET
      if (!email || !email.includes('@')) {
        return NextResponse.json({ success: false, error: 'Valid email address is required.' }, { status: 400 });
      }
    }

    const result = await generateAndSendOtp({
      email: targetOldEmail,
      purpose,
      newEmail,
      userName,
    });

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
