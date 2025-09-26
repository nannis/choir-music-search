// Tests for the Choir Music Search Edge Function
import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock fetch globally for testing Edge Function endpoints
global.fetch = vi.fn();

describe('Choir Music Search Edge Function', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Health Check Endpoint', () => {
    it('should return healthy status for GET /health', async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({
          status: 'healthy',
          timestamp: '2024-01-01T00:00:00Z',
          message: 'Edge Function is working!'
        })
      };

      (fetch as any).mockResolvedValueOnce(mockResponse);

      const response = await fetch('https://kqjccswtdxkffghuijhu.supabase.co/functions/v1/choir-music-api/health', {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer test-token',
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      expect(response.ok).toBe(true);
      expect(data.status).toBe('healthy');
      expect(data.message).toBe('Edge Function is working!');
    });
  });

  describe('Search Endpoint', () => {
    it('should return search results for GET /search', async () => {
      const mockResults = {
        results: [
          {
            id: 'test-id-1',
            title: 'Test Song',
            composer: 'Test Composer',
            textWriter: 'Test Writer',
            description: 'Test description',
            language: 'English',
            voicing: 'SATB',
            difficulty: 'Easy',
            season: null,
            theme: 'Sacred',
            sourceLink: 'https://example.com'
          }
        ],
        total: 1,
        page: 1,
        limit: 20,
        hasMore: false
      };

      const mockResponse = {
        ok: true,
        json: async () => mockResults
      };

      (fetch as any).mockResolvedValueOnce(mockResponse);

      const response = await fetch('https://kqjccswtdxkffghuijhu.supabase.co/functions/v1/choir-music-api/search?q=test', {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer test-token',
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      expect(response.ok).toBe(true);
      expect(data.results).toHaveLength(1);
      expect(data.results[0].title).toBe('Test Song');
      expect(data.results[0].composer).toBe('Test Composer');
      expect(data.total).toBe(1);
      expect(data.page).toBe(1);
      expect(data.limit).toBe(20);
    });

    it('should handle search without query parameter', async () => {
      const mockResults = {
        results: [],
        total: 0,
        page: 1,
        limit: 20,
        hasMore: false
      };

      const mockResponse = {
        ok: true,
        json: async () => mockResults
      };

      (fetch as any).mockResolvedValueOnce(mockResponse);

      const response = await fetch('https://kqjccswtdxkffghuijhu.supabase.co/functions/v1/choir-music-api/search', {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer test-token',
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      expect(response.ok).toBe(true);
      expect(data.results).toHaveLength(0);
      expect(data.total).toBe(0);
    });

    it('should handle pagination parameters', async () => {
      const mockResults = {
        results: [],
        total: 0,
        page: 2,
        limit: 10,
        hasMore: false
      };

      const mockResponse = {
        ok: true,
        json: async () => mockResults
      };

      (fetch as any).mockResolvedValueOnce(mockResponse);

      const response = await fetch('https://kqjccswtdxkffghuijhu.supabase.co/functions/v1/choir-music-api/search?q=test&page=2&limit=10', {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer test-token',
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      expect(response.ok).toBe(true);
      expect(data.page).toBe(2);
      expect(data.limit).toBe(10);
    });
  });

  describe('Add Songs Endpoint', () => {
    it('should add songs successfully for POST /add-songs', async () => {
      const mockSongs = [
        {
          title: 'New Song',
          composer: 'New Composer',
          text_writer: 'New Writer',
          description: 'New description',
          source_link: 'https://example.com',
          source: 'Test',
          language: 'English',
          voicing: 'SSAA',
          difficulty: 'Intermediate',
          theme: 'Folk',
          season: null,
          search_text: 'New Song New Composer'
        }
      ];

      const mockResponse = {
        ok: true,
        json: async () => ({
          message: 'Successfully added 1 songs',
          songs: mockSongs.map((song, index) => ({
            id: `test-id-${index}`,
            ...song,
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
            last_verified: '2024-01-01T00:00:00Z',
            is_active: true
          }))
        })
      };

      (fetch as any).mockResolvedValueOnce(mockResponse);

      const response = await fetch('https://kqjccswtdxkffghuijhu.supabase.co/functions/v1/choir-music-api/add-songs', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer test-token',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ songs: mockSongs })
      });

      const data = await response.json();

      expect(response.ok).toBe(true);
      expect(data.message).toBe('Successfully added 1 songs');
      expect(data.songs).toHaveLength(1);
      expect(data.songs[0].title).toBe('New Song');
    });

    it('should return error for invalid request body', async () => {
      const mockResponse = {
        ok: false,
        status: 400,
        json: async () => ({
          error: 'Invalid request',
          message: 'Expected an array of songs in the request body'
        })
      };

      (fetch as any).mockResolvedValueOnce(mockResponse);

      const response = await fetch('https://kqjccswtdxkffghuijhu.supabase.co/functions/v1/choir-music-api/add-songs', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer test-token',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ songs: [] })
      });

      const data = await response.json();

      expect(response.ok).toBe(false);
      expect(data.error).toBe('Invalid request');
      expect(data.message).toBe('Expected an array of songs in the request body');
    });

    it('should return error for missing songs array', async () => {
      const mockResponse = {
        ok: false,
        status: 400,
        json: async () => ({
          error: 'Invalid request',
          message: 'Expected an array of songs in the request body'
        })
      };

      (fetch as any).mockResolvedValueOnce(mockResponse);

      const response = await fetch('https://kqjccswtdxkffghuijhu.supabase.co/functions/v1/choir-music-api/add-songs', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer test-token',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
      });

      const data = await response.json();

      expect(response.ok).toBe(false);
      expect(data.error).toBe('Invalid request');
    });
  });

  describe('CORS Handling', () => {
    it('should handle OPTIONS preflight requests', async () => {
      const mockResponse = {
        ok: true,
        headers: {
          get: vi.fn((header: string) => {
            if (header === 'Access-Control-Allow-Origin') return '*';
            if (header === 'Access-Control-Allow-Methods') return 'GET, POST, PUT, DELETE, OPTIONS';
            return null;
          })
        }
      };

      (fetch as any).mockResolvedValueOnce(mockResponse);

      const response = await fetch('https://kqjccswtdxkffghuijhu.supabase.co/functions/v1/choir-music-api/search', {
        method: 'OPTIONS',
        headers: {
          'Origin': 'https://example.com'
        }
      });

      expect(response.ok).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should return 404 for unknown routes', async () => {
      const mockResponse = {
        ok: false,
        status: 404,
        json: async () => ({
          error: 'Not found',
          debug: {
            method: 'GET',
            path: '/unknown',
            fullUrl: 'https://test.supabase.co/functions/v1/choir-music-api/unknown',
            pathname: '/unknown'
          }
        })
      };

      (fetch as any).mockResolvedValueOnce(mockResponse);

      const response = await fetch('https://kqjccswtdxkffghuijhu.supabase.co/functions/v1/choir-music-api/unknown', {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer test-token',
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      expect(response.ok).toBe(false);
      expect(data.error).toBe('Not found');
      expect(data.debug.method).toBe('GET');
      expect(data.debug.path).toBe('/unknown');
    });
  });
});
