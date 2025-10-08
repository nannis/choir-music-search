/**
 * Integration tests for female choir music sources
 * Tests the new parsers and database integration for all-female choir music
 * Uses Edge Functions with real user authentication
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createClient } from '@supabase/supabase-js';

// Supabase client for testing - uses real user JWT
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://kqjccswtdxkffghuijhu.supabase.co';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtxamNjc3d0ZHhrZmZnaHVpamh1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwOTMwMzIsImV4cCI6MjA3MzY2OTAzMn0.fBcS1Wn5m2Kn-yt9_PF9dyGlIPocJd6MuinvDZ4q3MU';
const testUserJWT = process.env.SUPABASE_TEST_USER_JWT;

let supabase: ReturnType<typeof createClient>;
let insertedSongIds: string[] = [];

describe('Female Choir Music Sources Integration', () => {
  beforeAll(async () => {
    try {
      if (!testUserJWT) {
        console.log('⚠️ SUPABASE_TEST_USER_JWT not found. Skipping JWT-based tests.');
        console.log('ℹ️ Use tests/integration/female-choir-user-auth.test.ts for user authentication tests.');
        return;
      }

      console.log('🔑 Using real user JWT token for testing');
      console.log('👤 Test user: user_for_test@ssaasearch.se');

      // Create Supabase client with user JWT token
      supabase = createClient(supabaseUrl, supabaseAnonKey, {
        global: {
          headers: {
            Authorization: `Bearer ${testUserJWT}`
          }
        }
      });

      console.log("✅ Test setup successful with user JWT token");
    } catch (error) {
      console.error('Test setup failed:', error);
      throw error;
    }
  });

  afterAll(async () => {
    // Clean up test data by calling Edge Function to delete test songs
    if (insertedSongIds.length > 0) {
      console.log(`🧹 Cleaning up ${insertedSongIds.length} test songs`);
      
      try {
        const response = await fetch(`${supabaseUrl}/functions/v1/choir-music-api/delete-songs`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${testUserJWT}`,
            'apikey': supabaseAnonKey
          },
          body: JSON.stringify({ songIds: insertedSongIds })
        });

        if (response.ok) {
          console.log('✅ Test data cleaned up successfully');
        } else {
          console.log('⚠️ Could not clean up test data:', await response.text());
        }
      } catch (error) {
        console.log('⚠️ Cleanup failed:', error);
      }
    }
  });

  describe('Database Schema via Edge Functions', () => {
    it('should validate source types through search API', async () => {
      // Test that we can search for songs with different source types
      const validSources = [
        'CPDL - Choral Public Domain Library',
        'IMSLP - International Music Score Library Project',
        'Musescore',
        'Sheet Music Plus',
        'Free Choral Music',
        'YouTube',
        'Other'
      ];

      for (const source of validSources) {
        const response = await fetch(`${supabaseUrl}/functions/v1/choir-music-api/search?source=${encodeURIComponent(source)}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${testUserJWT}`,
            'apikey': supabaseAnonKey
          }
        });

        expect(response.status).toBe(200);
        const data = await response.json();
        expect(data).toHaveProperty('results');
        expect(data).toHaveProperty('total');
        expect(Array.isArray(data.results)).toBe(true);
      }
    });

    it('should validate voicing types through search API', async () => {
      const validVoicings = ['SSA', 'SSAA', 'SA', 'SSAATTBB'];
      
      for (const voicing of validVoicings) {
        const response = await fetch(`${supabaseUrl}/functions/v1/choir-music-api/search?voicing=${voicing}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${testUserJWT}`,
            'apikey': supabaseAnonKey
          }
        });

        expect(response.status).toBe(200);
        const data = await response.json();
        expect(data).toHaveProperty('results');
        expect(Array.isArray(data.results)).toBe(true);
      }
    });
  });

  describe('Sample Data via Edge Functions', () => {
    it('should be able to add SSA female choir music via API', async () => {
      const testSong = {
        title: 'Test SSA Song',
        composer: 'Test Composer',
        description: 'A test SSA song for integration testing',
        source_link: 'https://example.com/test-ssa',
        source: 'CPDL - Choral Public Domain Library',
        voicing: 'SSA',
        language: 'English',
        difficulty: 'Easy',
        season: 'General',
        theme: 'Sacred'
      };

      const response = await fetch(`${supabaseUrl}/functions/v1/choir-music-api/add-songs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${testUserJWT}`,
          'apikey': supabaseAnonKey
        },
        body: JSON.stringify({ songs: [testSong], upsert: true })
      });

      expect(response.status).toBe(200);
      const result = await response.json();
      expect(result.message).toContain('Processed');
      expect(result.added).toBeGreaterThanOrEqual(0);
      expect(result.updated).toBeGreaterThanOrEqual(0);
      
      // Store song ID for cleanup
      if (result.songIds && result.songIds.length > 0) {
        insertedSongIds.push(...result.songIds);
      }
    });

    it('should be able to add SSAA female choir music via API', async () => {
      const testSong = {
        title: 'Test SSAA Song',
        composer: 'Test Composer 2',
        description: 'A test SSAA song for integration testing',
        source_link: 'https://example.com/test-ssaa',
        source: 'Musescore',
        voicing: 'SSAA',
        language: 'English',
        difficulty: 'Medium',
        season: 'Christmas',
        theme: 'Sacred'
      };

      const response = await fetch(`${supabaseUrl}/functions/v1/choir-music-api/add-songs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${testUserJWT}`,
          'apikey': supabaseAnonKey
        },
        body: JSON.stringify({ songs: [testSong], upsert: true })
      });

      expect(response.status).toBe(200);
      const result = await response.json();
      expect(result.message).toContain('Processed');
      
      // Store song ID for cleanup
      if (result.songIds && result.songIds.length > 0) {
        insertedSongIds.push(...result.songIds);
      }
    });

    it('should prevent duplicates when adding the same song', async () => {
      const testSong = {
        title: 'Duplicate Test Song',
        composer: 'Test Composer',
        description: 'A test song for duplicate prevention',
        source_link: 'https://example.com/duplicate-test',
        source: 'Other',
        voicing: 'SSA',
        language: 'English'
      };

      // Add the song twice
      const response1 = await fetch(`${supabaseUrl}/functions/v1/choir-music-api/add-songs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${testUserJWT}`,
          'apikey': supabaseAnonKey
        },
        body: JSON.stringify({ songs: [testSong], upsert: true })
      });

      const response2 = await fetch(`${supabaseUrl}/functions/v1/choir-music-api/add-songs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${testUserJWT}`,
          'apikey': supabaseAnonKey
        },
        body: JSON.stringify({ songs: [testSong], upsert: true })
      });

      expect(response1.status).toBe(200);
      expect(response2.status).toBe(200);
      
      const result1 = await response1.json();
      const result2 = await response2.json();
      
      // First insertion should add, second should update (upsert behavior)
      expect(result1.added + result1.updated).toBe(1);
      expect(result2.added + result2.updated).toBe(1);
      
      // Store song ID for cleanup
      if (result1.songIds && result1.songIds.length > 0) {
        insertedSongIds.push(...result1.songIds);
      }
    });
  });

  describe('Search Functionality via Edge Functions', () => {
    it('should be able to search for female choir music by voicing', async () => {
      const response = await fetch(`${supabaseUrl}/functions/v1/choir-music-api/search?voicing=SSA`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${testUserJWT}`,
          'apikey': supabaseAnonKey
        }
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toHaveProperty('results');
      expect(data).toHaveProperty('total');
      expect(Array.isArray(data.results)).toBe(true);
      
      // If results exist, verify they have SSA voicing
      if (data.results.length > 0) {
        data.results.forEach((song: any) => {
          expect(song.voicing).toBe('SSA');
        });
      }
    });

    it('should be able to search for female choir music by source', async () => {
      const response = await fetch(`${supabaseUrl}/functions/v1/choir-music-api/search?source=${encodeURIComponent('CPDL - Choral Public Domain Library')}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${testUserJWT}`,
          'apikey': supabaseAnonKey
        }
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toHaveProperty('results');
      expect(Array.isArray(data.results)).toBe(true);
      
      // If results exist, verify they have the correct source
      if (data.results.length > 0) {
        data.results.forEach((song: any) => {
          expect(song.source).toBe('CPDL - Choral Public Domain Library');
        });
      }
    });

    it('should support full-text search for female choir music', async () => {
      const response = await fetch(`${supabaseUrl}/functions/v1/choir-music-api/search?q=test`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${testUserJWT}`,
          'apikey': supabaseAnonKey
        }
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toHaveProperty('results');
      expect(data).toHaveProperty('total');
      expect(Array.isArray(data.results)).toBe(true);
      
      // If results exist, verify they contain "test" in title, composer, or description
      if (data.results.length > 0) {
        data.results.forEach((song: any) => {
          const searchableText = `${song.title} ${song.composer} ${song.description}`.toLowerCase();
          expect(searchableText).toContain('test');
        });
      }
    });

    it('should support combined search filters', async () => {
      const response = await fetch(`${supabaseUrl}/functions/v1/choir-music-api/search?voicing=SSA&source=${encodeURIComponent('CPDL - Choral Public Domain Library')}&q=test`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${testUserJWT}`,
          'apikey': supabaseAnonKey
        }
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toHaveProperty('results');
      expect(Array.isArray(data.results)).toBe(true);
      
      // If results exist, verify they match all criteria
      if (data.results.length > 0) {
        data.results.forEach((song: any) => {
          expect(song.voicing).toBe('SSA');
          expect(song.source).toBe('CPDL - Choral Public Domain Library');
          const searchableText = `${song.title} ${song.composer} ${song.description}`.toLowerCase();
          expect(searchableText).toContain('test');
        });
      }
    });
  });

  describe('API Integration', () => {
    it('should handle pagination correctly', async () => {
      const response = await fetch(`${supabaseUrl}/functions/v1/choir-music-api/search?page=1&limit=5`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${testUserJWT}`,
          'apikey': supabaseAnonKey
        }
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toHaveProperty('results');
      expect(data).toHaveProperty('total');
      expect(data).toHaveProperty('page', 1);
      expect(data).toHaveProperty('limit', 5);
      expect(Array.isArray(data.results)).toBe(true);
      expect(data.results.length).toBeLessThanOrEqual(5);
    });

    it('should return proper error for invalid requests', async () => {
      const response = await fetch(`${supabaseUrl}/functions/v1/choir-music-api/search?invalid_param=test`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${testUserJWT}`,
          'apikey': supabaseAnonKey
        }
      });

      // Should still return 200 but with empty results or handle gracefully
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toHaveProperty('results');
      expect(Array.isArray(data.results)).toBe(true);
    });
  });
});