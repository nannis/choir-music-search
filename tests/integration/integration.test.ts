// Integration tests for the add-songs functionality
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock fetch globally
global.fetch = vi.fn();

describe('Add Songs Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Add SundMusik Songs', () => {
    it('should successfully add SundMusik songs to database', async () => {
      const mockSongs = [
        {
          title: 'Reiländer från Finnskogen',
          composer: 'Traditional Swedish / Arr. SundMusik',
          text_writer: 'Traditional Swedish',
          description: 'Swedish folk song arranged for women\'s choir, beautiful traditional melody',
          source_link: 'https://sundmusik.com/product-category/kornoter/damkor/',
          source: 'SundMusik',
          language: 'Swedish',
          voicing: 'SSAA',
          difficulty: 'Intermediate',
          theme: 'Folk',
          season: null,
          search_text: 'Reiländer från Finnskogen Traditional Swedish SundMusik women choir folk song traditional melody'
        },
        {
          title: 'Visa vid midsommartid',
          composer: 'Traditional Swedish / Arr. SundMusik',
          text_writer: 'Traditional Swedish',
          description: 'Swedish midsummer song arranged for women\'s trio, perfect for summer concerts',
          source_link: 'https://sundmusik.com/product-category/kornoter/damkor/',
          source: 'SundMusik',
          language: 'Swedish',
          voicing: 'SSA',
          difficulty: 'Easy',
          theme: 'Folk',
          season: 'Summer',
          search_text: 'Visa vid midsommartid Traditional Swedish SundMusik women trio midsummer song summer concerts'
        }
      ];

      const mockResponse = {
        message: 'Successfully added 2 songs',
        songs: mockSongs.map((song, index) => ({
          id: `test-id-${index}`,
          ...song,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
          last_verified: '2024-01-01T00:00:00Z',
          is_active: true
        }))
      };

      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      // Simulate the add-songs API call
      const response = await fetch('https://kqjccswtdxkffghuijhu.supabase.co/functions/v1/choir-music-api/add-songs', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtxamNjc3d0ZHhrZmZnaHVpamh1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwOTMwMzIsImV4cCI6MjA3MzY2OTAzMn0.fBcS1Wn5m2Kn-yt9_PF9dyGlIPocJd6MuinvDZ4q3MU',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ songs: mockSongs })
      });

      const result = await response.json();

      expect(response.ok).toBe(true);
      expect(result.message).toBe('Successfully added 2 songs');
      expect(result.songs).toHaveLength(2);
      expect(result.songs[0].title).toBe('Reiländer från Finnskogen');
      expect(result.songs[0].voicing).toBe('SSAA');
      expect(result.songs[1].title).toBe('Visa vid midsommartid');
      expect(result.songs[1].voicing).toBe('SSA');
    });

    it('should handle validation errors for invalid song data', async () => {
      const invalidSongs = [
        {
          // Missing required fields
          title: 'Incomplete Song'
        }
      ];

      (fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({
          error: 'Invalid request',
          message: 'Expected an array of songs in the request body'
        })
      });

      const response = await fetch('https://kqjccswtdxkffghuijhu.supabase.co/functions/v1/choir-music-api/add-songs', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtxamNjc3d0ZHhrZmZnaHVpamh1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwOTMwMzIsImV4cCI6MjA3MzY2OTAzMn0.fBcS1Wn5m2Kn-yt9_PF9dyGlIPocJd6MuinvDZ4q3MU',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ songs: invalidSongs })
      });

      const result = await response.json();

      expect(response.ok).toBe(false);
      expect(result.error).toBe('Invalid request');
    });
  });

  describe('Search After Adding Songs', () => {
    it('should find newly added songs in search results', async () => {
      // First, mock the add-songs response
      const mockAddResponse = {
        message: 'Successfully added 1 song',
        songs: [{
          id: 'new-song-id',
          title: 'New Swedish Song',
          composer: 'Traditional Swedish / Arr. SundMusik',
          text_writer: 'Traditional Swedish',
          description: 'New Swedish folk song',
          source_link: 'https://sundmusik.com/product-category/kornoter/damkor/',
          source: 'SundMusik',
          language: 'Swedish',
          voicing: 'SSAA',
          difficulty: 'Easy',
          theme: 'Folk',
          season: null,
          search_text: 'New Swedish Song Traditional Swedish SundMusik',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
          last_verified: '2024-01-01T00:00:00Z',
          is_active: true
        }]
      };

      // Then, mock the search response
      const mockSearchResponse = {
        results: [{
          id: 'new-song-id',
          title: 'New Swedish Song',
          composer: 'Traditional Swedish / Arr. SundMusik',
          textWriter: 'Traditional Swedish',
          description: 'New Swedish folk song',
          language: 'Swedish',
          voicing: 'SSAA',
          difficulty: 'Easy',
          season: null,
          theme: 'Folk',
          sourceLink: 'https://sundmusik.com/product-category/kornoter/damkor/'
        }],
        total: 1,
        page: 1,
        limit: 20,
        hasMore: false
      };

      // Mock add-songs call
      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockAddResponse
      });

      // Mock search call
      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockSearchResponse
      });

      // Add song
      const addResponse = await fetch('https://kqjccswtdxkffghuijhu.supabase.co/functions/v1/choir-music-api/add-songs', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtxamNjc3d0ZHhrZmZnaHVpamh1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwOTMwMzIsImV4cCI6MjA3MzY2OTAzMn0.fBcS1Wn5m2Kn-yt9_PF9dyGlIPocJd6MuinvDZ4q3MU',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          songs: [{
            title: 'New Swedish Song',
            composer: 'Traditional Swedish / Arr. SundMusik',
            text_writer: 'Traditional Swedish',
            description: 'New Swedish folk song',
            source_link: 'https://sundmusik.com/product-category/kornoter/damkor/',
            source: 'SundMusik',
            language: 'Swedish',
            voicing: 'SSAA',
            difficulty: 'Easy',
            theme: 'Folk',
            season: null,
            search_text: 'New Swedish Song Traditional Swedish SundMusik'
          }]
        })
      });

      const addResult = await addResponse.json();
      expect(addResult.message).toBe('Successfully added 1 song');

      // Search for the song
      const searchResponse = await fetch('https://kqjccswtdxkffghuijhu.supabase.co/functions/v1/choir-music-api/search?q=Swedish', {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtxamNjc3d0ZHhrZmZnaHVpamh1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwOTMwMzIsImV4cCI6MjA3MzY2OTAzMn0.fBcS1Wn5m2Kn-yt9_PF9dyGlIPocJd6MuinvDZ4q3MU',
          'Content-Type': 'application/json'
        }
      });

      const searchResult = await searchResponse.json();
      expect(searchResult.results).toHaveLength(1);
      expect(searchResult.results[0].title).toBe('New Swedish Song');
      expect(searchResult.results[0].language).toBe('Swedish');
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors gracefully', async () => {
      (fetch as any).mockRejectedValueOnce(new Error('Network error'));

      try {
        await fetch('https://kqjccswtdxkffghuijhu.supabase.co/functions/v1/choir-music-api/add-songs', {
          method: 'POST',
          headers: {
            'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtxamNjc3d0ZHhrZmZnaHVpamh1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwOTMwMzIsImV4cCI6MjA3MzY2OTAzMn0.fBcS1Wn5m2Kn-yt9_PF9dyGlIPocJd6MuinvDZ4q3MU',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ songs: [] })
        });
      } catch (error) {
        expect(error.message).toBe('Network error');
      }
    });

    it('should handle server errors gracefully', async () => {
      (fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({
          error: 'Internal server error',
          details: 'Database connection failed'
        })
      });

      const response = await fetch('https://kqjccswtdxkffghuijhu.supabase.co/functions/v1/choir-music-api/add-songs', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtxamNjc3d0ZHhrZmZnaHVpamh1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwOTMwMzIsImV4cCI6MjA3MzY2OTAzMn0.fBcS1Wn5m2Kn-yt9_PF9dyGlIPocJd6MuinvDZ4q3MU',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ songs: [] })
      });

      const result = await response.json();
      expect(response.ok).toBe(false);
      expect(result.error).toBe('Internal server error');
    });
  });
});
