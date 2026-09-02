-- Migration: Class-Associated Subjects with Chapters & Topics Syllabus
-- Updates public.subjects to reference public.class_levels and store structured syllabus

CREATE TABLE IF NOT EXISTS public.subjects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    class_level_id UUID REFERENCES public.class_levels(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    code VARCHAR(50) NOT NULL,
    department VARCHAR(50) NOT NULL DEFAULT 'GENERAL',
    total_weekly_classes INT NOT NULL DEFAULT 3,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    syllabus JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- In case public.subjects already existed without these columns:
ALTER TABLE public.subjects
ADD COLUMN IF NOT EXISTS class_level_id UUID REFERENCES public.class_levels(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS syllabus JSONB NOT NULL DEFAULT '[]'::jsonb;

CREATE INDEX IF NOT EXISTS idx_subjects_class_level ON public.subjects(class_level_id);
