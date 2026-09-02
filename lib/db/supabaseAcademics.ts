const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://lzckoyeouimyrjzcefkp.supabase.co';
const SERVICE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  '';

function getHeaders() {
  return {
    apikey: SERVICE_KEY,
    Authorization: `Bearer ${SERVICE_KEY}`,
    'Content-Type': 'application/json',
  };
}

// ---------------------------------------------------------------------------
// 1. PROGRAMS
// ---------------------------------------------------------------------------
export interface AcademicProgram {
  id: string;
  name: string;
  code: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
}

export async function fetchProgramsFromSupabase(): Promise<AcademicProgram[]> {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/programs?select=*&order=created_at.asc`, {
      headers: getHeaders(),
      cache: 'no-store',
    });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data)
      ? data.map((p) => ({
          id: p.id,
          name: p.name,
          code: p.code,
          description: p.description || '',
          isActive: p.is_active ?? true,
          createdAt: p.created_at,
        }))
      : [];
  } catch {
    return [];
  }
}

export async function createProgramInSupabase(data: {
  name: string;
  code: string;
  description?: string;
}): Promise<AcademicProgram> {
  const payload = {
    name: data.name.trim(),
    code: data.code.trim().toUpperCase(),
    description: data.description ? data.description.trim() : null,
    is_active: true,
  };

  const res = await fetch(`${SUPABASE_URL}/rest/v1/programs`, {
    method: 'POST',
    headers: { ...getHeaders(), Prefer: 'return=representation' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Failed to create program: ${err}`);
  }

  const rows = await res.json();
  const row = Array.isArray(rows) ? rows[0] : rows;
  return {
    id: row.id,
    name: row.name,
    code: row.code,
    description: row.description || '',
    isActive: row.is_active,
    createdAt: row.created_at,
  };
}

export async function updateProgramInSupabase(
  id: string,
  data: {
    name?: string;
    code?: string;
    description?: string;
    isActive?: boolean;
  }
): Promise<boolean> {
  const payload: any = { updated_at: new Date().toISOString() };
  if (data.name) payload.name = data.name.trim();
  if (data.code) payload.code = data.code.trim().toUpperCase();
  if (data.description !== undefined) payload.description = data.description.trim();
  if (data.isActive !== undefined) payload.is_active = data.isActive;

  const res = await fetch(`${SUPABASE_URL}/rest/v1/programs?id=eq.${id}`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify(payload),
  });

  return res.ok;
}

export async function deleteProgramInSupabase(id: string): Promise<boolean> {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/programs?id=eq.${id}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  return res.ok;
}

// ---------------------------------------------------------------------------
// 2. CLASS LEVELS & BOARD EXAM COHORT CLASSIFICATION
// ---------------------------------------------------------------------------
export interface ClassLevel {
  id: string;
  name: string;
  numericLevel: number;
  cohortType: 'ANNUAL' | 'SSC' | 'HSC' | 'ADMISSION';
  targetExamLabel: string;
  description: string;
}

