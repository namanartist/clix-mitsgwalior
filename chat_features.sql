
-- =================================================================
-- CHAT SYSTEM UPGRADE MIGRATION
-- Adds support for: Multimedia, Location, Polls, Read Receipts, Online Status
-- =================================================================

-- 1. Update MESSAGES Table
-- Adds fields to store rich content and status
ALTER TABLE public.messages
ADD COLUMN IF NOT EXISTS media_url TEXT,
ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS poll_data JSONB, -- Stores { question: "...", options: [...] }
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'read'));

-- 2. Update PROFILES Table
-- Adds fields for Real-time Presence
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS last_seen TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
ADD COLUMN IF NOT EXISTS is_online BOOLEAN DEFAULT false;

-- 3. Update RLS Policies for Interactivity

-- Policy: Allow users to update messages 
-- Required for:
-- 1. Recipients marking messages as 'read'
-- 2. Users voting on Polls (modifying the poll_data JSON)
DROP POLICY IF EXISTS "Auth users update messages" ON public.messages;
CREATE POLICY "Auth users update messages"
ON public.messages FOR UPDATE
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- Policy: Allow users to update their own presence
-- Required for: Updating is_online and last_seen
DROP POLICY IF EXISTS "Users update own presence" ON public.profiles;
CREATE POLICY "Users update own presence"
ON public.profiles FOR UPDATE
USING (auth.uid()::text = id)
WITH CHECK (auth.uid()::text = id);

-- 4. Create Index for Performance
-- Improves chat loading speed when filtering by club or direct messages
CREATE INDEX IF NOT EXISTS idx_messages_club_id ON public.messages(club_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_recipient ON public.messages(sender_id, recipient_id);
