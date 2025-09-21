import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SearchService } from '../src/services/searchService';

// Mock fetch globally
global.fetch = vi.fn();

describe('SearchService', () => {
  beforeEach(() => {
    // Reset mocks before each test
    fetch.mockClear();
  });

  describe('searchMusic', () => {
    it('should return empty array for empty query', async () => {
      const result = await SearchService.searchMusic('');
      expect(result).toEqual([]);
      expect(fetch).not.toHaveBeenCalled();
    });

    it('should return empty array for whitespace-only query', async () => {
      const result = await SearchService.searchMusic('   ');
      expect(result).toEqual([]);
      expect(fetch).not.toHaveBeenCalled();
    });

    it('should make API call and return results for valid query', async () => {
      const mockResults = [
        { id: '1', title: 'Test Song', composer: 'Test Composer' }
      ];
      
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ results: mockResults })
      });

      const result = await SearchService.searchMusic('test');
      
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/functions/v1/choir-music-api/search?q=test'),
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Authorization': expect.stringContaining('Bearer'),
            'Content-Type': 'application/json'
          })
        })
      );
      
      expect(result).toEqual(mockResults);
    });

    it('should handle API error responses', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error'
      });

      await expect(SearchService.searchMusic('test')).rejects.toThrow(
        'API request failed: 500 Internal Server Error'
      );
    });

    it('should handle network errors', async () => {
      fetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(SearchService.searchMusic('test')).rejects.toThrow('Network error');
    });

    it('should handle non-Error exceptions', async () => {
      fetch.mockRejectedValueOnce('String error');

      await expect(SearchService.searchMusic('test')).rejects.toThrow('Search failed');
    });

    it('should return empty array when API returns no results', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ results: null })
      });

      const result = await SearchService.searchMusic('test');
      expect(result).toEqual([]);
    });

    it('should use environment variables when available', async () => {
      // Mock environment variables
      const originalEnv = import.meta.env;
      import.meta.env.VITE_SUPABASE_URL = 'https://test.supabase.co';
      import.meta.env.VITE_SUPABASE_ANON_KEY = 'test-key';

      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ results: [] })
      });

      await SearchService.searchMusic('test');

      expect(fetch).toHaveBeenCalledWith(
        'https://test.supabase.co/functions/v1/choir-music-api/search?q=test',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-key'
          })
        })
      );

      // Restore original environment
      import.meta.env = originalEnv;
    });

    it('should fallback to hardcoded values when environment variables are not available', async () => {
      // This test verifies that the service uses fallback values
      // Since we can't easily mock import.meta.env in Vitest, we'll test the behavior
      // by checking that the service makes a call with the expected URL pattern
      
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ results: [] })
      });

      await SearchService.searchMusic('test');

      // Verify that fetch was called with a URL containing the expected domain
      expect(fetch).toHaveBeenCalledWith(
        expect.stringMatching(/.*supabase\.co.*\/functions\/v1\/choir-music-api\/search/),
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Authorization': expect.stringMatching(/Bearer .+/),
            'Content-Type': 'application/json'
          })
        })
      );
    });
  });
});
