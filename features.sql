
-- =================================================================
-- 1. SETUP EVENTS TABLE (For "Deploy Event")
-- =================================================================
CREATE TABLE IF NOT EXISTS public.events (
    id TEXT PRIMARY KEY, -- Matches frontend ID generation (e.g., 'evt-123...')
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    club_id TEXT REFERENCES public.clubs(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    type TEXT CHECK (type IN ('Free', 'Paid')),
    fee NUMERIC DEFAULT 0,
    status TEXT DEFAULT 'Pending' CHECK (status IN ('Pending', 'Approved', 'Rejected')),
    date TEXT NOT NULL, -- Storing as YYYY-MM-DD text to match frontend simple date pickers
    upi_qr_url TEXT,    -- Specific QR for this event
    banner_url TEXT,
    is_finalized BOOLEAN DEFAULT false,
    created_by TEXT REFERENCES public.profiles(id)
);

-- Enable RLS
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Policy: Everyone can read active/approved events
CREATE POLICY "Public read approved events" 
ON public.events FOR SELECT 
USING (status = 'Approved' OR auth.uid() IS NOT NULL);

-- Policy: Authenticated users (Presidents/Faculty) can create events
CREATE POLICY "Auth users create events" 
ON public.events FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

-- Policy: Only Faculty/Admins/Creators can update events
CREATE POLICY "Creators and Staff update events" 
ON public.events FOR UPDATE 
USING (
    created_by = auth.uid() OR 
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND global_role IN ('Faculty Coordinator', 'Super Admin')
    )
);

-- =================================================================
-- 2. UPDATE CLUBS TABLE (For "New Recruitment Cycle" & "Manage QR")
-- =================================================================

-- Add columns if they don't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clubs' AND column_name = 'default_upi_qr_url') THEN
        ALTER TABLE public.clubs ADD COLUMN default_upi_qr_url TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clubs' AND column_name = 'recruitment_active') THEN
        ALTER TABLE public.clubs ADD COLUMN recruitment_active BOOLEAN DEFAULT false;
    END IF;
    
    -- Ensure JSONB columns exist for complex data
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clubs' AND column_name = 'custom_sections') THEN
        ALTER TABLE public.clubs ADD COLUMN custom_sections JSONB DEFAULT '[]'::jsonb;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clubs' AND column_name = 'quotations') THEN
        ALTER TABLE public.clubs ADD COLUMN quotations JSONB DEFAULT '[]'::jsonb;
    END IF;
END $$;

-- RLS Update for Clubs (Allow updates by authenticated users - restricted by App logic for Presidents)
CREATE POLICY "Auth users update clubs" 
ON public.clubs FOR UPDATE 
USING (auth.role() = 'authenticated');

-- =================================================================
-- 3. SETUP AUDIT LOGS (For Tracking "Recruitment Cycle" Actions)
-- =================================================================
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id TEXT PRIMARY KEY,
    timestamp TEXT NOT NULL, -- Storing frontend formatted timestamp
    "user" TEXT NOT NULL,    -- User Name
    action TEXT NOT NULL,
    club_id TEXT
);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Read logs" ON public.audit_logs FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Create logs" ON public.audit_logs FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- =================================================================
-- 4. SETUP SAVED EVENTS (For Student Dashboard)
-- =================================================================
CREATE TABLE IF NOT EXISTS public.saved_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT REFERENCES public.profiles(id) ON DELETE CASCADE,
    event_id TEXT REFERENCES public.events(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    UNIQUE(user_id, event_id)
);

ALTER TABLE public.saved_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own saved events" 
ON public.saved_events FOR ALL 
USING (user_id = auth.uid());

-- =================================================================
-- 5. SETUP REGISTRATIONS (For Tickets & Attendance)
-- =================================================================
CREATE TABLE IF NOT EXISTS public.registrations (
    id TEXT PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    event_id TEXT REFERENCES public.events(id) ON DELETE CASCADE,
    student_id TEXT REFERENCES public.profiles(id) ON DELETE CASCADE,
    student_name TEXT,
    student_roll TEXT,
    student_branch TEXT,
    status TEXT DEFAULT 'Pending',
    payment_type TEXT,
    payment_proof_url TEXT,
    ticket_id TEXT, -- The generated Ticket ID
    attendance_marked BOOLEAN DEFAULT false,
    certificate_id TEXT
);

ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;

-- Policy: Users can see their own registrations
CREATE POLICY "Users read own regs" 
ON public.registrations FOR SELECT 
USING (student_id = auth.uid());

-- Policy: Club Admins/Faculty can see all regs (Simplified for this file)
-- In production, you'd check if auth.uid() is the faculty or president of the event's club
CREATE POLICY "Staff read all regs" 
ON public.registrations FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND global_role IN ('Faculty Coordinator', 'Super Admin')
    )
);

-- Policy: Users can create registrations
CREATE POLICY "Users create regs" 
ON public.registrations FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

-- Policy: Updates (e.g. marking attendance, issuing ticket)
CREATE POLICY "Staff update regs" 
ON public.registrations FOR UPDATE 
USING (true)
WITH CHECK (true);
