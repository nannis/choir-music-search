/**
 * Tests for the updated SearchService with filter support
 * Verifies that filters are properly passed to the API
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SearchService } from '../src/services/searchService';
import { FilterOptions } from '../src/components/SearchFilters';

// Mock fetch globally
global.fetch = vi.fn();

describe('SearchService with Filters', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset fetch mock
    (global.fetch as any).mockClear();
  });

  it('should call API without filters when none provided', async () => {
    const mockResponse = {
      ok: true,
      json: () => Promise.resolve({ results: [] })
    };
    (global.fetch as any).mockResolvedValue(mockResponse);

    await SearchService.searchMusic('test query');

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/search?q=test+query'),
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({
          'Authorization': expect.stringContaining('Bearer'),
          'Content-Type': 'application/json'
        })
      })
    );
  });

  it('should include filter parameters in API call', async () => {
    const mockResponse = {
      ok: true,
      json: () => Promise.resolve({ results: [] })
    };
    (global.fetch as any).mockResolvedValue(mockResponse);

    const filters: FilterOptions = {
      source: ['IMSLP', 'MuseScore'],
      voicing: ['SSA'],
      difficulty: ['Easy'],
      language: [],
      theme: [],
      season: [],
      period: []
    };

    await SearchService.searchMusic('test query', filters);

    const expectedUrl = expect.stringContaining('/search?q=test+query&source=IMSLP%2CMuseScore&voicing=SSA&difficulty=Easy');
    expect(global.fetch).toHaveBeenCalledWith(
      expectedUrl,
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({
          'Authorization': expect.stringContaining('Bearer'),
          'Content-Type': 'application/json'
        })
      })
    );
  });

  it('should not include empty filter arrays in API call', async () => {
    const mockResponse = {
      ok: true,
      json: () => Promise.resolve({ results: [] })
    };
    (global.fetch as any).mockResolvedValue(mockResponse);

    const filters: FilterOptions = {
      source: ['IMSLP'],
      voicing: [],
      difficulty: [],
      language: [],
      theme: [],
      season: [],
      period: []
    };

    await SearchService.searchMusic('test query', filters);

    const expectedUrl = expect.stringContaining('/search?q=test+query&source=IMSLP');
    expect(global.fetch).toHaveBeenCalledWith(
      expectedUrl,
      expect.objectContaining({
        method: 'GET'
      })
    );

    // Should not contain empty filter parameters
    const callUrl = (global.fetch as any).mock.calls[0][0];
    expect(callUrl).not.toContain('voicing=');
    expect(callUrl).not.toContain('difficulty=');
    expect(callUrl).not.toContain('language=');
    expect(callUrl).not.toContain('theme=');
    expect(callUrl).not.toContain('season=');
    expect(callUrl).not.toContain('period=');
  });

  it('should handle all filter types correctly', async () => {
    const mockResponse = {
      ok: true,
      json: () => Promise.resolve({ results: [] })
    };
    (global.fetch as any).mockResolvedValue(mockResponse);

    const filters: FilterOptions = {
      source: ['IMSLP'],
      voicing: ['SSA', 'SSAA'],
      difficulty: ['Easy', 'Intermediate'],
      language: ['English', 'Latin'],
      theme: ['Sacred', 'Christmas'],
      season: ['Advent', 'Easter'],
      period: ['Baroque', 'Classical']
    };

    await SearchService.searchMusic('test query', filters);

    const callUrl = (global.fetch as any).mock.calls[0][0];
    
    expect(callUrl).toContain('source=IMSLP');
    expect(callUrl).toContain('voicing=SSA%2CSSAA');
    expect(callUrl).toContain('difficulty=Easy%2CIntermediate');
    expect(callUrl).toContain('language=English%2CLatin');
    expect(callUrl).toContain('theme=Sacred%2CChristmas');
    expect(callUrl).toContain('season=Advent%2CEaster');
    expect(callUrl).toContain('period=Baroque%2CClassical');
  });

  it('should return empty array for empty query', async () => {
    const result = await SearchService.searchMusic('');
    expect(result).toEqual([]);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('should return empty array for whitespace-only query', async () => {
    const result = await SearchService.searchMusic('   ');
    expect(result).toEqual([]);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('should throw error when API call fails', async () => {
    const mockResponse = {
      ok: false,
      status: 500,
      statusText: 'Internal Server Error'
    };
    (global.fetch as any).mockResolvedValue(mockResponse);

    await expect(SearchService.searchMusic('test query')).rejects.toThrow('API request failed: 500 Internal Server Error');
  });

  it('should throw error when network request fails', async () => {
    (global.fetch as any).mockRejectedValue(new Error('Network error'));

    await expect(SearchService.searchMusic('test query')).rejects.toThrow('Network error');
  });

  it('should return results from successful API call', async () => {
    const mockResults = [
      { id: '1', title: 'Test Song', composer: 'Test Composer' },
      { id: '2', title: 'Another Song', composer: 'Another Composer' }
    ];
    
    const mockResponse = {
      ok: true,
      json: () => Promise.resolve({ results: mockResults })
    };
    (global.fetch as any).mockResolvedValue(mockResponse);

    const result = await SearchService.searchMusic('test query');
    expect(result).toEqual(mockResults);
  });

  it('should handle API response with no results property', async () => {
    const mockResponse = {
      ok: true,
      json: () => Promise.resolve({})
    };
    (global.fetch as any).mockResolvedValue(mockResponse);

    const result = await SearchService.searchMusic('test query');
    expect(result).toEqual([]);
  });
});
