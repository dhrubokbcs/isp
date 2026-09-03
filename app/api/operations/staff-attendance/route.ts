import { NextResponse } from 'next/server';
import { fetchStaffAttendanceForDate, punchStaffAttendance } from '@/lib/db/supabaseStaffAttendance';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0];
    const records = await fetchStaffAttendanceForDate(date);
    return NextResponse.json({ success: true, records });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.id) {
      return NextResponse.json({ success: false, error: 'Staff Record ID is required.' }, { status: 400 });
    }
    const date = body.date || new Date().toISOString().split('T')[0];
    const record = await punchStaffAttendance({
      id: body.id,
      date,
      action: body.action || 'PUNCH_IN',
      time: body.time,
      status: body.status,
      remark: body.remark,
    });
    return NextResponse.json({ success: true, record });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
