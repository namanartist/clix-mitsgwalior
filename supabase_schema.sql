
-- =================================================================
-- MITS CLUB MANAGEMENT SYSTEM (CCMS) - SUPABASE SCHEMA V2
-- =================================================================

-- 1. CLEANUP (Careful: This drops existing data)
DROP TABLE IF EXISTS public.session_archives CASCADE;
DROP TABLE IF EXISTS public.notifications CASCADE;
DROP TABLE IF EXISTS public.messages CASCADE;
DROP TABLE IF EXISTS public.saved_events CASCADE;
DROP TABLE IF EXISTS public.audit_logs CASCADE;
DROP TABLE IF EXISTS public.applicants CASCADE;
DROP TABLE IF EXISTS public.registrations CASCADE;
DROP TABLE IF EXISTS public.events CASCADE;
DROP TABLE IF EXISTS public.clubs CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- 2. ENUMS & TYPES
DO $$ BEGIN
    CREATE TYPE public.app_role AS ENUM ('Student', 'Faculty Coordinator', 'Super Admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.club_category AS ENUM ('Technical', 'Cultural', 'Social', 'Sports');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.event_type AS ENUM ('Free', 'Paid');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.status_type AS ENUM ('Pending', 'Approved', 'Rejected');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.applicant_stage AS ENUM ('Applied', 'Screening', 'Interview', 'Offer', 'Selected', 'Rejected');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. TABLES

-- PROFILES (Linked to Supabase Auth)
CREATE TABLE public.profiles (
    id TEXT PRIMARY KEY, -- Maps to auth.users.id or custom 'user-xxx'
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    global_role public.app_role DEFAULT 'Student',
    enrollment_number TEXT,
    branch TEXT,
    photo_url TEXT,
    signature_url TEXT,
    linkedin TEXT,
    github TEXT,
    phone_number TEXT,
    profile_locked BOOLEAN DEFAULT false,
    skills TEXT[] DEFAULT '{}',
    -- Storing memberships as JSONB to match frontend structure: [{ clubId: "...", role: "..." }]
    club_memberships JSONB DEFAULT '[]'::jsonb, 
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- CLUBS
CREATE TABLE public.clubs (
    id TEXT PRIMARY KEY, -- 'club-xxx'
    name TEXT NOT NULL,
    category public.club_category NOT NULL,
    theme_color TEXT DEFAULT '#2563eb',
    subdomain TEXT,
    logo_url TEXT,
    banner_url TEXT,
    tagline TEXT,
    description TEXT,
    faculty_coordinator_id TEXT REFERENCES public.profiles(id) ON DELETE SET NULL,
    faculty_coordinator_names TEXT[] DEFAULT '{}',
    leadership JSONB DEFAULT '{}'::jsonb, -- { "President": "Name" }
    is_frozen BOOLEAN DEFAULT false,
    recruitment_active BOOLEAN DEFAULT false,
    achievements JSONB DEFAULT '[]'::jsonb,
    custom_sections JSONB DEFAULT '[]'::jsonb,
    quotations JSONB DEFAULT '[]'::jsonb,
    default_upi_qr_url TEXT,
    payment_gateway_config JSONB DEFAULT '{"provider": "ManualUPI", "isActive": true}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- EVENTS
CREATE TABLE public.events (
    id TEXT PRIMARY KEY, -- 'evt-xxx'
    club_id TEXT REFERENCES public.clubs(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    type public.event_type DEFAULT 'Free',
    fee NUMERIC DEFAULT 0,
    status public.status_type DEFAULT 'Pending',
    date TEXT NOT NULL, -- YYYY-MM-DD
    upi_qr_url TEXT,
    banner_url TEXT,
    is_finalized BOOLEAN DEFAULT false,
    created_by TEXT REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- REGISTRATIONS
CREATE TABLE public.registrations (
    id TEXT PRIMARY KEY, -- 'reg-xxx'
    event_id TEXT REFERENCES public.events(id) ON DELETE CASCADE,
    student_id TEXT REFERENCES public.profiles(id) ON DELETE CASCADE,
    student_name TEXT NOT NULL,
    student_roll TEXT,
    student_branch TEXT,
    status public.status_type DEFAULT 'Pending',
    payment_type TEXT DEFAULT 'Free',
    payment_proof_url TEXT,
    ticket_id TEXT,
    attendance_marked BOOLEAN DEFAULT false,
    certificate_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- APPLICANTS (Recruitment)
CREATE TABLE public.applicants (
    id TEXT PRIMARY KEY, -- 'app-xxx'
    name TEXT NOT NULL,
    roll_number TEXT,
    branch TEXT,
    domain TEXT,
    stage public.applicant_stage DEFAULT 'Applied',
    why_join TEXT,
    resume_url TEXT,
    notes TEXT,
    recruitment_cycle TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- AUDIT LOGS
CREATE TABLE public.audit_logs (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    timestamp TEXT NOT NULL,
    "user" TEXT NOT NULL,
    action TEXT NOT NULL,
    club_id TEXT REFERENCES public.clubs(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- SAVED EVENTS (Bookmarks)
CREATE TABLE public.saved_events (
    user_id TEXT REFERENCES public.profiles(id) ON DELETE CASCADE,
    event_id TEXT REFERENCES public.events(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    PRIMARY KEY (user_id, event_id)
);

-- MESSAGES (Chat)
CREATE TABLE public.messages (
    id TEXT PRIMARY KEY, -- 'msg-xxx'
    sender_id TEXT REFERENCES public.profiles(id) ON DELETE CASCADE,
    sender_name TEXT,
    content TEXT,
    timestamp TEXT, -- ISO String from frontend
    club_id TEXT REFERENCES public.clubs(id) ON DELETE CASCADE, -- Null if DM
    recipient_id TEXT REFERENCES public.profiles(id) ON DELETE CASCADE, -- Null if Club Channel
    type TEXT DEFAULT 'text',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- NOTIFICATIONS
CREATE TABLE public.notifications (
    id TEXT PRIMARY KEY, -- 'notif-xxx'
    user_id TEXT REFERENCES public.profiles(id) ON DELETE CASCADE, -- Optional: Target user
    title TEXT,
    message TEXT,
    type TEXT,
    timestamp TEXT,
    read BOOLEAN DEFAULT false,
    sender_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- SESSION ARCHIVES
CREATE TABLE public.session_archives (
    id TEXT PRIMARY KEY,
    session_name TEXT NOT NULL,
    archived_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    archived_by TEXT REFERENCES public.profiles(id) ON DELETE SET NULL,
    data JSONB NOT NULL -- Full dump
);

-- 4. ROW LEVEL SECURITY (RLS)

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clubs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applicants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_archives ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (true);

-- CRITICAL FIX: Allow Admins/Faculty to update profiles (e.g., appointing presidents)
CREATE POLICY "Users and Admins can update profiles" ON public.profiles FOR UPDATE USING (
  auth.uid()::text = id OR 
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid()::text AND global_role IN ('Super Admin', 'Faculty Coordinator'))
);

-- Clubs Policies
CREATE POLICY "Clubs are viewable by everyone" ON public.clubs FOR SELECT USING (true);
CREATE POLICY "Faculty/Admins insert clubs" ON public.clubs FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid()::text AND global_role IN ('Faculty Coordinator', 'Super Admin'))
);
CREATE POLICY "Authorized update clubs" ON public.clubs FOR UPDATE USING (
    -- Admins/Faculty OR Club President (checked via logic or simple role check)
    auth.role() = 'authenticated'
);

-- Events Policies
CREATE POLICY "Events viewable by everyone" ON public.events FOR SELECT USING (true);
CREATE POLICY "Auth users create events" ON public.events FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Auth users update events" ON public.events FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Auth users delete events" ON public.events FOR DELETE USING (auth.role() = 'authenticated');

-- Registrations Policies
CREATE POLICY "Users view own registrations" ON public.registrations FOR SELECT USING (student_id = auth.uid()::text);
CREATE POLICY "Faculty/Admins view all registrations" ON public.registrations FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid()::text AND global_role IN ('Faculty Coordinator', 'Super Admin'))
);
CREATE POLICY "Users can register" ON public.registrations FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Staff update registrations" ON public.registrations FOR UPDATE USING (auth.role() = 'authenticated');

-- Applicants Policies
CREATE POLICY "View applicants" ON public.applicants FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Create applicants" ON public.applicants FOR INSERT WITH CHECK (true); -- Public application
CREATE POLICY "Update applicants" ON public.applicants FOR UPDATE USING (auth.role() = 'authenticated');

-- Audit Logs Policies
CREATE POLICY "View logs" ON public.audit_logs FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Insert logs" ON public.audit_logs FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Saved Events
CREATE POLICY "Manage saved events" ON public.saved_events FOR ALL USING (user_id = auth.uid()::text);

-- Messages
CREATE POLICY "View messages" ON public.messages FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Send messages" ON public.messages FOR INSERT WITH CHECK (sender_id = auth.uid()::text);

-- Notifications
CREATE POLICY "View notifications" ON public.notifications FOR SELECT USING (true);
CREATE POLICY "Create notifications" ON public.notifications FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Session Archives
CREATE POLICY "Admins manage archives" ON public.session_archives FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid()::text AND global_role = 'Super Admin')
);

-- 5. TRIGGERS & FUNCTIONS

-- Function to handle new user signup (Supabase Auth -> public.profiles)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, global_role)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.email, 'Student');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new auth user
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Auto-update 'updated_at' timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- 6. INSERT DEMO DATA (Optional - Safe to run multiple times due to ON CONFLICT)
INSERT INTO public.profiles (id, name, email, global_role)
VALUES 
    ('user-1', 'Naman Lahariya', 'naman@mits.ac.in', 'Super Admin')
ON CONFLICT (id) DO NOTHING;
