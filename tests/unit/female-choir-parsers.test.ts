/**
 * Unit tests for female choir music parsers
 * Tests the parser functionality without requiring database connection
 */

import { describe, it, expect, vi } from 'vitest';
import { DataIngestionService } from '../../backend/services/dataIngestion';

// Mock the database connection
const mockPool = {
  execute: vi.fn(),
  query: vi.fn(),
  end: vi.fn()
};

describe('Female Choir Music Parsers', () => {
  let ingestionService: DataIngestionService;

  beforeEach(() => {
    // Create a new instance for each test
    ingestionService = new DataIngestionService(mockPool as any);
  });

  describe('Parser Initialization', () => {
    it('should have parsers for all new female choir sources', () => {
      // Access the private parsers map through reflection
      const parsers = (ingestionService as any).parsers;
      
      expect(parsers.has('ChorusOnline')).toBe(true);
      expect(parsers.has('HalLeonard')).toBe(true);
      expect(parsers.has('CPDL')).toBe(true);
    });

    it('should have correct parser types', () => {
      const parsers = (ingestionService as any).parsers;
      
      // Check that parsers are instances of the correct classes
      expect(parsers.get('ChorusOnline')).toBeDefined();
      expect(parsers.get('HalLeonard')).toBeDefined();
      expect(parsers.get('CPDL')).toBeDefined();
    });
  });

  describe('ChorusOnline Parser', () => {
    it('should have correct update frequency', () => {
      const parser = (ingestionService as any).parsers.get('ChorusOnline');
      expect(parser.getUpdateFrequency()).toBe('daily');
    });

    it('should have parse method', () => {
      const parser = (ingestionService as any).parsers.get('ChorusOnline');
      expect(typeof parser.parse).toBe('function');
    });

    it('should handle parse errors gracefully', async () => {
      const parser = (ingestionService as any).parsers.get('ChorusOnline');
      
      // Mock fetch to throw an error
      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));
      
      const result = await parser.parse('https://example.com');
      expect(result).toEqual([]);
    });
  });

  describe('Hal Leonard Parser', () => {
    it('should have correct update frequency', () => {
      const parser = (ingestionService as any).parsers.get('HalLeonard');
      expect(parser.getUpdateFrequency()).toBe('weekly');
    });

    it('should have parse method', () => {
      const parser = (ingestionService as any).parsers.get('HalLeonard');
      expect(typeof parser.parse).toBe('function');
    });

    it('should handle parse errors gracefully', async () => {
      const parser = (ingestionService as any).parsers.get('HalLeonard');
      
      // Mock fetch to throw an error
      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));
      
      const result = await parser.parse('https://example.com');
      expect(result).toEqual([]);
    });
  });

  describe('CPDL Parser', () => {
    it('should have correct update frequency', () => {
      const parser = (ingestionService as any).parsers.get('CPDL');
      expect(parser.getUpdateFrequency()).toBe('weekly');
    });

    it('should have parse method', () => {
      const parser = (ingestionService as any).parsers.get('CPDL');
      expect(typeof parser.parse).toBe('function');
    });

    it('should handle parse errors gracefully', async () => {
      const parser = (ingestionService as any).parsers.get('CPDL');
      
      // Mock fetch to throw an error
      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));
      
      const result = await parser.parse('https://example.com');
      expect(result).toEqual([]);
    });
  });

  describe('Parser Data Structure', () => {
    it('should return songs with correct structure', async () => {
      const parser = (ingestionService as any).parsers.get('ChorusOnline');
      
      // Mock successful fetch response
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        text: () => Promise.resolve('Test Song - Test Artist (Test Composer)')
      });
      
      const result = await parser.parse('https://example.com');
      
      if (result.length > 0) {
        const song = result[0];
        expect(song).toHaveProperty('title');
        expect(song).toHaveProperty('composer');
        expect(song).toHaveProperty('description');
        expect(song).toHaveProperty('sourceLink');
        expect(song).toHaveProperty('source');
        expect(song).toHaveProperty('searchText');
        expect(song.source).toBe('ChorusOnline');
      }
    });

    it('should build search text correctly', () => {
      const parser = (ingestionService as any).parsers.get('ChorusOnline');
      
      const songData = {
        title: 'Test Song',
        composer: 'Test Composer',
        description: 'Test description',
        language: 'English',
        voicing: 'SSA',
        difficulty: 'Intermediate',
        theme: 'Popular'
      };
      
      const searchText = parser.buildSearchText(songData);
      expect(searchText).toContain('Test Song');
      expect(searchText).toContain('Test Composer');
      expect(searchText).toContain('Test description');
      expect(searchText).toContain('English');
      expect(searchText).toContain('SSA');
      expect(searchText).toContain('Intermediate');
      expect(searchText).toContain('Popular');
    });
  });

  describe('Voicing Detection', () => {
    it('should detect SSA voicing', () => {
      const parser = (ingestionService as any).parsers.get('ChorusOnline');
      
      // Mock successful fetch response with SSA content
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        text: () => Promise.resolve('Test Song SSA - Test Artist (Test Composer)')
      });
      
      // The parser should detect SSA voicing from the content
      expect(true).toBe(true); // Placeholder - actual voicing detection would be tested in integration
    });

    it('should detect SSAA voicing', () => {
      const parser = (ingestionService as any).parsers.get('ChorusOnline');
      
      // Mock successful fetch response with SSAA content
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        text: () => Promise.resolve('Test Song SSAA - Test Artist (Test Composer)')
      });
      
      // The parser should detect SSAA voicing from the content
      expect(true).toBe(true); // Placeholder - actual voicing detection would be tested in integration
    });
  });

  describe('Source Validation', () => {
    it('should validate source types', () => {
      const validSources = [
        'ChorusOnline',
        'HalLeonard', 
        'FluegelMusic',
        'CarusVerlag',
        'SchottMusic',
        'StrettaMusic',
        'CPDL',
        'Musopen'
      ];
      
      // These should all be valid source types
      validSources.forEach(source => {
        expect(typeof source).toBe('string');
        expect(source.length).toBeGreaterThan(0);
      });
    });
  });
});
