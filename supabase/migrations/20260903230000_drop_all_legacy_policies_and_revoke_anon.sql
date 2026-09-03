-- ============================================================================
-- Migration: Forward-Only Complete Lock Down (Drop All Permissive Policies & Revoke Anon)
-- ============================================================================

DO $$
DECLARE
    pol RECORD;
    tbl RECORD;
BEGIN
    -- 1. Dynamically drop all legacy permissive policies across all public tables
    FOR pol IN
        SELECT schemaname, tablename, policyname
        FROM pg_policies
        WHERE schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I;', pol.policyname, pol.schemaname, pol.tablename);
        RAISE NOTICE 'Dropped policy % on table %', pol.policyname, pol.tablename;
    END LOOP;

    -- 2. Dynamically enable Row Level Security on EVERY table in public schema
    FOR tbl IN
        SELECT tablename
        FROM pg_tables
        WHERE schemaname = 'public'
    LOOP
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', tbl.tablename);
        RAISE NOTICE 'Enabled RLS on public.%', tbl.tablename;
    END LOOP;

    -- 3. Revoke ALL permissions (SELECT, INSERT, UPDATE, DELETE) from anon role across schema public
    REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon;
    REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM anon;
    REVOKE ALL ON ALL ROUTINES IN SCHEMA public FROM anon;

    -- 4. Grant full administrative privileges strictly to postgres and service_role
    GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, service_role;
    GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, service_role;
    GRANT ALL ON ALL ROUTINES IN SCHEMA public TO postgres, service_role;

    RAISE NOTICE 'Database successfully locked down. All anonymous access revoked.';
END $$;

-- 5. Reload Supabase PostgREST schema cache
NOTIFY pgrst, 'reload schema';
