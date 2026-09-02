import { NextResponse } from 'next/server';
import {
  fetchRoomsFromSupabase,
  createRoomInSupabase,
  updateRoomInSupabase,
  deleteRoomInSupabase,
} from '@/lib/db/supabaseAcademics';

export async function GET() {
  try {
    const rooms = await fetchRoomsFromSupabase();
    return NextResponse.json({
      success: true,
      source: 'supabase',
      count: rooms.length,
      rooms,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { roomNumber, name, roomType, capacity, floor, status } = body;
    if (!roomNumber) {
      return NextResponse.json({ success: false, error: 'Room Number is required' }, { status: 400 });
    }
    const created = await createRoomInSupabase({
      roomNumber,
      name: name || roomNumber,
      roomType: roomType || 'LECTURE_HALL',
      capacity: parseInt(capacity, 10) || 40,
      hasAirCondition: false,
      hasProjector: false,
      floor: floor || '1st Floor',
      status: status || 'AVAILABLE',
    });
    return NextResponse.json({ success: true, room: created }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, action, ...updates } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Room ID is required' }, { status: 400 });
    }

    if (action === 'TOGGLE_STATUS') {
      const { status } = body;
      const ok = await updateRoomInSupabase(id, { status });
      return NextResponse.json({ success: ok });
    }

    if (updates.capacity) {
      updates.capacity = parseInt(updates.capacity, 10);
    }

    const ok = await updateRoomInSupabase(id, updates);
    return NextResponse.json({ success: ok });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Room ID is required' }, { status: 400 });
    }

    const ok = await deleteRoomInSupabase(id);
    return NextResponse.json({ success: ok });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
