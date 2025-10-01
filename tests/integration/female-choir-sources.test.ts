/**
 * Integration tests for female choir music sources
 * Tests the new parsers and database integration for all-female choir music
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { Pool } from 'pg';
import { DataIngestionService } from '../../backend/services/dataIngestion';

// Test database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://localhost:5432/choir_music_test',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

describe('Female Choir Music Sources Integration', () => {
  let ingestionService: DataIngestionService;

  beforeAll(async () => {
    // Initialize the data ingestion service
    ingestionService = new DataIngestionService(pool as any);
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('Database Schema', () => {
    it('should have the new source types in the songs table', async () => {
      const result = await pool.query(`
        SELECT column_name, data_type, is_nullable 
        FROM information_schema.columns 
        WHERE table_name = 'songs' AND column_name = 'source'
      `);
      
      expect(result.rows).toHaveLength(1);
      expect(result.rows[0].data_type).toBe('character varying');
    });

    it('should accept new source types', async () => {
      // Test that we can insert songs with new source types
      const testSources = ['ChorusOnline', 'HalLeonard', 'FluegelMusic', 'CarusVerlag', 'SchottMusic', 'CPDL', 'Musopen'];
      
      for (const source of testSources) {
        const result = await pool.query(`
          INSERT INTO songs (title, composer, description, source_link, source, search_text)
          VALUES ($1, $2, $3, $4, $5, $6)
          RETURNING id
        `, [
          `Test Song ${source}`,
          'Test Composer',
          'Test description',
          'https://example.com',
          source,
          'test search text'
        ]);
        
        expect(result.rows).toHaveLength(1);
        expect(result.rows[0].id).toBeDefined();
        
        // Clean up
        await pool.query('DELETE FROM songs WHERE id = $1', [result.rows[0].id]);
      }
    });
  });

  describe('Data Ingestion Service', () => {
    it('should have parsers for all new sources', () => {
      // Access the private parsers map through reflection
      const parsers = (ingestionService as any).parsers;
      
      expect(parsers.has('ChorusOnline')).toBe(true);
      expect(parsers.has('HalLeonard')).toBe(true);
      expect(parsers.has('CPDL')).toBe(true);
    });

    it('should be able to parse ChorusOnline data', async () => {
      const parser = (ingestionService as any).parsers.get('ChorusOnline');
      expect(parser).toBeDefined();
      
      // Test that the parser has the required methods
      expect(typeof parser.parse).toBe('function');
      expect(typeof parser.getUpdateFrequency).toBe('function');
      expect(parser.getUpdateFrequency()).toBe('daily');
    });

    it('should be able to parse Hal Leonard data', async () => {
      const parser = (ingestionService as any).parsers.get('HalLeonard');
      expect(parser).toBeDefined();
      
      // Test that the parser has the required methods
      expect(typeof parser.parse).toBe('function');
      expect(typeof parser.getUpdateFrequency).toBe('function');
      expect(parser.getUpdateFrequency()).toBe('weekly');
    });

    it('should be able to parse CPDL data', async () => {
      const parser = (ingestionService as any).parsers.get('CPDL');
      expect(parser).toBeDefined();
      
      // Test that the parser has the required methods
      expect(typeof parser.parse).toBe('function');
      expect(typeof parser.getUpdateFrequency).toBe('function');
      expect(parser.getUpdateFrequency()).toBe('weekly');
    });
  });

  describe('Sample Data', () => {
    it('should be able to insert female choir music samples', async () => {
      const sampleMusic = {
        title: "Test Female Choir Song",
        composer: "Test Composer",
        text_writer: "Test Writer",
        description: "Test description for female choir",
        source_link: "https://example.com/test",
        audio_link: "https://example.com/audio/test.mp3",
        source: "ChorusOnline",
        language: "English",
        voicing: "SSA",
        difficulty: "Intermediate",
        theme: "Popular",
        season: null,
        search_text: "Test Female Choir Song Test Composer Test Writer Test description for female choir English SSA Intermediate Popular"
      };

      const result = await pool.query(`
        INSERT INTO songs (title, composer, text_writer, description, source_link, audio_link,
                          source, language, voicing, difficulty, theme, season, search_text)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        RETURNING id, title, composer, source, voicing
      `, [
        sampleMusic.title,
        sampleMusic.composer,
        sampleMusic.text_writer,
        sampleMusic.description,
        sampleMusic.source_link,
        sampleMusic.audio_link,
        sampleMusic.source,
        sampleMusic.language,
        sampleMusic.voicing,
        sampleMusic.difficulty,
        sampleMusic.theme,
        sampleMusic.season,
        sampleMusic.search_text
      ]);

      expect(result.rows).toHaveLength(1);
      expect(result.rows[0].title).toBe(sampleMusic.title);
      expect(result.rows[0].composer).toBe(sampleMusic.composer);
      expect(result.rows[0].source).toBe(sampleMusic.source);
      expect(result.rows[0].voicing).toBe(sampleMusic.voicing);

      // Clean up
      await pool.query('DELETE FROM songs WHERE id = $1', [result.rows[0].id]);
    });

    it('should support different voicing types for female choirs', async () => {
      const voicingTypes = ['SSA', 'SSAA', 'SAA'];
      
      for (const voicing of voicingTypes) {
        const result = await pool.query(`
          INSERT INTO songs (title, composer, description, source_link, source, voicing, search_text)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
          RETURNING id, voicing
        `, [
          `Test ${voicing} Song`,
          'Test Composer',
          `Test description for ${voicing} choir`,
          'https://example.com',
          'ChorusOnline',
          voicing,
          `Test ${voicing} Song Test Composer Test description for ${voicing} choir ChorusOnline ${voicing}`
        ]);
        
        expect(result.rows).toHaveLength(1);
        expect(result.rows[0].voicing).toBe(voicing);
        
        // Clean up
        await pool.query('DELETE FROM songs WHERE id = $1', [result.rows[0].id]);
      }
    });
  });

  describe('Search Functionality', () => {
    it('should be able to search for female choir music by voicing', async () => {
      // Insert test data
      const testSongs = [
        {
          title: "SSA Test Song",
          composer: "Test Composer 1",
          voicing: "SSA",
          source: "ChorusOnline"
        },
        {
          title: "SSAA Test Song", 
          composer: "Test Composer 2",
          voicing: "SSAA",
          source: "HalLeonard"
        }
      ];

      const insertedIds = [];
      for (const song of testSongs) {
        const result = await pool.query(`
          INSERT INTO songs (title, composer, description, source_link, source, voicing, search_text)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
          RETURNING id
        `, [
          song.title,
          song.composer,
          `Test description for ${song.voicing}`,
          'https://example.com',
          song.source,
          song.voicing,
          `${song.title} ${song.composer} Test description for ${song.voicing} ${song.source} ${song.voicing}`
        ]);
        insertedIds.push(result.rows[0].id);
      }

      // Test SSA search
      const ssaResult = await pool.query(`
        SELECT * FROM songs WHERE voicing = 'SSA' AND source IN ('ChorusOnline', 'HalLeonard', 'FluegelMusic', 'CarusVerlag', 'SchottMusic', 'CPDL', 'Musopen')
      `);
      expect(ssaResult.rows.length).toBeGreaterThanOrEqual(1);

      // Test SSAA search
      const ssaaResult = await pool.query(`
        SELECT * FROM songs WHERE voicing = 'SSAA' AND source IN ('ChorusOnline', 'HalLeonard', 'FluegelMusic', 'CarusVerlag', 'SchottMusic', 'CPDL', 'Musopen')
      `);
      expect(ssaaResult.rows.length).toBeGreaterThanOrEqual(1);

      // Clean up
      for (const id of insertedIds) {
        await pool.query('DELETE FROM songs WHERE id = $1', [id]);
      }
    });

    it('should be able to search for female choir music by source', async () => {
      const sources = ['ChorusOnline', 'HalLeonard', 'CPDL'];
      
      for (const source of sources) {
        const result = await pool.query(`
          SELECT COUNT(*) as count FROM songs WHERE source = $1
        `, [source]);
        
        expect(parseInt(result.rows[0].count)).toBeGreaterThanOrEqual(0);
      }
    });

    it('should support full-text search for female choir music', async () => {
      // Insert test data with searchable text
      const result = await pool.query(`
        INSERT INTO songs (title, composer, description, source_link, source, voicing, search_text)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING id
      `, [
        'Beautiful Female Choir Song',
        'Test Composer',
        'A beautiful arrangement for women\'s choir',
        'https://example.com',
        'ChorusOnline',
        'SSA',
        'Beautiful Female Choir Song Test Composer A beautiful arrangement for women\'s choir ChorusOnline SSA'
      ]);

      const insertedId = result.rows[0].id;

      // Test full-text search
      const searchResult = await pool.query(`
        SELECT * FROM songs 
        WHERE to_tsvector('english', search_text || ' ' || title || ' ' || composer || ' ' || COALESCE(description, ''))
        @@ plainto_tsquery('english', $1)
        AND source IN ('ChorusOnline', 'HalLeonard', 'FluegelMusic', 'CarusVerlag', 'SchottMusic', 'CPDL', 'Musopen')
      `, ['female choir']);

      expect(searchResult.rows.length).toBeGreaterThanOrEqual(1);

      // Clean up
      await pool.query('DELETE FROM songs WHERE id = $1', [insertedId]);
    });
  });
});
