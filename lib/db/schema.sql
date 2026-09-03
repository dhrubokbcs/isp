-- =====================================================================
-- ISP Digital Campus — Master Supabase PostgreSQL Schema
-- Architecture Specification: MASTER_PLAN.md
-- Center: Indicator Student's Point (Classes 6-12, SSC, HSC, Admission)
-- =====================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. ENUMS
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('SUPERADMIN', 'ADMIN', 'TEACHER', 'STAFF', 'STUDENT', 'GUARDIAN');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE user_status AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING_VERIFICATION');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE year_status AS ENUM ('UPCOMING', 'ACTIVE', 'ARCHIVED');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE session_status AS ENUM ('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE attendance_status AS ENUM ('PRESENT', 'ABSENT', 'LATE', 'EXCUSED');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE payment_method AS ENUM ('CASH', 'BKASH', 'NAGAD', 'BANK', 'ONLINE');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE fee_status AS ENUM ('PENDING', 'PARTIAL', 'PAID', 'OVERDUE');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 3. USERS TABLE
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_id UUID UNIQUE, -- References auth.users(id) in Supabase Auth
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    role user_role NOT NULL DEFAULT 'STAFF',
    status user_status NOT NULL DEFAULT 'ACTIVE',
    avatar_url TEXT,
    last_login_at TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);

-- 4. ACADEMIC YEARS & ATOMIC SERIAL TRACKER
CREATE TABLE IF NOT EXISTS public.academic_years (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    year INT UNIQUE NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status year_status NOT NULL DEFAULT 'UPCOMING',
    next_student_serial INT NOT NULL DEFAULT 1, -- Starts at 1 (for YYYY0001)
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. PROGRAMS (Academic, SSC, HSC, University Admission)
CREATE TABLE IF NOT EXISTS public.programs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(150) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. CLASS LEVELS (Class 6 through Class 12)
CREATE TABLE IF NOT EXISTS public.class_levels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    numeric_level INT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. BATCHES
CREATE TABLE IF NOT EXISTS public.batches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(150) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    academic_year_id UUID NOT NULL REFERENCES public.academic_years(id) ON DELETE RESTRICT,
    program_id UUID REFERENCES public.programs(id) ON DELETE SET NULL,
    max_capacity INT NOT NULL DEFAULT 40,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_batches_academic_year ON public.batches(academic_year_id);

-- 8. TEACHERS
CREATE TABLE IF NOT EXISTS public.teachers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    designation VARCHAR(150),
    specialization VARCHAR(150),
    bio TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. STUDENTS (Format: YYYYSSSS e.g. 20280001)
CREATE TABLE IF NOT EXISTS public.students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id VARCHAR(20) UNIQUE NOT NULL, -- Permanent YYYYSSSS
    user_id UUID UNIQUE NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    admission_academic_year INT NOT NULL,
    batch_id UUID REFERENCES public.batches(id) ON DELETE SET NULL,
    gender VARCHAR(20),
    dob DATE,
    address TEXT,
    guardian_name VARCHAR(150),
    guardian_phone VARCHAR(50),
    relationship VARCHAR(50),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_students_student_id ON public.students(student_id);
CREATE INDEX IF NOT EXISTS idx_students_batch ON public.students(batch_id);

-- 10. CLASS SESSIONS (Physical scheduled classes)
CREATE TABLE IF NOT EXISTS public.class_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    batch_id UUID NOT NULL REFERENCES public.batches(id) ON DELETE CASCADE,
    teacher_id UUID REFERENCES public.teachers(id) ON DELETE SET NULL,
    subject_name VARCHAR(150) NOT NULL,
    room_name VARCHAR(100),
    session_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    status session_status NOT NULL DEFAULT 'SCHEDULED',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sessions_batch_date ON public.class_sessions(batch_id, session_date);

-- 11. ATTENDANCE RECORDS (Daily physical attendance)
CREATE TABLE IF NOT EXISTS public.attendance_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES public.class_sessions(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    status attendance_status NOT NULL DEFAULT 'PRESENT',
    marked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_session_student UNIQUE (session_id, student_id)
);

CREATE INDEX IF NOT EXISTS idx_attendance_student ON public.attendance_records(student_id);

-- 12. STUDENT FEES & COLLECTIONS
CREATE TABLE IF NOT EXISTS public.student_fees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL,
    amount NUMERIC(10, 2) NOT NULL,
    due_date DATE NOT NULL,
    status fee_status NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    receipt_no VARCHAR(50) UNIQUE NOT NULL, -- Format: ISP-YYYY-XXXXXX
    student_fee_id UUID REFERENCES public.student_fees(id) ON DELETE SET NULL,
    amount NUMERIC(10, 2) NOT NULL,
    method payment_method NOT NULL DEFAULT 'CASH',
    received_by VARCHAR(150) NOT NULL,
    paid_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    notes TEXT
);

