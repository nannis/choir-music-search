#!/usr/bin/env node

/**
 * Script to add SSAA/SSA songs from MuseScore women's choir collection
 * Uses the backend API endpoints for secure database operations
 */

require('dotenv').config();

// Curated list of SSAA/SSA songs from MuseScore women's choir collection
const museScoreSongs = [
  {
    title: "Ave Maria",
    composer: "Franz Schubert",
    voicing: "SSAA",
    description: "Classic Ave Maria arranged for women's choir (SSAA)",
    source: "MuseScore",
    source_link: "https://musescore.com/sheetmusic/womens-choir",
    difficulty: "Intermediate"
  },
  {
    title: "Danny Boy",
    composer: "Traditional Irish",
    voicing: "SSA",
    description: "Traditional Irish ballad arranged for women's choir (SSA)",
    source: "MuseScore", 
    source_link: "https://musescore.com/sheetmusic/womens-choir",
    difficulty: "Beginner"
  },
  {
    title: "Amazing Grace",
    composer: "John Newton",
    voicing: "SSAA",
    description: "Traditional hymn arranged for women's choir (SSAA)",
    source: "MuseScore",
    source_link: "https://musescore.com/sheetmusic/womens-choir", 
    difficulty: "Beginner"
  },
  {
    title: "The Water is Wide",
    composer: "Traditional Scottish",
    voicing: "SSA",
    description: "Traditional Scottish folk song for women's choir (SSA)",
    source: "MuseScore",
    source_link: "https://musescore.com/sheetmusic/womens-choir",
    difficulty: "Intermediate"
  },
  {
    title: "Shenandoah",
    composer: "Traditional American",
    voicing: "SSAA",
    description: "Traditional American folk song arranged for women's choir (SSAA)",
    source: "MuseScore",
    source_link: "https://musescore.com/sheetmusic/womens-choir",
    difficulty: "Intermediate"
  },
  {
    title: "Scarborough Fair",
    composer: "Traditional English",
    voicing: "SSA",
    description: "Traditional English ballad for women's choir (SSA)",
    source: "MuseScore",
    source_link: "https://musescore.com/sheetmusic/womens-choir",
    difficulty: "Intermediate"
  },
  {
    title: "The Parting Glass",
    composer: "Traditional Irish",
    voicing: "SSAA",
    description: "Traditional Irish farewell song for women's choir (SSAA)",
    source: "MuseScore",
    source_link: "https://musescore.com/sheetmusic/womens-choir",
    difficulty: "Advanced"
  },
  {
    title: "Down by the Salley Gardens",
    composer: "Traditional Irish",
    voicing: "SSA",
    description: "Traditional Irish song arranged for women's choir (SSA)",
    source: "MuseScore",
    source_link: "https://musescore.com/sheetmusic/womens-choir",
    difficulty: "Intermediate"
  },
  {
    title: "The Ash Grove",
    composer: "Traditional Welsh",
    voicing: "SSAA",
    description: "Traditional Welsh folk song for women's choir (SSAA)",
    source: "MuseScore",
    source_link: "https://musescore.com/sheetmusic/womens-choir",
    difficulty: "Intermediate"
  },
  {
    title: "Loch Lomond",
    composer: "Traditional Scottish",
    voicing: "SSA",
    description: "Traditional Scottish song for women's choir (SSA)",
    source: "MuseScore",
    source_link: "https://musescore.com/sheetmusic/womens-choir",
    difficulty: "Beginner"
  }
];

async function addMuseScoreSongs() {
  console.log('🎵 Adding SSAA/SSA songs from MuseScore women\'s choir collection...');
  console.log('🔒 Using secure Supabase Edge Function API');
  
  // Dynamic import for node-fetch (ESM module)
  const { default: fetch } = await import('node-fetch');
  
  // Supabase configuration (same as frontend)
  const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://kqjccswtdxkffghuijhu.supabase.co';
  const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtxamNjc3d0ZHhrZmZnaHVpamh1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwOTMwMzIsImV4cCI6MjA3MzY2OTAzMn0.fBcS1Wn5m2Kn-yt9_PF9dyGlIPocJd6MuinvDZ4q3MU';
  const API_BASE_URL = `${SUPABASE_URL}/functions/v1/choir-music-api`;
  
  try {
    console.log('📡 Using Supabase Edge Function API...');
    
    let addedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;
    
    for (const song of museScoreSongs) {
      try {
        // Check if song already exists by searching for it
        const searchResponse = await fetch(
          `${API_BASE_URL}/search?q=${encodeURIComponent(song.title)}&voicing=${song.voicing}`, {
            headers: {
              'Authorization': `Bearer ${SUPABASE_KEY}`,
              'Content-Type': 'application/json'
            }
          }
        );
        
        if (searchResponse.ok) {
          const searchResults = await searchResponse.json();
          const existingSong = searchResults.results?.find(s => 
            s.title.toLowerCase() === song.title.toLowerCase() && 
            s.composer.toLowerCase() === song.composer.toLowerCase() &&
            s.voicing === song.voicing
          );
          
          if (existingSong) {
            console.log(`⏭️  Skipping "${song.title}" by ${song.composer} (${song.voicing}) - already exists`);
            skippedCount++;
            continue;
          }
        }
        
        // Add song via Supabase Edge Function API
        const addResponse = await fetch(`${API_BASE_URL}/add-songs`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${SUPABASE_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ songs: [song] })
        });
        
        if (addResponse.ok) {
          const result = await addResponse.json();
          console.log(`✅ Added "${song.title}" by ${song.composer} (${song.voicing}) - ${result.message}`);
          addedCount++;
        } else {
          const error = await addResponse.text();
          console.error(`❌ Failed to add "${song.title}": ${addResponse.status} - ${error}`);
          errorCount++;
        }
        
        // Small delay between requests to be respectful to the API
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error) {
        console.error(`❌ Error adding "${song.title}":`, error.message);
        errorCount++;
      }
    }
    
    console.log('\n🎼 Summary:');
    console.log(`✅ Added: ${addedCount} songs`);
    console.log(`⏭️  Skipped: ${skippedCount} songs (already exist)`);
    console.log(`❌ Errors: ${errorCount} songs`);
    console.log(`📊 Total processed: ${museScoreSongs.length} songs`);
    console.log('\n🎵 MuseScore songs addition completed!');
    
  } catch (error) {
    console.error('❌ Error during song addition:', error);
    console.log('\n💡 Make sure the Supabase Edge Function is deployed:');
    console.log('   supabase functions deploy choir-music-api');
    process.exit(1);
  }
}

// Run the song addition
addMuseScoreSongs();
