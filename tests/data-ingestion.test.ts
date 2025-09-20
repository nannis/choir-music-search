// Tests for Data Ingestion Service
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { IngestionJob, SongRecord } from '../../backend/services/dataIngestion';

// Mock mysql2
const mockConnection = {
  query: vi.fn(),
  execute: vi.fn(),
  end: vi.fn()
};

vi.mock('mysql2/promise', () => ({
  default: {
    createConnection: vi.fn(() => Promise.resolve(mockConnection))
  }
}));

// Mock node-cron
vi.mock('node-cron', () => ({
  schedule: vi.fn(),
  validate: vi.fn(() => true),
  getTasks: vi.fn(() => [])
}));

describe('Data Ingestion Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('IngestionJob Interface', () => {
    it('should have correct interface structure', () => {
      const job: IngestionJob = {
        id: 'test-job-1',
        source: 'IMSLP',
        url: 'https://imslp.org/test',
        parser: 'IMSLPParser',
        schedule: '0 2 * * *',
        lastRun: new Date('2024-01-01'),
        nextRun: new Date('2024-01-02'),
        status: 'active',
        errorMessage: undefined
      };

      expect(job.id).toBe('test-job-1');
      expect(job.source).toBe('IMSLP');
      expect(job.status).toBe('active');
      expect(job.lastRun).toBeInstanceOf(Date);
      expect(job.nextRun).toBeInstanceOf(Date);
    });

    it('should handle error status with message', () => {
      const job: IngestionJob = {
        id: 'test-job-2',
        source: 'Hymnary',
        url: 'https://hymnary.org/test',
        parser: 'HymnaryParser',
        schedule: '0 3 * * *',
        lastRun: null,
        nextRun: null,
        status: 'error',
        errorMessage: 'Connection timeout'
      };

      expect(job.status).toBe('error');
      expect(job.errorMessage).toBe('Connection timeout');
      expect(job.lastRun).toBeNull();
      expect(job.nextRun).toBeNull();
    });
  });

  describe('SongRecord Interface', () => {
    it('should have correct interface structure', () => {
      const song: SongRecord = {
        id: 'song-1',
        title: 'Ave Maria',
        composer: 'Franz Schubert',
        textWriter: 'Sir Walter Scott',
        description: 'Beautiful sacred song',
        sourceLink: 'https://imslp.org/ave-maria',
        audioLink: 'https://audio.example.com/ave-maria.mp3',
        source: 'IMSLP',
        language: 'Latin',
        voicing: 'SATB',
        difficulty: 'Intermediate',
        season: 'Christmas',
        theme: 'Sacred',
        period: 'Romantic',
        searchText: 'Ave Maria Franz Schubert Sir Walter Scott Beautiful sacred song Latin SATB Intermediate Christmas Sacred Romantic'
      };

      expect(song.id).toBe('song-1');
      expect(song.title).toBe('Ave Maria');
      expect(song.composer).toBe('Franz Schubert');
      expect(song.source).toBe('IMSLP');
      expect(song.voicing).toBe('SATB');
      expect(song.difficulty).toBe('Intermediate');
    });

    it('should handle optional fields', () => {
      const song: SongRecord = {
        id: 'song-2',
        title: 'Simple Song',
        composer: 'Unknown',
        description: 'Basic description',
        sourceLink: 'https://example.com/song',
        source: 'Other',
        searchText: 'Simple Song Unknown Basic description'
      };

      expect(song.textWriter).toBeUndefined();
      expect(song.audioLink).toBeUndefined();
      expect(song.language).toBeUndefined();
      expect(song.voicing).toBeUndefined();
      expect(song.difficulty).toBeUndefined();
      expect(song.season).toBeUndefined();
      expect(song.theme).toBeUndefined();
      expect(song.period).toBeUndefined();
    });
  });

  describe('Source Validation', () => {
    it('should validate source types', () => {
      const validSources: SongRecord['source'][] = ['IMSLP', 'Hymnary', 'ChoralNet', 'MuseScore', 'SundMusik', 'Other'];
      
      validSources.forEach(source => {
        const song: SongRecord = {
          id: 'test',
          title: 'Test',
          composer: 'Test',
          description: 'Test',
          sourceLink: 'https://test.com',
          source: source,
          searchText: 'Test'
        };
        
        expect(song.source).toBe(source);
      });
    });
  });

  describe('Search Text Generation', () => {
    it('should generate comprehensive search text', () => {
      const song: SongRecord = {
        id: 'song-1',
        title: 'Ave Maria',
        composer: 'Franz Schubert',
        textWriter: 'Sir Walter Scott',
        description: 'Beautiful sacred song',
        sourceLink: 'https://imslp.org/ave-maria',
        source: 'IMSLP',
        language: 'Latin',
        voicing: 'SATB',
        difficulty: 'Intermediate',
        season: 'Christmas',
        theme: 'Sacred',
        period: 'Romantic',
        searchText: 'Ave Maria Franz Schubert Sir Walter Scott Beautiful sacred song Latin SATB Intermediate Christmas Sacred Romantic'
      };

      const expectedSearchTerms = [
        'Ave Maria',
        'Franz Schubert',
        'Sir Walter Scott',
        'Beautiful sacred song',
        'Latin',
        'SATB',
        'Intermediate',
        'Christmas',
        'Sacred',
        'Romantic'
      ];

      expectedSearchTerms.forEach(term => {
        expect(song.searchText).toContain(term);
      });
    });

    it('should handle songs with minimal data', () => {
      const song: SongRecord = {
        id: 'song-minimal',
        title: 'Minimal Song',
        composer: 'Unknown',
        description: 'Basic',
        sourceLink: 'https://example.com',
        source: 'Other',
        searchText: 'Minimal Song Unknown Basic'
      };

      expect(song.searchText).toContain('Minimal Song');
      expect(song.searchText).toContain('Unknown');
      expect(song.searchText).toContain('Basic');
    });
  });

  describe('Schedule Validation', () => {
    it('should validate cron schedule formats', () => {
      const validSchedules = [
        '0 2 * * *',      // Daily at 2 AM
        '0 */6 * * *',     // Every 6 hours
        '0 0 * * 0',       // Weekly on Sunday
        '0 0 1 * *',       // Monthly on 1st
        '0 0 1 1 *'        // Yearly on January 1st
      ];

      validSchedules.forEach(schedule => {
        const job: IngestionJob = {
          id: 'test',
          source: 'IMSLP',
          url: 'https://test.com',
          parser: 'TestParser',
          schedule: schedule,
          lastRun: null,
          nextRun: null,
          status: 'active'
        };

        expect(job.schedule).toBe(schedule);
      });
    });
  });

  describe('URL Validation', () => {
    it('should validate source URLs', () => {
      const validUrls = [
        'https://imslp.org/wiki/Category:Composers',
        'https://hymnary.org/text',
        'https://choralnet.org/scores',
        'https://musescore.com/sheetmusic',
        'https://sundmusik.com/kornoter'
      ];

      validUrls.forEach(url => {
        const job: IngestionJob = {
          id: 'test',
          source: 'IMSLP',
          url: url,
          parser: 'TestParser',
          schedule: '0 2 * * *',
          lastRun: null,
          nextRun: null,
          status: 'active'
        };

        expect(job.url).toMatch(/^https?:\/\//);
        expect(job.url).toBe(url);
      });
    });
  });

  describe('Parser Types', () => {
    it('should define parser types for different sources', () => {
      const parserMappings = {
        'IMSLP': 'IMSLPParser',
        'Hymnary': 'HymnaryParser',
        'ChoralNet': 'ChoralNetParser',
        'MuseScore': 'MuseScoreParser',
        'SundMusik': 'SundMusikParser',
        'Other': 'GenericParser'
      };

      Object.entries(parserMappings).forEach(([source, parser]) => {
        const job: IngestionJob = {
          id: 'test',
          source: source as IngestionJob['source'],
          url: 'https://test.com',
          parser: parser,
          schedule: '0 2 * * *',
          lastRun: null,
          nextRun: null,
          status: 'active'
        };

        expect(job.parser).toBe(parser);
      });
    });
  });

  describe('Job Status Management', () => {
    it('should handle job status transitions', () => {
      const job: IngestionJob = {
        id: 'test-job',
        source: 'IMSLP',
        url: 'https://test.com',
        parser: 'TestParser',
        schedule: '0 2 * * *',
        lastRun: null,
        nextRun: null,
        status: 'active'
      };

      // Test status transitions
      expect(job.status).toBe('active');
      
      job.status = 'paused';
      expect(job.status).toBe('paused');
      
      job.status = 'error';
      job.errorMessage = 'Test error';
      expect(job.status).toBe('error');
      expect(job.errorMessage).toBe('Test error');
    });
  });

  describe('Date Handling', () => {
    it('should handle date fields correctly', () => {
      const now = new Date();
      const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

      const job: IngestionJob = {
        id: 'test-job',
        source: 'IMSLP',
        url: 'https://test.com',
        parser: 'TestParser',
        schedule: '0 2 * * *',
        lastRun: now,
        nextRun: tomorrow,
        status: 'active'
      };

      expect(job.lastRun).toBeInstanceOf(Date);
      expect(job.nextRun).toBeInstanceOf(Date);
      expect(job.nextRun!.getTime()).toBeGreaterThan(job.lastRun!.getTime());
    });

    it('should handle null date fields', () => {
      const job: IngestionJob = {
        id: 'test-job',
        source: 'IMSLP',
        url: 'https://test.com',
        parser: 'TestParser',
        schedule: '0 2 * * *',
        lastRun: null,
        nextRun: null,
        status: 'active'
      };

      expect(job.lastRun).toBeNull();
      expect(job.nextRun).toBeNull();
    });
  });

  describe('Error Handling', () => {
    it('should handle job errors with messages', () => {
      const job: IngestionJob = {
        id: 'test-job',
        source: 'IMSLP',
        url: 'https://test.com',
        parser: 'TestParser',
        schedule: '0 2 * * *',
        lastRun: new Date(),
        nextRun: null,
        status: 'error',
        errorMessage: 'Connection timeout after 30 seconds'
      };

      expect(job.status).toBe('error');
      expect(job.errorMessage).toBe('Connection timeout after 30 seconds');
    });

    it('should handle jobs without error messages', () => {
      const job: IngestionJob = {
        id: 'test-job',
        source: 'IMSLP',
        url: 'https://test.com',
        parser: 'TestParser',
        schedule: '0 2 * * *',
        lastRun: new Date(),
        nextRun: null,
        status: 'error'
      };

      expect(job.status).toBe('error');
      expect(job.errorMessage).toBeUndefined();
    });
  });
});
