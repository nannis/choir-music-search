import { createHmac } from 'node:crypto';
function base64url(input) {
  return input.toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}
function sign(payload, secret) {
  const hmac = createHmac('sha256', secret);
  hmac.update(payload);
  return base64url(hmac.digest());
}
Deno.serve(async (req)=>{
  try {
    const url = new URL(req.url);
    if (req.method === 'OPTIONS') return new Response(null, {
      headers: corsHeaders()
    });
    if (req.method !== 'POST' || url.pathname !== '/mint-test-jwt') {
      return new Response(JSON.stringify({
        error: 'Not found'
      }), {
        status: 404,
        headers: jsonHeaders()
      });
    }
    const body = await req.json().catch(()=>({}));
    const sub = body.sub ?? '00000000-0000-0000-0000-000000000001';
    const email = body.email ?? 'tester@example.com';
    const expires_in = Math.min(Math.max(body.expires_in ?? 600, 60), 3600); // 1 minute to 1 hour
    const now = Math.floor(Date.now() / 1000);
    const iat = now;
    const exp = now + expires_in;
    const issuer = Deno.env.get('SUPABASE_ISSUER') ?? Deno.env.get('SUPABASE_URL') ?? 'supabase';
    const audience = Deno.env.get('SUPABASE_AUDIENCE') ?? 'authenticated';
    const secret = Deno.env.get('TEST_JWT_SECRET');
    if (!secret) return new Response(JSON.stringify({
      error: 'Server not configured'
    }), {
      status: 500,
      headers: jsonHeaders()
    });
    const header = base64url(Buffer.from(JSON.stringify({
      alg: 'HS256',
      typ: 'JWT'
    })));
    const payload = base64url(Buffer.from(JSON.stringify({
      sub,
      aud: audience,
      role: 'test_service',
      iat,
      exp,
      iss: issuer,
      email
    })));
    const signature = sign(`${header}.${payload}`, secret);
    const token = `${header}.${payload}.${signature}`;
    return new Response(JSON.stringify({
      token,
      expires_at: exp
    }), {
      status: 200,
      headers: jsonHeaders()
    });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({
      error: 'unexpected_error'
    }), {
      status: 500,
      headers: jsonHeaders()
    });
  }
});
function jsonHeaders() {
  return {
    'Content-Type': 'application/json',
    'Connection': 'keep-alive'
  };
}
function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  };
}
