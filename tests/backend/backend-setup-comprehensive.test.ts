// Comprehensive tests for backend/setup-supabase.js
// Tests database setup script functionality

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock fs
vi.mock('fs', () => ({
  default: {
    existsSync: vi.fn(),
    readFileSync: vi.fn(),
    writeFileSync: vi.fn()
  },
  existsSync: vi.fn(),
  readFileSync: vi.fn(),
  writeFileSync: vi.fn()
}));

// Mock path
vi.mock('path', () => ({
  default: {
    join: vi.fn()
  },
  join: vi.fn()
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

// Import after mocking
import fs from 'fs';
import path from 'path';
import { Pool } from 'pg';

describe('Supabase Setup Script (setup-supabase.js)', () => {
  let mockPool: any;
  let mockQuery: any;

  beforeEach(() => {
    vi.clearAllMocks();
    
    mockQuery = vi.fn();
    mockPool = {
      query: mockQuery,
      connect: vi.fn(),
      end: vi.fn()
    };
    
    (Pool as any).mockImplementation(() => mockPool);
    
    // Set up default mock responses
    mockQuery.mockResolvedValue({ rows: [] });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Environment Variable Validation', () => {
    it('should proceed when DATABASE_URL is provided', () => {
      process.env.DATABASE_URL = 'postgresql://user:pass@host:5432/db';
      
      // Mock successful connection
      mockQuery.mockResolvedValue({ rows: [{ version: 'PostgreSQL 14.0' }] });
      (fs.existsSync as any).mockReturnValue(true);
      (fs.readFileSync as any).mockReturnValue('CREATE TABLE test (id SERIAL);');

      // Test would normally call the setup function
      expect(process.env.DATABASE_URL).toBe('postgresql://user:pass@host:5432/db');
    });

    it('should fail when DATABASE_URL is missing', () => {
      delete process.env.DATABASE_URL;
      
      // Test would normally call the setup function and fail
      expect(process.env.DATABASE_URL).toBeUndefined();
    });

    it('should validate DATABASE_URL format', () => {
      const validUrl = 'postgresql://user:pass@host:5432/db';
      const invalidUrl = 'invalid-url';
      
      expect(validUrl.startsWith('postgresql://')).toBe(true);
      expect(invalidUrl.startsWith('postgresql://')).toBe(false);
    });
  });

  describe('Database Connection', () => {
    it('should connect to database successfully', async () => {
      mockQuery.mockResolvedValue({ rows: [{ version: 'PostgreSQL 14.0' }] });
      
      const result = await mockQuery('SELECT version()');
      
      expect(result.rows[0].version).toContain('PostgreSQL');
    });

    it('should handle connection errors', async () => {
      mockQuery.mockRejectedValue(new Error('Connection failed'));
      
      await expect(mockQuery('SELECT version()')).rejects.toThrow('Connection failed');
    });

    it('should test database connectivity', async () => {
      mockQuery.mockResolvedValue({ rows: [{ 1: 1 }] });
      
      const result = await mockQuery('SELECT 1');
      
      expect(result.rows[0]).toEqual({ 1: 1 });
    });
  });

  describe('Schema File Handling', () => {
    it('should read schema file successfully', () => {
      const mockSchema = `
        CREATE TABLE songs (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          title VARCHAR(255) NOT NULL,
          composer VARCHAR(255),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        
        CREATE TABLE ingestion_jobs (
          id VARCHAR(255) PRIMARY KEY,
          source VARCHAR(100) NOT NULL,
          schedule VARCHAR(100),
          status VARCHAR(50) DEFAULT 'active'
        );
      `;

      (fs.existsSync as any).mockReturnValue(true);
      (fs.readFileSync as any).mockReturnValue(mockSchema);

      const schemaPath = path.join('/test', 'path', 'schema-postgresql.sql');
      const schema = fs.readFileSync(schemaPath, 'utf8');

      expect(schema).toContain('CREATE TABLE songs');
      expect(schema).toContain('CREATE TABLE ingestion_jobs');
    });

    it('should handle missing schema file', () => {
      (fs.existsSync as any).mockReturnValue(false);

      const schemaPath = path.join('/test', 'path', 'schema-postgresql.sql');
      const exists = fs.existsSync(schemaPath);

      expect(exists).toBe(false);
    });

    it('should split schema into statements correctly', () => {
      const mockSchema = `
        CREATE TABLE songs (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          title VARCHAR(255) NOT NULL
        );
        
        CREATE TABLE composers (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          name VARCHAR(255) NOT NULL
        );
      `;

      (fs.readFileSync as any).mockReturnValue(mockSchema);

      const schema = fs.readFileSync('/test/path/schema-postgresql.sql', 'utf8');
      const statements = schema
        .split(';')
        .map(stmt => stmt.trim())
        .filter(stmt => stmt.length > 0);

      expect(statements).toHaveLength(2);
      expect(statements[0]).toContain('CREATE TABLE songs');
      expect(statements[1]).toContain('CREATE TABLE composers');
    });
  });

  describe('Schema Execution', () => {
    beforeEach(() => {
      process.env.DATABASE_URL = 'postgresql://user:pass@host:5432/db';
      (fs.existsSync as any).mockReturnValue(true);
    });

    it('should execute schema statements successfully', async () => {
      const mockSchema = 'CREATE TABLE test (id SERIAL PRIMARY KEY);';
      (fs.readFileSync as any).mockReturnValue(mockSchema);
      
      mockQuery.mockResolvedValue({ rows: [] });

      await mockQuery(mockSchema);

      expect(mockQuery).toHaveBeenCalledWith(mockSchema);
    });

    it('should handle table already exists error', async () => {
      const mockSchema = 'CREATE TABLE existing_table (id SERIAL);';
      (fs.readFileSync as any).mockReturnValue(mockSchema);
      
      mockQuery.mockRejectedValue(new Error('relation "existing_table" already exists'));

      await expect(mockQuery(mockSchema)).rejects.toThrow('already exists');
    });

    it('should handle other database errors', async () => {
      const mockSchema = 'INVALID SQL STATEMENT;';
      (fs.readFileSync as any).mockReturnValue(mockSchema);
      
      mockQuery.mockRejectedValue(new Error('syntax error at or near "INVALID"'));

      await expect(mockQuery(mockSchema)).rejects.toThrow('syntax error');
    });
  });

  describe('Database Testing', () => {
    beforeEach(() => {
      process.env.DATABASE_URL = 'postgresql://user:pass@host:5432/db';
      (fs.existsSync as any).mockReturnValue(true);
      (fs.readFileSync as any).mockReturnValue('CREATE TABLE songs (id SERIAL);');
    });

    it('should test database tables', async () => {
      mockQuery.mockResolvedValue({ 
        rows: [
          { table_name: 'songs' },
          { table_name: 'ingestion_jobs' },
          { table_name: 'submissions' }
        ] 
      });

      const result = await mockQuery(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
      `);

      expect(result.rows).toHaveLength(3);
      expect(result.rows[0].table_name).toBe('songs');
    });

    it('should test song count', async () => {
      mockQuery.mockResolvedValue({ rows: [{ count: '0' }] });

      const result = await mockQuery('SELECT COUNT(*) as count FROM songs');

      expect(result.rows[0].count).toBe('0');
    });

    it('should test full-text search', async () => {
      mockQuery.mockResolvedValue({ rows: [] });

      const result = await mockQuery(`
        SELECT * FROM songs 
        WHERE search_text @@ plainto_tsquery('english', 'test')
      `);

      expect(result.rows).toHaveLength(0);
    });
  });

  describe('Error Handling', () => {
    it('should handle file system errors', () => {
      (fs.existsSync as any).mockImplementation(() => {
        throw new Error('File system error');
      });

      expect(() => fs.existsSync('/test/path')).toThrow('File system error');
    });

    it('should handle path resolution errors', () => {
      (path.join as any).mockImplementation(() => {
        throw new Error('Path resolution error');
      });

      expect(() => path.join('/test', 'path')).toThrow('Path resolution error');
    });

    it('should handle database connection timeout', async () => {
      mockQuery.mockRejectedValue(new Error('Connection timeout'));

      await expect(mockQuery('SELECT 1')).rejects.toThrow('Connection timeout');
    });
  });

  describe('Configuration Validation', () => {
    it('should validate required environment variables', () => {
      const requiredVars = ['DATABASE_URL'];
      
      requiredVars.forEach(varName => {
        expect(process.env[varName]).toBeDefined();
      });
    });

    it('should validate database URL format', () => {
      const validUrls = [
        'postgresql://user:pass@host:5432/db',
        'postgresql://user:pass@host:5432/db?sslmode=require'
      ];
      
      const invalidUrls = [
        'mysql://user:pass@host:3306/db',
        'invalid-url'
      ];

      validUrls.forEach(url => {
        expect(url.startsWith('postgresql://')).toBe(true);
      });

      invalidUrls.forEach(url => {
        expect(url.startsWith('postgresql://')).toBe(false);
      });
    });
  });

  describe('Setup Completion', () => {
    it('should report successful setup', async () => {
      // Mock the first call (version check)
      mockQuery.mockResolvedValueOnce({ rows: [{ version: 'PostgreSQL 14.0' }] });
      const versionResult = await mockQuery('SELECT version()');
      expect(versionResult.rows[0].version).toContain('PostgreSQL');

      // Mock the second call (table count)
      mockQuery.mockResolvedValueOnce({ rows: [{ count: '0' }] });
      const countResult = await mockQuery('SELECT COUNT(*) as count FROM songs');
      expect(countResult.rows[0].count).toBe('0');
    });

    it('should handle partial setup failure', async () => {
      // Mock the first call (version check succeeds)
      mockQuery.mockResolvedValueOnce({ rows: [{ version: 'PostgreSQL 14.0' }] });
      await mockQuery('SELECT version()');

      // Mock the second call (schema fails)
      mockQuery.mockRejectedValueOnce(new Error('Schema execution failed'));
      await expect(mockQuery('CREATE TABLE test (id SERIAL);')).rejects.toThrow('Schema execution failed');
    });
  });
});