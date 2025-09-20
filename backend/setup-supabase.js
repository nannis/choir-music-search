#!/usr/bin/env node

// Supabase Database Setup Script for Choir Music Search
// This script sets up the database schema on Supabase PostgreSQL

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Load environment variables from .env file
require('dotenv').config();

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function setupSupabaseDatabase() {
  log('🚀 Setting up Choir Music Search Database on Supabase...', 'cyan');
  
  try {
    // Check if DATABASE_URL is provided (Supabase automatically provides this)
    if (!process.env.DATABASE_URL) {
      log('❌ DATABASE_URL environment variable not found!', 'red');
      log('💡 Make sure you\'re running this in Supabase or have DATABASE_URL set locally', 'yellow');
      log('💡 Get your DATABASE_URL from Supabase Dashboard → Settings → Database', 'yellow');
      return;
    }

    log('🔍 Connecting to Supabase PostgreSQL database...', 'blue');
    
    // Create connection to Supabase
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    });

    // Test connection
    const client = await pool.connect();
    const result = await client.query('SELECT version()');
    client.release();
    
    log('✅ Supabase database connection successful!', 'green');
    log(`📊 PostgreSQL version: ${result.rows[0].version.split(' ')[0]}`, 'green');

    // Read and execute schema
    log('📄 Reading PostgreSQL database schema...', 'blue');
    const schemaPath = path.join(__dirname, '..', 'database', 'schema-postgresql.sql');
    
    if (!fs.existsSync(schemaPath)) {
      log('❌ Schema file not found. Please ensure database/schema-postgresql.sql exists.', 'red');
      return;
    }

    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Split schema into individual statements
    const statements = schema
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    log('🏗️  Executing database schema on Supabase...', 'blue');

    for (const statement of statements) {
      try {
        await pool.query(statement);
        log(`✅ Executed: ${statement.substring(0, 50)}...`, 'green');
      } catch (error) {
        if (error.code === '42P07' || error.message.includes('already exists')) {
          log(`⚠️  Table/function already exists: ${statement.substring(0, 50)}...`, 'yellow');
        } else {
          log(`❌ Error executing statement: ${error.message}`, 'red');
          log(`Statement: ${statement.substring(0, 100)}...`, 'red');
        }
      }
    }

    // Test the tables
    log('\n🧪 Testing database tables...', 'blue');
    
    const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    log(`✅ Found ${tablesResult.rows.length} tables:`, 'green');
    tablesResult.rows.forEach(table => {
      log(`   - ${table.table_name}`, 'green');
    });

    // Test data insertion
    const songCountResult = await pool.query('SELECT COUNT(*) as count FROM songs');
    log(`✅ Songs table has ${songCountResult.rows[0].count} records`, 'green');

    // Test full-text search
    const searchResult = await pool.query(`
      SELECT title, composer 
      FROM songs 
      WHERE to_tsvector('english', search_text || ' ' || title || ' ' || composer || ' ' || COALESCE(description, '')) 
      @@ plainto_tsquery('english', 'Bach') 
      LIMIT 3
    `);
    
    log(`✅ Full-text search test: Found ${searchResult.rows.length} results`, 'green');
    searchResult.rows.forEach(song => {
      log(`   - ${song.title} by ${song.composer}`, 'green');
    });

    await pool.end();

    log('\n🎉 Supabase database setup completed successfully!', 'green');
    log('\n📋 Next steps:', 'yellow');
    log('1. Your Supabase app should now be able to connect to the database', 'cyan');
    log('2. Test the API: curl https://your-app.vercel.app/api/health', 'cyan');
    log('3. Update your frontend to use the Supabase API URL', 'cyan');

  } catch (error) {
    log(`❌ Supabase database setup failed: ${error.message}`, 'red');
    
    if (error.code === '28P01') {
      log('💡 Check your DATABASE_URL credentials', 'yellow');
    } else if (error.code === 'ECONNREFUSED') {
      log('💡 Check if the Supabase database is running', 'yellow');
    } else if (error.code === '3D000') {
      log('💡 The database might not exist. Check your Supabase project.', 'yellow');
    }
    
    log('\n💡 Supabase Database Tips:', 'blue');
    log('- DATABASE_URL format: postgresql://user:password@host:port/database', 'blue');
    log('- Get DATABASE_URL from Supabase Dashboard → Settings → Database', 'blue');
    log('- Check Supabase dashboard for database status', 'blue');
  }
}

// Run the setup
setupSupabaseDatabase().catch(console.error);

