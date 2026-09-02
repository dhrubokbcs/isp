-- Migration: Extended Student Profiles & Flexible Data Storage
-- Adds profile_data JSONB and essential columns to public.students

ALTER TABLE public.students 
ADD COLUMN IF NOT EXISTS profile_data JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS blood_group VARCHAR(10),
ADD COLUMN IF NOT EXISTS religion VARCHAR(50),
ADD COLUMN IF NOT EXISTS nationality VARCHAR(50) DEFAULT 'Bangladeshi',
ADD COLUMN IF NOT EXISTS institution_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS primary_guardian VARCHAR(50) DEFAULT 'FATHER',
ADD COLUMN IF NOT EXISTS father_name VARCHAR(150),
ADD COLUMN IF NOT EXISTS father_phone VARCHAR(50),
ADD COLUMN IF NOT EXISTS mother_name VARCHAR(150),
ADD COLUMN IF NOT EXISTS mother_phone VARCHAR(50);

-- Index for fast queries
CREATE INDEX IF NOT EXISTS idx_students_primary_guardian ON public.students(primary_guardian);
CREATE INDEX IF NOT EXISTS idx_students_institution ON public.students(institution_name);
CREATE INDEX IF NOT EXISTS idx_students_profile_data ON public.students USING gin (profile_data);
