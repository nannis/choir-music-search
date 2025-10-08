# Fix for JWT Function Runtime Error

## Issue
The mint-test-jwt function returns "unexpected_error" which indicates a runtime error, likely due to Node.js crypto API compatibility in Deno Edge Functions.

## Solution
The Edge Function code needs to be updated to use Deno-compatible APIs instead of Node.js crypto. 

### Quick Fix Required
Replace the current Edge Function with this Deno-compatible version:

```typescript
// Updated index.ts for mint-test-jwt
function base64url(bytes: Uint8Array): string {
  return btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

async function sign(payload: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(payload));
  return base64url(new Uint8Array(signature));
}

Deno.serve(async (req) => {
  try {
    if (req.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders() });
    }
    
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: jsonHeaders()
      });
    }
    
    const body = await req.json().catch(() => ({}));
    const sub = body.sub ?? '00000000-0000-0000-0000-000000000001';
    const email = body.email ?? 'tester@example.com';
    const expires_in = Math.min(Math.max(body.expires_in ?? 600, 60), 3600);
    
    const now = Math.floor(Date.now() / 1000);
    const issuer = Deno.env.get('SUPABASE_ISSUER') ?? Deno.env.get('SUPABASE_URL') ?? 'supabase';
    const audience = Deno.env.get('SUPABASE_AUDIENCE') ?? 'authenticated';
    const secret = Deno.env.get('TEST_JWT_SECRET');
    
    if (!secret) {
      return new Response(JSON.stringify({ error: 'Server not configured' }), {
        status: 500,
        headers: jsonHeaders()
      });
    }
    
    const header = {
      alg: 'HS256',
      typ: 'JWT'
    };
    
    const payload = {
      sub,
      aud: audience,
      role: 'test_service',
      iat: now,
      exp: now + expires_in,
      iss: issuer,
      email
    };
    
    const encoder = new TextEncoder();
    const headerB64 = base64url(encoder.encode(JSON.stringify(header)));
    const payloadB64 = base64url(encoder.encode(JSON.stringify(payload)));
    
    const signature = await sign(`${headerB64}.${payloadB64}`, secret);
    const token = `${headerB64}.${payloadB64}.${signature}`;
    
    return new Response(JSON.stringify({
      token,
      expires_at: now + expires_in
    }), {
      status: 200,
      headers: jsonHeaders()
    });
    
  } catch (err) {
    console.error('JWT minting error:', err);
    return new Response(JSON.stringify({
      error: 'unexpected_error',
      details: err.message // Include error details for debugging
    }), {
      status: 500,
      headers: jsonHeaders()
    });
  }
});

function jsonHeaders() {
  return {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
  };
}

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  };
}
```

### Deployment Steps
1. Go to Supabase Dashboard > Functions > mint-test-jwt
2. Replace the current code with the updated version above
3. Deploy the function
4. Ensure TEST_JWT_SECRET environment variable is still set

### Test After Deployment
Run our verification script:
```bash
node scripts/verify-jwt-working.js
```

The function should now work correctly!
