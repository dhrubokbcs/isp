import { NextResponse } from 'next/server';
import {
  fetchProgramsFromSupabase,
  createProgramInSupabase,
  updateProgramInSupabase,
  deleteProgramInSupabase,
} from '@/lib/db/supabaseAcademics';
import { requireAdmin, requireUser } from '@/lib/auth/requireSession';

export async function GET(request: Request) {
  try {
    const auth = await requireUser(request);
    if (auth.errorResponse) return auth.errorResponse;

    const programs = await fetchProgramsFromSupabase();
    return NextResponse.json({
      success: true,
      source: 'supabase',
      count: programs.length,
      programs,
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
    const { name, code, description } = body;
    if (!name || !code) {
      return NextResponse.json({ success: false, error: 'Program Name and Code are required' }, { status: 400 });
    }
    const created = await createProgramInSupabase({ name, code, description });
    return NextResponse.json({ success: true, program: created }, { status: 201 });
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
      return NextResponse.json({ success: false, error: 'Program ID is required' }, { status: 400 });
    }

    if (action === 'TOGGLE_STATUS') {
      const { isActive } = body;
      const ok = await updateProgramInSupabase(id, { isActive });
      return NextResponse.json({ success: ok });
    }

    const ok = await updateProgramInSupabase(id, updates);
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
      return NextResponse.json({ success: false, error: 'Program ID is required' }, { status: 400 });
    }

    const ok = await deleteProgramInSupabase(id);
    return NextResponse.json({ success: ok });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
