-- Migration: Add subjects and rooms tables for Academic Module

-- 1. Academic Subjects Catalog
CREATE TABLE IF NOT EXISTS public.subjects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(150) NOT NULL,
    code VARCHAR(50) NOT NULL UNIQUE,
    department VARCHAR(50) NOT NULL DEFAULT 'GENERAL',
    target_level VARCHAR(100),
    total_weekly_classes INT NOT NULL DEFAULT 3,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Campus Rooms & Laboratories
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

-- Grant full access to authenticated & service_role
GRANT ALL ON TABLE public.subjects TO postgres, service_role, authenticated, anon;
GRANT ALL ON TABLE public.rooms TO postgres, service_role, authenticated, anon;
