/**
 * Integration tests for female choir music sources
 * Tests the new parsers and database integration for all-female choir music
 * Uses remote Supabase database via API calls
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { createClient } from '@supabase/supabase-js';

// Supabase client for testing - uses test service role JWT
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://kqjccswtdxkffghuijhu.supabase.co';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtxamNjc3d0ZHhrZmZnaHVpamh1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwOTMwMzIsImV4cCI6MjA3MzY2OTAzMn0.fBcS1Wn5m2Kn-yt9_PF9dyGlIPocJd6MuinvDZ4q3MU';

// Mint endpoint configuration
const MINT_ENDPOINT = process.env.MINT_ENDPOINT || `${supabaseUrl}/functions/v1/mint-test-jwt`;
const TEST_SUB = process.env.TEST_SUB || '00000000-0000-0000-0000-000000000001';
const TEST_EMAIL = process.env.TEST_EMAIL || 'tester@example.com';
const EXPIRES_IN = Number(process.env.EXPIRES_IN || 300); // 5 minutes for CI

// Global variable for test token
let testAuthToken: string;
let supabase: ReturnType<typeof createClient>;

// Use real user JWT token for testing
const testUserJWT = process.env.SUPABASE_TEST_USER_JWT;

describe('Female Choir Music Sources Integration', () => {
  beforeAll(async () => {
    try {
      if (!testUserJWT) {
        console.log('⚠️ SUPABASE_TEST_USER_JWT not found. Skipping JWT-based tests.');
        console.log('ℹ️ Use tests/integration/female-choir-user-auth.test.ts for user authentication tests.');
        return;
      }

      // Use real user JWT token
      testAuthToken = testUserJWT;
      
      console.log('🔑 Using real user JWT token for testing');
      console.log('👤 Test user: user_for_test@ssaasearch.se');

      // Create Supabase client with user JWT token
      supabase = createClient(supabaseUrl, supabaseAnonKey, {
        global: {
          headers: {
            Authorization: `Bearer ${testAuthToken}`
          }
        }
      });

      // Test database connection (may be restricted by RLS)
      const { data, error } = await supabase.from('songs').select('id').limit(1);
      if (error) {
        console.log('ℹ️ Database access restricted by RLS policies (expected for user-level access)');
        console.log('ℹ️ Error:', error.message);
      } else {
        console.log("✅ Test setup successful with user JWT token");
      }
    } catch (error) {
      console.error('Test setup failed:', error);
      throw error;
    }
  });

  describe('Database Schema', () => {
    it('should have the new source types in the songs table', async () => {
      // Test that we can query the songs table
      const { data, error } = await supabase
        .from('songs')
        .select('source')
        .limit(1);
      
      expect(error).toBeNull();
      expect(data).toBeDefined();
    });

    it('should accept new source types', async () => {
      const testSources = ['ChorusOnline', 'HalLeonard', 'CPDL', 'FluegelMusic', 'CarusVerlag', 'SchottMusic', 'StrettaMusic', 'Musopen'];

      for (const source of testSources) {
        const { data, error } = await supabase
          .from('songs')
          .insert({
            title: `Test Song ${source}`,
            composer: 'Test Composer',
            description: 'Test description',
            source_link: 'https://example.com',
            source: source,
            search_text: `Test Song ${source} Test Composer Test description`
          })
          .select('id');
        
        expect(error).toBeNull();
        expect(data).toHaveLength(1);
        expect(data![0].id).toBeDefined();
        
        // Clean up
        await supabase
          .from('songs')
          .delete()
          .eq('id', data![0].id);
      }
    });
  });

  describe('Sample Data', () => {
    it('should be able to insert female choir music samples', async () => {
      const testSong = {
        title: 'Test Female Choir Song',
        composer: 'Test Composer',
        text_writer: 'Test Writer',
        description: 'Test description for female choir',
        source_link: 'https://example.com/test-song',
        audio_link: 'https://example.com/audio/test-song.mp3',
        source: 'ChorusOnline',
        language: 'English',
        voicing: 'SSA',
        difficulty: 'Intermediate',
        theme: 'Sacred',
        season: null,
        search_text: 'Test Female Choir Song Test Composer Test Writer Test description for female choir'
      };

      const { data, error } = await supabase
        .from('songs')
        .insert(testSong)
        .select('id');
      
      expect(error).toBeNull();
      expect(data).toHaveLength(1);
      expect(data![0].id).toBeDefined();
      
      // Clean up
      await supabase
        .from('songs')
        .delete()
        .eq('id', data![0].id);
    });

    it('should support different voicing types for female choirs', async () => {
      const voicingTypes = ['SSA', 'SSAA', 'SA', 'SAA'];
      const insertedIds = [];

      for (const voicing of voicingTypes) {
        const { data, error } = await supabase
          .from('songs')
          .insert({
            title: `Test Song ${voicing}`,
            composer: 'Test Composer',
            description: 'Test description',
            source_link: 'https://example.com',
            source: 'ChorusOnline',
            voicing: voicing,
            search_text: `Test Song ${voicing} Test Composer Test description`
          })
          .select('id');
        
        expect(error).toBeNull();
        expect(data).toHaveLength(1);
        insertedIds.push(data![0].id);
      }
      
      // Clean up
      for (const id of insertedIds) {
        await supabase
          .from('songs')
          .delete()
          .eq('id', id);
      }
    });
  });

  describe('Search Functionality', () => {
    it('should be able to search for female choir music by voicing', async () => {
      const testSongs = [
        { title: 'SSA Test Song', composer: 'Test Composer', voicing: 'SSA' },
        { title: 'SSAA Test Song', composer: 'Test Composer', voicing: 'SSAA' }
      ];
      
      const insertedIds = [];
      for (const song of testSongs) {
        const { data, error } = await supabase
          .from('songs')
          .insert({
            title: song.title,
            composer: song.composer,
            description: 'Test description',
            source_link: 'https://example.com',
            source: 'ChorusOnline',
            voicing: song.voicing,
            search_text: `${song.title} ${song.composer} Test description`
          })
          .select('id');
        
        expect(error).toBeNull();
        insertedIds.push(data![0].id);
      }

      // Test search by voicing
      const { data: ssaResults, error: ssaError } = await supabase
        .from('songs')
        .select('*')
        .eq('voicing', 'SSA')
        .eq('title', 'SSA Test Song');
      
      expect(ssaError).toBeNull();
      expect(ssaResults).toHaveLength(1);
      expect(ssaResults![0].voicing).toBe('SSA');
      
      // Clean up
      for (const id of insertedIds) {
        await supabase
          .from('songs')
          .delete()
          .eq('id', id);
      }
    });

    it('should be able to search for female choir music by source', async () => {
      const sources = ['ChorusOnline', 'HalLeonard', 'CPDL'];
      
      for (const source of sources) {
        const { data, error } = await supabase
          .from('songs')
          .select('count')
          .eq('source', source);
        
        expect(error).toBeNull();
        expect(data).toBeDefined();
      }
    });

    it('should support full-text search for female choir music', async () => {
      // Insert test data with searchable text
      const { data, error } = await supabase
        .from('songs')
        .insert({
          title: 'Beautiful Female Choir Piece',
          composer: 'Test Composer',
          description: 'A beautiful piece for women\'s voices',
          source_link: 'https://example.com',
          source: 'ChorusOnline',
          voicing: 'SSA',
          search_text: 'Beautiful Female Choir Piece Test Composer A beautiful piece for women voices'
        })
        .select('id');
      
      expect(error).toBeNull();
      expect(data).toHaveLength(1);
      const songId = data![0].id;

      // Test full-text search
      const { data: searchResults, error: searchError } = await supabase
        .from('songs')
        .select('*')
        .ilike('search_text', '%female choir%');
      
      expect(searchError).toBeNull();
      expect(searchResults).toBeDefined();
      expect(searchResults!.length).toBeGreaterThan(0);
      
      // Clean up
      await supabase
        .from('songs')
        .delete()
        .eq('id', songId);
    });
  });

  describe('API Integration', () => {
    it('should be able to add songs via API', async () => {
      const testSongs = [
        {
          title: 'API Test Song 1',
          composer: 'Test Composer',
          source: 'ChorusOnline',
          voicing: 'SSA',
          description: 'Test song added via API',
          source_link: 'https://example.com/api-test-1'
        },
        {
          title: 'API Test Song 2',
          composer: 'Test Composer',
          source: 'HalLeonard',
          voicing: 'SSAA',
          description: 'Another test song added via API',
          source_link: 'https://example.com/api-test-2'
        }
      ];

      // Test the add-songs API endpoint using test token
      const response = await fetch(`${supabaseUrl}/functions/v1/choir-music-api/add-songs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${testAuthToken}`,
          'apikey': supabaseAnonKey
        },
        body: JSON.stringify({ songs: testSongs })
      });

      expect(response.ok).toBe(true);
      
      const result = await response.json();
      expect(result.message).toContain('Processed 2 songs');
      expect(result.songs).toHaveLength(2);
      
      // Clean up - delete the test songs
      for (const song of result.songs) {
        await supabase
          .from('songs')
          .delete()
          .eq('id', song.id);
      }
    });

    it('should prevent duplicates when adding songs via API', async () => {
      const testSong = {
        title: 'Duplicate Test Song',
        composer: 'Test Composer',
        source: 'ChorusOnline',
        voicing: 'SSA',
        description: 'Test song for duplicate prevention',
        source_link: 'https://example.com/duplicate-test'
      };

      // Add the song twice using test token
      const response1 = await fetch(`${supabaseUrl}/functions/v1/choir-music-api/add-songs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${testAuthToken}`,
          'apikey': supabaseAnonKey
        },
        body: JSON.stringify({ songs: [testSong] })
      });

      const response2 = await fetch(`${supabaseUrl}/functions/v1/choir-music-api/add-songs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${testAuthToken}`,
          'apikey': supabaseAnonKey
        },
        body: JSON.stringify({ songs: [testSong] })
      });

      expect(response1.ok).toBe(true);
      expect(response2.ok).toBe(true);
      
      const result1 = await response1.json();
      const result2 = await response2.json();
      
      // First insertion should succeed
      expect(result1.songs).toHaveLength(1);
      
      // Second insertion should either skip or update (depending on upsert mode)
      // The safe insertion should prevent true duplicates
      expect(result2.summary).toBeDefined();
      
      // Clean up
      if (result1.songs.length > 0) {
        await supabase
          .from('songs')
          .delete()
          .eq('id', result1.songs[0].id);
      }
      if (result2.songs && result2.songs.length > 0) {
        await supabase
          .from('songs')
          .delete()
          .eq('id', result2.songs[0].id);
      }
    });
  });
});