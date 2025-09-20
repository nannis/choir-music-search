// Backend API for Choir Music Search
// Supabase PostgreSQL database integration with full-text search

import express from 'express';
import { Pool } from 'pg';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Load environment variables
require('dotenv').config();

// Database connection configuration
// Support both Supabase DATABASE_URL and individual environment variables
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

const dbConfig = getDbConfig();

// Create connection pool
const pool = new Pool(dbConfig);

// Database service class
class DatabaseService {
  private pool: Pool;

  constructor(pool: Pool) {
    this.pool = pool;
  }

  // Search songs with full-text search and filters
  async searchSongs(query: string, filters: any = {}, page: number = 1, limit: number = 20) {
    const offset = (page - 1) * limit;
    let whereClause = 'WHERE is_active = TRUE';
    const params: any[] = [];
    let paramIndex = 1;

    // Add full-text search if query provided (PostgreSQL syntax)
    if (query && query.trim()) {
      whereClause += ` AND to_tsvector('english', search_text || ' ' || title || ' ' || composer || ' ' || COALESCE(description, '')) @@ plainto_tsquery('english', $${paramIndex})`;
      params.push(query);
      paramIndex++;
    }

    // Add filters (PostgreSQL parameter format)
    if (filters.language) {
      whereClause += ` AND language = $${paramIndex}`;
      params.push(filters.language);
      paramIndex++;
    }
    if (filters.voicing) {
      whereClause += ` AND voicing = $${paramIndex}`;
      params.push(filters.voicing);
      paramIndex++;
    }
    if (filters.difficulty) {
      whereClause += ` AND difficulty = $${paramIndex}`;
      params.push(filters.difficulty);
      paramIndex++;
    }
    if (filters.season) {
      whereClause += ` AND season = $${paramIndex}`;
      params.push(filters.season);
      paramIndex++;
    }
    if (filters.theme) {
      whereClause += ` AND theme = $${paramIndex}`;
      params.push(filters.theme);
      paramIndex++;
    }
    if (filters.source) {
      whereClause += ` AND source = $${paramIndex}`;
      params.push(filters.source);
      paramIndex++;
    }

    // Get total count
    const countQuery = `SELECT COUNT(*) as total FROM songs ${whereClause}`;
    const countResult = await this.pool.query(countQuery, params);
    const total = parseInt(countResult.rows[0].total);

    // Get results with ranking (PostgreSQL syntax)
    const searchQuery = `
      SELECT *, 
        ts_rank(to_tsvector('english', search_text || ' ' || title || ' ' || composer || ' ' || COALESCE(description, '')), plainto_tsquery('english', $1)) as relevance_score
      FROM songs 
      ${whereClause}
      ORDER BY relevance_score DESC, updated_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    const searchParams = query ? [query, ...params, limit, offset] : ['', ...params, limit, offset];
    const searchResult = await this.pool.query(searchQuery, searchParams);

    return {
      results: searchResult.rows,
      total,
      page,
      limit,
      hasMore: offset + limit < total
    };
  }

  // Get song by ID
  async getSongById(id: string) {
    const query = 'SELECT * FROM songs WHERE id = $1 AND is_active = TRUE';
    const result = await this.pool.query(query, [id]);
    return result.rows[0];
  }

  // Add new song
  async addSong(songData: any) {
    const id = uuidv4();
    const searchText = this.buildSearchText(songData);
    
    const query = `
      INSERT INTO songs (id, title, composer, text_writer, description, source_link, audio_link, 
                        source, language, voicing, difficulty, season, theme, period, search_text)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
    `;
    
    const params = [
      id, songData.title, songData.composer, songData.textWriter, songData.description,
      songData.sourceLink, songData.audioLink, songData.source, songData.language,
      songData.voicing, songData.difficulty, songData.season, songData.theme,
      songData.period, searchText
    ];

    await this.pool.query(query, params);
    return id;
  }

  // Update song
  async updateSong(id: string, songData: any) {
    const searchText = this.buildSearchText(songData);
    
    const query = `
      UPDATE songs SET 
        title = $1, composer = $2, text_writer = $3, description = $4, source_link = $5, 
        audio_link = $6, source = $7, language = $8, voicing = $9, difficulty = $10, 
        season = $11, theme = $12, period = $13, search_text = $14, updated_at = CURRENT_TIMESTAMP
      WHERE id = $15
    `;
    
    const params = [
      songData.title, songData.composer, songData.textWriter, songData.description,
      songData.sourceLink, songData.audioLink, songData.source, songData.language,
      songData.voicing, songData.difficulty, songData.season, songData.theme,
      songData.period, searchText, id
    ];

    await this.pool.query(query, params);
  }

  // Submit user contribution
  async submitUserContribution(submission: any) {
    const id = uuidv4();
    
    const query = `
      INSERT INTO user_submissions (id, user_id, title, composer, source_link, description,
                                  language, voicing, difficulty, season, theme)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    `;
    
    const params = [
      id, submission.userId, submission.title, submission.composer, submission.sourceLink,
      submission.description, submission.language, submission.voicing, submission.difficulty,
      submission.season, submission.theme
    ];

    await this.pool.query(query, params);
    return id;
  }

  // Get user submissions
  async getUserSubmissions(status?: string) {
    let query = 'SELECT * FROM user_submissions';
    const params: any[] = [];
    
    if (status) {
      query += ' WHERE status = $1';
      params.push(status);
    }
    
    query += ' ORDER BY submitted_at DESC';
    
    const result = await this.pool.query(query, params);
    return result.rows;
  }

  // Approve user submission
  async approveSubmission(submissionId: string, reviewerId: string) {
    // Get submission
    const submissionResult = await this.pool.query(
      'SELECT * FROM user_submissions WHERE id = $1',
      [submissionId]
    );
    
    const submission = submissionResult.rows[0];
    if (!submission) {
      throw new Error('Submission not found');
    }

    // Add to songs table
    const songId = await this.addSong({
      title: submission.title,
      composer: submission.composer,
      textWriter: null,
      description: submission.description,
      sourceLink: submission.source_link,
      audioLink: null,
      source: 'Other',
      language: submission.language,
      voicing: submission.voicing,
      difficulty: submission.difficulty,
      season: submission.season,
      theme: submission.theme,
      period: null
    });

    // Update submission status
    await this.pool.query(
      'UPDATE user_submissions SET status = $1, reviewed_at = CURRENT_TIMESTAMP, reviewed_by = $2 WHERE id = $3',
      ['approved', reviewerId, submissionId]
    );

    return songId;
  }

  // Build search text for full-text search
  private buildSearchText(songData: any): string {
    const parts = [
      songData.title,
      songData.composer,
      songData.textWriter,
      songData.description,
      songData.language,
      songData.voicing,
      songData.difficulty,
      songData.season,
      songData.theme,
      songData.period
    ].filter(Boolean);
    
    return parts.join(' ');
  }

  // Get search suggestions
  async getSearchSuggestions(query: string, limit: number = 10) {
    const searchQuery = `
      SELECT DISTINCT title, composer, language, voicing, difficulty, season, theme
      FROM songs 
      WHERE is_active = TRUE 
        AND (title ILIKE $1 OR composer ILIKE $1 OR description ILIKE $1)
      ORDER BY 
        CASE 
          WHEN title ILIKE $2 THEN 1
          WHEN composer ILIKE $2 THEN 2
          ELSE 3
        END,
        updated_at DESC
      LIMIT $3
    `;
    
    const searchTerm = `%${query}%`;
    const exactTerm = `${query}%`;
    
    const result = await this.pool.query(searchQuery, [searchTerm, exactTerm, limit]);
    return result.rows;
  }

  // Get filter options
  async getFilterOptions() {
    const query = `
      SELECT 
        COUNT(DISTINCT language) as languages,
        COUNT(DISTINCT voicing) as voicings,
        COUNT(DISTINCT difficulty) as difficulties,
        COUNT(DISTINCT season) as seasons,
        COUNT(DISTINCT theme) as themes,
        COUNT(DISTINCT source) as sources
      FROM songs 
      WHERE is_active = TRUE
    `;
    
    const result = await this.pool.query(query);
    return result.rows[0];
  }

  // Get distinct values for each filter
  async getDistinctValues(field: string) {
    const query = `SELECT DISTINCT ${field} FROM songs WHERE is_active = TRUE AND ${field} IS NOT NULL ORDER BY ${field}`;
    const result = await this.pool.query(query);
    return result.rows.map(row => row[field]);
  }
}

// Initialize database service
const dbService = new DatabaseService(pool);

// API Routes

// Search endpoint
app.get('/api/search', async (req, res) => {
  try {
    const { q: query, ...filters } = req.query;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const result = await dbService.searchSongs(query as string, filters, page, limit);
    res.json(result);
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Search failed' });
  }
});

// Get song by ID
app.get('/api/songs/:id', async (req, res) => {
  try {
    const song = await dbService.getSongById(req.params.id);
    if (!song) {
      return res.status(404).json({ error: 'Song not found' });
    }
    res.json(song);
  } catch (error) {
    console.error('Get song error:', error);
    res.status(500).json({ error: 'Failed to get song' });
  }
});

// Add new song
app.post('/api/songs', async (req, res) => {
  try {
    const songId = await dbService.addSong(req.body);
    res.json({ id: songId, message: 'Song added successfully' });
  } catch (error) {
    console.error('Add song error:', error);
    res.status(500).json({ error: 'Failed to add song' });
  }
});

// Update song
app.put('/api/songs/:id', async (req, res) => {
  try {
    await dbService.updateSong(req.params.id, req.body);
    res.json({ message: 'Song updated successfully' });
  } catch (error) {
    console.error('Update song error:', error);
    res.status(500).json({ error: 'Failed to update song' });
  }
});

// Submit user contribution
app.post('/api/submissions', async (req, res) => {
  try {
    const submissionId = await dbService.submitUserContribution(req.body);
    res.json({ id: submissionId, message: 'Submission received' });
  } catch (error) {
    console.error('Submission error:', error);
    res.status(500).json({ error: 'Failed to submit contribution' });
  }
});

// Get user submissions (admin)
app.get('/api/submissions', async (req, res) => {
  try {
    const status = req.query.status as string;
    const submissions = await dbService.getUserSubmissions(status);
    res.json(submissions);
  } catch (error) {
    console.error('Get submissions error:', error);
    res.status(500).json({ error: 'Failed to get submissions' });
  }
});

// Approve submission (admin)
app.post('/api/submissions/:id/approve', async (req, res) => {
  try {
    const reviewerId = req.body.reviewerId || 'admin';
    const songId = await dbService.approveSubmission(req.params.id, reviewerId);
    res.json({ songId, message: 'Submission approved and added to database' });
  } catch (error) {
    console.error('Approve submission error:', error);
    res.status(500).json({ error: 'Failed to approve submission' });
  }
});

// Get search suggestions
app.get('/api/suggestions', async (req, res) => {
  try {
    const query = req.query.q as string;
    const limit = parseInt(req.query.limit as string) || 10;
    
    if (!query || query.length < 2) {
      return res.json([]);
    }
    
    const suggestions = await dbService.getSearchSuggestions(query, limit);
    res.json(suggestions);
  } catch (error) {
    console.error('Suggestions error:', error);
    res.status(500).json({ error: 'Failed to get suggestions' });
  }
});

// Get filter options
app.get('/api/filters', async (req, res) => {
  try {
    const options = await dbService.getFilterOptions();
    res.json(options);
  } catch (error) {
    console.error('Filter options error:', error);
    res.status(500).json({ error: 'Failed to get filter options' });
  }
});

// Get distinct values for specific filter
app.get('/api/filters/:field', async (req, res) => {
  try {
    const values = await dbService.getDistinctValues(req.params.field);
    res.json(values);
  } catch (error) {
    console.error('Filter values error:', error);
    res.status(500).json({ error: 'Failed to get filter values' });
  }
});

// Health check
app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'healthy', database: 'connected' });
  } catch (error) {
    res.status(500).json({ status: 'unhealthy', database: 'disconnected' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Backend API server running on port ${PORT}`);
  console.log(`Database: ${process.env.DATABASE_URL ? 'Supabase PostgreSQL' : 'Local PostgreSQL'}`);
});

export default app;




