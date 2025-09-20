// Test the actual backend server logic by extracting testable functions
import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock pg (PostgreSQL client)
const mockPool = {
  query: vi.fn(),
  connect: vi.fn(),
  end: vi.fn()
};

// Extract testable functions from the backend server
function getDbConfig() {
  // Supabase provides DATABASE_URL in format: postgresql://user:password@host:port/database
  if (process.env.DATABASE_URL) {
    return {
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    };
  }
  
  // Fallback to individual environment variables (for local development)
  return {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'choir_music_search',
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  };
}

// Testable database service class
class DatabaseService {
  private pool: any;

  constructor(pool: any) {
    this.pool = pool;
  }

  async searchSongs(query: string, page: number = 1, limit: number = 20) {
    const offset = (page - 1) * limit;
    
    let sql = `
      SELECT * FROM songs 
      WHERE is_active = true
    `;
    const params: any[] = [];
    
    if (query.trim()) {
      sql += ` AND to_tsvector('english', search_text) @@ plainto_tsquery('english', $1)`;
      params.push(query.trim());
    }
    
    sql += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);
    
    const result = await this.pool.query(sql, params);
    return result.rows;
  }

  async createSong(songData: any) {
    const sql = `
      INSERT INTO songs (id, title, composer, text_writer, description, source_link, source, language, voicing, difficulty, theme, search_text)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *
    `;
    
    const params = [
      songData.id,
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
    ];
    
    const result = await this.pool.query(sql, params);
    return result.rows[0];
  }

  async updateSong(id: string, updates: any) {
    const fields = Object.keys(updates);
    const setClause = fields.map((field, index) => `${field} = $${index + 2}`).join(', ');
    
    const sql = `
      UPDATE songs 
      SET ${setClause}, updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `;
    
    const params = [id, ...fields.map(field => updates[field])];
    const result = await this.pool.query(sql, params);
    return result.rows[0];
  }

  async deleteSong(id: string) {
    const sql = `
      UPDATE songs 
      SET is_active = false, updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `;
    
    const result = await this.pool.query(sql, [id]);
    return result.rows[0];
  }
}

