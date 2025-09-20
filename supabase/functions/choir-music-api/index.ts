// Simple test Edge Function for debugging
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// CORS headers for cross-origin requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Credentials': 'true',
};

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

    // Search endpoint with mock data
    if ((path === '/search' || path === '/choir-music-api/search') && method === 'GET') {
      const query = url.searchParams.get('q') || '';
      
      // Mock search results for testing
      const mockResults = [
        {
          id: '1',
          title: 'Ave Maria',
          composer: 'Franz Schubert',
          textWriter: 'Sir Walter Scott',
          description: 'One of the most beloved Ave Maria settings for choir',
          language: 'Latin',
          voicing: 'SATB',
          difficulty: 'Intermediate',
          season: null,
          theme: 'Sacred',
          sourceLink: 'https://imslp.org/wiki/Ave_Maria,_D.839_(Schubert,_Franz)'
        },
        {
          id: '2',
          title: 'Jesu, Joy of Man\'s Desiring',
          composer: 'Johann Sebastian Bach',
          textWriter: 'Martin Jahn',
          description: 'Beautiful chorale from Bach\'s Cantata 147',
          language: 'German',
          voicing: 'SATB',
          difficulty: 'Intermediate',
          season: null,
          theme: 'Sacred',
          sourceLink: 'https://imslp.org/wiki/Herz_und_Mund_und_Tat_und_Leben,_BWV_147_(Bach,_Johann_Sebastian)'
        }
      ];

      // Filter results based on query
      const filteredResults = query 
        ? mockResults.filter(result => 
            result.title.toLowerCase().includes(query.toLowerCase()) ||
            result.composer.toLowerCase().includes(query.toLowerCase()) ||
            result.description.toLowerCase().includes(query.toLowerCase())
          )
        : mockResults;

      return new Response(JSON.stringify({
        results: filteredResults,
        total: filteredResults.length,
        page: 1,
        limit: 20,
        hasMore: false
      }), {
        headers: { 
          ...corsHeaders, 
          'Access-Control-Allow-Origin': req.headers.get('origin') || '*',
          'Content-Type': 'application/json' 
        }
      });
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