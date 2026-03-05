
-- =================================================================
-- MITS CLUB MANAGEMENT SYSTEM (CCMS) - SUPABASE SCHEMA
-- =================================================================

-- 1. PROFILES (Users)
-- Matches 'User' type in types.ts
create table if not exists public.profiles (
  id text primary key, -- Use text to match 'user-123' format or UUIDs
  name text not null,
  email text not null unique,
  global_role text not null check (global_role in ('Student', 'Faculty Coordinator', 'Super Admin')),
  enrollment_number text,
  branch text,
  photo_url text,
  signature_url text,
  linkedin text,
  github text,
  phone_number text,
  profile_locked boolean default false,
  skills text[], -- Array of strings
  club_memberships jsonb default '[]'::jsonb, -- Stores array of { clubId, role }
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. CLUBS
-- Matches 'Club' type
create table if not exists public.clubs (
  id text primary key,
  name text not null,
  category text not null check (category in ('Technical', 'Cultural', 'Social', 'Sports')),
  theme_color text,
  subdomain text,
  logo_url text,
  banner_url text,
  tagline text,
  description text,
  faculty_coordinator_id text,
  faculty_coordinator_names text[],
  leadership jsonb default '{}'::jsonb, -- Key-value pairs for leadership roles
  is_frozen boolean default false,
  recruitment_active boolean default false,
  achievements jsonb default '[]'::jsonb,
  custom_sections jsonb default '[]'::jsonb,
  quotations jsonb default '[]'::jsonb,
  default_upi_qr_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. EVENTS
-- Matches 'Event' type
create table if not exists public.events (
  id text primary key,
  club_id text references public.clubs(id) on delete cascade,
  title text not null,
  description text,
  type text check (type in ('Free', 'Paid')),
  fee numeric default 0,
  status text default 'Pending' check (status in ('Pending', 'Approved', 'Rejected')),
  date text not null, -- YYYY-MM-DD format
  upi_qr_url text,
  banner_url text,
  is_finalized boolean default false,
  created_by text references public.profiles(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. REGISTRATIONS
-- Matches 'Registration' type
create table if not exists public.registrations (
  id text primary key,
  event_id text references public.events(id) on delete cascade,
  student_id text references public.profiles(id) on delete cascade,
  student_name text,
  student_roll text,
  student_branch text,
  status text default 'Pending' check (status in ('Pending', 'Approved', 'Rejected')),
  payment_type text default 'Free',
  payment_proof_url text,
  ticket_id text,
  attendance_marked boolean default false,
  certificate_id text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. APPLICANTS
-- Matches 'Applicant' type
create table if not exists public.applicants (
  id text primary key,
  name text not null,
  roll_number text,
  branch text,
  domain text,
  stage text check (stage in ('Applied', 'Screening', 'Interview', 'Offer', 'Selected', 'Rejected')),
  why_join text,
  resume_url text,
  notes text,
  recruitment_cycle text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. AUDIT LOGS
-- Matches 'AuditLog' type
create table if not exists public.audit_logs (
  id text primary key default gen_random_uuid()::text,
  timestamp text not null,
  "user" text not null,
  action text not null,
  club_id text references public.clubs(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 7. SAVED EVENTS
-- Matches 'SavedEvent' type
create table if not exists public.saved_events (
  user_id text references public.profiles(id) on delete cascade,
  event_id text references public.events(id) on delete cascade,
  primary key (user_id, event_id)
);

-- 8. MESSAGES (Chat System)
-- Matches 'Message' type
create table if not exists public.messages (
  id text primary key default gen_random_uuid()::text,
  sender_id text references public.profiles(id),
  sender_name text,
  content text,
  timestamp text,
  club_id text references public.clubs(id), -- Nullable for DMs
  recipient_id text references public.profiles(id), -- Nullable for Group Chats
  type text default 'text',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 9. NOTIFICATIONS
-- Matches 'Notification' type
create table if not exists public.notifications (
  id text primary key default gen_random_uuid()::text,
  user_id text references public.profiles(id), -- Target user
  title text,
  message text,
  type text,
  timestamp text,
  read boolean default false,
  sender_name text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 10. SESSION ARCHIVES (New Feature)
-- Stores a JSON dump of a past session before reset
create table if not exists public.session_archives (
  id text primary key default gen_random_uuid()::text,
  session_name text not null, -- e.g., "2025-2026 Academic Session"
  archived_at timestamp with time zone default timezone('utc'::text, now()) not null,
  archived_by text references public.profiles(id),
  data jsonb not null -- The massive JSON dump of all tables
);

-- =================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =================================================================

-- Enable RLS on all tables
alter table public.profiles enable row level security;
alter table public.clubs enable row level security;
alter table public.events enable row level security;
alter table public.registrations enable row level security;
alter table public.applicants enable row level security;
alter table public.audit_logs enable row level security;
alter table public.saved_events enable row level security;
alter table public.messages enable row level security;
alter table public.notifications enable row level security;
alter table public.session_archives enable row level security;

-- PROFILES Policies
drop policy if exists "Public profiles are viewable by everyone" on public.profiles;
create policy "Public profiles are viewable by everyone" 
on public.profiles for select using (true);

drop policy if exists "Users can insert their own profile" on public.profiles;
create policy "Users can insert their own profile" 
on public.profiles for insert with check (auth.uid()::text = id);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile" 
on public.profiles for update using (auth.uid()::text = id);

-- CLUBS Policies
drop policy if exists "Clubs are viewable by everyone" on public.clubs;
create policy "Clubs are viewable by everyone" 
on public.clubs for select using (true);

drop policy if exists "Admins and Faculty can insert clubs" on public.clubs;
create policy "Admins and Faculty can insert clubs" 
on public.clubs for insert with check (
  exists (select 1 from public.profiles where id = auth.uid()::text and global_role in ('Super Admin', 'Faculty Coordinator'))
);

drop policy if exists "Club Presidents and Admins can update clubs" on public.clubs;
create policy "Club Presidents and Admins can update clubs" 
on public.clubs for update using (
  exists (select 1 from public.profiles where id = auth.uid()::text and global_role in ('Super Admin', 'Faculty Coordinator'))
  or
  (leadership->>'President' is not null) -- Simplified check
);

-- EVENTS Policies
drop policy if exists "Events are viewable by everyone" on public.events;
create policy "Events are viewable by everyone" 
on public.events for select using (true);

drop policy if exists "Authorized users can create events" on public.events;
create policy "Authorized users can create events" 
on public.events for insert with check (auth.role() = 'authenticated');

drop policy if exists "Authorized users can update events" on public.events;
create policy "Authorized users can update events" 
on public.events for update using (auth.role() = 'authenticated');

-- REGISTRATIONS Policies
drop policy if exists "Users can see own registrations" on public.registrations;
create policy "Users can see own registrations" 
on public.registrations for select using (student_id = auth.uid()::text);

drop policy if exists "Club admins can see event registrations" on public.registrations;
create policy "Club admins can see event registrations" 
on public.registrations for select using (
  exists (
    select 1 from public.events e
    join public.clubs c on e.club_id = c.id
    where e.id = registrations.event_id
    -- Add complex logic here to check if auth.uid() is admin of club c
  )
);

drop policy if exists "Users can register" on public.registrations;
create policy "Users can register" 
on public.registrations for insert with check (student_id = auth.uid()::text);

-- MESSAGES Policies
drop policy if exists "Users can read public club messages" on public.messages;
create policy "Users can read public club messages" 
on public.messages for select using (club_id is not null);

drop policy if exists "Users can read own DMs" on public.messages;
create policy "Users can read own DMs" 
on public.messages for select using (sender_id = auth.uid()::text or recipient_id = auth.uid()::text);

drop policy if exists "Users can send messages" on public.messages;
create policy "Users can send messages" 
on public.messages for insert with check (sender_id = auth.uid()::text);

-- NOTIFICATIONS Policies
drop policy if exists "Users can read own notifications" on public.notifications;
create policy "Users can read own notifications" 
on public.notifications for select using (user_id = auth.uid()::text);

-- SESSION ARCHIVES Policies
drop policy if exists "Admins can view and create archives" on public.session_archives;
create policy "Admins can view and create archives" 
on public.session_archives for all using (
  exists (select 1 from public.profiles where id = auth.uid()::text and global_role = 'Super Admin')
);

-- =================================================================
-- INITIAL SEED DATA HELPER (Optional)
-- =================================================================
-- Insert 'DEMO_USERS' from constants.tsx here manually if needed.
