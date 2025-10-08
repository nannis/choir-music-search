#!/usr/bin/env node

/**
 * Run Data Ingestion via Edge Function
 * This script uses the existing parsers to extract songs and sends them
 * to the Supabase edge function for safe database insertion
 */

const { DataIngestionService } = require('../backend/dist/services/dataIngestion');
require('dotenv').config();

// Mock database connection for the parsers (they don't need real DB for parsing)
const mockDb = {
  execute: () => Promise.resolve([[], []]),
  query: () => Promise.resolve([[], []]),
  end: () => Promise.resolve()
};

async function runDataIngestionViaEdgeFunction() {
  console.log('🎵 Running Data Ingestion via Edge Function...');
  
  // Check for required environment variables
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Missing required environment variables:');
    console.error('   SUPABASE_URL and SUPABASE_ANON_KEY are required');
    console.error('   Please check your .env file');
    process.exit(1);
  }
  
  const edgeFunctionUrl = `${supabaseUrl}/functions/v1/choir-music-api/add-songs`;
  
  try {
    // Create ingestion service with mock DB (we only need the parsers)
    const ingestionService = new DataIngestionService(mockDb);
    
    // Get the parsers
    const parsers = ingestionService.parsers;
    
    // Collect all songs from all sources
    const allSongs = [];
    const sourceResults = [];
    
    for (const [sourceName, parser] of parsers) {
      console.log(`\n📥 Processing ${sourceName}...`);
      
      try {
        // Parse data from the source
        const songs = await parser.parse('test-url');
        
        if (songs && songs.length > 0) {
          console.log(`✅ ${sourceName}: Found ${songs.length} songs`);
          allSongs.push(...songs);
          sourceResults.push({ source: sourceName, count: songs.length, success: true });
        } else {
          console.log(`⚠️  ${sourceName}: No songs found`);
          sourceResults.push({ source: sourceName, count: 0, success: false, error: 'No songs found' });
        }
      } catch (error) {
        console.error(`❌ ${sourceName}: Error - ${error.message}`);
        sourceResults.push({ source: sourceName, count: 0, success: false, error: error.message });
      }
    }
    
    if (allSongs.length === 0) {
      console.log('\n❌ No songs found from any source. Cannot proceed.');
      return;
    }
    
    console.log(`\n🚀 Sending ${allSongs.length} songs to Edge Function...`);
    
    // Prepare the request payload
    const payload = {
      songs: allSongs.map(song => ({
        title: song.title,
        composer: song.composer,
        textWriter: song.textWriter || null,
        description: song.description,
        sourceLink: song.sourceLink,
        audioLink: song.audioLink || null,
        source: song.source,
        language: song.language || null,
        voicing: song.voicing || null,
        difficulty: song.difficulty || null,
        theme: song.theme || null,
        season: song.season || null,
        period: song.period || null
      })),
      upsert: false // Use safe insert to prevent duplicates
    };
    
    // Send to edge function
    const response = await fetch(edgeFunctionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseAnonKey}`,
        'apikey': supabaseAnonKey
      },
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Edge function request failed: ${response.status} ${response.statusText}\n${errorText}`);
    }
    
    const result = await response.json();
    
    // Display results
    console.log('\n📊 Ingestion Results:');
    console.log(`✅ Total songs processed: ${result.summary.total}`);
    console.log(`🆕 New songs inserted: ${result.summary.inserted}`);
    console.log(`🔄 Songs updated: ${result.summary.updated}`);
    console.log(`⏭️  Songs skipped: ${result.summary.skipped}`);
    console.log(`❌ Errors: ${result.summary.errors}`);
    
    if (result.errors && result.errors.length > 0) {
      console.log('\n⚠️  Errors encountered:');
      result.errors.forEach((error, index) => {
        console.log(`   ${index + 1}. ${error.song}: ${error.error}`);
      });
    }
    
    if (result.songs && result.songs.length > 0) {
      console.log('\n🎼 Successfully added songs:');
      result.songs.slice(0, 5).forEach((song, index) => {
        console.log(`   ${index + 1}. "${song.title}" by ${song.composer} (${song.voicing || 'Unknown'})`);
      });
      if (result.songs.length > 5) {
        console.log(`   ... and ${result.songs.length - 5} more`);
      }
    }
    
    console.log('\n🎉 Data ingestion completed successfully!');
    console.log('💡 You can now search for these songs in the application');
    
  } catch (error) {
    console.error('❌ Data ingestion failed:', error.message);
    process.exit(1);
  }
}

// Run the ingestion
runDataIngestionViaEdgeFunction();
