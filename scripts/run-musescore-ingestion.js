#!/usr/bin/env node

/**
 * Script to manually run MuseScore data ingestion
 * This will fetch songs from MuseScore women's choir collection and add them to the database
 */

const { DataIngestionService } = require('../backend/dist/services/dataIngestion');
const { Pool } = require('pg');
require('dotenv').config();

async function runMuseScoreIngestion() {
  console.log('🎵 Starting MuseScore data ingestion...');
  
  try {
    // Create database connection
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });

    // Create ingestion service
    const ingestionService = new DataIngestionService(pool);

    console.log('📥 Fetching songs from MuseScore women\'s choir collection...');
    
    // Run the MuseScore ingestion
    await ingestionService.runJob('musescore-manual-run');
    
    console.log('✅ MuseScore ingestion completed successfully!');
    console.log('🎼 Songs have been added to the database');
    
    // Close database connection
    await pool.end();
    
  } catch (error) {
    console.error('❌ Error during MuseScore ingestion:', error);
    process.exit(1);
  }
}

// Run the ingestion
runMuseScoreIngestion();