// Default standard class levels matching the user's cohort specification
export const STANDARD_CLASS_LEVELS: ClassLevel[] = [
  {
    id: 'cl-6',
    name: 'Class 6',
    numericLevel: 6,
    cohortType: 'ANNUAL',
    targetExamLabel: 'Annual Session (Jan 1 - Dec 31)',
    description: 'Junior secondary foundation curriculum',
  },
  {
    id: 'cl-7',
    name: 'Class 7',
    numericLevel: 7,
    cohortType: 'ANNUAL',
    targetExamLabel: 'Annual Session (Jan 1 - Dec 31)',
    description: 'Junior secondary intermediate curriculum',
  },
  {
    id: 'cl-8',
    name: 'Class 8',
    numericLevel: 8,
    cohortType: 'ANNUAL',
    targetExamLabel: 'Annual Session (Jan 1 - Dec 31)',
    description: 'Junior secondary board preparation foundation',
  },
  {
    id: 'cl-9',
    name: 'Class 9',
    numericLevel: 9,
    cohortType: 'SSC',
    targetExamLabel: 'Target SSC (Exam in 2 Years e.g. SSC 2028)',
    description: 'Secondary Science & General curriculum (1st year of SSC)',
  },
  {
    id: 'cl-10',
    name: 'Class 10',
    numericLevel: 10,
    cohortType: 'SSC',
    targetExamLabel: 'Target SSC (Exam Next Year e.g. SSC 2027)',
    description: 'Secondary candidate test exam & board test prep',
  },
  {
    id: 'cl-11',
    name: 'Class 11',
    numericLevel: 11,
    cohortType: 'HSC',
    targetExamLabel: 'Target HSC (Exam in 2 Years e.g. HSC 2028)',
    description: 'Higher Secondary 1st year board & college care',
  },
  {
    id: 'cl-12',
    name: 'Class 12',
    numericLevel: 12,
    cohortType: 'HSC',
    targetExamLabel: 'Target HSC (Exam Next Year e.g. HSC 2027)',
    description: 'Higher Secondary 2nd year test exam & pre-admission prep',
  },
  {
    id: 'cl-adm',
    name: 'Admission',
    numericLevel: 13,
    cohortType: 'ADMISSION',
    targetExamLabel: 'Varsity & Medical Entrance',
    description: 'Intensive medical, engineering, and university test preparation',
  },
];

export async function fetchClassLevelsFromSupabase(): Promise<ClassLevel[]> {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/class_levels?select=*&order=numeric_level.asc`, {
      headers: getHeaders(),
      cache: 'no-store',
    });
    if (!res.ok) return [];
    const data = await res.json();
    if (!Array.isArray(data)) return [];

    return data.map((cl) => {
      let cohortType: 'ANNUAL' | 'SSC' | 'HSC' | 'ADMISSION' = 'ANNUAL';
      let targetExamLabel = 'Annual Session (Jan 1 - Dec 31)';

      if (cl.numeric_level === 9) {
        cohortType = 'SSC';
        targetExamLabel = 'Target SSC (Exam in 2 Years e.g. SSC 2028)';
      } else if (cl.numeric_level === 10) {
        cohortType = 'SSC';
        targetExamLabel = 'Target SSC (Exam Next Year e.g. SSC 2027)';
      } else if (cl.numeric_level === 11) {
        cohortType = 'HSC';
        targetExamLabel = 'Target HSC (Exam in 2 Years e.g. HSC 2028)';
      } else if (cl.numeric_level === 12) {
        cohortType = 'HSC';
        targetExamLabel = 'Target HSC (Exam Next Year e.g. HSC 2027)';
      } else if (cl.numeric_level >= 13) {
        cohortType = 'ADMISSION';
        targetExamLabel = 'Varsity & Medical Entrance';
      }

      return {
        id: cl.id,
        name: cl.name,
        numericLevel: cl.numeric_level,
        cohortType,
        targetExamLabel,
        description: cl.description || `${cl.name} academic cohort`,
      };
    });
  } catch (err) {
    console.error('Error in fetchClassLevelsFromSupabase:', err);
    return [];
  }
}

export async function createClassLevelInSupabase(data: {
  name: string;
  numericLevel: number;
}): Promise<ClassLevel> {
  const payload = {
    name: data.name.trim(),
    numeric_level: data.numericLevel,
  };

  const res = await fetch(`${SUPABASE_URL}/rest/v1/class_levels`, {
    method: 'POST',
    headers: { ...getHeaders(), Prefer: 'return=representation' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Failed to save class level in Supabase: ${err}`);
  }

  const rows = await res.json();
  const row = Array.isArray(rows) ? rows[0] : rows;
  return {
    id: row.id,
    name: row.name,
    numericLevel: row.numeric_level,
    cohortType: row.numeric_level >= 11 ? 'HSC' : row.numeric_level >= 9 ? 'SSC' : 'ANNUAL',
    targetExamLabel: row.numeric_level >= 9 ? 'Board Examination Track' : 'Annual Session',
    description: `${row.name} cohort`,
  };
}

