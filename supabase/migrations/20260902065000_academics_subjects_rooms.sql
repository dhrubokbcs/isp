-- Create subjects table if not exists
CREATE TABLE IF NOT EXISTS public.subjects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(150) NOT NULL,
    department VARCHAR(100) NOT NULL DEFAULT 'GENERAL',
    target_level VARCHAR(100) NOT NULL DEFAULT 'CLASS_10',
    total_weekly_classes INT NOT NULL DEFAULT 3,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create rooms table if not exists
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

-- Enable RLS and grant access to service_role and authenticated users
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;

GRANT ALL ON TABLE public.subjects TO postgres, service_role;
GRANT ALL ON TABLE public.rooms TO postgres, service_role;

REVOKE INSERT, UPDATE, DELETE ON TABLE public.subjects FROM anon;
REVOKE INSERT, UPDATE, DELETE ON TABLE public.rooms FROM anon;
