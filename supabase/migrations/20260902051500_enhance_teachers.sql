-- =====================================================================
-- Migration: Enhance Teachers Table with Profile and Credential Fields
-- Employee ID: ISP1001, ISP1002...
-- Fields: Full Name, Nickname, Birthday, Gender, Bio, Educational Details,
-- Experience, Mobile, WhatsApp, Email, Initial Password
-- =====================================================================

CREATE SEQUENCE IF NOT EXISTS public.teacher_employee_id_seq START WITH 1001 INCREMENT BY 1;

ALTER TABLE public.teachers 
    ADD COLUMN IF NOT EXISTS employee_id VARCHAR(30) UNIQUE DEFAULT ('ISP' || nextval('public.teacher_employee_id_seq')::text),
    ADD COLUMN IF NOT EXISTS nickname VARCHAR(100),
    ADD COLUMN IF NOT EXISTS dob DATE,
    ADD COLUMN IF NOT EXISTS gender VARCHAR(20),
    ADD COLUMN IF NOT EXISTS educational_details TEXT,
    ADD COLUMN IF NOT EXISTS experience TEXT,
    ADD COLUMN IF NOT EXISTS mobile VARCHAR(50),
    ADD COLUMN IF NOT EXISTS whatsapp VARCHAR(50),
    ADD COLUMN IF NOT EXISTS initial_password VARCHAR(50);

CREATE INDEX IF NOT EXISTS idx_teachers_employee_id ON public.teachers(employee_id);
