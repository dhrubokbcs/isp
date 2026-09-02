import { NextResponse } from 'next/server';
import { verifyOtpAndExecute } from '@/lib/email/otpService';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, code, purpose, newPassword, newEmail } = body;

    if (!email || !code || !purpose) {
      return NextResponse.json({ success: false, error: 'Email, OTP code, and purpose are required.' }, { status: 400 });
    }

    const result = await verifyOtpAndExecute({
      email,
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
