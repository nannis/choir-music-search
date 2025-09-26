/**
 * RLS Policies Test Script
 * 
 * This script tests the Row Level Security policies by attempting various operations
 * and checking if they're properly blocked or allowed.
 * 
 * Usage: node scripts/test-rls-policies.js
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Configuration
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Missing required environment variables:');
  console.error('   VITE_SUPABASE_URL');
  console.error('   VITE_SUPABASE_ANON_KEY');
  console.error('   SUPABASE_SERVICE_ROLE_KEY (optional, for admin tests)');
  process.exit(1);
}

// Create Supabase clients
const supabaseAnon = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const supabaseService = SUPABASE_SERVICE_ROLE_KEY 
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
  : null;

// Test results tracking
const testResults = {
  passed: 0,
  failed: 0,
  skipped: 0,
  tests: []
};

function logTest(name, passed, message = '') {
  const status = passed ? '✅ PASS' : '❌ FAIL';
  console.log(`${status} ${name}${message ? `: ${message}` : ''}`);
  
  testResults.tests.push({ name, passed, message });
  if (passed) {
    testResults.passed++;
  } else {
    testResults.failed++;
  }
}

function logSkip(name, reason) {
  console.log(`⏭️  SKIP ${name}: ${reason}`);
  testResults.tests.push({ name, passed: null, message: reason });
  testResults.skipped++;
}

async function testAnonymousAccess() {
  console.log('\n🔒 Testing Anonymous User Access (Should be blocked)...');
  
  // Test songs table access
  try {
    const { data, error } = await supabaseAnon
      .from('songs')
      .select('id, title')
      .limit(1);
    
    if (error && error.message.includes('permission denied')) {
      logTest('Anonymous access to songs (read)', true, 'Properly blocked by RLS');
    } else if (error) {
      logTest('Anonymous access to songs (read)', false, `Unexpected error: ${error.message}`);
    } else {
      logTest('Anonymous access to songs (read)', false, 'Should be blocked but data was returned');
    }
  } catch (err) {
    logTest('Anonymous access to songs (read)', false, `Exception: ${err.message}`);
  }

  // Test songs table insert
  try {
    const { error } = await supabaseAnon
      .from('songs')
      .insert({
        title: 'Test Song',
        composer: 'Test Composer',
        source_link: 'https://example.com/test',
        source: 'Other'
      });
    
    if (error && error.message.includes('permission denied')) {
      logTest('Anonymous insert into songs', true, 'Properly blocked by RLS');
    } else {
      logTest('Anonymous insert into songs', false, `Should be blocked: ${error?.message || 'No error'}`);
    }
  } catch (err) {
    logTest('Anonymous insert into songs', false, `Exception: ${err.message}`);
  }

  // Test user_submissions table access
  try {
    const { error } = await supabaseAnon
      .from('user_submissions')
      .select('id, title')
      .limit(1);
    
    if (error && error.message.includes('permission denied')) {
      logTest('Anonymous access to user_submissions', true, 'Properly blocked by RLS');
    } else {
      logTest('Anonymous access to user_submissions', false, `Should be blocked: ${error?.message || 'No error'}`);
    }
  } catch (err) {
    logTest('Anonymous access to user_submissions', false, `Exception: ${err.message}`);
  }

  // Test ingestion_jobs table access
  try {
    const { error } = await supabaseAnon
      .from('ingestion_jobs')
      .select('id, source')
      .limit(1);
    
    if (error && error.message.includes('permission denied')) {
      logTest('Anonymous access to ingestion_jobs', true, 'Properly blocked by RLS');
    } else {
      logTest('Anonymous access to ingestion_jobs', false, `Should be blocked: ${error?.message || 'No error'}`);
    }
  } catch (err) {
    logTest('Anonymous access to ingestion_jobs', false, `Exception: ${err.message}`);
  }
}

async function testServiceRoleAccess() {
  if (!supabaseService) {
    logSkip('Service role tests', 'SUPABASE_SERVICE_ROLE_KEY not provided');
    return;
  }

  console.log('\n🔑 Testing Service Role Access (Should work)...');
  
  try {
    const { data, error } = await supabaseService
      .from('songs')
      .select('id, title')
      .limit(1);
    
    if (error) {
      logTest('Service role access to songs', false, `Error: ${error.message}`);
    } else {
      logTest('Service role access to songs', true, `Retrieved ${data?.length || 0} records`);
    }
  } catch (err) {
    logTest('Service role access to songs', false, `Exception: ${err.message}`);
  }

  try {
    const { data, error } = await supabaseService
      .from('user_submissions')
      .select('id, title')
      .limit(1);
    
    if (error) {
      logTest('Service role access to user_submissions', false, `Error: ${error.message}`);
    } else {
      logTest('Service role access to user_submissions', true, `Retrieved ${data?.length || 0} records`);
    }
  } catch (err) {
    logTest('Service role access to user_submissions', false, `Exception: ${err.message}`);
  }

  try {
    const { data, error } = await supabaseService
      .from('ingestion_jobs')
      .select('id, source')
      .limit(1);
    
    if (error) {
      logTest('Service role access to ingestion_jobs', false, `Error: ${error.message}`);
    } else {
      logTest('Service role access to ingestion_jobs', true, `Retrieved ${data?.length || 0} records`);
    }
  } catch (err) {
    logTest('Service role access to ingestion_jobs', false, `Exception: ${err.message}`);
  }
}

async function checkRLSStatus() {
  console.log('\n🔍 Checking RLS Status...');
  
  if (!supabaseService) {
    logSkip('RLS status check', 'SUPABASE_SERVICE_ROLE_KEY not provided');
    return;
  }

  const tables = ['songs', 'user_submissions', 'ingestion_jobs'];
  
  for (const tableName of tables) {
    try {
      // Check if RLS is enabled by trying to access the table
      // If RLS is disabled, we should be able to access it with anon key
      const { error: anonError } = await supabaseAnon
        .from(tableName)
        .select('id')
        .limit(1);
      
      if (anonError && anonError.message.includes('permission denied')) {
        logTest(`RLS enabled on ${tableName}`, true, 'Anonymous access properly blocked');
      } else if (anonError) {
        logTest(`RLS enabled on ${tableName}`, false, `Unexpected error: ${anonError.message}`);
      } else {
        logTest(`RLS enabled on ${tableName}`, false, 'RLS appears to be disabled - anonymous access allowed');
      }
    } catch (err) {
      logTest(`RLS enabled on ${tableName}`, false, `Exception: ${err.message}`);
    }
  }
}

async function runTests() {
  console.log('🧪 RLS Policies Test Suite');
  console.log('==========================');
  console.log(`Supabase URL: ${SUPABASE_URL}`);
  console.log(`Service Role Key: ${SUPABASE_SERVICE_ROLE_KEY ? 'Provided' : 'Not provided'}`);
  
  await checkRLSStatus();
  await testAnonymousAccess();
  await testServiceRoleAccess();
  
  // Print summary
  console.log('\n📊 Test Summary');
  console.log('================');
  console.log(`✅ Passed: ${testResults.passed}`);
  console.log(`❌ Failed: ${testResults.failed}`);
  console.log(`⏭️  Skipped: ${testResults.skipped}`);
  console.log(`📈 Total: ${testResults.passed + testResults.failed + testResults.skipped}`);
  
  if (testResults.failed > 0) {
    console.log('\n❌ Some tests failed. Check the output above for details.');
    console.log('\n💡 Common issues:');
    console.log('   - RLS policies not applied to tables');
    console.log('   - Incorrect environment variables');
    console.log('   - Network connectivity issues');
    console.log('   - Supabase project not accessible');
    process.exit(1);
  } else {
    console.log('\n🎉 All tests passed! RLS policies appear to be working correctly.');
  }
}

// Run the tests
runTests().catch(error => {
  console.error('💥 Test suite failed with error:', error);
  process.exit(1);
});
