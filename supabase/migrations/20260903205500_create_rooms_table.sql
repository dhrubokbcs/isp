-- ============================================================================
-- Migration: Create Campus Rooms Table and Reload Schema Cache
-- ============================================================================

-- 1. Create Campus Rooms Table
CREATE TABLE IF NOT EXISTS public.rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_number VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(150) NOT NULL,
    room_type VARCHAR(50) NOT NULL DEFAULT 'LECTURE_HALL',
    capacity INT NOT NULL DEFAULT 40,
    floor VARCHAR(100) NOT NULL DEFAULT '1st Floor',
    status VARCHAR(50) NOT NULL DEFAULT 'AVAILABLE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Indexes for efficient lookup
CREATE INDEX IF NOT EXISTS idx_rooms_room_number ON public.rooms(room_number);
CREATE INDEX IF NOT EXISTS idx_rooms_status ON public.rooms(status);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;

-- 4. Permissive policies for full CRUD access
DROP POLICY IF EXISTS "Allow all operations for service_role and authenticated users" ON public.rooms;
CREATE POLICY "Allow all operations for service_role and authenticated users"
ON public.rooms
FOR ALL
TO public
USING (true)
WITH CHECK (true);

-- 5. Grant Table Permissions
GRANT ALL ON TABLE public.rooms TO postgres, service_role, authenticated, anon;

-- 6. Reload Supabase PostgREST Schema Cache
NOTIFY pgrst, 'reload schema';
