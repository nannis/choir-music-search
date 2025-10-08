#!/usr/bin/env node
/**
 * Script to sign in test user and get a real JWT token for integration testing
 * This simulates the frontend authentication flow
 */

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://kqjccswtdxkffghuijhu.supabase.co';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtxamNjc3d0ZHhrZmZnaHVpamh1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwOTMwMzIsImV4cCI6MjA3MzY2OTAzMn0.fBcS1Wn5m2Kn-yt9_PF9dyGlIPocJd6MuinvDZ4q3MU';

const TEST_USER_EMAIL = process.env.TEST_USER_EMAIL || 'user_for_test@ssaasearch.se';
const TEST_USER_PASSWORD = process.env.TEST_USER_PASSWORD || 'afsd643jgfd!!1fdbsdurt!EEc#';

console.log('🔐 Signing in test user to get JWT token...');
console.log(`📧 Email: ${TEST_USER_EMAIL}`);

async function signInTestUser() {
  try {
    // Sign in the test user via Supabase Auth
    const response = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      },
      body: JSON.stringify({
        email: TEST_USER_EMAIL,
        password: TEST_USER_PASSWORD
      })
    });

    console.log(`📊 Status: ${response.status} ${response.statusText}`);

    if (response.ok) {
      const data = await response.json();
      
      if (data.access_token) {
        console.log('✅ Successfully signed in test user!');
        console.log('🔑 JWT Token received');
        
        // Decode JWT payload to verify
        const tokenParts = data.access_token.split('.');
        if (tokenParts.length === 3) {
          const payloadB64 = tokenParts[1];
          const paddedPayload = payloadB64 + '='.repeat((4 - payloadB64.length % 4) % 4);
          const decodedPayload = JSON.parse(atob(paddedPayload));
          
          console.log('🔍 Token details:');
          console.log(`   User ID: ${decodedPayload.sub}`);
          console.log(`   Email: ${decodedPayload.email}`);
          console.log(`   Role: ${decodedPayload.role}`);
          console.log(`   Expires: ${new Date(decodedPayload.exp * 1000)}`);
        }
        
        console.log('\n📋 Use this token in your integration tests:');
        console.log(`SUPABASE_TEST_USER_JWT="${data.access_token}"`);
        
        return data.access_token;
      } else {
        console.log('❌ No access token in response:', data);
        return null;
      }
    } else {
      const errorText = await response.text();
      console.log('❌ Sign in failed:', errorText);
      return null;
    }
  } catch (error) {
    console.log('❌ Error signing in:', error.message);
    return null;
  }
}

// Run the sign in
signInTestUser().then(token => {
  if (token) {
    console.log('\n🎯 Next steps:');
    console.log('1. Copy the JWT token above');
    console.log('2. Add it to your .env.test file as SUPABASE_TEST_USER_JWT');
    console.log('3. Update integration tests to use this real user JWT');
    console.log('4. Test Edge Functions with proper user authentication');
  }
});
