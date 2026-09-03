import { NextResponse } from 'next/server';
import { getAttendanceSettings, updateAttendanceSettings } from '@/lib/db/supabaseSettings';

export async function GET() {
  try {
    const settings = await getAttendanceSettings();
    return NextResponse.json({ success: true, settings });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const settings = await updateAttendanceSettings(body);
    return NextResponse.json({ success: true, settings });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
