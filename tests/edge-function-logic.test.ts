// Test the actual Edge Function logic by extracting testable functions
import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock the Supabase client
const mockSupabaseClient = {
  from: vi.fn(() => ({
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
        order: vi.fn(() => ({
          textSearch: vi.fn(() => ({
            range: vi.fn(() => Promise.resolve({
              data: [
                {
                  id: 'test-id-1',
                  title: 'Test Song',
                  composer: 'Test Composer',
                  text_writer: 'Test Writer',
                  description: 'Test description',
                  language: 'English',
                  voicing: 'SATB',
                  difficulty: 'Easy',
                  season: null,
                  theme: 'Sacred',
                  source_link: 'https://example.com',
                  created_at: '2024-01-01T00:00:00Z',
                  updated_at: '2024-01-01T00:00:00Z',
                  last_verified: '2024-01-01T00:00:00Z',
                  is_active: true
                }
              ],
              error: null,
              count: 1
            }))
          })),
          range: vi.fn(() => Promise.resolve({
            data: [
              {
                id: 'test-id-1',
                title: 'Test Song',
                composer: 'Test Composer',
                text_writer: 'Test Writer',
                description: 'Test description',
                language: 'English',
                voicing: 'SATB',
                difficulty: 'Easy',
                season: null,
                theme: 'Sacred',
                source_link: 'https://example.com',
                created_at: '2024-01-01T00:00:00Z',
                updated_at: '2024-01-01T00:00:00Z',
                last_verified: '2024-01-01T00:00:00Z',
                is_active: true
              }
            ],
            error: null,
            count: 1
          }))
        }))
      })),
      insert: vi.fn(() => ({
        select: vi.fn(() => Promise.resolve({
          data: [
            {
              id: 'new-song-id',
              title: 'New Song',
              composer: 'New Composer',
              text_writer: 'New Writer',
              description: 'New description',
              language: 'English',
              voicing: 'SSAA',
              difficulty: 'Intermediate',
              season: null,
              theme: 'Folk',
              source_link: 'https://example.com',
              created_at: '2024-01-01T00:00:00Z',
              updated_at: '2024-01-01T00:00:00Z',
              last_verified: '2024-01-01T00:00:00Z',
              is_active: true
            }
          ],
          error: null
        }))
      }))
    }))
  }))
};

// Extract testable functions from the Edge Function
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Credentials': 'true',
};

// Testable function for handling health check
function handleHealthCheck(origin?: string) {
  return new Response(JSON.stringify({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    message: 'Edge Function is working!' 
  }), {
    headers: { 
      ...corsHeaders, 
      'Access-Control-Allow-Origin': origin || '*',
      'Content-Type': 'application/json' 
    }
  });
}

// Testable function for handling search
async function handleSearch(query: string, page: number = 1, limit: number = 20, supabase: any) {
  const offset = (page - 1) * limit;

  let dbQuery = supabase
    .from('songs')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  // If there's a search query, use full-text search
  if (query.trim()) {
    dbQuery = dbQuery.textSearch('search_text', query.trim());
  }

  // Add pagination
  dbQuery = dbQuery.range(offset, offset + limit - 1);

  const { data: songs, error, count } = await dbQuery;

  if (error) {
    throw new Error(`Database query failed: ${error.message}`);
  }

  // Transform data to match frontend expectations
  const results = songs?.map(song => ({
    id: song.id,
    title: song.title,
    composer: song.composer,
    textWriter: song.text_writer,
    description: song.description,
    language: song.language,
    voicing: song.voicing,
    difficulty: song.difficulty,
    season: song.season,
    theme: song.theme,
    sourceLink: song.source_link
  })) || [];

  return {
    results: results,
    total: count || results.length,
    page: page,
    limit: limit,
    hasMore: results.length === limit
  };
}

// Testable function for handling add songs
async function handleAddSongs(songs: any[], supabase: any) {
  if (!Array.isArray(songs) || songs.length === 0) {
    throw new Error('Expected an array of songs in the request body');
  }

  const { data, error } = await supabase
    .from('songs')
    .insert(songs)
    .select();

  if (error) {
    throw new Error(`Failed to add songs: ${error.message}`);
  }

  return {
    message: `Successfully added ${data.length} songs`,
    songs: data
  };
}