export async function seedStandardClassLevelsInSupabase(): Promise<{ count: number }> {
  const seedItems = [
    { name: 'Class 6', numeric_level: 6 },
    { name: 'Class 7', numeric_level: 7 },
    { name: 'Class 8', numeric_level: 8 },
    { name: 'Class 9', numeric_level: 9 },
    { name: 'Class 10', numeric_level: 10 },
    { name: 'Class 11', numeric_level: 11 },
    { name: 'Class 12', numeric_level: 12 },
    { name: 'Admission', numeric_level: 13 },
  ];

  const res = await fetch(`${SUPABASE_URL}/rest/v1/class_levels`, {
    method: 'POST',
    headers: { ...getHeaders(), Prefer: 'return=representation' },
    body: JSON.stringify(seedItems),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Failed to seed class levels: ${err}`);
  }

  const rows = await res.json();
  return { count: Array.isArray(rows) ? rows.length : 0 };
}

export async function deleteClassLevelInSupabase(id: string): Promise<boolean> {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/class_levels?id=eq.${id}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  return res.ok;
}

export async function updateClassLevelInSupabase(
  id: string,
  data: { name?: string; numericLevel?: number }
): Promise<boolean> {
  const payload: any = {};
  if (data.name) payload.name = data.name.trim();
  if (data.numericLevel !== undefined) payload.numeric_level = data.numericLevel;

  const res = await fetch(`${SUPABASE_URL}/rest/v1/class_levels?id=eq.${id}`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify(payload),
  });

  return res.ok;
}

// ---------------------------------------------------------------------------
// 3. BATCHES
// ---------------------------------------------------------------------------
export interface BatchRecord {
  id: string;
  name: string;
  code: string;
  academicYearId?: string;
  academicYearName?: string;
  programId?: string;
  programName?: string;
  cohortLabel: string;
  shift: 'MORNING' | 'DAY' | 'EVENING';
  maxCapacity: number;
  currentEnrolled: number;
  isActive: boolean;
  createdAt: string;
}

export async function fetchBatchesFromSupabase(): Promise<BatchRecord[]> {
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/batches?select=*,academic_years(id,name,year),programs(id,name,code)&order=created_at.desc`,
      {
        headers: getHeaders(),
        cache: 'no-store',
      }
    );
    if (!res.ok) return [];
    const rows = await res.json();
    if (!Array.isArray(rows)) return [];

    return rows.map((b) => ({
      id: b.id,
      name: b.name,
      code: b.code,
      academicYearId: b.academic_year_id,
      academicYearName: b.academic_years?.name || '',
      programId: b.program_id,
      programName: b.programs?.name || '',
      cohortLabel: b.name.includes('SSC')
        ? 'SSC Board Exam Track'
        : b.name.includes('HSC')
        ? 'HSC Board Exam Track'
        : 'Annual Academic Track',
      shift: (b.shift || 'MORNING') as 'MORNING' | 'DAY' | 'EVENING',
      maxCapacity: b.max_capacity || 40,
      currentEnrolled: b.current_enrolled || 0,
      isActive: b.is_active ?? true,
      createdAt: b.created_at,
    }));
  } catch {
    return [];
  }
}

