-- Simplified RLS Policies for Choir Music Search
-- This version uses basic authentication checks without custom roles
-- Run these commands in the Supabase SQL Editor

-- ==============================================
-- ENABLE ROW LEVEL SECURITY ON ALL TABLES
-- ==============================================

-- Enable RLS on user_submissions table
ALTER TABLE public.user_submissions ENABLE ROW LEVEL SECURITY;

-- Enable RLS on songs table  
ALTER TABLE public.songs ENABLE ROW LEVEL SECURITY;

-- Enable RLS on ingestion_jobs table
ALTER TABLE public.ingestion_jobs ENABLE ROW LEVEL SECURITY;

-- ==============================================
-- USER_SUBMISSIONS TABLE POLICIES
-- ==============================================

-- Policy: Users can view their own submissions
CREATE POLICY "Users can view their own submissions" ON public.user_submissions
FOR SELECT USING (auth.uid() = user_id);

-- Policy: Users can insert their own submissions
CREATE POLICY "Users can insert their own submissions" ON public.user_submissions
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own submissions
CREATE POLICY "Users can update their own submissions" ON public.user_submissions
FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own submissions
CREATE POLICY "Users can delete their own submissions" ON public.user_submissions
FOR DELETE USING (auth.uid() = user_id);

-- ==============================================
-- SONGS TABLE POLICIES
-- ==============================================

-- Policy: Only authenticated users can view songs
CREATE POLICY "Authenticated users can view songs" ON public.songs
FOR SELECT USING (auth.uid() IS NOT NULL);

-- Policy: Only authenticated users can insert songs (for now)
-- You can restrict this further by adding admin checks later
CREATE POLICY "Authenticated users can insert songs" ON public.songs
FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Policy: Only authenticated users can update songs
CREATE POLICY "Authenticated users can update songs" ON public.songs
FOR UPDATE USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

-- Policy: Only authenticated users can delete songs
CREATE POLICY "Authenticated users can delete songs" ON public.songs
FOR DELETE USING (auth.uid() IS NOT NULL);

-- ==============================================
-- INGESTION_JOBS TABLE POLICIES
-- ==============================================

-- Policy: Only authenticated users can view ingestion jobs
CREATE POLICY "Authenticated users can view ingestion jobs" ON public.ingestion_jobs
FOR SELECT USING (auth.uid() IS NOT NULL);

-- Policy: Only authenticated users can insert ingestion jobs
CREATE POLICY "Authenticated users can insert ingestion jobs" ON public.ingestion_jobs
FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Policy: Only authenticated users can update ingestion jobs
CREATE POLICY "Authenticated users can update ingestion jobs" ON public.ingestion_jobs
FOR UPDATE USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

-- Policy: Only authenticated users can delete ingestion jobs
CREATE POLICY "Authenticated users can delete ingestion jobs" ON public.ingestion_jobs
FOR DELETE USING (auth.uid() IS NOT NULL);

-- ==============================================
-- NOTES
-- ==============================================

-- This simplified version:
-- 1. Blocks all anonymous access (auth.uid() IS NOT NULL)
-- 2. Allows all authenticated users to access all data
-- 3. Users can only modify their own submissions (user_id = auth.uid())
-- 4. No custom role system required

-- To add admin restrictions later, you can:
-- 1. Add custom claims to your JWT tokens
-- 2. Use Supabase's built-in role system
-- 3. Create custom functions to check user roles

-- For now, this will resolve the security warnings by ensuring
-- only authenticated users can access the database.
