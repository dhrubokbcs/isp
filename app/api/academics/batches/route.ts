import { NextResponse } from 'next/server';
import {
  fetchBatchesFromSupabase,
  createBatchInSupabase,
  updateBatchInSupabase,
  deleteBatchInSupabase,
} from '@/lib/db/supabaseAcademics';
import { requireAdmin, requireUser } from '@/lib/auth/requireSession';

export async function GET(request: Request) {
  try {
    const auth = await requireUser(request);
    if (auth.errorResponse) return auth.errorResponse;

    const batches = await fetchBatchesFromSupabase();
    return NextResponse.json({
      success: true,
      source: 'supabase',
      count: batches.length,
      batches,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const auth = await requireAdmin(request);
    if (auth.errorResponse) return auth.errorResponse;

    const body = await request.json();
    const { name, code, academicYearId, programId, maxCapacity, shift } = body;
    if (!name || !code || !academicYearId) {
      return NextResponse.json(
        { success: false, error: 'Batch Name, Code, and Academic Year are required' },
        { status: 400 }
      );
    }
    const created = await createBatchInSupabase({
      name,
      code,
      academicYearId,
      programId,
      maxCapacity: maxCapacity ? parseInt(maxCapacity, 10) : 40,
      shift,
    });
    return NextResponse.json({ success: true, batch: created }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const auth = await requireAdmin(request);
    if (auth.errorResponse) return auth.errorResponse;

    const body = await request.json();
    const { id, action, ...updates } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Batch ID is required' }, { status: 400 });
    }

    if (action === 'TOGGLE_STATUS') {
      const { isActive } = body;
      const ok = await updateBatchInSupabase(id, { isActive });
      return NextResponse.json({ success: ok });
    }

    if (updates.maxCapacity) {
      updates.maxCapacity = parseInt(updates.maxCapacity, 10);
    }

    const ok = await updateBatchInSupabase(id, updates);
    return NextResponse.json({ success: ok });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const auth = await requireAdmin(request);
    if (auth.errorResponse) return auth.errorResponse;

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Batch ID is required' }, { status: 400 });
    }

    const ok = await deleteBatchInSupabase(id);
    return NextResponse.json({ success: ok });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
