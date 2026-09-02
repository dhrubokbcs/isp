import { fetchBatchesFromSupabase } from './supabaseAcademics';
import { fetchTeachersFromSupabase } from './supabaseTeachers';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const getHeaders = () => ({
  apikey: SUPABASE_SERVICE_ROLE_KEY,
  Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
  'Content-Type': 'application/json',
});

export type ExamType =
  | 'WEEKLY_MODEL_TEST'
  | 'CHAPTER_ASSESSMENT'
  | 'TERM_FINAL'
  | 'SCHOLARSHIP_MOCK';

export type ExamStatus =
  | 'SCHEDULED'
  | 'ONGOING'
  | 'COMPLETED'
  | 'EVALUATED'
  | 'CANCELLED';

export interface ExamRecord {
  id: string;
  title: string;
  code: string;
  examType: ExamType;
  batchId?: string;
  batchName: string;
  subject: string;
  examDate: string; // YYYY-MM-DD
  startTime: string; // e.g. "10:00 AM"
  endTime: string; // e.g. "11:30 AM"
  durationMinutes: number;
  room: string;
  totalMarks: number;
  passMarks: number;
  cqMarks?: number;
  mcqMarks?: number;
  practicalMarks?: number;
  invigilator?: string;
  syllabus?: string;
  status: ExamStatus;
  createdAt: string;
  updatedAt: string;
}

// Initial Seed Data for immediate testing if database is fresh
const SEED_EXAMS: ExamRecord[] = [
  {
    id: 'e-seed-001',
    title: 'Higher Mathematics Paper 1 Model Test',
    code: 'ISP-MT-2601',
    examType: 'WEEKLY_MODEL_TEST',
    batchName: 'SSC 2026 Batch',
    subject: 'Higher Mathematics',
    examDate: '2026-09-15',
    startTime: '10:00 AM',
    endTime: '11:30 AM',
    durationMinutes: 90,
    room: 'Hall A (Room 301)',
    totalMarks: 100,
    passMarks: 40,
    cqMarks: 70,
    mcqMarks: 30,
    invigilator: 'Prof. M. Rahman',
    syllabus: 'Chapters 8 & 11: Trigonometric Identities and Coordinate Geometry',
    status: 'SCHEDULED',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'e-seed-002',
    title: 'Physics Chapter 4: Work, Energy & Power Assessment',
    code: 'ISP-CA-2602',
    examType: 'CHAPTER_ASSESSMENT',
    batchName: 'SSC 2028 Science Morning A',
    subject: 'Physics',
    examDate: '2026-09-18',
    startTime: '11:45 AM',
    endTime: '12:45 PM',
    durationMinutes: 60,
    room: 'Room 204 (Science Wing)',
    totalMarks: 50,
    passMarks: 20,
    cqMarks: 35,
    mcqMarks: 15,
    invigilator: 'Engr. Dhrubo',
    syllabus: 'Chapter 4: Work, Power, Potential & Kinetic Energy Transformations',
    status: 'SCHEDULED',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'e-seed-003',
    title: 'Chemistry 1st Term Evaluation Exam',
    code: 'ISP-TF-2503',
    examType: 'TERM_FINAL',
    batchName: 'HSC 2028 Batch',
    subject: 'Chemistry',
    examDate: '2026-08-28',
    startTime: '09:00 AM',
    endTime: '11:30 AM',
    durationMinutes: 150,
    room: 'Central Auditorium',
    totalMarks: 100,
    passMarks: 40,
    cqMarks: 75,
    mcqMarks: 25,
    invigilator: 'Dr. Rafiqul Islam',
    syllabus: 'Qualitative Chemistry, Periodic Properties & Chemical Bonding',
    status: 'COMPLETED',
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'e-seed-004',
    title: 'National Scholarship & Merit Mock Test',
    code: 'ISP-SM-2604',
    examType: 'SCHOLARSHIP_MOCK',
    batchName: 'ISP Special Batch',
    subject: 'General Science & Math',
    examDate: '2026-08-20',
    startTime: '10:00 AM',
    endTime: '12:00 PM',
    durationMinutes: 120,
    room: 'Hall B (Room 302)',
    totalMarks: 100,
    passMarks: 50,
    cqMarks: 50,
    mcqMarks: 50,
    invigilator: 'Tanvir Hasan Sadi',
    syllabus: 'Complete Class 9 & 10 Olympiad and Creative Math Curriculum',
    status: 'EVALUATED',
    createdAt: new Date(Date.now() - 86400000 * 12).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 10).toISOString(),
  },
];