CREATE INDEX IF NOT EXISTS idx_payments_receipt ON public.payments(receipt_no);

-- 13. NOTICES
CREATE TABLE IF NOT EXISTS public.notices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    audience VARCHAR(50) NOT NULL DEFAULT 'ALL', -- ALL, SSC, HSC, TEACHERS, STUDENTS
    is_pinned BOOLEAN NOT NULL DEFAULT FALSE,
    published_by VARCHAR(150) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================================
-- 14. ATOMIC FUNCTION: GENERATE NEXT STUDENT ID (YYYYSSSS)
-- =====================================================================
CREATE OR REPLACE FUNCTION public.generate_next_student_id(p_year INT)
RETURNS VARCHAR AS $$
DECLARE
    v_serial INT;
    v_generated_id VARCHAR;
BEGIN
    -- Lock academic year row to guarantee concurrency-safe sequence
    SELECT next_student_serial INTO v_serial
    FROM public.academic_years
    WHERE year = p_year
    FOR UPDATE;

    IF v_serial IS NULL THEN
        -- Default to 1 if cohort not found
        v_serial := 1;
    END IF;

    -- Format YYYYSSSS (e.g. 20280001)
    v_generated_id := p_year::TEXT || LPAD(v_serial::TEXT, 4, '0');

    -- Increment counter for next admission
    UPDATE public.academic_years
    SET next_student_serial = next_student_serial + 1,
        updated_at = NOW()
    WHERE year = p_year;

    RETURN v_generated_id;
END;
$$ LANGUAGE plpgsql;

-- =====================================================================
-- 15. ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_fees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read of active notices" ON public.notices;
CREATE POLICY "Allow public read of active notices" ON public.notices
    FOR SELECT TO anon, authenticated USING (TRUE);

DROP POLICY IF EXISTS "Users can read own profile" ON public.users;
CREATE POLICY "Users can read own profile" ON public.users
    FOR SELECT TO authenticated USING (auth.uid() = auth_id);

-- =====================================================================
-- 16. SEED DATA (Academic Cohort, Programs, Superadmin)
-- =====================================================================
-- Academic Year 2028
INSERT INTO public.academic_years (id, name, year, start_date, end_date, status, next_student_serial)
VALUES ('e1111111-1111-1111-1111-111111111111', 'Academic Year 2028', 2028, '2028-01-01', '2028-12-31', 'ACTIVE', 43)
ON CONFLICT (year) DO NOTHING;

-- Programs
INSERT INTO public.programs (name, code, description) VALUES
('SSC Special Care Program', 'SSC', 'Comprehensive preparation for Class 9 & 10 SSC examination'),
('HSC Academic & Board Care', 'HSC', 'Higher Secondary Certificate science curriculum'),
('University & Medical Admission', 'ADMISSION', 'Intensive coaching for engineering, medical, and public university entrance')
ON CONFLICT (code) DO NOTHING;

-- Superadmin User
INSERT INTO public.users (
    id,
    email,
    password_hash,
    full_name,
    role,
    status
) VALUES (
    'bdb8b059-c893-47d6-a142-1d27dd0fd210',
    'sadiworkmail@gmail.com',
    's01836650S@&',
    'Tanvir Hasan Sadi',
    'SUPERADMIN',
    'ACTIVE'
) ON CONFLICT (email) DO UPDATE SET
    role = 'SUPERADMIN',
    status = 'ACTIVE',
    updated_at = NOW();

-- 15. EXAMS & SCHEDULES TABLE
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

CREATE INDEX IF NOT EXISTS idx_exams_date ON public.exams(exam_date);
CREATE INDEX IF NOT EXISTS idx_exams_batch ON public.exams(batch_name);
CREATE INDEX IF NOT EXISTS idx_exams_code ON public.exams(code);
CREATE INDEX IF NOT EXISTS idx_exams_status ON public.exams(status);

ALTER TABLE public.exams ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    DROP POLICY IF EXISTS "Allow all access to exams" ON public.exams;
    CREATE POLICY "Allow all access to exams"
        ON public.exams
        FOR ALL
        TO authenticated, anon, service_role
        USING (true)
        WITH CHECK (true);
END $$;

