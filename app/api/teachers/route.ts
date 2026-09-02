import { NextResponse } from 'next/server';
import {
  fetchTeachersFromSupabase,
  createTeacherInSupabase,
  getNextEmployeeIdFromSupabase,
} from '@/lib/db/supabaseTeachers';
import { getTeachers, addTeacher, getNextEmployeeId } from '@/lib/db/teachers';

export async function GET() {
  try {
    const teachers = await fetchTeachersFromSupabase();
    const nextEmployeeId = await getNextEmployeeIdFromSupabase();

    return NextResponse.json({
      success: true,
      source: 'supabase',
      count: teachers.length,
      nextEmployeeId,
      teachers,
    });
  } catch (err: any) {
    console.error('Error in GET /api/teachers:', err);
    const fallbackTeachers = getTeachers();
    return NextResponse.json({
      success: true,
      source: 'memory_fallback',
      count: fallbackTeachers.length,
      nextEmployeeId: getNextEmployeeId(),
      teachers: fallbackTeachers,
    });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      fullName,
      nickname,
      dob,
      gender,
      bio,
      educationalDetails,
      experience,
      mobile,
      whatsapp,
      email,
      initialPassword,
    } = body;

    if (!fullName || !email || !mobile) {
      return NextResponse.json(
        { success: false, error: 'Full Name, Email, and Mobile number are required.' },
        { status: 400 }
      );
    }

    try {
      // Primary: Save directly to Supabase
      const createdTeacher = await createTeacherInSupabase({
        fullName,
        nickname,
        dob,
        gender,
        bio,
        educationalDetails,
        experience,
        mobile,
        whatsapp,
        email,
        initialPassword,
      });

      return NextResponse.json(
        {
          success: true,
          source: 'supabase',
          message: `Teacher saved in Supabase database with Employee ID ${createdTeacher.employeeId}`,
          teacher: createdTeacher,
        },
        { status: 201 }
      );
    } catch (supabaseError: any) {
      console.error('Supabase write error, using fallback:', supabaseError);

      // Fallback: save to memory
      const fallbackTeacher = addTeacher({
        fullName: fullName.trim(),
        nickname: nickname ? nickname.trim() : '',
        dob: dob || undefined,
        gender: gender || 'Male',
        bio: bio ? bio.trim() : '',
        educationalDetails: educationalDetails ? educationalDetails.trim() : '',
        experience: experience ? experience.trim() : '',
        mobile: mobile.trim(),
        whatsapp: whatsapp ? whatsapp.trim() : mobile.trim(),
        email: email.trim().toLowerCase(),
        initialPassword,
        status: 'ACTIVE',
      });

      return NextResponse.json(
        {
          success: true,
          source: 'memory_fallback',
          message: `Teacher saved (memory fallback): ${supabaseError.message}`,
          teacher: fallbackTeacher,
        },
        { status: 201 }
      );
    }
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to process teacher registration' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const { employeeId, status } = await request.json();
    if (!employeeId || !status) {
      return NextResponse.json(
        { success: false, error: 'Employee ID and Status are required' },
        { status: 400 }
      );
    }

    const { updateTeacherStatusInSupabase } = await import('@/lib/db/supabaseTeachers');
    const ok = await updateTeacherStatusInSupabase(employeeId, status);

    return NextResponse.json({
      success: ok,
      message: ok ? `Status updated to ${status}` : 'Teacher not found',
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
