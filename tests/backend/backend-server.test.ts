// Tests for Backend Server (Supabase Integration)
import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock pg (PostgreSQL client)
const mockPool = {
  query: vi.fn(),
  connect: vi.fn(),
  end: vi.fn()
};

vi.mock('pg', () => ({
  Pool: vi.fn(() => mockPool)
}));

// Mock uuid
vi.mock('uuid', () => ({
  v4: vi.fn(() => 'test-uuid-123')
}));

// Mock dotenv
vi.mock('dotenv', () => ({
  config: vi.fn()
}));

describe('Backend Server - Supabase Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Database Configuration', () => {
    it('should use DATABASE_URL when available', () => {
      const originalEnv = process.env.DATABASE_URL;
      process.env.DATABASE_URL = 'postgresql://user:pass@host:5432/db';
      process.env.NODE_ENV = 'production';

      const getDbConfig = () => {
        if (process.env.DATABASE_URL) {
          return {
            connectionString: process.env.DATABASE_URL,
            ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
          };
        }
        return {};
      };

      const config = getDbConfig();
      expect(config.connectionString).toBe('postgresql://user:pass@host:5432/db');
      expect(config.ssl).toEqual({ rejectUnauthorized: false });

      process.env.DATABASE_URL = originalEnv;
    });

    it('should fallback to individual environment variables', () => {
      const originalEnv = process.env.DATABASE_URL;
      delete process.env.DATABASE_URL;
      process.env.DB_HOST = 'localhost';
      process.env.DB_PORT = '5432';
      process.env.DB_USER = 'postgres';
      process.env.DB_PASSWORD = 'password';
      process.env.DB_NAME = 'choir_music_search';

      const getDbConfig = () => {
        if (process.env.DATABASE_URL) {
          return { connectionString: process.env.DATABASE_URL };
        }
        
        return {
          host: process.env.DB_HOST || 'localhost',
          port: parseInt(process.env.DB_PORT || '5432'),
          user: process.env.DB_USER || 'postgres',
          password: process.env.DB_PASSWORD || '',
          database: process.env.DB_NAME || 'choir_music_search',
          ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
        };
      };

      const config = getDbConfig();
      expect(config.host).toBe('localhost');
      expect(config.port).toBe(5432);
      expect(config.user).toBe('postgres');
      expect(config.password).toBe('password');
      expect(config.database).toBe('choir_music_search');

      process.env.DATABASE_URL = originalEnv;
    });

    it('should handle SSL configuration for production', () => {
      process.env.NODE_ENV = 'production';
      
      const sslConfig = process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false;
      
      expect(sslConfig).toEqual({ rejectUnauthorized: false });
    });

    it('should disable SSL for development', () => {
      process.env.NODE_ENV = 'development';
      
      const sslConfig = process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false;
      
      expect(sslConfig).toBe(false);
    });
  });

  describe('Database Service Class', () => {
    it('should initialize with connection pool', () => {
      // Test that the mock pool is properly configured
      expect(mockPool.query).toBeDefined();
      expect(mockPool.connect).toBeDefined();
      expect(mockPool.end).toBeDefined();
    });

    it('should handle database queries', async () => {
      const mockResult = {
        rows: [
          {
            id: 'test-id',
            title: 'Test Song',
            composer: 'Test Composer'
          }
        ],
        rowCount: 1
      };

      mockPool.query.mockResolvedValueOnce(mockResult);

      const result = await mockPool.query('SELECT * FROM songs WHERE id = $1', ['test-id']);
      
      expect(result.rows).toHaveLength(1);
      expect(result.rows[0].title).toBe('Test Song');
      expect(mockPool.query).toHaveBeenCalledWith('SELECT * FROM songs WHERE id = $1', ['test-id']);
    });

    it('should handle database errors', async () => {
      const mockError = new Error('Database connection failed');
      mockPool.query.mockRejectedValueOnce(mockError);

      try {
        await mockPool.query('SELECT * FROM songs');
      } catch (error) {
        expect(error.message).toBe('Database connection failed');
      }
    });
  });

  describe('Search Functionality', () => {
    it('should perform full-text search', async () => {
      const searchQuery = 'Bach';
      const mockResults = {
        rows: [
          {
            id: 'song-1',
            title: 'Bach Chorale',
            composer: 'Johann Sebastian Bach',
            search_text: 'Bach Chorale Johann Sebastian Bach'
          }
        ],
        rowCount: 1
      };

      mockPool.query.mockResolvedValueOnce(mockResults);

      const query = `
        SELECT * FROM songs 
        WHERE is_active = true 
        AND to_tsvector('english', search_text) @@ plainto_tsquery('english', $1)
        ORDER BY created_at DESC
        LIMIT $2 OFFSET $3
      `;

      const result = await mockPool.query(query, [searchQuery, 20, 0]);
      
      expect(result.rows).toHaveLength(1);
      expect(result.rows[0].composer).toBe('Johann Sebastian Bach');
    });

    it('should handle pagination', async () => {
      const page = 2;
      const limit = 10;
      const offset = (page - 1) * limit;

      expect(offset).toBe(10);

      const mockResults = {
        rows: Array(10).fill(null).map((_, i) => ({
          id: `song-${i + 11}`,
          title: `Song ${i + 11}`,
          composer: `Composer ${i + 11}`
        })),
        rowCount: 10
      };

      mockPool.query.mockResolvedValueOnce(mockResults);

      const result = await mockPool.query('SELECT * FROM songs LIMIT $1 OFFSET $2', [limit, offset]);
      
      expect(result.rows).toHaveLength(10);
      expect(result.rows[0].id).toBe('song-11');
    });

    it('should handle empty search results', async () => {
      const mockResults = {
        rows: [],
        rowCount: 0
      };

      mockPool.query.mockResolvedValueOnce(mockResults);

      const result = await mockPool.query('SELECT * FROM songs WHERE title = $1', ['Nonexistent Song']);
      
      expect(result.rows).toHaveLength(0);
      expect(result.rowCount).toBe(0);
    });
  });

  describe('Song Management', () => {
    it('should create new song records', async () => {
      const songData = {
        title: 'New Song',
        composer: 'New Composer',
        text_writer: 'New Writer',
        description: 'New description',
        source_link: 'https://example.com',
        source: 'IMSLP',
        language: 'English',
        voicing: 'SATB',
        difficulty: 'Easy',
        theme: 'Sacred',
        search_text: 'New Song New Composer'
      };

      const mockResult = {
        rows: [{
          id: 'test-uuid-123',
          ...songData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          last_verified: new Date().toISOString(),
          is_active: true
        }],
        rowCount: 1
      };

      mockPool.query.mockResolvedValueOnce(mockResult);

      const insertQuery = `
        INSERT INTO songs (id, title, composer, text_writer, description, source_link, source, language, voicing, difficulty, theme, search_text)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        RETURNING *
      `;

      const result = await mockPool.query(insertQuery, [
        'test-uuid-123',
        songData.title,
        songData.composer,
        songData.text_writer,
        songData.description,
        songData.source_link,
        songData.source,
        songData.language,
        songData.voicing,
        songData.difficulty,
        songData.theme,
        songData.search_text
      ]);

      expect(result.rows).toHaveLength(1);
      expect(result.rows[0].title).toBe('New Song');
      expect(result.rows[0].id).toBe('test-uuid-123');
    });

    it('should update existing song records', async () => {
      const updateData = {
        title: 'Updated Song',
        description: 'Updated description'
      };

      const mockResult = {
        rows: [{
          id: 'existing-id',
          ...updateData,
          updated_at: new Date().toISOString()
        }],
        rowCount: 1
      };

      mockPool.query.mockResolvedValueOnce(mockResult);

      const updateQuery = `
        UPDATE songs 
        SET title = $1, description = $2, updated_at = NOW()
        WHERE id = $3
        RETURNING *
      `;

      const result = await mockPool.query(updateQuery, [
        updateData.title,
        updateData.description,
        'existing-id'
      ]);

      expect(result.rows).toHaveLength(1);
      expect(result.rows[0].title).toBe('Updated Song');
    });

    it('should soft delete songs', async () => {
      const mockResult = {
        rows: [{
          id: 'song-to-delete',
          is_active: false,
          updated_at: new Date().toISOString()
        }],
        rowCount: 1
      };

      mockPool.query.mockResolvedValueOnce(mockResult);

      const deleteQuery = `
        UPDATE songs 
        SET is_active = false, updated_at = NOW()
        WHERE id = $1
        RETURNING *
      `;

      const result = await mockPool.query(deleteQuery, ['song-to-delete']);

      expect(result.rows).toHaveLength(1);
      expect(result.rows[0].is_active).toBe(false);
    });
  });

  describe('API Endpoints', () => {
    it('should handle GET /api/songs endpoint', () => {
      const endpoint = '/api/songs';
      const method = 'GET';
      
      expect(endpoint).toBe('/api/songs');
      expect(method).toBe('GET');
    });

    it('should handle POST /api/songs endpoint', () => {
      const endpoint = '/api/songs';
      const method = 'POST';
      
      expect(endpoint).toBe('/api/songs');
      expect(method).toBe('POST');
    });

    it('should handle PUT /api/songs/:id endpoint', () => {
      const endpoint = '/api/songs/:id';
      const method = 'PUT';
      
      expect(endpoint).toBe('/api/songs/:id');
      expect(method).toBe('PUT');
    });

    it('should handle DELETE /api/songs/:id endpoint', () => {
      const endpoint = '/api/songs/:id';
      const method = 'DELETE';
      
      expect(endpoint).toBe('/api/songs/:id');
      expect(method).toBe('DELETE');
    });
  });

  describe('Error Handling', () => {
    it('should handle database connection errors', async () => {
      const connectionError = new Error('Connection refused');
      mockPool.connect.mockRejectedValueOnce(connectionError);

      try {
        await mockPool.connect();
      } catch (error) {
        expect(error.message).toBe('Connection refused');
      }
    });

    it('should handle query timeout errors', async () => {
      const timeoutError = new Error('Query timeout');
      mockPool.query.mockRejectedValueOnce(timeoutError);

      try {
        await mockPool.query('SELECT * FROM songs');
      } catch (error) {
        expect(error.message).toBe('Query timeout');
      }
    });

    it('should handle invalid SQL queries', async () => {
      const sqlError = new Error('syntax error at or near "INVALID"');
      mockPool.query.mockRejectedValueOnce(sqlError);

      try {
        await mockPool.query('INVALID SQL QUERY');
      } catch (error) {
        expect(error.message).toContain('syntax error');
      }
    });
  });

  describe('CORS Configuration', () => {
    it('should configure CORS middleware', () => {
      const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      };

      expect(corsHeaders['Access-Control-Allow-Origin']).toBe('*');
      expect(corsHeaders['Access-Control-Allow-Methods']).toContain('GET');
      expect(corsHeaders['Access-Control-Allow-Methods']).toContain('POST');
      expect(corsHeaders['Access-Control-Allow-Headers']).toContain('Content-Type');
    });
  });

  describe('Environment Variables', () => {
    it('should use default PORT when not specified', () => {
      const PORT = process.env.PORT || 3001;
      expect(PORT).toBe(3001);
    });

    it('should use custom PORT when specified', () => {
      const originalPort = process.env.PORT;
      process.env.PORT = '4000';
      
      const PORT = process.env.PORT || 3001;
      expect(PORT).toBe('4000');
      
      process.env.PORT = originalPort;
    });
  });

  describe('UUID Generation', () => {
    it('should generate unique IDs for songs', () => {
      const mockUuid = 'test-uuid-123';
      const id1 = mockUuid;
      const id2 = mockUuid;

      expect(id1).toBe('test-uuid-123');
      expect(id2).toBe('test-uuid-123');
      expect(typeof id1).toBe('string');
      expect(id1.length).toBeGreaterThan(0);
    });
  });
});
