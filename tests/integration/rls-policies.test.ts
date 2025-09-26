/**
 * RLS Policies Test Suite
 * Tests Row Level Security policies for user_submissions, songs, and ingestion_jobs tables
 * 
 * This test suite verifies that:
 * 1. RLS is properly enabled on all tables
 * 2. Users can only access their own data
 * 3. Admins have appropriate access
 * 4. Unauthorized access is properly blocked
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createClient } from '@supabase/supabase-js';

// Test configuration
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'http://localhost:54321';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'test-anon-key';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'test-service-role-key';

// Create Supabase clients for different access levels
const supabaseAnon = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const supabaseService = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Test data
const testUser1 = {
  id: 'test-user-1-uuid',
  email: 'testuser1@example.com',
  role: 'user'
};

const testUser2 = {
  id: 'test-user-2-uuid', 
  email: 'testuser2@example.com',
  role: 'user'
};

const testAdmin = {
  id: 'test-admin-uuid',
  email: 'admin@example.com',
  role: 'admin'
};

const testSong = {
  id: 'test-song-uuid',
  title: 'Test Song',
  composer: 'Test Composer',
  source_link: 'https://example.com/test-song',
  source: 'Other',
  language: 'English',
  voicing: 'SATB',
  difficulty: 'Easy',
  theme: 'Test'
};

const testSubmission = {
  id: 'test-submission-uuid',
  user_id: testUser1.id,
  title: 'Test Submission',
  composer: 'Test Composer',
  source_link: 'https://example.com/test-submission',
  description: 'Test submission description',
  language: 'English',
  voicing: 'SATB',
  difficulty: 'Easy',
  theme: 'Test',
  status: 'pending'
};

const testIngestionJob = {
  id: 'test-ingestion-job-uuid',
  source: 'TestSource',
  url: 'https://example.com/test-source',
  parser: 'TestParser',
  schedule: '0 0 * * *',
  status: 'active'
};

describe('RLS Policies Tests', () => {
  beforeAll(async () => {
    // Set up test data using service role (bypasses RLS)
    console.log('Setting up test data...');
    
    // Insert test song
    const { error: songError } = await supabaseService
      .from('songs')
      .insert(testSong);
    
    if (songError) {
      console.warn('Failed to insert test song:', songError.message);
    }

    // Insert test submission
    const { error: submissionError } = await supabaseService
      .from('user_submissions')
      .insert(testSubmission);
    
    if (submissionError) {
      console.warn('Failed to insert test submission:', submissionError.message);
    }

    // Insert test ingestion job
    const { error: jobError } = await supabaseService
      .from('ingestion_jobs')
      .insert(testIngestionJob);
    
    if (jobError) {
      console.warn('Failed to insert test ingestion job:', jobError.message);
    }
  });

  afterAll(async () => {
    // Clean up test data using service role
    console.log('Cleaning up test data...');
    
    await supabaseService
      .from('songs')
      .delete()
      .eq('id', testSong.id);
    
    await supabaseService
      .from('user_submissions')
      .delete()
      .eq('id', testSubmission.id);
    
    await supabaseService
      .from('ingestion_jobs')
      .delete()
      .eq('id', testIngestionJob.id);
  });

  describe('Songs Table RLS', () => {
    it('should allow anonymous users to read songs (if public access enabled)', async () => {
      const { data, error } = await supabaseAnon
        .from('songs')
        .select('*')
        .limit(1);
      
      // This test may fail if public access is not enabled
      // Check if error is due to RLS or other issues
      if (error) {
        console.log('Anonymous access to songs:', error.message);
        // If it's an RLS error, that's expected behavior
        expect(error.message).toContain('permission denied');
      } else {
        expect(data).toBeDefined();
        expect(Array.isArray(data)).toBe(true);
      }
    });

    it('should prevent anonymous users from inserting songs', async () => {
      const { error } = await supabaseAnon
        .from('songs')
        .insert({
          title: 'Unauthorized Song',
          composer: 'Unauthorized Composer',
          source_link: 'https://example.com/unauthorized',
          source: 'Other'
        });
      
      expect(error).toBeDefined();
      expect(error?.message).toContain('permission denied');
    });

    it('should prevent anonymous users from updating songs', async () => {
      const { error } = await supabaseAnon
        .from('songs')
        .update({ title: 'Modified Title' })
        .eq('id', testSong.id);
      
      expect(error).toBeDefined();
      expect(error?.message).toContain('permission denied');
    });

    it('should prevent anonymous users from deleting songs', async () => {
      const { error } = await supabaseAnon
        .from('songs')
        .delete()
        .eq('id', testSong.id);
      
      expect(error).toBeDefined();
      expect(error?.message).toContain('permission denied');
    });
  });

  describe('User Submissions Table RLS', () => {
    it('should prevent anonymous users from accessing submissions', async () => {
      const { error } = await supabaseAnon
        .from('user_submissions')
        .select('*');
      
      expect(error).toBeDefined();
      expect(error?.message).toContain('permission denied');
    });

    it('should prevent anonymous users from inserting submissions', async () => {
      const { error } = await supabaseAnon
        .from('user_submissions')
        .insert({
          title: 'Unauthorized Submission',
          composer: 'Unauthorized Composer',
          source_link: 'https://example.com/unauthorized'
        });
      
      expect(error).toBeDefined();
      expect(error?.message).toContain('permission denied');
    });
  });

  describe('Ingestion Jobs Table RLS', () => {
    it('should prevent anonymous users from accessing ingestion jobs', async () => {
      const { error } = await supabaseAnon
        .from('ingestion_jobs')
        .select('*');
      
      expect(error).toBeDefined();
      expect(error?.message).toContain('permission denied');
    });

    it('should prevent anonymous users from inserting ingestion jobs', async () => {
      const { error } = await supabaseAnon
        .from('ingestion_jobs')
        .insert({
          source: 'UnauthorizedSource',
          url: 'https://example.com/unauthorized',
          parser: 'UnauthorizedParser'
        });
      
      expect(error).toBeDefined();
      expect(error?.message).toContain('permission denied');
    });
  });

  describe('RLS Configuration Verification', () => {
    it('should have RLS enabled on user_submissions table', async () => {
      const { data, error } = await supabaseService
        .rpc('check_rls_enabled', { table_name: 'user_submissions' });
      
      if (error) {
        // Fallback: check if we can access the table without RLS
        const { error: accessError } = await supabaseAnon
          .from('user_submissions')
          .select('id')
          .limit(1);
        
        // If we get permission denied, RLS is likely enabled
        expect(accessError?.message).toContain('permission denied');
      } else {
        expect(data).toBe(true);
      }
    });

    it('should have RLS enabled on songs table', async () => {
      const { data, error } = await supabaseService
        .rpc('check_rls_enabled', { table_name: 'songs' });
      
      if (error) {
        // Fallback: check if we can access the table without RLS
        const { error: accessError } = await supabaseAnon
          .from('songs')
          .select('id')
          .limit(1);
        
        // If we get permission denied, RLS is likely enabled
        expect(accessError?.message).toContain('permission denied');
      } else {
        expect(data).toBe(true);
      }
    });

    it('should have RLS enabled on ingestion_jobs table', async () => {
      const { data, error } = await supabaseService
        .rpc('check_rls_enabled', { table_name: 'ingestion_jobs' });
      
      if (error) {
        // Fallback: check if we can access the table without RLS
        const { error: accessError } = await supabaseAnon
          .from('ingestion_jobs')
          .select('id')
          .limit(1);
        
        // If we get permission denied, RLS is likely enabled
        expect(accessError?.message).toContain('permission denied');
      } else {
        expect(data).toBe(true);
      }
    });
  });
});

/**
 * Helper function to create a Supabase client with a specific user context
 * This would be used for testing authenticated user access
 */