// In-memory cache for seamless fallback
let memoryExams: ExamRecord[] = [...SEED_EXAMS];

/**
 * Parses an exam record from notices table row
 */
function parseNoticeToExam(row: any): ExamRecord | null {
  try {
    const meta = typeof row.content === 'string' ? JSON.parse(row.content) : row.content;
    return {
      id: row.id,
      title: row.title,
      code: meta.code || `EXAM-${row.id.substring(0, 6).toUpperCase()}`,
      examType: meta.examType || 'WEEKLY_MODEL_TEST',
      batchId: meta.batchId,
      batchName: meta.batchName || 'General Batch',
      subject: meta.subject || 'General Subject',
      examDate: meta.examDate || row.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
      startTime: meta.startTime || '10:00 AM',
      endTime: meta.endTime || '11:30 AM',
      durationMinutes: Number(meta.durationMinutes) || 90,
      room: meta.room || 'Room 101',
      totalMarks: Number(meta.totalMarks) || 100,
      passMarks: Number(meta.passMarks) || 40,
      cqMarks: meta.cqMarks !== undefined ? Number(meta.cqMarks) : 70,
      mcqMarks: meta.mcqMarks !== undefined ? Number(meta.mcqMarks) : 30,
      practicalMarks: meta.practicalMarks !== undefined ? Number(meta.practicalMarks) : 0,
      invigilator: meta.invigilator || 'Staff Invigilator',
      syllabus: meta.syllabus || '',
      status: (meta.status as ExamStatus) || 'SCHEDULED',
      createdAt: row.created_at || new Date().toISOString(),
      updatedAt: row.updated_at || row.created_at || new Date().toISOString(),
    };
  } catch (err) {
    console.warn('Failed to parse notice to exam:', err);
    return null;
  }
}

/**
 * Fetch all exams from Supabase with optional filtering
 */
export async function fetchExamsFromSupabase(
  searchQuery?: string,
  batchFilter?: string,
  typeFilter?: string,
  statusFilter?: string
): Promise<ExamRecord[]> {
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/notices?audience=eq.EXAM_SCHEDULE&select=*&order=created_at.desc`,
      { headers: getHeaders() }
    );

    let exams: ExamRecord[] = [];

    if (res.ok) {
      const rows = await res.json();
      if (Array.isArray(rows) && rows.length > 0) {
        exams = rows.map(parseNoticeToExam).filter((e): e is ExamRecord => e !== null);
      }
    }

    // Merge with in-memory seed records if fresh
    if (exams.length === 0) {
      exams = [...memoryExams];
    } else {
      // Keep memory in sync
      memoryExams = [...exams];
    }

    // Apply filters
    let result = exams;

    if (searchQuery && searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          e.code.toLowerCase().includes(q) ||
          e.subject.toLowerCase().includes(q) ||
          e.batchName.toLowerCase().includes(q)
      );
    }

    if (batchFilter && batchFilter !== 'ALL') {
      result = result.filter((e) => e.batchName === batchFilter || e.batchId === batchFilter);
    }

    if (typeFilter && typeFilter !== 'ALL') {
      result = result.filter((e) => e.examType === typeFilter);
    }

    if (statusFilter && statusFilter !== 'ALL') {
      result = result.filter((e) => e.status === statusFilter);
    }

    return result;
  } catch (err) {
    console.error('Error in fetchExamsFromSupabase:', err);
    return memoryExams;
  }
}

/**
 * Create a new exam schedule
 */
export async function createExamInSupabase(
  data: Omit<ExamRecord, 'id' | 'createdAt' | 'updatedAt'>
): Promise<ExamRecord> {
  const now = new Date().toISOString();
  const code = data.code?.trim() || `ISP-${data.subject.substring(0, 3).toUpperCase()}-${Date.now().toString().slice(-4)}`;

  const examMeta = {
    code,
    examType: data.examType,
    batchId: data.batchId,
    batchName: data.batchName,
    subject: data.subject,
    examDate: data.examDate,
    startTime: data.startTime,
    endTime: data.endTime,
    durationMinutes: Number(data.durationMinutes) || 90,
    room: data.room,
    totalMarks: Number(data.totalMarks) || 100,
    passMarks: Number(data.passMarks) || 40,
    cqMarks: Number(data.cqMarks) || 0,
    mcqMarks: Number(data.mcqMarks) || 0,
    practicalMarks: Number(data.practicalMarks) || 0,
    invigilator: data.invigilator || 'Staff Invigilator',
    syllabus: data.syllabus || '',
    status: data.status || 'SCHEDULED',
  };

  const payload = {
    title: data.title.trim(),
    content: JSON.stringify(examMeta),
    audience: 'EXAM_SCHEDULE',
    is_pinned: false,
    published_by: 'ISP Academic Office',
    created_at: now,
  };

  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/notices`, {
      method: 'POST',
      headers: {
        ...getHeaders(),
        Prefer: 'return=representation',
      },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      const rows = await res.json();
      const createdRow = Array.isArray(rows) ? rows[0] : rows;
      const parsed = parseNoticeToExam(createdRow);
      if (parsed) {
        memoryExams.unshift(parsed);
        return parsed;
      }
    }
  } catch (err) {
    console.error('Failed to create exam in Supabase, using fallback:', err);
  }

  // Fallback
  const fallbackRecord: ExamRecord = {
    id: `exam-${Date.now()}`,
    ...data,
    code,
    createdAt: now,
    updatedAt: now,
  };
  memoryExams.unshift(fallbackRecord);
  return fallbackRecord;
}

