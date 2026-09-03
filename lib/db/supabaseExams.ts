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

// Initial Seed Data for immediate testing
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

let memoryExams: ExamRecord[] = [...SEED_EXAMS];

/**
 * Maps Supabase public.exams table row (snake_case) to ExamRecord (camelCase)
 */
function mapExamRow(row: any): ExamRecord {
  return {
    id: row.id,
    title: row.title,
    code: row.code,
    examType: row.exam_type || 'WEEKLY_MODEL_TEST',
    batchId: row.batch_id || undefined,
    batchName: row.batch_name || '',
    subject: row.subject || '',
    examDate: row.exam_date || '',
    startTime: row.start_time || '',
    endTime: row.end_time || '',
    durationMinutes: Number(row.duration_minutes) || 90,
    room: row.room || 'Hall A',
    totalMarks: Number(row.total_marks) || 100,
    passMarks: Number(row.pass_marks) || 40,
    cqMarks: row.cq_marks !== null && row.cq_marks !== undefined ? Number(row.cq_marks) : undefined,
    mcqMarks: row.mcq_marks !== null && row.mcq_marks !== undefined ? Number(row.mcq_marks) : undefined,
    practicalMarks: row.practical_marks !== null && row.practical_marks !== undefined ? Number(row.practical_marks) : undefined,
    invigilator: row.invigilator || '',
    syllabus: row.syllabus || '',
    status: (row.status as ExamStatus) || 'SCHEDULED',
    createdAt: row.created_at || new Date().toISOString(),
    updatedAt: row.updated_at || new Date().toISOString(),
  };
}

/**
 * Maps ExamRecord to Supabase public.exams payload (snake_case)
 */
function toExamPayload(data: Partial<ExamRecord>) {
  const payload: any = {};
  if (data.title !== undefined) payload.title = data.title.trim();
  if (data.code !== undefined) payload.code = data.code.trim();
  if (data.examType !== undefined) payload.exam_type = data.examType;
  if (data.batchId !== undefined) payload.batch_id = data.batchId || null;
  if (data.batchName !== undefined) payload.batch_name = data.batchName.trim();
  if (data.subject !== undefined) payload.subject = data.subject.trim();
  if (data.examDate !== undefined) payload.exam_date = data.examDate;
  if (data.startTime !== undefined) payload.start_time = data.startTime.trim();
  if (data.endTime !== undefined) payload.end_time = data.endTime.trim();
  if (data.durationMinutes !== undefined) payload.duration_minutes = Number(data.durationMinutes);
  if (data.room !== undefined) payload.room = data.room.trim();
  if (data.totalMarks !== undefined) payload.total_marks = Number(data.totalMarks);
  if (data.passMarks !== undefined) payload.pass_marks = Number(data.passMarks);
  if (data.cqMarks !== undefined) payload.cq_marks = Number(data.cqMarks);
  if (data.mcqMarks !== undefined) payload.mcq_marks = Number(data.mcqMarks);
  if (data.practicalMarks !== undefined) payload.practical_marks = Number(data.practicalMarks);
  if (data.invigilator !== undefined) payload.invigilator = data.invigilator.trim();
  if (data.syllabus !== undefined) payload.syllabus = data.syllabus.trim();
  if (data.status !== undefined) payload.status = data.status;
  return payload;
}

/**
 * Fetch all exams from Supabase public.exams table
 */
export async function fetchExamsFromSupabase(
  searchQuery?: string,
  batchFilter?: string,
  typeFilter?: string,
  statusFilter?: string
): Promise<ExamRecord[]> {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/exams?select=*&order=exam_date.desc`, {
      headers: getHeaders(),
    });

    if (res.ok) {
      const rows = await res.json();
      if (Array.isArray(rows) && rows.length > 0) {
        let list = rows.map(mapExamRow);
        memoryExams = [...list];

        if (searchQuery && searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          list = list.filter(
            (e) =>
              e.title.toLowerCase().includes(q) ||
              e.code.toLowerCase().includes(q) ||
              e.subject.toLowerCase().includes(q) ||
              e.batchName.toLowerCase().includes(q)
          );
        }

        if (batchFilter && batchFilter !== 'ALL') {
          list = list.filter((e) => e.batchName === batchFilter || e.batchId === batchFilter);
        }

        if (typeFilter && typeFilter !== 'ALL') {
          list = list.filter((e) => e.examType === typeFilter);
        }

        if (statusFilter && statusFilter !== 'ALL') {
          list = list.filter((e) => e.status === statusFilter);
        }

        return list;
      }
    }
  } catch (err) {
    console.warn('Could not query public.exams table, checking in-memory fallback:', err);
  }

  // Fallback filtering
  let result = memoryExams;
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
    result = result.filter((e) => e.batchName === batchFilter);
  }
  if (typeFilter && typeFilter !== 'ALL') {
    result = result.filter((e) => e.examType === typeFilter);
  }
  if (statusFilter && statusFilter !== 'ALL') {
    result = result.filter((e) => e.status === statusFilter);
  }
  return result;
}

/**
 * Create a new exam in Supabase public.exams table
 */
export async function createExamInSupabase(
  data: Omit<ExamRecord, 'id' | 'createdAt' | 'updatedAt'>
): Promise<ExamRecord> {
  const code =
    data.code?.trim() ||
    `ISP-${data.subject.substring(0, 3).toUpperCase()}-${Date.now().toString().slice(-4)}`;

  const now = new Date().toISOString();
  const payload = {
    ...toExamPayload({ ...data, code }),
    created_at: now,
    updated_at: now,
  };

  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/exams`, {
      method: 'POST',
      headers: {
        ...getHeaders(),
        Prefer: 'return=representation',
      },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      const rows = await res.json();
      const created = Array.isArray(rows) ? rows[0] : rows;
      const mapped = mapExamRow(created);
      memoryExams.unshift(mapped);
      return mapped;
    } else {
      const errText = await res.text();
      console.warn('Failed to insert directly into public.exams:', errText);
    }
  } catch (err) {
    console.error('Network error creating exam in public.exams:', err);
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
 * Update an exam in Supabase public.exams table
 */
export async function updateExamInSupabase(
  id: string,
  updates: Partial<ExamRecord>
): Promise<boolean> {
  const payload = {
    ...toExamPayload(updates),
    updated_at: new Date().toISOString(),
  };

  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/exams?id=eq.${id}`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      const idx = memoryExams.findIndex((e) => e.id === id);
      if (idx !== -1) {
        memoryExams[idx] = { ...memoryExams[idx], ...updates, updatedAt: new Date().toISOString() };
      }
      return true;
    }
  } catch (err) {
    console.warn('Failed to patch public.exams:', err);
  }

  const idx = memoryExams.findIndex((e) => e.id === id);
  if (idx !== -1) {
    memoryExams[idx] = { ...memoryExams[idx], ...updates, updatedAt: new Date().toISOString() };
    return true;
  }
  return false;
}

/**
 * Delete an exam from Supabase public.exams table
 */
export async function deleteExamInSupabase(id: string): Promise<boolean> {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/exams?id=eq.${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });

    memoryExams = memoryExams.filter((e) => e.id !== id);
    return res.ok || true;
  } catch (err) {
    console.warn('Failed to delete from public.exams:', err);
    memoryExams = memoryExams.filter((e) => e.id !== id);
    return true;
  }
}
