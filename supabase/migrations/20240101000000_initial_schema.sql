-- Initial database schema for Choir Music Search
-- Migration: Create base tables and indexes
-- This should be run first when setting up a new Supabase project

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Main songs table with PostgreSQL full-text search
CREATE TABLE songs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  composer VARCHAR(255) NOT NULL,
  text_writer VARCHAR(255),
  description TEXT,
  source_link VARCHAR(500) NOT NULL,
  audio_link VARCHAR(500),
  source VARCHAR(20) NOT NULL CHECK (source IN ('IMSLP', 'Hymnary', 'ChoralNet', 'MuseScore', 'SundMusik', 'Other')),
  
  -- Searchable metadata
  language VARCHAR(50),
  voicing VARCHAR(20),
  difficulty VARCHAR(20),
  season VARCHAR(50),
  theme VARCHAR(50),
  period VARCHAR(50),
  
  -- Full-text search field (combined searchable text)
  search_text TEXT,
  
  -- Metadata for management
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_verified TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE,
  
  -- Indexes for performance
  CONSTRAINT idx_title UNIQUE (title, composer)
);

-- Create indexes for performance
CREATE INDEX idx_songs_title ON songs (title);
CREATE INDEX idx_songs_composer ON songs (composer);
CREATE INDEX idx_songs_source ON songs (source);
CREATE INDEX idx_songs_language_voicing ON songs (language, voicing);
CREATE INDEX idx_songs_difficulty_theme ON songs (difficulty, theme);
CREATE INDEX idx_songs_active_updated ON songs (is_active, updated_at);

-- Full-text search index
CREATE INDEX idx_songs_search_text ON songs USING gin(to_tsvector('english', search_text || ' ' || title || ' ' || composer || ' ' || COALESCE(description, '')));

-- User submissions table for community contributions
CREATE TABLE user_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_email VARCHAR(255) NOT NULL,
  song_title VARCHAR(255) NOT NULL,
  composer VARCHAR(255) NOT NULL,
  source_link VARCHAR(500) NOT NULL,
  description TEXT,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Data ingestion jobs table for automated music discovery
CREATE TABLE ingestion_jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  source VARCHAR(50) NOT NULL,
  url VARCHAR(500) NOT NULL,
  parser VARCHAR(100) NOT NULL,
  schedule VARCHAR(100) NOT NULL,
  last_run TIMESTAMP,
  next_run TIMESTAMP,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'paused', 'error')),
  error_message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Query cache table for performance optimization
CREATE TABLE query_cache (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  query_hash VARCHAR(64) UNIQUE NOT NULL,
  query_text TEXT NOT NULL,
  results JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NOT NULL
);

-- Create indexes for additional tables
CREATE INDEX idx_user_submissions_status ON user_submissions (status);
CREATE INDEX idx_user_submissions_created ON user_submissions (created_at);
CREATE INDEX idx_ingestion_jobs_status ON ingestion_jobs (status);
CREATE INDEX idx_ingestion_jobs_next_run ON ingestion_jobs (next_run);
CREATE INDEX idx_query_cache_expires ON query_cache (expires_at);

-- Insert initial sample data
INSERT INTO songs (title, composer, text_writer, description, source_link, source, language, voicing, difficulty, theme, season, search_text) VALUES

-- IMSLP Works
('Ave Maria', 'Franz Schubert', 'Sir Walter Scott', 'Beloved sacred song with beautiful melody', 'https://imslp.org/wiki/Ave_Maria,_D.839_(Schubert,_Franz)', 'IMSLP', 'Latin', 'SATB', 'Intermediate', 'Sacred', NULL, 'Ave Maria Schubert Scott beloved sacred song beautiful melody'),
('Panis Angelicus', 'César Franck', 'Thomas Aquinas', 'Beautiful sacred song for solo voice and choir', 'https://imslp.org/wiki/Panis_Angelicus_(Franck,_César)', 'IMSLP', 'Latin', 'SATB', 'Intermediate', 'Sacred', NULL, 'Panis Angelicus Franck Aquinas beautiful sacred song solo voice choir'),
('Ave Verum Corpus', 'Wolfgang Amadeus Mozart', 'Latin hymn', 'Sacred motet with elegant simplicity', 'https://imslp.org/wiki/Ave_verum_corpus,_K.618_(Mozart,_Wolfgang_Amadeus)', 'IMSLP', 'Latin', 'SATB', 'Easy', 'Sacred', NULL, 'Ave Verum Corpus Mozart Latin hymn sacred motet elegant simplicity'),

