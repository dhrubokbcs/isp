import { NextResponse } from 'next/server';
import { fetchGuardiansFromSupabase, updateGuardianDetailsInSupabase } from '@/lib/db/supabaseGuardians';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || undefined;
    const filter = searchParams.get('filter') || undefined;

    const guardians = await fetchGuardiansFromSupabase(query, filter);
    return NextResponse.json({
      success: true,
      source: 'supabase',
      count: guardians.length,
      guardians,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id || !updates.linkedStudentIds || updates.linkedStudentIds.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Guardian ID and linked student IDs are required' },
        { status: 400 }
      );
    }

    const ok = await updateGuardianDetailsInSupabase(id, updates);
    return NextResponse.json({ success: ok });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