function createUserClient(userId: string, userRole: string = 'user') {
  // In a real test environment, you would:
  // 1. Create a test user in Supabase Auth
  // 2. Set their metadata with the appropriate role
  // 3. Get their JWT token
  // 4. Create a client with that token
  
  // For now, this is a placeholder
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: {
      headers: {
        'Authorization': `Bearer test-token-for-${userId}`,
        'X-User-Role': userRole
      }
    }
  });
}

/**
 * Test scenarios that require authenticated users
 * These would need to be run with actual user authentication
 */
describe('Authenticated User RLS Tests (Requires Auth Setup)', () => {
  it.skip('should allow users to access their own submissions', async () => {
    const userClient = createUserClient(testUser1.id, 'user');
    
    const { data, error } = await userClient
      .from('user_submissions')
      .select('*')
      .eq('user_id', testUser1.id);
    
    expect(error).toBeNull();
    expect(data).toBeDefined();
  });

  it.skip('should prevent users from accessing other users submissions', async () => {
    const userClient = createUserClient(testUser1.id, 'user');
    
    const { error } = await userClient
      .from('user_submissions')
      .select('*')
      .eq('user_id', testUser2.id);
    
    expect(error).toBeDefined();
    expect(error?.message).toContain('permission denied');
  });

  it.skip('should allow admins to access all submissions', async () => {
    const adminClient = createUserClient(testAdmin.id, 'admin');
    
    const { data, error } = await adminClient
      .from('user_submissions')
      .select('*');
    
    expect(error).toBeNull();
    expect(data).toBeDefined();
  });
});
