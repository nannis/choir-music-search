-- Row Level Security (RLS) Policies for Choir Music Search
-- This file contains RLS policies to secure the database tables
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

-- Policy: Admins can view all submissions (for review purposes)
CREATE POLICY "Admins can view all submissions" ON public.user_submissions
FOR SELECT USING (
  auth.jwt() ->> 'role' = 'admin'
);

-- Policy: Admins can update submission status (for approval/rejection)
CREATE POLICY "Admins can update submission status" ON public.user_submissions
FOR UPDATE USING (
  auth.jwt() ->> 'role' = 'admin'
) WITH CHECK (
  auth.jwt() ->> 'role' = 'admin'
);

-- ==============================================
-- SONGS TABLE POLICIES
-- ==============================================

-- Policy: All authenticated users can view all songs (public read access)
CREATE POLICY "All authenticated users can view songs" ON public.songs
FOR SELECT USING (auth.uid() IS NOT NULL);

-- Policy: Only admins can insert new songs
CREATE POLICY "Admins can insert songs" ON public.songs
FOR INSERT WITH CHECK (
  auth.jwt() ->> 'role' = 'admin'
);

-- Policy: Only admins can update songs
CREATE POLICY "Admins can update songs" ON public.songs
FOR UPDATE USING (
  auth.jwt() ->> 'role' = 'admin'
) WITH CHECK (
  auth.jwt() ->> 'role' = 'admin'
);

-- Policy: Only admins can delete songs
CREATE POLICY "Admins can delete songs" ON public.songs
FOR DELETE USING (
  auth.jwt() ->> 'role' = 'admin'
);

-- ==============================================
-- INGESTION_JOBS TABLE POLICIES
-- ==============================================

-- Policy: Only admins can view ingestion jobs (internal system data)
CREATE POLICY "Admins can view ingestion jobs" ON public.ingestion_jobs
FOR SELECT USING (
  auth.jwt() ->> 'role' = 'admin'
);

-- Policy: Only admins can insert ingestion jobs
CREATE POLICY "Admins can insert ingestion jobs" ON public.ingestion_jobs
FOR INSERT WITH CHECK (
  auth.jwt() ->> 'role' = 'admin'
);

-- Policy: Only admins can update ingestion jobs
CREATE POLICY "Admins can update ingestion jobs" ON public.ingestion_jobs
FOR UPDATE USING (
  auth.jwt() ->> 'role' = 'admin'
) WITH CHECK (
  auth.jwt() ->> 'role' = 'admin'
);

-- Policy: Only admins can delete ingestion jobs
CREATE POLICY "Admins can delete ingestion jobs" ON public.ingestion_jobs
FOR DELETE USING (
  auth.jwt() ->> 'role' = 'admin'
);

-- ==============================================
-- NOTES AND CONSIDERATIONS
-- ==============================================

-- 1. USER ROLES: These policies use JWT claims for role checking
--    To set a user as admin, you need to configure custom claims in your auth system
--    or use Supabase's built-in role system. For custom claims:
--    - Configure your auth provider to include 'role' in JWT claims
--    - Or use Supabase's user metadata and create a custom function

-- 2. ANONYMOUS ACCESS: If you need anonymous users to view songs, you can modify the songs SELECT policy:
--    CREATE POLICY "Public can view songs" ON public.songs FOR SELECT USING (true);

-- 3. TESTING: After implementing these policies, test with different user accounts:
--    - Regular authenticated user
--    - Admin user  
--    - Anonymous user (if applicable)

-- 4. MONITORING: Check Supabase logs to ensure policies are working correctly
--    and that legitimate access isn't being blocked.