-- Hymnary Works
('Amazing Grace', 'John Newton', 'John Newton', 'Beloved hymn with powerful message of redemption', 'https://hymnary.org/text/amazing_grace_how_sweet_the_sound', 'Hymnary', 'English', 'SATB', 'Easy', 'Sacred', NULL, 'Amazing Grace Newton beloved hymn powerful message redemption'),
('How Great Thou Art', 'Stuart K. Hine', 'Stuart K. Hine', 'Popular hymn celebrating God''s creation', 'https://hymnary.org/text/o_lord_my_god_when_i_in_awesome_wonder', 'Hymnary', 'English', 'SATB', 'Intermediate', 'Sacred', NULL, 'How Great Thou Art Hine popular hymn celebrating God creation'),
('Silent Night', 'Franz Gruber', 'Joseph Mohr', 'Peaceful Christmas carol', 'https://hymnary.org/text/silent_night_holy_night_all_is_calm', 'Hymnary', 'English', 'SATB', 'Easy', 'Sacred', 'Christmas', 'Silent Night Gruber Mohr peaceful Christmas carol'),

-- ChoralNet Works
('The Lord Bless You and Keep You', 'John Rutter', 'Numbers 6:24-26', 'Contemporary blessing with beautiful harmonies', 'https://choralnet.org/view/123456', 'ChoralNet', 'English', 'SATB', 'Intermediate', 'Sacred', NULL, 'Lord Bless You Keep You Rutter Numbers contemporary blessing beautiful harmonies'),
('For the Beauty of the Earth', 'John Rutter', 'Folliott S. Pierpoint', 'Joyful hymn celebrating creation', 'https://choralnet.org/view/123457', 'ChoralNet', 'English', 'SATB', 'Easy', 'Sacred', NULL, 'Beauty Earth Rutter Pierpoint joyful hymn celebrating creation'),

-- MuseScore Works
('Danny Boy', 'Traditional Irish', 'Frederic Weatherly', 'Emotional Irish ballad', 'https://musescore.com/sheetmusic/danny-boy', 'MuseScore', 'English', 'SATB', 'Intermediate', 'Folk', NULL, 'Danny Boy Traditional Irish Weatherly emotional ballad'),
('Shenandoah', 'Traditional American', 'Traditional', 'Hauntingly beautiful folk song', 'https://musescore.com/sheetmusic/shenandoah', 'MuseScore', 'English', 'SATB', 'Easy', 'Folk', NULL, 'Shenandoah Traditional American hauntingly beautiful folk song'),

-- Christmas Works
('O Come, O Come Emmanuel', 'Traditional', 'Latin antiphon', 'Advent hymn with ancient origins', 'https://hymnary.org/text/o_come_o_come_emmanuel', 'Hymnary', 'English', 'SATB', 'Easy', 'Sacred', 'Advent', 'O Come Emmanuel Traditional Latin antiphon Advent hymn ancient origins'),
('In the Bleak Midwinter', 'Gustav Holst', 'Christina Rossetti', 'Poetic Christmas carol', 'https://hymnary.org/text/in_the_bleak_midwinter', 'Hymnary', 'English', 'SATB', 'Intermediate', 'Sacred', 'Christmas', 'Bleak Midwinter Holst Rossetti poetic Christmas carol'),

-- Classical Works
('Locus Iste', 'Anton Bruckner', 'Latin antiphon', 'Sacred motet with rich harmonies', 'https://imslp.org/wiki/Locus_iste,_WAB_23_(Bruckner,_Anton)', 'IMSLP', 'Latin', 'SATB', 'Advanced', 'Sacred', NULL, 'Locus Iste Bruckner Latin antiphon sacred motet rich harmonies'),
('Ave Maria', 'Anton Bruckner', 'Latin hymn', 'Romantic setting with lush harmonies', 'https://imslp.org/wiki/Ave_Maria,_WAB_6_(Bruckner,_Anton)', 'IMSLP', 'Latin', 'SATB', 'Advanced', 'Sacred', NULL, 'Ave Maria Bruckner Latin hymn Romantic setting lush harmonies'),

-- Modern Works
('The Road Home', 'Stephen Paulus', 'Michael Dennis Browne', 'Contemporary choral work with beautiful text', 'https://choralnet.org/view/123458', 'ChoralNet', 'English', 'SATB', 'Advanced', 'Sacred', NULL, 'Road Home Paulus Browne contemporary choral work beautiful text'),
('Sure on This Shining Night', 'Morten Lauridsen', 'James Agee', 'Romantic choral setting of poetry', 'https://choralnet.org/view/123459', 'ChoralNet', 'English', 'SATB', 'Advanced', 'Sacred', NULL, 'Sure Shining Night Lauridsen Agee romantic choral setting poetry');
