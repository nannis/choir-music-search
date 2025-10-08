-- Test-specific RLS policies for integration tests
-- These policies allow the service role to bypass RLS for testing purposes
-- Run this in the Supabase SQL Editor

-- ==============================================
-- TEST POLICIES FOR SONGS TABLE
-- ==============================================

-- Policy: Service role can do everything on songs table (for testing)
CREATE POLICY "Service role can manage songs" ON public.songs
FOR ALL USING (
  auth.jwt() ->> 'role' = 'service_role'
) WITH CHECK (
  auth.jwt() ->> 'role' = 'service_role'
);

-- ==============================================
-- TEST POLICIES FOR USER_SUBMISSIONS TABLE
-- ==============================================

-- Policy: Service role can do everything on user_submissions table (for testing)
CREATE POLICY "Service role can manage user_submissions" ON public.user_submissions
FOR ALL USING (
  auth.jwt() ->> 'role' = 'service_role'
) WITH CHECK (
  auth.jwt() ->> 'role' = 'service_role'
);

-- ==============================================
-- TEST POLICIES FOR INGESTION_JOBS TABLE
-- ==============================================

-- Policy: Service role can do everything on ingestion_jobs table (for testing)
CREATE POLICY "Service role can manage ingestion_jobs" ON public.ingestion_jobs
FOR ALL USING (
  auth.jwt() ->> 'role' = 'service_role'
) WITH CHECK (
  auth.jwt() ->> 'role' = 'service_role'
);

-- ==============================================
-- TEST POLICIES FOR QUERY_CACHE TABLE (if exists)
-- ==============================================

-- Policy: Service role can do everything on query_cache table (for testing)
CREATE POLICY "Service role can manage query_cache" ON public.query_cache
FOR ALL USING (
  auth.jwt() ->> 'role' = 'service_role'
) WITH CHECK (
  auth.jwt() ->> 'role' = 'service_role'
);


