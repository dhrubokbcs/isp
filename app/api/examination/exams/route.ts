import { NextResponse } from 'next/server';
import {
  fetchExamsFromSupabase,
  createExamInSupabase,
  updateExamInSupabase,
  deleteExamInSupabase,
  ExamRecord,
} from '@/lib/db/supabaseExams';
import { fetchBatchesFromSupabase } from '@/lib/db/supabaseAcademics';
import { fetchTeachersFromSupabase } from '@/lib/db/supabaseTeachers';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query') || undefined;
    const batch = searchParams.get('batch') || undefined;
    const type = searchParams.get('type') || undefined;
    const status = searchParams.get('status') || undefined;

    const [exams, batches, teachers] = await Promise.all([
      fetchExamsFromSupabase(query, batch, type, status),
      fetchBatchesFromSupabase().catch(() => []),
      fetchTeachersFromSupabase().catch(() => []),
    ]);

    const counts = {
      total: exams.length,
      scheduled: exams.filter((e) => e.status === 'SCHEDULED').length,
      ongoing: exams.filter((e) => e.status === 'ONGOING').length,
      completed: exams.filter((e) => e.status === 'COMPLETED').length,
      evaluated: exams.filter((e) => e.status === 'EVALUATED').length,
    };

    return NextResponse.json({
      success: true,
      counts,
      exams,
      batches: batches.map((b) => ({ id: b.id, name: b.name, code: b.code })),
      teachers: teachers.map((t) => ({ id: t.id, name: t.fullName })),
    });
  } catch (err: any) {
    console.error('Error in GET /api/examination/exams:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to fetch exam schedules' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      title,
      code,
      examType,
      batchName,
      batchId,
      subject,
      examDate,
      startTime,
      endTime,
      durationMinutes,
      room,
      totalMarks,
      passMarks,
      cqMarks,
      mcqMarks,
      practicalMarks,
      invigilator,
      syllabus,
      status,
    } = body;

    if (!title || !batchName || !subject || !examDate) {
      return NextResponse.json(
        { success: false, error: 'Exam title, batch, subject, and exam date are required.' },
        { status: 400 }
      );
    }

    const createdExam = await createExamInSupabase({
      title: title.trim(),
      code: code ? code.trim() : '',
      examType: examType || 'WEEKLY_MODEL_TEST',
      batchName: batchName.trim(),
      batchId,
      subject: subject.trim(),
      examDate,
      startTime: startTime || '10:00 AM',
      endTime: endTime || '11:30 AM',
      durationMinutes: Number(durationMinutes) || 90,
      room: room ? room.trim() : 'Hall A',
      totalMarks: Number(totalMarks) || 100,
      passMarks: Number(passMarks) || 40,
      cqMarks: cqMarks !== undefined ? Number(cqMarks) : 70,
      mcqMarks: mcqMarks !== undefined ? Number(mcqMarks) : 30,
      practicalMarks: practicalMarks !== undefined ? Number(practicalMarks) : 0,
      invigilator: invigilator ? invigilator.trim() : 'Staff Invigilator',
      syllabus: syllabus ? syllabus.trim() : '',
      status: status || 'SCHEDULED',
    });

    return NextResponse.json(
      {
        success: true,
        message: `Exam "${createdExam.title}" scheduled successfully.`,
        exam: createdExam,
      },
      { status: 201 }
    );
  } catch (err: any) {
    console.error('Error in POST /api/examination/exams:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to schedule exam' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Exam ID is required for update.' },
        { status: 400 }
      );
    }

    const ok = await updateExamInSupabase(id, updates);
    if (!ok) {
      return NextResponse.json(
        { success: false, error: 'Failed to update exam schedule.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Exam schedule updated successfully.',
    });
  } catch (err: any) {
    console.error('Error in PATCH /api/examination/exams:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to update exam schedule' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Exam ID is required for deletion.' },
        { status: 400 }
      );
    }

    const ok = await deleteExamInSupabase(id);
    if (!ok) {
      return NextResponse.json(
        { success: false, error: 'Failed to delete exam schedule.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Exam schedule deleted successfully.',
    });
  } catch (err: any) {
    console.error('Error in DELETE /api/examination/exams:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to delete exam schedule' },
      { status: 500 }
    );
  }
}
