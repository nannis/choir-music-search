// Supabase Keepalive Function
// This function performs a simple database query to keep the project active
// Prevents the project from going idle and being paused

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Initialize Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// CORS headers for cross-origin requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

// Main keepalive handler
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
    // Perform a simple, lightweight query to keep database active
    // This just counts songs to verify database connectivity
    const { data, error, count } = await supabase
      .from('songs')
      .select('*', { count: 'exact', head: true })
      .limit(1);

    if (error) {
      console.error('Keepalive database error:', error);
      return new Response(JSON.stringify({ 
        status: 'error',
        message: 'Database query failed',
        error: error.message,
        timestamp: new Date().toISOString()
      }), {
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        }
      });
    }

    // Return success response with database status
    return new Response(JSON.stringify({ 
      status: 'healthy',
      message: 'Keepalive successful',
      database: 'connected',
      timestamp: new Date().toISOString(),
      totalSongs: count || 0
    }), {
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'application/json' 
      }
    });

  } catch (error) {
    console.error('Keepalive error:', error);
    return new Response(JSON.stringify({ 
      status: 'error',
      message: error.message,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'application/json' 
      }
    });
  }
});