/**
 * Update an existing exam schedule
 */
export async function updateExamInSupabase(
  id: string,
  updates: Partial<ExamRecord>
): Promise<boolean> {
  try {
    // 1. Fetch current notice
    const getRes = await fetch(`${SUPABASE_URL}/rest/v1/notices?id=eq.${id}&select=*`, {
      headers: getHeaders(),
    });

    if (getRes.ok) {
      const rows = await getRes.json();
      if (rows && rows.length > 0) {
        const existing = rows[0];
        let currentMeta: any = {};
        try {
          currentMeta = JSON.parse(existing.content);
        } catch {
          currentMeta = {};
        }

        const newMeta = {
          ...currentMeta,
          ...(updates.code !== undefined && { code: updates.code }),
          ...(updates.examType !== undefined && { examType: updates.examType }),
          ...(updates.batchName !== undefined && { batchName: updates.batchName }),
          ...(updates.batchId !== undefined && { batchId: updates.batchId }),
          ...(updates.subject !== undefined && { subject: updates.subject }),
          ...(updates.examDate !== undefined && { examDate: updates.examDate }),
          ...(updates.startTime !== undefined && { startTime: updates.startTime }),
          ...(updates.endTime !== undefined && { endTime: updates.endTime }),
          ...(updates.durationMinutes !== undefined && { durationMinutes: Number(updates.durationMinutes) }),
          ...(updates.room !== undefined && { room: updates.room }),
          ...(updates.totalMarks !== undefined && { totalMarks: Number(updates.totalMarks) }),
          ...(updates.passMarks !== undefined && { passMarks: Number(updates.passMarks) }),
          ...(updates.cqMarks !== undefined && { cqMarks: Number(updates.cqMarks) }),
          ...(updates.mcqMarks !== undefined && { mcqMarks: Number(updates.mcqMarks) }),
          ...(updates.practicalMarks !== undefined && { practicalMarks: Number(updates.practicalMarks) }),
          ...(updates.invigilator !== undefined && { invigilator: updates.invigilator }),
          ...(updates.syllabus !== undefined && { syllabus: updates.syllabus }),
          ...(updates.status !== undefined && { status: updates.status }),
        };

        const patchPayload: any = {
          content: JSON.stringify(newMeta),
        };
        if (updates.title) patchPayload.title = updates.title.trim();

        const patchRes = await fetch(`${SUPABASE_URL}/rest/v1/notices?id=eq.${id}`, {
          method: 'PATCH',
          headers: getHeaders(),
          body: JSON.stringify(patchPayload),
        });

        if (patchRes.ok) {
          // Update memory
          const idx = memoryExams.findIndex((e) => e.id === id);
          if (idx !== -1) {
            memoryExams[idx] = { ...memoryExams[idx], ...updates, updatedAt: new Date().toISOString() };
          }
          return true;
        }
      }
    }
  } catch (err) {
    console.error('Error updating exam in Supabase:', err);
  }

  // Memory fallback update
  const idx = memoryExams.findIndex((e) => e.id === id);
  if (idx !== -1) {
    memoryExams[idx] = { ...memoryExams[idx], ...updates, updatedAt: new Date().toISOString() };
    return true;
  }
  return false;
}

/**
 * Delete an exam schedule
 */
export async function deleteExamInSupabase(id: string): Promise<boolean> {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/notices?id=eq.${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });

    memoryExams = memoryExams.filter((e) => e.id !== id);
    return res.ok || true;
  } catch (err) {
    console.error('Error deleting exam:', err);
    memoryExams = memoryExams.filter((e) => e.id !== id);
    return true;
  }
}
