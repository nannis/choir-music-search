#!/usr/bin/env node

/**
 * Test Data Ingestion using Edge Function
 * This script tests the data ingestion system by using the existing parsers
 * and sending the data to the Supabase edge function instead of direct database access
 */

const { DataIngestionService } = require('../backend/dist/services/dataIngestion');
require('dotenv').config();

// Mock database connection for the parsers (they don't need real DB for parsing)
const mockDb = {
  execute: () => Promise.resolve([[], []]),
  query: () => Promise.resolve([[], []]),
  end: () => Promise.resolve()
};

async function testDataIngestionWithEdgeFunction() {
  console.log('🎵 Testing Data Ingestion with Edge Function...');
  
  try {
    // Create ingestion service with mock DB (we only need the parsers)
    const ingestionService = new DataIngestionService(mockDb);
    
    // Get the parsers
    const parsers = ingestionService.parsers;
    
    // Test each parser
    const testResults = [];
    
    for (const [sourceName, parser] of parsers) {
      console.log(`\n📥 Testing ${sourceName} parser...`);
      
      try {
        // Parse data from the source
        const songs = await parser.parse('test-url');
        
        if (songs && songs.length > 0) {
          console.log(`✅ ${sourceName}: Found ${songs.length} songs`);
          
          // Show first few songs as examples
          const examples = songs.slice(0, 3);
          examples.forEach((song, index) => {
            console.log(`   ${index + 1}. "${song.title}" by ${song.composer} (${song.voicing || 'Unknown voicing'})`);
          });
          
          testResults.push({
            source: sourceName,
            success: true,
            count: songs.length,
            songs: songs
          });
        } else {
          console.log(`⚠️  ${sourceName}: No songs found`);
          testResults.push({
            source: sourceName,
            success: false,
            count: 0,
            error: 'No songs found'
          });
        }
      } catch (error) {
        console.error(`❌ ${sourceName}: Error - ${error.message}`);
        testResults.push({
          source: sourceName,
          success: false,
          count: 0,
          error: error.message
        });
      }
    }
    
    // Summary
    console.log('\n📊 Test Summary:');
    const successfulSources = testResults.filter(r => r.success);
    const totalSongs = successfulSources.reduce((sum, r) => sum + r.count, 0);
    
    console.log(`✅ Successful sources: ${successfulSources.length}/${testResults.length}`);
    console.log(`🎼 Total songs found: ${totalSongs}`);
    
    if (successfulSources.length > 0) {
      console.log('\n🚀 Ready to send to Edge Function!');
      console.log('Next step: Use the /add-songs endpoint to add these songs to the database');
      
      // Show how to use the edge function
      console.log('\n📝 Example API call:');
      console.log('POST https://your-project.supabase.co/functions/v1/choir-music-api/add-songs');
      console.log('Content-Type: application/json');
      console.log('Authorization: Bearer YOUR_ANON_KEY');
      console.log('');
      console.log('{');
      console.log('  "songs": [');
      if (successfulSources[0] && successfulSources[0].songs.length > 0) {
        const exampleSong = successfulSources[0].songs[0];
        console.log('    {');
        console.log(`      "title": "${exampleSong.title}",`);
        console.log(`      "composer": "${exampleSong.composer}",`);
        console.log(`      "source": "${exampleSong.source}",`);
        console.log(`      "voicing": "${exampleSong.voicing || null}",`);
        console.log(`      "description": "${exampleSong.description}",`);
        console.log(`      "sourceLink": "${exampleSong.sourceLink}"`);
        console.log('    }');
      }
      console.log('  ]');
      console.log('}');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

// Run the test
testDataIngestionWithEdgeFunction();
