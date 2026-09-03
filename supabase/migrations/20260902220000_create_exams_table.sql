-- =====================================================================
-- ISP Digital Campus — Examination System Schema
-- Table: public.exams
-- =====================================================================

CREATE TABLE IF NOT EXISTS public.exams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    code VARCHAR(100) NOT NULL UNIQUE,
    exam_type VARCHAR(50) NOT NULL DEFAULT 'WEEKLY_MODEL_TEST',
    batch_id UUID REFERENCES public.batches(id) ON DELETE SET NULL,
    batch_name VARCHAR(150) NOT NULL,
    subject VARCHAR(150) NOT NULL,
    exam_date DATE NOT NULL,
    start_time VARCHAR(50) NOT NULL DEFAULT '10:00 AM',
    end_time VARCHAR(50) NOT NULL DEFAULT '11:30 AM',
    duration_minutes INT NOT NULL DEFAULT 90,
    room VARCHAR(100) NOT NULL DEFAULT 'Hall A (Room 301)',
    total_marks NUMERIC(6, 2) NOT NULL DEFAULT 100,
    pass_marks NUMERIC(6, 2) NOT NULL DEFAULT 40,
    cq_marks NUMERIC(6, 2) DEFAULT 70,
    mcq_marks NUMERIC(6, 2) DEFAULT 30,
    practical_marks NUMERIC(6, 2) DEFAULT 0,
    invigilator VARCHAR(150),
    syllabus TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'SCHEDULED',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for lightning fast lookups
CREATE INDEX IF NOT EXISTS idx_exams_date ON public.exams(exam_date);
CREATE INDEX IF NOT EXISTS idx_exams_batch ON public.exams(batch_name);
CREATE INDEX IF NOT EXISTS idx_exams_code ON public.exams(code);
CREATE INDEX IF NOT EXISTS idx_exams_status ON public.exams(status);

-- Enable Row Level Security (RLS) and restrict anon writes
ALTER TABLE public.exams ENABLE ROW LEVEL SECURITY;

GRANT ALL ON TABLE public.exams TO postgres, service_role;
REVOKE INSERT, UPDATE, DELETE ON TABLE public.exams FROM anon;

-- Seed Initial Institutional Exams for testing
INSERT INTO public.exams (
    title, code, exam_type, batch_name, subject, exam_date, start_time, end_time, duration_minutes, room, total_marks, pass_marks, cq_marks, mcq_marks, invigilator, syllabus, status
) VALUES 
(
    'Higher Mathematics Paper 1 Model Test',
    'ISP-MT-2601',
    'WEEKLY_MODEL_TEST',
    'SSC 2026 Batch',
    'Higher Mathematics',
    CURRENT_DATE + INTERVAL '3 days',
    '10:00 AM',
    '11:30 AM',
    90,
    'Hall A (Room 301)',
    100,
    40,
    70,
    30,
    'Prof. M. Rahman',
    'Chapters 8 & 11: Trigonometric Identities and Coordinate Geometry',
    'SCHEDULED'
),
(
    'Physics Chapter 4: Work, Energy & Power Assessment',
    'ISP-CA-2602',
    'CHAPTER_ASSESSMENT',
    'SSC 2028 Science Morning A',
    'Physics',
    CURRENT_DATE + INTERVAL '6 days',
    '11:45 AM',
    '12:45 PM',
    60,
    'Room 204 (Science Wing)',
    50,
    20,
    35,
    15,
    'Engr. Dhrubo',
    'Chapter 4: Work, Power, Potential & Kinetic Energy Transformations',
    'SCHEDULED'
),
(
    'Chemistry 1st Term Evaluation Exam',
    'ISP-TF-2503',
    'TERM_FINAL',
    'HSC 2028 Batch',
    'Chemistry',
    CURRENT_DATE - INTERVAL '5 days',
    '09:00 AM',
    '11:30 AM',
    150,
    'Central Auditorium',
    100,
    40,
    75,
    25,
    'Dr. Rafiqul Islam',
    'Qualitative Chemistry, Periodic Properties & Chemical Bonding',
    'COMPLETED'
)
ON CONFLICT (code) DO NOTHING;
