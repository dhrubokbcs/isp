-- ============================================================================
-- Migration: Dynamically Secure Existing Tables, Enable RLS & Revoke Anon Writes
-- ============================================================================

DO $$
DECLARE
    tbl_name text;
    target_tables text[] := ARRAY[
        'users',
        'teachers',
        'students',
        'academic_years',
        'class_levels',
        'programs',
        'batches',
        'subjects',
        'rooms',
        'class_sessions',
        'faculty_attendance',
        'exams'
    ];
BEGIN
    FOREACH tbl_name IN ARRAY target_tables LOOP
        -- Check if table exists in public schema before executing
        IF to_regclass('public.' || quote_ident(tbl_name)) IS NOT NULL THEN
            -- 1. Enable RLS
            EXECUTE 'ALTER TABLE public.' || quote_ident(tbl_name) || ' ENABLE ROW LEVEL SECURITY;';
            
            -- 2. Revoke mutation privileges from anon
            EXECUTE 'REVOKE INSERT, UPDATE, DELETE ON TABLE public.' || quote_ident(tbl_name) || ' FROM anon;';
            
            -- 3. Ensure service_role and postgres have full access
            EXECUTE 'GRANT ALL ON TABLE public.' || quote_ident(tbl_name) || ' TO postgres, service_role;';
            
            RAISE NOTICE 'Secured table: public.%', tbl_name;
        ELSE
            RAISE NOTICE 'Skipping non-existent table: public.%', tbl_name;
        END IF;
    END LOOP;
END $$;

-- Reload PostgREST schema cache
NOTIFY pgrst, 'reload schema';