export async function createBatchInSupabase(data: {
  name: string;
  code: string;
  academicYearId: string;
  programId?: string;
  maxCapacity?: number;
  shift?: 'MORNING' | 'DAY' | 'EVENING';
}): Promise<BatchRecord> {
  const payload = {
    name: data.name.trim(),
    code: data.code.trim().toUpperCase(),
    academic_year_id: data.academicYearId,
    program_id: data.programId || null,
    max_capacity: data.maxCapacity || 40,
    is_active: true,
  };

  const res = await fetch(`${SUPABASE_URL}/rest/v1/batches`, {
    method: 'POST',
    headers: { ...getHeaders(), Prefer: 'return=representation' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Failed to create batch: ${err}`);
  }

  const rows = await res.json();
  const b = Array.isArray(rows) ? rows[0] : rows;
  return {
    id: b.id,
    name: b.name,
    code: b.code,
    academicYearId: b.academic_year_id,
    cohortLabel: b.name.includes('SSC') ? 'SSC Board Exam Track' : 'Academic Track',
    shift: data.shift || 'MORNING',
    maxCapacity: b.max_capacity,
    currentEnrolled: 0,
    isActive: true,
    createdAt: b.created_at,
  };
}

export async function updateBatchInSupabase(
  id: string,
  data: {
    name?: string;
    code?: string;
    shift?: 'MORNING' | 'DAY' | 'EVENING';
    maxCapacity?: number;
    isActive?: boolean;
  }
): Promise<boolean> {
  const payload: any = { updated_at: new Date().toISOString() };
  if (data.name) payload.name = data.name.trim();
  if (data.code) payload.code = data.code.trim().toUpperCase();
  if (data.shift) payload.shift = data.shift;
  if (data.maxCapacity !== undefined) payload.max_capacity = data.maxCapacity;
  if (data.isActive !== undefined) payload.is_active = data.isActive;

  const res = await fetch(`${SUPABASE_URL}/rest/v1/batches?id=eq.${id}`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify(payload),
  });

  return res.ok;
}

export async function deleteBatchInSupabase(id: string): Promise<boolean> {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/batches?id=eq.${id}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  return res.ok;
}

// ---------------------------------------------------------------------------
// 4. SUBJECTS, CHAPTERS & TOPICS
// ---------------------------------------------------------------------------
export interface TopicRecord {
  id: string;
  title: string;
  estimatedLectures?: number;
  notes?: string;
}

export interface ChapterRecord {
  id: string;
  chapterNumber: number;
  title: string;
  description?: string;
  topics: TopicRecord[];
}

export interface SubjectRecord {
  id: string;
  classLevelId?: string;
  classLevelName?: string;
  name: string;
  code: string;
  department: 'SCIENCE' | 'COMMERCE' | 'ARTS' | 'GENERAL';
  targetLevel?: string;
  totalWeeklyClasses: number;
  isActive: boolean;
  syllabus: ChapterRecord[];
}

// In-memory fallback if public.subjects table migration is not yet run in Supabase SQL editor
const subjectsMemory: SubjectRecord[] = [];

export async function fetchSubjectsFromSupabase(classLevelId?: string): Promise<SubjectRecord[]> {
  try {
    let url = `${SUPABASE_URL}/rest/v1/subjects?select=*,class_level:class_levels(id,name,numeric_level)&order=name.asc`;
    if (classLevelId) {
      url += `&class_level_id=eq.${classLevelId}`;
    }
    const res = await fetch(url, {
      headers: getHeaders(),
      cache: 'no-store',
    });
    if (!res.ok) {
      // Return memory fallback filtered by classLevelId if specified
      if (classLevelId) {
        return subjectsMemory.filter((s) => s.classLevelId === classLevelId);
      }
      return subjectsMemory;
    }
    const rows = await res.json();
    if (!Array.isArray(rows)) return subjectsMemory;

    return rows.map((s) => ({
      id: s.id,
      classLevelId: s.class_level_id || (s.class_level ? s.class_level.id : ''),
      classLevelName: s.class_level ? s.class_level.name : (s.target_level || 'General'),
      name: s.name,
      code: s.code,
      department: s.department || 'GENERAL',
      targetLevel: s.target_level || (s.class_level ? s.class_level.name : ''),
      totalWeeklyClasses: s.total_weekly_classes || 3,
      isActive: s.is_active ?? true,
      syllabus: Array.isArray(s.syllabus) ? s.syllabus : [],
    }));
  } catch (err) {
    console.error('Error in fetchSubjectsFromSupabase:', err);
    return subjectsMemory;
  }
}

export async function createSubjectInSupabase(data: {
  name: string;
  code: string;
  classLevelId?: string;
  department?: 'SCIENCE' | 'COMMERCE' | 'ARTS' | 'GENERAL';
  targetLevel?: string;
  totalWeeklyClasses?: number;
  isActive?: boolean;
}): Promise<SubjectRecord> {
  const payload: any = {
    name: data.name.trim(),
    code: data.code.trim().toUpperCase(),
    department: data.department || 'GENERAL',
    total_weekly_classes: data.totalWeeklyClasses || 3,
    is_active: data.isActive ?? true,
    syllabus: [],
  };
  if (data.classLevelId) {
    payload.class_level_id = data.classLevelId;
  }
  if (data.targetLevel) {
    payload.target_level = data.targetLevel;
  }

  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/subjects`, {
      method: 'POST',
      headers: { ...getHeaders(), Prefer: 'return=representation' },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      const rows = await res.json();
      const s = Array.isArray(rows) ? rows[0] : rows;
      return {
        id: s.id,
        classLevelId: s.class_level_id,
        classLevelName: '',
        name: s.name,
        code: s.code,
        department: s.department,
        targetLevel: s.target_level,
        totalWeeklyClasses: s.total_weekly_classes,
        isActive: s.is_active,
        syllabus: s.syllabus || [],
      };
    }
  } catch {
    // Fallback to memory
  }

  // Graceful memory fallback
  const fallbackRecord: SubjectRecord = {
    id: `sub-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    classLevelId: data.classLevelId || '',
    classLevelName: data.targetLevel || 'General',
    name: data.name.trim(),
    code: data.code.trim().toUpperCase(),
    department: data.department || 'GENERAL',
    targetLevel: data.targetLevel || '',
    totalWeeklyClasses: data.totalWeeklyClasses || 3,
    isActive: data.isActive ?? true,
    syllabus: [],
  };
  subjectsMemory.push(fallbackRecord);
  return fallbackRecord;
}

export async function updateSubjectInSupabase(id: string, data: Partial<SubjectRecord>): Promise<boolean> {
  const payload: any = { updated_at: new Date().toISOString() };
  if (data.name) payload.name = data.name.trim();
  if (data.code) payload.code = data.code.trim().toUpperCase();
  if (data.department) payload.department = data.department;
  if (data.classLevelId !== undefined) payload.class_level_id = data.classLevelId || null;
  if (data.targetLevel !== undefined) payload.target_level = data.targetLevel;
  if (data.totalWeeklyClasses !== undefined) payload.total_weekly_classes = data.totalWeeklyClasses;
  if (data.isActive !== undefined) payload.is_active = data.isActive;
  if (data.syllabus !== undefined) payload.syllabus = data.syllabus;

  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/subjects?id=eq.${id}`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });

    if (res.ok) return true;
  } catch {
    // Fallback
  }

  // Fallback in memory
  const idx = subjectsMemory.findIndex((s) => s.id === id);
  if (idx !== -1) {
    subjectsMemory[idx] = { ...subjectsMemory[idx], ...data };
    return true;
  }
  return false;
}

