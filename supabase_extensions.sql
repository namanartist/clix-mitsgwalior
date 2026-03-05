
-- =================================================================
-- EXTENSION: CONNECT MISSING SYSTEMS (Dev Team, Mentors, Config)
-- =================================================================

-- 1. Update Clubs Table for Payment Gateway
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clubs' AND column_name = 'payment_gateway_config') THEN
        ALTER TABLE public.clubs 
        ADD COLUMN payment_gateway_config JSONB DEFAULT '{"provider": "ManualUPI", "isActive": true}'::jsonb;
    END IF;
END $$;

-- 2. Developers Table (For the "Architects" page)
CREATE TABLE IF NOT EXISTS public.developers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    role TEXT,
    bio TEXT,
    email TEXT,
    image TEXT, -- Stores Base64 or URL
    linkedin TEXT,
    github TEXT,
    is_lead BOOLEAN DEFAULT false,
    education JSONB DEFAULT '[]'::jsonb,
    experience JSONB DEFAULT '[]'::jsonb,
    achievements JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Mentors Table
CREATE TABLE IF NOT EXISTS public.mentors (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    designation TEXT,
    image TEXT,
    link TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. System Config Table (For dynamic site settings like "Developed Under")
CREATE TABLE IF NOT EXISTS public.system_config (
    key TEXT PRIMARY KEY,
    value JSONB
);

-- =================================================================
-- SECURITY POLICIES (RLS)
-- =================================================================

ALTER TABLE public.developers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_config ENABLE ROW LEVEL SECURITY;

-- Developers Policies
DROP POLICY IF EXISTS "Public read developers" ON public.developers;
CREATE POLICY "Public read developers" 
ON public.developers FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authorized write developers" ON public.developers;
CREATE POLICY "Authorized write developers" 
ON public.developers FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid()::text AND global_role IN ('Super Admin', 'Faculty Coordinator'))
    OR 
    -- Allow initial setup or developer self-management if needed (simplified to admins here)
    (auth.jwt() ->> 'email' IN ('namanalahariya@gmail.com')) 
);

-- Mentors Policies
DROP POLICY IF EXISTS "Public read mentors" ON public.mentors;
CREATE POLICY "Public read mentors" 
ON public.mentors FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authorized write mentors" ON public.mentors;
CREATE POLICY "Authorized write mentors" 
ON public.mentors FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid()::text AND global_role IN ('Super Admin', 'Faculty Coordinator'))
);

-- System Config Policies
DROP POLICY IF EXISTS "Public read config" ON public.system_config;
CREATE POLICY "Public read config" 
ON public.system_config FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authorized write config" ON public.system_config;
CREATE POLICY "Authorized write config" 
ON public.system_config FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid()::text AND global_role IN ('Super Admin'))
);
