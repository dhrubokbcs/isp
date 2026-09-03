-- =====================================================================
-- Migration: Add designation Column to public.teachers
-- Ensures explicit designation support (e.g. Senior Faculty, Lecturer, Department Head, Mentor)
-- =====================================================================

ALTER TABLE public.teachers 
    ADD COLUMN IF NOT EXISTS designation VARCHAR(150);

-- Create index for quick designation filtering
CREATE INDEX IF NOT EXISTS idx_teachers_designation ON public.teachers(designation);
