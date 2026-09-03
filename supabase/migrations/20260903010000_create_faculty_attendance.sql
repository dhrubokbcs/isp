-- =====================================================================
-- Migration: Create Faculty & Staff Class Session Attendance Table
-- Modeled after ISP's operational Google Sheet Log:
-- Date, Batch, Slot Start, Slot End, Faculty, Entry Time, Exit Time, Total Student, Signature, Remark, Exam Batch, Duration
-- =====================================================================

CREATE TABLE IF NOT EXISTS public.faculty_attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    batch_name VARCHAR(100) NOT NULL,
    slot_start VARCHAR(50) NOT NULL,
    slot_end VARCHAR(50) NOT NULL,
    faculty_name VARCHAR(150) NOT NULL,
    entry_time VARCHAR(50),
    exit_time VARCHAR(50),
    total_students INT NOT NULL DEFAULT 0,
    signature VARCHAR(150),
    remark TEXT,
    exam_batch VARCHAR(100),
    duration VARCHAR(50),
    status VARCHAR(50) NOT NULL DEFAULT 'PRESENT', -- 'PRESENT', 'LATE', 'CANCELLED', 'SUSPENDED', 'NO_STUDENT'
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for lightning fast filtering & KPI aggregations
CREATE INDEX IF NOT EXISTS idx_faculty_attendance_date ON public.faculty_attendance(date);
CREATE INDEX IF NOT EXISTS idx_faculty_attendance_faculty ON public.faculty_attendance(faculty_name);
CREATE INDEX IF NOT EXISTS idx_faculty_attendance_batch ON public.faculty_attendance(batch_name);
CREATE INDEX IF NOT EXISTS idx_faculty_attendance_status ON public.faculty_attendance(status);

-- Enable RLS
ALTER TABLE public.faculty_attendance ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    DROP POLICY IF EXISTS "Allow all access to faculty_attendance" ON public.faculty_attendance;
    CREATE POLICY "Allow all access to faculty_attendance"
        ON public.faculty_attendance
        FOR ALL
        TO authenticated, anon, service_role
        USING (true)
        WITH CHECK (true);
END $$;
