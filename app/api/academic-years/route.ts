import { NextResponse } from 'next/server';
import {
  fetchAcademicYearsFromSupabase,
  createAcademicYearInSupabase,
  updateAcademicYearStatusInSupabase,
} from '@/lib/db/supabaseAcademicYears';
import { requireAdmin, requireUser } from '@/lib/auth/requireSession';

export async function GET(request: Request) {
  try {
    const auth = await requireUser(request);
    if (auth.errorResponse) return auth.errorResponse;

    const years = await fetchAcademicYearsFromSupabase();
    return NextResponse.json({
      success: true,
      source: 'supabase',
      count: years.length,
      years,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to fetch academic years' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const auth = await requireAdmin(request);
    if (auth.errorResponse) return auth.errorResponse;

    const body = await request.json();
    const { name, year, startDate, endDate, status } = body;

    if (!name || !year) {
      return NextResponse.json(
        { success: false, error: 'Academic Year Name and Year are required.' },
        { status: 400 }
      );
    }

    const created = await createAcademicYearInSupabase({
      name,
      year: parseInt(year, 10),
      startDate,
      endDate,
      status,
    });

    return NextResponse.json(
      {
        success: true,
        message: `Academic Year ${created.name} created successfully`,
        academicYear: created,
      },
      { status: 201 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to create academic year' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const auth = await requireAdmin(request);
    if (auth.errorResponse) return auth.errorResponse;

    const body = await request.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json(
        { success: false, error: 'ID and status are required' },
        { status: 400 }
      );
    }

    const ok = await updateAcademicYearStatusInSupabase(id, status);
    return NextResponse.json({
      success: ok,
      message: ok ? `Status updated to ${status}` : 'Failed to update status',
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to update academic year' },
      { status: 500 }
    );
  }
}
