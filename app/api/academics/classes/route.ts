import { NextResponse } from 'next/server';
import {
  fetchClassLevelsFromSupabase,
  createClassLevelInSupabase,
  updateClassLevelInSupabase,
  seedStandardClassLevelsInSupabase,
  deleteClassLevelInSupabase,
} from '@/lib/db/supabaseAcademics';

export async function GET() {
  try {
    const classLevels = await fetchClassLevelsFromSupabase();
    return NextResponse.json({
      success: true,
      source: 'supabase',
      count: classLevels.length,
      classLevels,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (body.action === 'SEED') {
      const result = await seedStandardClassLevelsInSupabase();
      return NextResponse.json({
        success: true,
        message: `Successfully seeded ${result.count} standard class levels into Supabase`,
      });
    }

    const { name, numericLevel } = body;
    if (!name || numericLevel === undefined) {
      return NextResponse.json(
        { success: false, error: 'Class Name and Numeric Level are required' },
        { status: 400 }
      );
    }

    const created = await createClassLevelInSupabase({
      name,
      numericLevel: parseInt(numericLevel, 10),
    });

    return NextResponse.json({ success: true, classLevel: created }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, name, numericLevel } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'ID is required' }, { status: 400 });
    }

    const ok = await updateClassLevelInSupabase(id, {
      name,
      numericLevel: numericLevel !== undefined ? parseInt(numericLevel, 10) : undefined,
    });

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
      return NextResponse.json({ success: false, error: 'ID is required' }, { status: 400 });
    }

    const ok = await deleteClassLevelInSupabase(id);
    return NextResponse.json({ success: ok });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
