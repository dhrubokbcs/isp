import { NextResponse } from 'next/server';
import { verifyGmailConnection, sendTestEmail } from '@/lib/email/mailer';

export async function GET() {
  try {
    const isConfigured = Boolean(process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD);
    const verification = await verifyGmailConnection();

    return NextResponse.json({
      success: verification.success,
      isConfigured,
      user: process.env.GMAIL_USER ? process.env.GMAIL_USER.replace(/(.{2})(.*)(@.*)/, '$1***$3') : null,
      message: verification.message,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { to } = body;

    if (!to || !to.includes('@')) {
      return NextResponse.json({ success: false, error: 'Valid recipient email address is required' }, { status: 400 });
    }

    const result = await sendTestEmail(to.trim());
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