export async function deleteSubjectInSupabase(id: string): Promise<boolean> {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/subjects?id=eq.${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    if (res.ok) return true;
  } catch {
    // Fallback
  }

  const idx = subjectsMemory.findIndex((s) => s.id === id);
  if (idx !== -1) {
    subjectsMemory.splice(idx, 1);
    return true;
  }
  return true;
}

// Chapter and Topic mutations
export async function getSubjectById(id: string): Promise<SubjectRecord | null> {
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/subjects?id=eq.${id}&select=*,class_level:class_levels(id,name,numeric_level)&limit=1`,
      { headers: getHeaders(), cache: 'no-store' }
    );
    if (res.ok) {
      const rows = await res.json();
      if (Array.isArray(rows) && rows.length > 0) {
        const s = rows[0];
        return {
          id: s.id,
          classLevelId: s.class_level_id || (s.class_level ? s.class_level.id : ''),
          classLevelName: s.class_level ? s.class_level.name : (s.target_level || 'General'),
          name: s.name,
          code: s.code,
          department: s.department || 'GENERAL',
          targetLevel: s.target_level || '',
          totalWeeklyClasses: s.total_weekly_classes || 3,
          isActive: s.is_active ?? true,
          syllabus: Array.isArray(s.syllabus) ? s.syllabus : [],
        };
      }
    }
  } catch {
    // Fallback
  }

  const found = subjectsMemory.find((s) => s.id === id);
  return found || null;
}

export async function addChapterToSubject(
  subjectId: string,
  chapter: { chapterNumber: number; title: string; description?: string }
): Promise<boolean> {
  const subject = await getSubjectById(subjectId);
  if (!subject) return false;

  const newChapter: ChapterRecord = {
    id: `ch-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    chapterNumber: chapter.chapterNumber,
    title: chapter.title.trim(),
    description: chapter.description?.trim(),
    topics: [],
  };

  const updatedSyllabus = [...subject.syllabus, newChapter].sort(
    (a, b) => a.chapterNumber - b.chapterNumber
  );

  return updateSubjectInSupabase(subjectId, { syllabus: updatedSyllabus });
}

