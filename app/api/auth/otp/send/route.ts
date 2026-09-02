import { NextResponse } from 'next/server';
import { generateAndSendOtp } from '@/lib/email/otpService';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, purpose, newEmail, userName } = body;

    if (!email || !email.includes('@')) {
      return NextResponse.json({ success: false, error: 'Valid email address is required.' }, { status: 400 });
    }

    if (!purpose || (purpose !== 'PASSWORD_RESET' && purpose !== 'EMAIL_CHANGE')) {
      return NextResponse.json({ success: false, error: 'Valid purpose is required (PASSWORD_RESET or EMAIL_CHANGE).' }, { status: 400 });
    }

    if (purpose === 'EMAIL_CHANGE' && (!newEmail || !newEmail.includes('@'))) {
      return NextResponse.json({ success: false, error: 'Valid newEmail is required for email change.' }, { status: 400 });
    }

    const result = await generateAndSendOtp({
      email,
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
