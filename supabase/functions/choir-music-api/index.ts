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

    // Add songs endpoint
    if ((path === '/add-songs' || path === '/choir-music-api/add-songs') && method === 'POST') {
      try {
        const body = await req.json();
        const songs = body.songs || [];

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

        // Insert songs into database
        const { data, error } = await supabase
          .from('songs')
          .insert(songs)
          .select();

        if (error) {
          console.error('Database insert error:', error);
          return new Response(JSON.stringify({ 
            error: 'Failed to add songs',
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

        return new Response(JSON.stringify({
          message: `Successfully added ${data.length} songs`,
          songs: data
        }), {
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