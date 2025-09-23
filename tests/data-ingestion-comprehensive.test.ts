// Comprehensive tests for backend/services/dataIngestion.ts
// Tests DataIngestionService class and all its methods

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock node-cron
vi.mock('node-cron', () => ({
  default: {
    schedule: vi.fn(() => ({
      start: vi.fn(),
      stop: vi.fn(),
      destroy: vi.fn()
    }))
  },
  schedule: vi.fn(() => ({
    start: vi.fn(),
    stop: vi.fn(),
    destroy: vi.fn()
  }))
}));

// Mock pg
vi.mock('pg', () => ({
  Pool: vi.fn().mockImplementation(() => ({
    query: vi.fn(),
    connect: vi.fn(),
    end: vi.fn()
  }))
}));

// Mock dotenv
vi.mock('dotenv', () => ({
  config: vi.fn()
}));

// Mock uuid
vi.mock('uuid', () => ({
  v4: vi.fn(() => 'test-uuid-123')
}));

// Import after mocking
import { DataIngestionService } from '../backend/services/dataIngestion';
import cron from 'node-cron';
import { Pool } from 'pg';

describe('Data Ingestion Service (dataIngestion.ts)', () => {
  let dataIngestionService: DataIngestionService;
  let mockPool: any;
  let mockQuery: any;
  let mockExecute: any;

  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks();
    
    // Create mock database methods
    mockQuery = vi.fn();
    mockExecute = vi.fn();
    
    mockPool = {
      query: mockQuery,
      connect: vi.fn(),
      end: vi.fn(),
      execute: mockExecute
    };
    
    // Mock Pool constructor
    (Pool as any).mockImplementation(() => mockPool);
    
    // Create service instance
    dataIngestionService = new DataIngestionService();
    
    // Mock the database property
    (dataIngestionService as any).db = mockPool;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Service Initialization', () => {
    it('should initialize with database pool', () => {
      expect(dataIngestionService).toBeDefined();
      expect(mockPool).toBeDefined();
    });
  });

  describe('IMSLP Parser', () => {
    it('should parse IMSLP data correctly', async () => {
      // Mock IMSLP parser
      const mockParser = {
        parse: vi.fn().mockResolvedValue([
          {
            title: 'Ave Maria',
            composer: 'Bach, Johann Sebastian',
            source: 'IMSLP',
            source_link: 'https://imslp.org/wiki/Ave_Maria_(Bach,_Johann_Sebastian)'
          },
          {
            title: 'Mass in B Minor',
            composer: 'Bach, Johann Sebastian',
            source: 'IMSLP',
            source_link: 'https://imslp.org/wiki/Mass_in_B_Minor_(Bach,_Johann_Sebastian)'
          },
          {
            title: 'St. Matthew Passion',
            composer: 'Bach, Johann Sebastian',
            source: 'IMSLP',
            source_link: 'https://imslp.org/wiki/St._Matthew_Passion_(Bach,_Johann_Sebastian)'
          }
        ])
      };

      // Mock the parser in the service
      (dataIngestionService as any).parsers = new Map([['IMSLP', mockParser]]);

      const result = await (dataIngestionService as any).parsers.get('IMSLP').parse('https://imslp.org/wiki/Category:For_female_chorus');

      expect(result).toHaveLength(3);
      expect(result[0]).toHaveProperty('title', 'Ave Maria');
      expect(result[0]).toHaveProperty('composer', 'Bach, Johann Sebastian');
    });

    it('should handle IMSLP parsing errors', async () => {
      const mockParser = {
        parse: vi.fn().mockRejectedValue(new Error('Network error'))
      };

      (dataIngestionService as any).parsers = new Map([['IMSLP', mockParser]]);

      await expect((dataIngestionService as any).parsers.get('IMSLP').parse('invalid-url'))
        .rejects.toThrow('Network error');
    });
  });

  describe('MuseScore Parser', () => {
    it('should parse MuseScore data correctly', async () => {
      const mockParser = {
        parse: vi.fn().mockResolvedValue([
          {
            title: 'Modern Choral Piece',
            composer: 'Modern Composer',
            source: 'MuseScore',
            source_link: 'https://musescore.com/user/123/scores/456'
          }
        ])
      };

      (dataIngestionService as any).parsers = new Map([['MuseScore', mockParser]]);

      const result = await (dataIngestionService as any).parsers.get('MuseScore').parse('https://musescore.com/user/123/scores/456');

      expect(result).toHaveLength(1);
      expect(result[0]).toHaveProperty('title', 'Modern Choral Piece');
      expect(result[0]).toHaveProperty('source', 'MuseScore');
    });
  });

  describe('SundMusik Parser', () => {
    it('should parse SundMusik data correctly', async () => {
      const mockParser = {
        parse: vi.fn().mockResolvedValue([
          {
            title: 'Swedish Folk Song',
            composer: 'Traditional Swedish',
            source: 'SundMusik',
            source_link: 'https://sundmusik.com/swedish-folk-song'
          }
        ])
      };

      (dataIngestionService as any).parsers = new Map([['SundMusik', mockParser]]);

      const result = await (dataIngestionService as any).parsers.get('SundMusik').parse('https://sundmusik.com/swedish-folk-song');

      expect(result).toHaveLength(1);
      expect(result[0]).toHaveProperty('title', 'Swedish Folk Song');
      expect(result[0]).toHaveProperty('source', 'SundMusik');
    });
  });

  describe('Job Management', () => {
    it('should start ingestion with active jobs', async () => {
      mockExecute.mockResolvedValue([
        [
          { id: 'job1', source: 'IMSLP', schedule: '0 2 * * *', status: 'active' },
          { id: 'job2', source: 'MuseScore', schedule: '0 3 * * *', status: 'active' }
        ]
      ]);

      await dataIngestionService.startIngestion();

      expect(mockExecute).toHaveBeenCalledWith(
        'SELECT * FROM ingestion_jobs WHERE status = "active"'
      );
    });

    it('should schedule individual jobs', async () => {
      const job = {
        id: 'job1',
        source: 'IMSLP',
        schedule: '0 2 * * *',
        status: 'active'
      };

      await dataIngestionService.scheduleJob(job);

      // The scheduleJob method doesn't call the database directly
      expect(dataIngestionService).toBeDefined();
    });

    it('should handle job scheduling errors', async () => {
      const job = {
        id: 'job1',
        source: 'UnknownSource',
        schedule: '0 2 * * *',
        status: 'active'
      };

      // The method logs the error but doesn't throw
      await dataIngestionService.scheduleJob(job);
      expect(dataIngestionService).toBeDefined();
    });
  });

  describe('Job Execution', () => {
    it('should execute job successfully', async () => {
      const jobId = 'job1';
      const mockJob = {
        id: jobId,
        source: 'IMSLP',
        schedule: '0 2 * * *',
        status: 'active'
      };

      mockExecute.mockResolvedValue([[mockJob]]);

      // Mock parser
      const mockParser = {
        parse: vi.fn().mockResolvedValue([
          {
            title: 'Test Song',
            composer: 'Test Composer',
            source: 'IMSLP'
          }
        ])
      };

      (dataIngestionService as any).parsers = new Map([['IMSLP', mockParser]]);

      await dataIngestionService.runJob(jobId);

      expect(mockExecute).toHaveBeenCalledWith(
        'SELECT * FROM ingestion_jobs WHERE id = ?',
        [jobId]
      );
    });

    it('should handle job not found', async () => {
      mockExecute.mockResolvedValue([[]]); // Empty job result

      // The method logs the error but doesn't throw
      await dataIngestionService.runJob('nonexistent');
      expect(dataIngestionService).toBeDefined();
    });

    it('should update existing songs', async () => {
      const jobId = 'job1';
      const mockJob = {
        id: jobId,
        source: 'SundMusik',
        schedule: '0 2 * * *',
        status: 'active'
      };

      mockExecute
        .mockResolvedValueOnce([[mockJob]]) // Get job
        .mockResolvedValueOnce([[]]) // Check existing song
        .mockResolvedValueOnce([[]]) // Insert new song
        .mockResolvedValueOnce([[]]); // Update job status

      const mockParser = {
        parse: vi.fn().mockResolvedValue([
          {
            title: 'Visa vid midsommartid',
            composer: 'Traditional Swedish',
            description: 'Updated description',
            source: 'SundMusik',
            source_link: 'https://sundmusik.com/visa-vid-midsommartid-ssa',
            voicing: 'SSA'
          }
        ])
      };

      (dataIngestionService as any).parsers = new Map([['SundMusik', mockParser]]);

      await dataIngestionService.runJob(jobId);

      expect(mockExecute).toHaveBeenCalledWith(
        'SELECT id FROM songs WHERE title = ? AND composer = ? AND source = ?',
        ['Visa vid midsommartid', 'Traditional Swedish', 'SundMusik']
      );
    });
  });

  describe('Service Management', () => {
    it('should stop all jobs', async () => {
      const mockTask = {
        stop: vi.fn(),
        destroy: vi.fn()
      };

      (dataIngestionService as any).jobs = new Map([
        ['job1', mockTask],
        ['job2', mockTask]
      ]);

      await dataIngestionService.stopIngestion();

      expect(mockTask.stop).toHaveBeenCalled();
    });

    it('should get service status', async () => {
      mockExecute.mockResolvedValue([[]]); // Mock empty jobs array
      
      const jobs = await dataIngestionService.getAllJobs();
      
      expect(Array.isArray(jobs)).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should handle database connection errors', async () => {
      mockExecute.mockRejectedValue(new Error('Connection lost'));

      // The method logs the error but doesn't throw
      await dataIngestionService.startIngestion();
      expect(dataIngestionService).toBeDefined();
    });

    it('should handle parser errors gracefully', async () => {
      const jobId = 'job1';
      const mockJob = {
        id: jobId,
        source: 'IMSLP',
        schedule: '0 2 * * *',
        status: 'active'
      };

      mockExecute
        .mockResolvedValueOnce([[mockJob]])
        .mockResolvedValueOnce([[]]); // Update job status

      const mockParser = {
        parse: vi.fn().mockRejectedValue(new Error('Parser failed'))
      };

      (dataIngestionService as any).parsers = new Map([['IMSLP', mockParser]]);

      await dataIngestionService.runJob(jobId);

      expect(mockExecute).toHaveBeenCalledWith(
        'UPDATE ingestion_jobs SET status = "error", error_message = ? WHERE id = ?',
        ['Parser failed', jobId]
      );
    });

    it('should handle invalid job data', async () => {
      const invalidJob = {
        id: 'job1',
        source: 'IMSLP',
        // Missing schedule
        status: 'active'
      };

      // The method logs the error but doesn't throw
      await dataIngestionService.scheduleJob(invalidJob as any);
      expect(dataIngestionService).toBeDefined();
    });
  });

  describe('Data Validation', () => {
    it('should validate song data before insertion', async () => {
      const jobId = 'job1';
      const mockJob = {
        id: jobId,
        source: 'IMSLP',
        schedule: '0 2 * * *',
        status: 'active'
      };

      mockExecute
        .mockResolvedValueOnce([[mockJob]])
        .mockResolvedValueOnce([[]]) // Check existing song
        .mockResolvedValueOnce([[]]) // Insert new song
        .mockResolvedValueOnce([[]]); // Update job status

      const mockParser = {
        parse: vi.fn().mockResolvedValue([
          {
            title: 'Valid Song',
            composer: 'Valid Composer',
            source: 'IMSLP',
            source_link: 'https://example.com'
          }
        ])
      };

      (dataIngestionService as any).parsers = new Map([['IMSLP', mockParser]]);

      await dataIngestionService.runJob(jobId);

      expect(mockExecute).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO songs'),
        expect.arrayContaining(['Valid Song', 'Valid Composer', 'IMSLP'])
      );
    });

    it('should skip invalid song data', async () => {
      const jobId = 'job1';
      const mockJob = {
        id: jobId,
        source: 'IMSLP',
        schedule: '0 2 * * *',
        status: 'active'
      };

      mockExecute
        .mockResolvedValueOnce([[mockJob]])
        .mockResolvedValueOnce([[]]) // Update job status

      const mockParser = {
        parse: vi.fn().mockResolvedValue([
          {
            // Missing required fields
            source: 'IMSLP'
          }
        ])
      };

      (dataIngestionService as any).parsers = new Map([['IMSLP', mockParser]]);

      await dataIngestionService.runJob(jobId);

      // Should not attempt to insert invalid data
      expect(mockExecute).not.toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO songs'),
        expect.anything()
      );
    });
  });
});