export async function updateChapterInSubject(
  subjectId: string,
  chapterId: string,
  updates: { chapterNumber?: number; title?: string; description?: string }
): Promise<boolean> {
  const subject = await getSubjectById(subjectId);
  if (!subject) return false;

  const updatedSyllabus = subject.syllabus.map((ch) => {
    if (ch.id === chapterId) {
      return {
        ...ch,
        ...(updates.chapterNumber !== undefined ? { chapterNumber: updates.chapterNumber } : {}),
        ...(updates.title !== undefined ? { title: updates.title.trim() } : {}),
        ...(updates.description !== undefined ? { description: updates.description.trim() } : {}),
      };
    }
    return ch;
  }).sort((a, b) => a.chapterNumber - b.chapterNumber);

  return updateSubjectInSupabase(subjectId, { syllabus: updatedSyllabus });
}

export async function deleteChapterFromSubject(
  subjectId: string,
  chapterId: string
): Promise<boolean> {
  const subject = await getSubjectById(subjectId);
  if (!subject) return false;

  const updatedSyllabus = subject.syllabus.filter((ch) => ch.id !== chapterId);
  return updateSubjectInSupabase(subjectId, { syllabus: updatedSyllabus });
}

export async function addTopicToChapter(
  subjectId: string,
  chapterId: string,
  topic: { title: string; estimatedLectures?: number; notes?: string }
): Promise<boolean> {
  const subject = await getSubjectById(subjectId);
  if (!subject) return false;

  const newTopic: TopicRecord = {
    id: `top-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    title: topic.title.trim(),
    estimatedLectures: topic.estimatedLectures || 1,
    notes: topic.notes?.trim(),
  };

  const updatedSyllabus = subject.syllabus.map((ch) => {
    if (ch.id === chapterId) {
      return {
        ...ch,
        topics: [...ch.topics, newTopic],
      };
    }
    return ch;
  });

  return updateSubjectInSupabase(subjectId, { syllabus: updatedSyllabus });
}

export async function updateTopicInChapter(
  subjectId: string,
  chapterId: string,
  topicId: string,
  updates: { title?: string; estimatedLectures?: number; notes?: string }
): Promise<boolean> {
  const subject = await getSubjectById(subjectId);
  if (!subject) return false;

  const updatedSyllabus = subject.syllabus.map((ch) => {
    if (ch.id === chapterId) {
      return {
        ...ch,
        topics: ch.topics.map((t) => {
          if (t.id === topicId) {
            return {
              ...t,
              ...(updates.title !== undefined ? { title: updates.title.trim() } : {}),
              ...(updates.estimatedLectures !== undefined ? { estimatedLectures: updates.estimatedLectures } : {}),
              ...(updates.notes !== undefined ? { notes: updates.notes.trim() } : {}),
            };
          }
          return t;
        }),
      };
    }
    return ch;
  });

  return updateSubjectInSupabase(subjectId, { syllabus: updatedSyllabus });
}

export async function deleteTopicFromChapter(
  subjectId: string,
  chapterId: string,
  topicId: string
): Promise<boolean> {
  const subject = await getSubjectById(subjectId);
  if (!subject) return false;

  const updatedSyllabus = subject.syllabus.map((ch) => {
    if (ch.id === chapterId) {
      return {
        ...ch,
        topics: ch.topics.filter((t) => t.id !== topicId),
      };
    }
    return ch;
  });

  return updateSubjectInSupabase(subjectId, { syllabus: updatedSyllabus });
}

// ---------------------------------------------------------------------------
// 5. ROOMS & LABS
// ---------------------------------------------------------------------------
export interface CampusRoom {
  id: string;
  roomNumber: string;
  name: string;
  roomType: 'LECTURE_HALL' | 'SCIENCE_LAB' | 'COMPUTER_LAB' | 'EXAM_HALL';
  capacity: number;
  hasAirCondition: boolean;
  hasProjector: boolean;
  floor: string;
  status: 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE';
}

export async function fetchRoomsFromSupabase(): Promise<CampusRoom[]> {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/rooms?select=*&order=room_number.asc`, {
      headers: getHeaders(),
      cache: 'no-store',
    });
    if (!res.ok) return [];
    const rows = await res.json();
    if (!Array.isArray(rows)) return [];

    return rows.map((r) => ({
      id: r.id,
      roomNumber: r.room_number,
      name: r.name,
      roomType: r.room_type || 'LECTURE_HALL',
      capacity: r.capacity || 40,
      hasAirCondition: false,
      hasProjector: false,
      floor: r.floor || '1st Floor',
      status: r.status || 'AVAILABLE',
    }));
  } catch (err) {
    console.error('Error in fetchRoomsFromSupabase:', err);
    return [];
  }
}

