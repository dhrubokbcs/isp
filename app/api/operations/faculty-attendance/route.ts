import { NextResponse } from 'next/server';
import {
  fetchFacultyAttendance,
  createFacultyAttendanceRecord,
  updateFacultyAttendanceRecord,
  deleteFacultyAttendanceRecord,
} from '@/lib/db/supabaseFacultyAttendance';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date') || undefined;
    const startDate = searchParams.get('startDate') || undefined;
    const endDate = searchParams.get('endDate') || undefined;
    const facultyName = searchParams.get('facultyName') || undefined;
    const batchName = searchParams.get('batchName') || undefined;
    const status = searchParams.get('status') || undefined;
    const search = searchParams.get('search') || undefined;
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    const result = await fetchFacultyAttendance({
      date,
      startDate,
      endDate,
      facultyName,
      batchName,
      status,
      search,
      limit,
      offset,
    });

    return NextResponse.json({
      success: true,
      records: result.records,
      totalCount: result.totalCount,
      stats: result.stats,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.batchName || !body.facultyName || !body.slotStart || !body.slotEnd) {
      return NextResponse.json(
        { success: false, error: 'Batch Name, Faculty Name, and Scheduled Slot are required.' },
        { status: 400 }
      );
    }

    const record = await createFacultyAttendanceRecord({
      date: body.date || new Date().toISOString().split('T')[0],
      batchName: body.batchName,
      slotStart: body.slotStart,
      slotEnd: body.slotEnd,
      facultyName: body.facultyName,
      entryTime: body.entryTime || null,
      exitTime: body.exitTime || null,
      totalStudents: parseInt(body.totalStudents || '0', 10),
      signature: body.signature || null,
      remark: body.remark || null,
      examBatch: body.examBatch || null,
      duration: body.duration || null,
      status: body.status || 'PRESENT',
    });

    return NextResponse.json({ success: true, record }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    if (!body.id) {
      return NextResponse.json({ success: false, error: 'Record ID is required.' }, { status: 400 });
    }

    const record = await updateFacultyAttendanceRecord(body.id, {
      date: body.date,
      batchName: body.batchName,
      slotStart: body.slotStart,
      slotEnd: body.slotEnd,
      facultyName: body.facultyName,
      entryTime: body.entryTime,
      exitTime: body.exitTime,
      totalStudents: body.totalStudents !== undefined ? parseInt(body.totalStudents, 10) : undefined,
      signature: body.signature,
      remark: body.remark,
      examBatch: body.examBatch,
      duration: body.duration,
      status: body.status,
    });

    return NextResponse.json({ success: true, record });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ success: false, error: 'Record ID is required.' }, { status: 400 });
    }

    await deleteFacultyAttendanceRecord(id);
    return NextResponse.json({ success: true, message: 'Record deleted successfully' });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
