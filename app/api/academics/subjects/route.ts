import { NextResponse } from 'next/server';
import {
  fetchSubjectsFromSupabase,
  createSubjectInSupabase,
  updateSubjectInSupabase,
  deleteSubjectInSupabase,
  addChapterToSubject,
  updateChapterInSubject,
  deleteChapterFromSubject,
  addTopicToChapter,
  updateTopicInChapter,
  deleteTopicFromChapter,
} from '@/lib/db/supabaseAcademics';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const classLevelId = searchParams.get('classLevelId') || undefined;

    const subjects = await fetchSubjectsFromSupabase(classLevelId);
    return NextResponse.json({
      success: true,
      source: 'supabase',
      count: subjects.length,
      subjects,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, code, classLevelId, department, targetLevel, totalWeeklyClasses } = body;
    if (!name || !code) {
      return NextResponse.json({ success: false, error: 'Subject Name and Code are required' }, { status: 400 });
    }
    const created = await createSubjectInSupabase({
      name,
      code,
      classLevelId: classLevelId || undefined,
      department: department || 'GENERAL',
      targetLevel: targetLevel || '',
      totalWeeklyClasses: totalWeeklyClasses || 3,
      isActive: true,
    });
    return NextResponse.json({ success: true, subject: created }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, action, ...updates } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Subject ID is required' }, { status: 400 });
    }

    if (action === 'TOGGLE_STATUS') {
      const { isActive } = body;
      const ok = await updateSubjectInSupabase(id, { isActive });
      return NextResponse.json({ success: ok });
    }

    // Syllabus Chapter actions
    if (action === 'ADD_CHAPTER') {
      const { chapter } = body;
      const ok = await addChapterToSubject(id, chapter);
      return NextResponse.json({ success: ok });
    }

    if (action === 'UPDATE_CHAPTER') {
      const { chapterId, chapter } = body;
      const ok = await updateChapterInSubject(id, chapterId, chapter);
      return NextResponse.json({ success: ok });
    }

    if (action === 'DELETE_CHAPTER') {
      const { chapterId } = body;
      const ok = await deleteChapterFromSubject(id, chapterId);
      return NextResponse.json({ success: ok });
    }

    // Syllabus Topic actions
    if (action === 'ADD_TOPIC') {
      const { chapterId, topic } = body;
      const ok = await addTopicToChapter(id, chapterId, topic);
      return NextResponse.json({ success: ok });
    }

    if (action === 'UPDATE_TOPIC') {
      const { chapterId, topicId, topic } = body;
      const ok = await updateTopicInChapter(id, chapterId, topicId, topic);
      return NextResponse.json({ success: ok });
    }

    if (action === 'DELETE_TOPIC') {
      const { chapterId, topicId } = body;
      const ok = await deleteTopicFromChapter(id, chapterId, topicId);
      return NextResponse.json({ success: ok });
    }

    // Standard subject update
    const ok = await updateSubjectInSupabase(id, updates);
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

    const ok = await deleteSubjectInSupabase(id);
    return NextResponse.json({ success: ok });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