export async function createRoomInSupabase(data: Omit<CampusRoom, 'id'>): Promise<CampusRoom> {
  const payload = {
    room_number: data.roomNumber.trim(),
    name: data.name ? data.name.trim() : data.roomNumber.trim(),
    room_type: data.roomType || 'LECTURE_HALL',
    capacity: data.capacity || 40,
    floor: data.floor || '1st Floor',
    status: data.status || 'AVAILABLE',
  };

  const res = await fetch(`${SUPABASE_URL}/rest/v1/rooms`, {
    method: 'POST',
    headers: { ...getHeaders(), Prefer: 'return=representation' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Failed to create room in Supabase: ${err}`);
  }

  const rows = await res.json();
  const r = Array.isArray(rows) ? rows[0] : rows;
  return {
    id: r.id,
    roomNumber: r.room_number,
    name: r.name,
    roomType: r.room_type,
    capacity: r.capacity,
    hasAirCondition: false,
    hasProjector: false,
    floor: r.floor,
    status: r.status,
  };
}

export async function updateRoomInSupabase(id: string, data: Partial<CampusRoom>): Promise<boolean> {
  const payload: any = { updated_at: new Date().toISOString() };
  if (data.roomNumber) payload.room_number = data.roomNumber.trim();
  if (data.name) payload.name = data.name.trim();
  if (data.roomType) payload.room_type = data.roomType;
  if (data.capacity !== undefined) payload.capacity = data.capacity;
  if (data.floor) payload.floor = data.floor;
  if (data.status) payload.status = data.status;

  const res = await fetch(`${SUPABASE_URL}/rest/v1/rooms?id=eq.${id}`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify(payload),
  });

  return res.ok;
}

export async function deleteRoomInSupabase(id: string): Promise<boolean> {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/rooms?id=eq.${id}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  return res.ok;
}

// ---------------------------------------------------------------------------
// 6. TIMETABLE & CLASS SESSIONS
// ---------------------------------------------------------------------------
export interface TimetableSession {
  id: string;
  batchId: string;
  batchName: string;
  cohort: string;
  subject: string;
  teacherName: string;
  roomNumber: string;
  dayOfWeek: 'SATURDAY' | 'SUNDAY' | 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY';
  startTime: string;
  endTime: string;
  isActive: boolean;
}

export async function fetchTimetableFromSupabase(): Promise<TimetableSession[]> {
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/class_sessions?select=*,batches(id,name,code),teachers(id,user:users(full_name))&order=start_time.asc`,
      {
        headers: getHeaders(),
        cache: 'no-store',
      }
    );
    if (!res.ok) return [];
    const rows = await res.json();
    if (!Array.isArray(rows)) return [];

    return rows.map((r) => {
      let day: any = 'SATURDAY';
      if (r.session_date) {
        const d = new Date(r.session_date);
        const days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
        day = days[d.getDay()] || 'SATURDAY';
      }

      return {
        id: r.id,
        batchId: r.batch_id || '',
        batchName: r.batches?.name || 'Academic Batch',
        cohort: r.batches?.name?.includes('SSC')
          ? 'SSC Board Track'
          : r.batches?.name?.includes('HSC')
          ? 'HSC Board Track'
          : 'Annual Cohort',
        subject: r.subject_name || '',
        teacherName: r.teachers?.user?.full_name || 'Assigned Instructor',
        roomNumber: r.room_name || 'Room 101',
        dayOfWeek: day,
        startTime: r.start_time ? r.start_time.substring(0, 5) : '08:00',
        endTime: r.end_time ? r.end_time.substring(0, 5) : '09:30',
        isActive: r.status !== 'CANCELLED',
      };
    });
  } catch (err) {
    console.error('Error in fetchTimetableFromSupabase:', err);
    return [];
  }
}

export async function createTimetableSessionInSupabase(data: {
  batchId?: string;
  batchName?: string;
  subject: string;
  teacherName?: string;
  roomNumber?: string;
  dayOfWeek?: string;
  startTime?: string;
  endTime?: string;
}): Promise<TimetableSession> {
  let batchId = data.batchId;
  if (!batchId) {
    const bRes = await fetch(`${SUPABASE_URL}/rest/v1/batches?limit=1`, { headers: getHeaders() });
    const batches = await bRes.json();
    batchId = batches?.[0]?.id;
  }

  const formatTime = (t?: string) => {
    if (!t) return '08:00:00';
    if (t.includes(':') && t.split(':').length === 2) return `${t}:00`;
    return t;
  };

  const payload = {
    batch_id: batchId,
    subject_name: data.subject.trim(),
    room_name: data.roomNumber || 'Room 101',
    session_date: new Date().toISOString().split('T')[0],
    start_time: formatTime(data.startTime),
    end_time: formatTime(data.endTime),
    status: 'SCHEDULED',
  };

  const res = await fetch(`${SUPABASE_URL}/rest/v1/class_sessions`, {
    method: 'POST',
    headers: { ...getHeaders(), Prefer: 'return=representation' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Failed to create class session in Supabase: ${err}`);
  }

  const rows = await res.json();
  const created = Array.isArray(rows) ? rows[0] : rows;
  return {
    id: created.id,
    batchId: created.batch_id,
    batchName: data.batchName || 'Academic Batch',
    cohort: 'Academic Track',
    subject: created.subject_name,
    teacherName: data.teacherName || 'Assigned Instructor',
    roomNumber: created.room_name,
    dayOfWeek: (data.dayOfWeek as any) || 'SATURDAY',
    startTime: created.start_time,
    endTime: created.end_time,
    isActive: true,
  };
}

export async function updateTimetableSessionInSupabase(
  id: string,
  data: Partial<TimetableSession>
): Promise<boolean> {
  const payload: any = { updated_at: new Date().toISOString() };
  if (data.subject) payload.subject_name = data.subject;
  if (data.roomNumber) payload.room_name = data.roomNumber;
  if (data.startTime) payload.start_time = data.startTime;
  if (data.endTime) payload.end_time = data.endTime;
  if (data.isActive !== undefined) {
    payload.status = data.isActive ? 'SCHEDULED' : 'CANCELLED';
  }

  const res = await fetch(`${SUPABASE_URL}/rest/v1/class_sessions?id=eq.${id}`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify(payload),
  });

  return res.ok;
}

export async function deleteTimetableSessionInSupabase(id: string): Promise<boolean> {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/class_sessions?id=eq.${id}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  return res.ok;
}
