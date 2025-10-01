// Choir Music Search Edge Function
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// CORS headers for cross-origin requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Credentials': 'true',
};

// Initialize Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Main Edge Function handler
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { 
      headers: {
        ...corsHeaders,
        'Access-Control-Allow-Origin': req.headers.get('origin') || '*',
      }
    });
  }

  try {
    const url = new URL(req.url);
    const path = url.pathname;
    const method = req.method;

    console.log(`Request: ${method} ${path}`);
    console.log(`Full URL: ${req.url}`);
    console.log(`Pathname: ${url.pathname}`);

    // Health check endpoint
    if (path === '/health' && method === 'GET') {
      return new Response(JSON.stringify({ 
        status: 'healthy', 
        timestamp: new Date().toISOString(),
        message: 'Edge Function is working!' 
      }), {
        headers: { 
          ...corsHeaders, 
          'Access-Control-Allow-Origin': req.headers.get('origin') || '*',
          'Content-Type': 'application/json' 
        }
      });
    }

    // Handle POST requests to root path (Supabase example format)
    if ((path === '/' || path === '/choir-music-api') && method === 'POST') {
      return new Response(JSON.stringify({ 
        message: 'Edge Function is working!',
        method: 'POST',
        timestamp: new Date().toISOString()
      }), {
        headers: { 
          ...corsHeaders, 
          'Access-Control-Allow-Origin': req.headers.get('origin') || '*',
          'Content-Type': 'application/json' 
        }
      });
    }

    // Add songs endpoint - now uses safe insertion to prevent duplicates
    if ((path === '/add-songs' || path === '/choir-music-api/add-songs') && method === 'POST') {
      try {
        const body = await req.json();
        const songs = body.songs || [];
        const upsertMode = body.upsert || false; // Allow client to choose upsert vs insert-only

        if (!Array.isArray(songs) || songs.length === 0) {
          return new Response(JSON.stringify({ 
            error: 'Invalid request',
            message: 'Expected an array of songs in the request body' 
          }), {
            status: 400,
            headers: { 
              ...corsHeaders, 
              'Access-Control-Allow-Origin': req.headers.get('origin') || '*',
              'Content-Type': 'application/json' 
            }
          });
        }

        // Use safe insertion functions to prevent duplicates
        const results = [];
        const errors = [];
        let insertedCount = 0;
        let updatedCount = 0;
        let skippedCount = 0;

        for (const song of songs) {
          try {
            // Validate required fields
            if (!song.title || !song.composer || !song.source) {
              errors.push({
                song: song.title || 'Unknown',
                error: 'Missing required fields: title, composer, and source are required'
              });
              continue;
            }

            // Call the appropriate safe function
            const { data, error } = upsertMode 
              ? await supabase.rpc('upsert_song', {
                  p_title: song.title,
                  p_composer: song.composer,
                  p_text_writer: song.text_writer || song.textWriter || null,
                  p_description: song.description || null,
                  p_source_link: song.source_link || song.sourceLink || '',
                  p_audio_link: song.audio_link || song.audioLink || null,
                  p_source: song.source,
                  p_language: song.language || null,
                  p_voicing: song.voicing || null,
                  p_difficulty: song.difficulty || null,
                  p_theme: song.theme || null,
                  p_season: song.season || null,
                  p_period: song.period || null
                })
              : await supabase.rpc('insert_song_safe', {
                  p_title: song.title,
                  p_composer: song.composer,
                  p_text_writer: song.text_writer || song.textWriter || null,
                  p_description: song.description || null,
                  p_source_link: song.source_link || song.sourceLink || '',
                  p_audio_link: song.audio_link || song.audioLink || null,
                  p_source: song.source,
                  p_language: song.language || null,
                  p_voicing: song.voicing || null,
                  p_difficulty: song.difficulty || null,
                  p_theme: song.theme || null,
                  p_season: song.season || null,
                  p_period: song.period || null
                });

            if (error) {
              console.error('Safe insert error for song:', song.title, error);
              errors.push({
                song: song.title,
                error: error.message
              });
            } else {
              results.push(data);
              // Check if this was an insert or update by looking at the function name
              // For now, we'll assume all successful calls are inserts unless we get more info
              insertedCount++;
            }
          } catch (songError) {
            console.error('Song processing error:', songError);
            errors.push({
              song: song.title || 'Unknown',
              error: songError.message
            });
          }
        }

        // Get the actual inserted/updated songs for response
        const songIds = results.filter(id => id !== null);
        let actualSongs = [];
        
        if (songIds.length > 0) {
          const { data: songData, error: fetchError } = await supabase
            .from('songs')
            .select('*')
            .in('id', songIds);
          
          if (!fetchError) {
            actualSongs = songData || [];
          }
        }

        const response = {
          message: `Processed ${songs.length} songs`,
          summary: {
            total: songs.length,
            inserted: insertedCount,
            updated: updatedCount,
            skipped: skippedCount,
            errors: errors.length
          },
          songs: actualSongs,
          errors: errors.length > 0 ? errors : undefined
        };

        return new Response(JSON.stringify(response), {
          headers: { 
            ...corsHeaders, 
            'Access-Control-Allow-Origin': req.headers.get('origin') || '*',
            'Content-Type': 'application/json' 
          }
        });

      } catch (error) {
        console.error('Add songs error:', error);
        return new Response(JSON.stringify({ 
          error: 'Add songs failed',
          details: error.message 
        }), {
          status: 500,
          headers: { 
            ...corsHeaders, 
            'Access-Control-Allow-Origin': req.headers.get('origin') || '*',
            'Content-Type': 'application/json' 
          }
        });
      }
    }

    // Examples endpoint - returns random selection of songs for front page
    if ((path === '/examples' || path === '/choir-music-api/examples') && method === 'GET') {
      try {
        // Get a random selection of songs to showcase the collection
        // First, get the total count of active songs
        const { count, error: countError } = await supabase
          .from('songs')
          .select('*', { count: 'exact', head: true })
          .eq('is_active', true);

        if (countError) {
          console.error('Database count error:', countError);
          return new Response(JSON.stringify({ 
            error: 'Database query failed',
            details: countError.message 
          }), {
            status: 500,
            headers: { 
              ...corsHeaders, 
              'Access-Control-Allow-Origin': req.headers.get('origin') || '*',
              'Content-Type': 'application/json' 
            }
          });
        }

        const totalSongs = count || 0;
        let examples = [];

        if (totalSongs > 0) {
          // For truly random selection, we'll fetch more songs than needed and then randomly select
          const numExamples = Math.min(6, totalSongs);
          const fetchLimit = Math.min(50, totalSongs); // Fetch up to 50 songs for better randomness
          
          // Fetch a larger set of songs
          const { data: songs, error } = await supabase
            .from('songs')
            .select('*')
            .eq('is_active', true)
            .order('created_at', { ascending: false })
            .limit(fetchLimit);

          if (error) {
            console.error('Database query error:', error);
            return new Response(JSON.stringify({ 
              error: 'Database query failed',
              details: error.message 
            }), {
              status: 500,
              headers: { 
                ...corsHeaders, 
                'Access-Control-Allow-Origin': req.headers.get('origin') || '*',
                'Content-Type': 'application/json' 
              }
            });
          }

          // Randomly select the desired number of examples
          const shuffled = songs?.sort(() => Math.random() - 0.5) || [];
          examples = shuffled.slice(0, numExamples);
        }

        // Transform data to match frontend expectations
        const transformedExamples = examples.map(song => ({
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
        }));

        return new Response(JSON.stringify({
          examples: transformedExamples
        }), {
          headers: { 
            ...corsHeaders, 
            'Access-Control-Allow-Origin': req.headers.get('origin') || '*',
            'Content-Type': 'application/json' 
          }
        });

      } catch (error) {
        console.error('Examples error:', error);
        return new Response(JSON.stringify({ 
          error: 'Examples failed',
          details: error.message 
        }), {
          status: 500,
          headers: { 
            ...corsHeaders, 
            'Access-Control-Allow-Origin': req.headers.get('origin') || '*',
            'Content-Type': 'application/json' 
          }
        });
      }
    }

    // Search endpoint with real database queries and filtering
    if ((path === '/search' || path === '/choir-music-api/search') && method === 'GET') {
      const query = url.searchParams.get('q') || '';
      const page = parseInt(url.searchParams.get('page') || '1');
      const limit = parseInt(url.searchParams.get('limit') || '20');
      const offset = (page - 1) * limit;

      // Extract filter parameters
      const filters = {
        source: url.searchParams.get('source')?.split(',').filter(Boolean) || [],
        voicing: url.searchParams.get('voicing')?.split(',').filter(Boolean) || [],
        difficulty: url.searchParams.get('difficulty')?.split(',').filter(Boolean) || [],
        language: url.searchParams.get('language')?.split(',').filter(Boolean) || [],
        theme: url.searchParams.get('theme')?.split(',').filter(Boolean) || [],
        season: url.searchParams.get('season')?.split(',').filter(Boolean) || [],
        period: url.searchParams.get('period')?.split(',').filter(Boolean) || []
      };

      try {
        let dbQuery = supabase
          .from('songs')
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: false });

        // If there's a search query, use full-text search
        if (query.trim()) {
          // Use ilike for case-insensitive partial matching
          dbQuery = dbQuery.or(`search_text.ilike.%${query.trim()}%,title.ilike.%${query.trim()}%,composer.ilike.%${query.trim()}%`);
        }

        // Apply filters
        if (filters.source.length > 0) {
          dbQuery = dbQuery.in('source', filters.source);
        }
        if (filters.voicing.length > 0) {
          dbQuery = dbQuery.in('voicing', filters.voicing);
        }
        if (filters.difficulty.length > 0) {
          dbQuery = dbQuery.in('difficulty', filters.difficulty);
        }
        if (filters.language.length > 0) {
          dbQuery = dbQuery.in('language', filters.language);
        }
        if (filters.theme.length > 0) {
          dbQuery = dbQuery.in('theme', filters.theme);
        }
        if (filters.season.length > 0) {
          dbQuery = dbQuery.in('season', filters.season);
        }
        if (filters.period.length > 0) {
          dbQuery = dbQuery.in('period', filters.period);
        }

        // Add pagination
        dbQuery = dbQuery.range(offset, offset + limit - 1);

        const { data: songs, error, count } = await dbQuery;

        if (error) {
          console.error('Database query error:', error);
          return new Response(JSON.stringify({ 
            error: 'Database query failed',
            details: error.message 
          }), {
            status: 500,
            headers: { 
              ...corsHeaders, 
              'Access-Control-Allow-Origin': req.headers.get('origin') || '*',
              'Content-Type': 'application/json' 
            }
          });
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

        return new Response(JSON.stringify({
          results: results,
          total: count || results.length,
          page: page,
          limit: limit,
          hasMore: results.length === limit
        }), {
          headers: { 
            ...corsHeaders, 
            'Access-Control-Allow-Origin': req.headers.get('origin') || '*',
            'Content-Type': 'application/json' 
          }
        });

      } catch (error) {
        console.error('Search error:', error);
        return new Response(JSON.stringify({ 
          error: 'Search failed',
          details: error.message 
        }), {
          status: 500,
          headers: { 
            ...corsHeaders, 
            'Access-Control-Allow-Origin': req.headers.get('origin') || '*',
            'Content-Type': 'application/json' 
          }
        });
      }
    }

    // Debug: Return path info for unknown routes
    return new Response(JSON.stringify({ 
      error: 'Not found',
      debug: {
        method: method,
        path: path,
        fullUrl: req.url,
        pathname: url.pathname
      }
    }), {
      status: 404,
      headers: { 
        ...corsHeaders, 
        'Access-Control-Allow-Origin': req.headers.get('origin') || '*',
        'Content-Type': 'application/json' 
      }
    });

  } catch (error) {
    console.error('Edge function error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 
        ...corsHeaders, 
        'Access-Control-Allow-Origin': req.headers.get('origin') || '*',
        'Content-Type': 'application/json' 
      }
    });
  }
});