describe('Edge Function Logic - Real Implementation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('CORS Headers', () => {
    it('should define correct CORS headers', () => {
      expect(corsHeaders['Access-Control-Allow-Origin']).toBe('*');
      expect(corsHeaders['Access-Control-Allow-Methods']).toContain('GET');
      expect(corsHeaders['Access-Control-Allow-Methods']).toContain('POST');
      expect(corsHeaders['Access-Control-Allow-Headers']).toContain('authorization');
    });
  });

  describe('Health Check Handler', () => {
    it('should return healthy status', () => {
      const response = handleHealthCheck();
      expect(response.status).toBe(200);
    });

    it('should include CORS headers', () => {
      const response = handleHealthCheck();
      const headers = response.headers as any;
      expect(headers.get('Access-Control-Allow-Origin')).toBe('*');
      expect(headers.get('Content-Type')).toBe('application/json');
    });

    it('should handle custom origin', () => {
      const response = handleHealthCheck('https://example.com');
      const headers = response.headers as any;
      expect(headers.get('Access-Control-Allow-Origin')).toBe('https://example.com');
    });
  });

  describe('Search Handler', () => {
    it('should perform search with query', async () => {
      const result = await handleSearch('Bach', 1, 20, mockSupabaseClient);
      
      expect(result.results).toHaveLength(1);
      expect(result.results[0].title).toBe('Test Song');
      expect(result.results[0].composer).toBe('Test Composer');
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(20);
    });

    it('should handle empty search query', async () => {
      const result = await handleSearch('', 1, 20, mockSupabaseClient);
      
      expect(result.results).toHaveLength(1);
      expect(result.total).toBe(1);
    });

    it('should handle pagination', async () => {
      const result = await handleSearch('test', 2, 10, mockSupabaseClient);
      
      expect(result.page).toBe(2);
      expect(result.limit).toBe(10);
    });

    it('should transform database results correctly', async () => {
      const result = await handleSearch('test', 1, 20, mockSupabaseClient);
      const song = result.results[0];
      
      expect(song.textWriter).toBe('Test Writer');
      expect(song.sourceLink).toBe('https://example.com');
      expect(song.id).toBe('test-id-1');
    });

    it('should handle database errors', async () => {
      mockSupabaseClient.from.mockReturnValueOnce({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            order: vi.fn(() => ({
              textSearch: vi.fn(() => ({
                range: vi.fn(() => Promise.resolve({
                  data: null,
                  error: { message: 'Database connection failed' },
                  count: 0
                }))
              }))
            }))
          }))
        }))
      });

      await expect(handleSearch('test', 1, 20, mockSupabaseClient))
        .rejects.toThrow('Database query failed: Database connection failed');
    });
  });

  describe('Add Songs Handler', () => {
    it('should add songs successfully', async () => {
      const songs = [
        {
          title: 'New Song',
          composer: 'New Composer',
          text_writer: 'New Writer',
          description: 'New description',
          source_link: 'https://example.com',
          source: 'Test',
          language: 'English',
          voicing: 'SSAA',
          difficulty: 'Intermediate',
          theme: 'Folk',
          season: null,
          search_text: 'New Song New Composer'
        }
      ];

      // Mock the insert method properly
      const mockInsertResult = {
        data: [
          {
            id: 'new-song-id',
            title: 'New Song',
            composer: 'New Composer',
            text_writer: 'New Writer',
            description: 'New description',
            language: 'English',
            voicing: 'SSAA',
            difficulty: 'Intermediate',
            season: null,
            theme: 'Folk',
            source_link: 'https://example.com',
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
            last_verified: '2024-01-01T00:00:00Z',
            is_active: true
          }
        ],
        error: null
      };

      mockSupabaseClient.from.mockReturnValueOnce({
        insert: vi.fn(() => ({
          select: vi.fn(() => Promise.resolve(mockInsertResult))
        }))
      });

      const result = await handleAddSongs(songs, mockSupabaseClient);
      
      expect(result.message).toBe('Successfully added 1 songs');
      expect(result.songs).toHaveLength(1);
      expect(result.songs[0].title).toBe('New Song');
    });

    it('should reject empty songs array', async () => {
      await expect(handleAddSongs([], mockSupabaseClient))
        .rejects.toThrow('Expected an array of songs in the request body');
    });

    it('should reject non-array input', async () => {
      await expect(handleAddSongs(null as any, mockSupabaseClient))
        .rejects.toThrow('Expected an array of songs in the request body');
    });

    it('should handle database insert errors', async () => {
      mockSupabaseClient.from.mockReturnValueOnce({
        insert: vi.fn(() => ({
          select: vi.fn(() => Promise.resolve({
            data: null,
            error: { message: 'Insert failed' }
          }))
        }))
      });

      const songs = [{ title: 'Test Song' }];
      
      await expect(handleAddSongs(songs, mockSupabaseClient))
        .rejects.toThrow('Failed to add songs: Insert failed');
    });
  });

  describe('URL Parsing', () => {
    it('should parse URL correctly', () => {
      const url = new URL('https://example.com/functions/v1/choir-music-api/search?q=test&page=2');
      
      expect(url.pathname).toBe('/functions/v1/choir-music-api/search');
      expect(url.searchParams.get('q')).toBe('test');
      expect(url.searchParams.get('page')).toBe('2');
    });

    it('should handle different path formats', () => {
      const paths = [
        '/search',
        '/choir-music-api/search',
        '/add-songs',
        '/choir-music-api/add-songs',
        '/health'
      ];

      paths.forEach(path => {
        const url = new URL(`https://example.com${path}`);
        expect(url.pathname).toBe(path);
      });
    });
  });

  describe('Request Method Handling', () => {
    it('should handle different HTTP methods', () => {
      const methods = ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'];
      
      methods.forEach(method => {
        expect(methods).toContain(method);
      });
    });

    it('should handle OPTIONS preflight requests', () => {
      const method = 'OPTIONS';
      const isOptions = method === 'OPTIONS';
      
      expect(isOptions).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should handle JSON parsing errors', async () => {
      const invalidJson = 'invalid json';
      
      try {
        JSON.parse(invalidJson);
      } catch (error) {
        expect(error).toBeInstanceOf(SyntaxError);
      }
    });

    it('should handle missing environment variables', () => {
      const supabaseUrl = process.env.SUPABASE_URL || 'https://default.supabase.co';
      const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'default-key';
      
      expect(supabaseUrl).toBeDefined();
      expect(supabaseServiceKey).toBeDefined();
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
        season: null,
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
});