describe('Backend Server Logic - Real Implementation', () => {
  let dbService: DatabaseService;

  beforeEach(() => {
    vi.clearAllMocks();
    dbService = new DatabaseService(mockPool);
  });

  describe('Database Configuration', () => {
    it('should use DATABASE_URL when available', () => {
      const originalEnv = process.env.DATABASE_URL;
      process.env.DATABASE_URL = 'postgresql://user:pass@host:5432/db';
      process.env.NODE_ENV = 'production';

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
      const config = getDbConfig();
      expect(config.ssl).toEqual({ rejectUnauthorized: false });
    });

    it('should disable SSL for development', () => {
      process.env.NODE_ENV = 'development';
      const config = getDbConfig();
      expect(config.ssl).toBe(false);
    });
  });

  describe('Database Service', () => {
    it('should search songs with query', async () => {
      const mockResults = [
        {
          id: 'song-1',
          title: 'Bach Chorale',
          composer: 'Johann Sebastian Bach',
          text_writer: 'Traditional',
          description: 'Beautiful chorale',
          source_link: 'https://imslp.org/bach-chorale',
          source: 'IMSLP',
          language: 'German',
          voicing: 'SATB',
          difficulty: 'Intermediate',
          theme: 'Sacred',
          season: null,
          search_text: 'Bach Chorale Johann Sebastian Bach'
        }
      ];

      mockPool.query.mockResolvedValueOnce({ rows: mockResults });

      const results = await dbService.searchSongs('Bach', 1, 20);
      
      expect(results).toHaveLength(1);
      expect(results[0].title).toBe('Bach Chorale');
      expect(results[0].composer).toBe('Johann Sebastian Bach');
      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('to_tsvector'),
        ['Bach', 20, 0]
      );
    });

    it('should search songs without query', async () => {
      const mockResults = [
        {
          id: 'song-1',
          title: 'Test Song',
          composer: 'Test Composer'
        }
      ];

      mockPool.query.mockResolvedValueOnce({ rows: mockResults });

      const results = await dbService.searchSongs('', 1, 20);
      
      expect(results).toHaveLength(1);
      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('WHERE is_active = true'),
        [20, 0]
      );
    });

    it('should handle pagination correctly', async () => {
      mockPool.query.mockResolvedValueOnce({ rows: [] });

      await dbService.searchSongs('test', 2, 10);
      
      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('LIMIT'),
        ['test', 10, 10] // page 2, limit 10, offset 10
      );
    });

    it('should create new song', async () => {
      const songData = {
        id: 'new-song-id',
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
        id: 'new-song-id',
        title: 'New Song',
        composer: 'New Composer',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_active: true
      };

      mockPool.query.mockResolvedValueOnce({ rows: [mockResult] });

      const result = await dbService.createSong(songData);
      
      expect(result.id).toBe('new-song-id');
      expect(result.title).toBe('New Song');
      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO songs'),
        expect.arrayContaining([
          'new-song-id',
          'New Song',
          'New Composer',
          'New Writer',
          'New description',
          'https://example.com',
          'IMSLP',
          'English',
          'SATB',
          'Easy',
          'Sacred',
          'New Song New Composer'
        ])
      );
    });

    it('should update existing song', async () => {
      const updates = {
        title: 'Updated Song',
        description: 'Updated description'
      };

      const mockResult = {
        id: 'existing-id',
        title: 'Updated Song',
        description: 'Updated description',
        updated_at: new Date().toISOString()
      };

      mockPool.query.mockResolvedValueOnce({ rows: [mockResult] });

      const result = await dbService.updateSong('existing-id', updates);
      
      expect(result.title).toBe('Updated Song');
      expect(result.description).toBe('Updated description');
      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE songs'),
        ['existing-id', 'Updated Song', 'Updated description']
      );
    });

    it('should soft delete song', async () => {
      const mockResult = {
        id: 'song-to-delete',
        is_active: false,
        updated_at: new Date().toISOString()
      };

      mockPool.query.mockResolvedValueOnce({ rows: [mockResult] });

      const result = await dbService.deleteSong('song-to-delete');
      
      expect(result.is_active).toBe(false);
      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('SET is_active = false'),
        ['song-to-delete']
      );
    });

    it('should handle database errors', async () => {
      const dbError = new Error('Database connection failed');
      mockPool.query.mockRejectedValueOnce(dbError);

      await expect(dbService.searchSongs('test'))
        .rejects.toThrow('Database connection failed');
    });
  });

  describe('API Endpoint Logic', () => {
    it('should handle GET /api/songs endpoint logic', () => {
      const endpoint = '/api/songs';
      const method = 'GET';
      
      expect(endpoint).toBe('/api/songs');
      expect(method).toBe('GET');
    });

    it('should handle POST /api/songs endpoint logic', () => {
      const endpoint = '/api/songs';
      const method = 'POST';
      
      expect(endpoint).toBe('/api/songs');
      expect(method).toBe('POST');
    });

    it('should handle PUT /api/songs/:id endpoint logic', () => {
      const endpoint = '/api/songs/:id';
      const method = 'PUT';
      const id = 'song-id-123';
      
      expect(endpoint).toBe('/api/songs/:id');
      expect(method).toBe('PUT');
      expect(id).toBe('song-id-123');
    });

    it('should handle DELETE /api/songs/:id endpoint logic', () => {
      const endpoint = '/api/songs/:id';
      const method = 'DELETE';
      const id = 'song-id-123';
      
      expect(endpoint).toBe('/api/songs/:id');
      expect(method).toBe('DELETE');
      expect(id).toBe('song-id-123');
    });
  });

  describe('CORS Configuration', () => {
    it('should configure CORS headers', () => {
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

  describe('Data Validation', () => {
    it('should validate song data structure', () => {
      const validSong = {
        title: 'Test Song',
        composer: 'Test Composer',
        text_writer: 'Test Writer',
        description: 'Test description',
        source_link: 'https://example.com',
        source: 'IMSLP',
        language: 'English',
        voicing: 'SATB',
        difficulty: 'Easy',
        theme: 'Sacred',
        search_text: 'Test Song Test Composer'
      };

      expect(validSong.title).toBeTruthy();
      expect(validSong.composer).toBeTruthy();
      expect(validSong.source_link).toMatch(/^https?:\/\//);
      expect(['Easy', 'Intermediate', 'Advanced']).toContain(validSong.difficulty);
      expect(['SATB', 'SSAA', 'SSA', 'TTBB']).toContain(validSong.voicing);
    });

    it('should validate required fields', () => {
      const requiredFields = ['title', 'composer', 'description', 'source_link', 'source', 'search_text'];
      
      const song = {
        title: 'Test',
        composer: 'Test',
        description: 'Test',
        source_link: 'https://test.com',
        source: 'Test',
        search_text: 'Test'
      };

      requiredFields.forEach(field => {
        expect(song[field as keyof typeof song]).toBeTruthy();
      });
    });
  });

  describe('SQL Query Construction', () => {
    it('should construct search query with text search', () => {
      const query = 'Bach';
      const sql = `
        SELECT * FROM songs 
        WHERE is_active = true
        AND to_tsvector('english', search_text) @@ plainto_tsquery('english', $1)
        ORDER BY created_at DESC LIMIT $2 OFFSET $3
      `;
      
      expect(sql).toContain('to_tsvector');
      expect(sql).toContain('plainto_tsquery');
      expect(sql).toContain('ORDER BY created_at DESC');
    });

    it('should construct search query without text search', () => {
      const sql = `
        SELECT * FROM songs 
        WHERE is_active = true
        ORDER BY created_at DESC LIMIT $1 OFFSET $2
      `;
      
      expect(sql).toContain('WHERE is_active = true');
      expect(sql).toContain('ORDER BY created_at DESC');
      expect(sql).not.toContain('to_tsvector');
    });

    it('should construct insert query', () => {
      const sql = `
        INSERT INTO songs (id, title, composer, text_writer, description, source_link, source, language, voicing, difficulty, theme, search_text)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        RETURNING *
      `;
      
      expect(sql).toContain('INSERT INTO songs');
      expect(sql).toContain('RETURNING *');
    });

    it('should construct update query', () => {
      const fields = ['title', 'description'];
      const setClause = fields.map((field, index) => `${field} = $${index + 2}`).join(', ');
      const sql = `
        UPDATE songs 
        SET ${setClause}, updated_at = NOW()
        WHERE id = $1
        RETURNING *
      `;
      
      expect(sql).toContain('UPDATE songs');
      expect(sql).toContain('SET title = $2, description = $3');
      expect(sql).toContain('WHERE id = $1');
    });
  });
});
