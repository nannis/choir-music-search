#!/usr/bin/env node

/**
 * Script to manually add SSAA/SSA songs from MuseScore women's choir collection
 * This will add curated songs directly to the database
 */

const { Pool } = require('pg');
require('dotenv').config();

// Curated list of SSAA/SSA songs from MuseScore women's choir collection
const museScoreSongs = [
  {
    title: "Ave Maria",
    composer: "Franz Schubert",
    voicing: "SSAA",
    description: "Classic Ave Maria arranged for women's choir (SSAA)",
    source: "MuseScore",
    sourceLink: "https://musescore.com/sheetmusic/womens-choir",
    difficulty: "Intermediate"
  },
  {
    title: "Danny Boy",
    composer: "Traditional Irish",
    voicing: "SSA",
    description: "Traditional Irish ballad arranged for women's choir (SSA)",
    source: "MuseScore", 
    sourceLink: "https://musescore.com/sheetmusic/womens-choir",
    difficulty: "Beginner"
  },
  {
    title: "Amazing Grace",
    composer: "John Newton",
    voicing: "SSAA",
    description: "Traditional hymn arranged for women's choir (SSAA)",
    source: "MuseScore",
    sourceLink: "https://musescore.com/sheetmusic/womens-choir", 
    difficulty: "Beginner"
  },
  {
    title: "The Water is Wide",
    composer: "Traditional Scottish",
    voicing: "SSA",
    description: "Traditional Scottish folk song for women's choir (SSA)",
    source: "MuseScore",
    sourceLink: "https://musescore.com/sheetmusic/womens-choir",
    difficulty: "Intermediate"
  },
  {
    title: "Shenandoah",
    composer: "Traditional American",
    voicing: "SSAA",
    description: "Traditional American folk song arranged for women's choir (SSAA)",
    source: "MuseScore",
    sourceLink: "https://musescore.com/sheetmusic/womens-choir",
    difficulty: "Intermediate"
  },
  {
    title: "Scarborough Fair",
    composer: "Traditional English",
    voicing: "SSA",
    description: "Traditional English ballad for women's choir (SSA)",
    source: "MuseScore",
    sourceLink: "https://musescore.com/sheetmusic/womens-choir",
    difficulty: "Intermediate"
  },
  {
    title: "The Parting Glass",
    composer: "Traditional Irish",
    voicing: "SSAA",
    description: "Traditional Irish farewell song for women's choir (SSAA)",
    source: "MuseScore",
    sourceLink: "https://musescore.com/sheetmusic/womens-choir",
    difficulty: "Advanced"
  },
  {
    title: "Down by the Salley Gardens",
    composer: "Traditional Irish",
    voicing: "SSA",
    description: "Traditional Irish song arranged for women's choir (SSA)",
    source: "MuseScore",
    sourceLink: "https://musescore.com/sheetmusic/womens-choir",
    difficulty: "Intermediate"
  },
  {
    title: "The Ash Grove",
    composer: "Traditional Welsh",
    voicing: "SSAA",
    description: "Traditional Welsh folk song for women's choir (SSAA)",
    source: "MuseScore",
    sourceLink: "https://musescore.com/sheetmusic/womens-choir",
    difficulty: "Intermediate"
  },
  {
    title: "Loch Lomond",
    composer: "Traditional Scottish",
    voicing: "SSA",
    description: "Traditional Scottish song for women's choir (SSA)",
    source: "MuseScore",
    sourceLink: "https://musescore.com/sheetmusic/womens-choir",
    difficulty: "Beginner"
  }
];

async function addMuseScoreSongs() {
  console.log('🎵 Adding SSAA/SSA songs from MuseScore women\'s choir collection...');
  
  try {
    // Create database connection
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });

    console.log('📥 Connecting to database...');
    
    // Test connection
    const client = await pool.connect();
    console.log('✅ Database connected successfully');
    
    let addedCount = 0;
    let skippedCount = 0;
    
    for (const song of museScoreSongs) {
      try {
        // Check if song already exists
        const existingSong = await client.query(
          'SELECT id FROM songs WHERE title = $1 AND composer = $2 AND voicing = $3',
          [song.title, song.composer, song.voicing]
        );
        
        if (existingSong.rows.length > 0) {
          console.log(`⏭️  Skipping "${song.title}" by ${song.composer} (${song.voicing}) - already exists`);
          skippedCount++;
          continue;
        }
        
        // Create search text
        const searchText = `${song.title} ${song.composer} ${song.voicing} ${song.description} ${song.difficulty}`.toLowerCase();
        
        // Insert song
        const result = await client.query(`
          INSERT INTO songs (title, composer, voicing, description, source, source_link, difficulty, search_text, created_at, updated_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
          RETURNING id
        `, [
          song.title,
          song.composer, 
          song.voicing,
          song.description,
          song.source,
          song.sourceLink,
          song.difficulty,
          searchText
        ]);
        
        console.log(`✅ Added "${song.title}" by ${song.composer} (${song.voicing}) - ID: ${result.rows[0].id}`);
        addedCount++;
        
      } catch (error) {
        console.error(`❌ Error adding "${song.title}":`, error.message);
      }
    }
    
    client.release();
    await pool.end();
    
    console.log('\n🎼 Summary:');
    console.log(`✅ Added: ${addedCount} songs`);
    console.log(`⏭️  Skipped: ${skippedCount} songs (already exist)`);
    console.log(`📊 Total processed: ${museScoreSongs.length} songs`);
    console.log('\n🎵 MuseScore songs addition completed successfully!');
    
  } catch (error) {
    console.error('❌ Error during song addition:', error);
    process.exit(1);
  }
}

// Run the song addition
addMuseScoreSongs();
