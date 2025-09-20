-- PostgreSQL Database Schema for Choir Music Search
-- Optimized for Supabase with full-text search capabilities

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
  user_id UUID,
  title VARCHAR(255) NOT NULL,
  composer VARCHAR(255) NOT NULL,
  source_link VARCHAR(500) NOT NULL,
  description TEXT,
  
  -- Metadata
  language VARCHAR(50),
  voicing VARCHAR(20),
  difficulty VARCHAR(20),
  season VARCHAR(50),
  theme VARCHAR(50),
  
  -- Submission status
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  reviewed_at TIMESTAMP NULL,
  reviewed_by UUID,
  review_notes TEXT,
  
  CONSTRAINT idx_submission_status UNIQUE (id)
);

CREATE INDEX idx_user_submissions_status ON user_submissions (status);
CREATE INDEX idx_user_submissions_submitted_at ON user_submissions (submitted_at);

-- Data ingestion jobs table
CREATE TABLE ingestion_jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  source VARCHAR(50) NOT NULL,
  url VARCHAR(500) NOT NULL,
  parser VARCHAR(100) NOT NULL,
  schedule VARCHAR(100), -- cron expression
  last_run TIMESTAMP NULL,
  next_run TIMESTAMP NULL,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'paused', 'error')),
  error_message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT idx_ingestion_source_status UNIQUE (source, status)
);

CREATE INDEX idx_ingestion_jobs_source_status ON ingestion_jobs (source, status);
CREATE INDEX idx_ingestion_jobs_next_run ON ingestion_jobs (next_run);

-- Query cache table for performance
CREATE TABLE query_cache (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  query_hash VARCHAR(64) UNIQUE NOT NULL,
  query_text TEXT NOT NULL,
  filters JSONB,
  results JSONB,
  result_count INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NOT NULL,
  
  CONSTRAINT idx_query_cache_hash UNIQUE (query_hash)
);

CREATE INDEX idx_query_cache_query_hash ON query_cache (query_hash);
CREATE INDEX idx_query_cache_expires_at ON query_cache (expires_at);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
CREATE TRIGGER update_songs_updated_at BEFORE UPDATE ON songs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ingestion_jobs_updated_at BEFORE UPDATE ON ingestion_jobs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert initial data from current hardcoded databases
INSERT INTO songs (id, title, composer, text_writer, description, source_link, source, language, voicing, difficulty, theme, season, search_text) VALUES
-- IMSLP Works
(uuid_generate_v4(), 'Ave Maria', 'Franz Schubert', 'Sir Walter Scott / Latin text', 'One of the most beloved Ave Maria settings for choir', 'https://imslp.org/wiki/Ave_Maria,_D.839_(Schubert,_Franz)', 'IMSLP', 'Latin', 'SATB', 'Intermediate', 'Sacred', NULL, 'Ave Maria Franz Schubert Sir Walter Scott Latin text One of the most beloved Ave Maria settings for choir'),
(uuid_generate_v4(), 'Mass in B minor - Kyrie', 'Johann Sebastian Bach', 'Latin Mass Ordinary', 'Opening movement of Bach''s monumental Mass in B minor', 'https://imslp.org/wiki/Mass_in_B_minor,_BWV_232_(Bach,_Johann_Sebastian)', 'IMSLP', 'Latin', 'SATB', 'Advanced', 'Sacred', NULL, 'Mass in B minor Kyrie Johann Sebastian Bach Latin Mass Ordinary Opening movement of Bach''s monumental Mass in B minor'),
(uuid_generate_v4(), 'Jesu, Joy of Man''s Desiring', 'Johann Sebastian Bach', 'Martin Jahn', 'Beautiful chorale from Bach''s Cantata 147, perfect for choir arrangements', 'https://imslp.org/wiki/Herz_und_Mund_und_Tat_und_Leben,_BWV_147_(Bach,_Johann_Sebastian)', 'IMSLP', 'German', 'SATB', 'Intermediate', 'Sacred', NULL, 'Jesu Joy of Man''s Desiring Johann Sebastian Bach Martin Jahn Beautiful chorale from Bach''s Cantata 147 perfect for choir arrangements'),
(uuid_generate_v4(), 'O Magnum Mysterium', 'Tomás Luis de Victoria', 'Latin antiphon', 'Renaissance masterpiece for Christmas season', 'https://imslp.org/wiki/O_magnum_mysterium_(Victoria,_Tomás_Luis_de)', 'IMSLP', 'Latin', 'SATB', 'Intermediate', 'Sacred', 'Christmas', 'O Magnum Mysterium Tomás Luis de Victoria Latin antiphon Renaissance masterpiece for Christmas season'),
(uuid_generate_v4(), 'Veni Creator Spiritus', 'Giovanni Pierluigi da Palestrina', 'Rabanus Maurus', 'Classic hymn to the Holy Spirit, Renaissance polyphony', 'https://imslp.org/wiki/Veni_Creator_Spiritus_(Palestrina,_Giovanni_Pierluigi_da)', 'IMSLP', 'Latin', 'SATB', 'Advanced', 'Sacred', NULL, 'Veni Creator Spiritus Giovanni Pierluigi da Palestrina Rabanus Maurus Classic hymn to the Holy Spirit Renaissance polyphony'),

-- Hymnary Works
(uuid_generate_v4(), 'Amazing Grace', 'John Newton / Traditional', 'John Newton', 'Most beloved hymn in English, suitable for choir arrangement in various styles', 'https://hymnary.org/text/amazing_grace_how_sweet_the_sound', 'Hymnary', 'English', 'SATB', 'Easy', 'Sacred', NULL, 'Amazing Grace John Newton Traditional Most beloved hymn in English suitable for choir arrangement in various styles'),
(uuid_generate_v4(), 'How Great Thou Art', 'Stuart K. Hine / Traditional Swedish melody', 'Stuart K. Hine', 'Popular Christian hymn, excellent for choir with rich harmonies', 'https://hymnary.org/text/o_lord_my_god_when_i_in_awesome_wonder', 'Hymnary', 'English', 'SATB', 'Intermediate', 'Sacred', NULL, 'How Great Thou Art Stuart K. Hine Traditional Swedish melody Popular Christian hymn excellent for choir with rich harmonies'),
(uuid_generate_v4(), 'Holy, Holy, Holy', 'John B. Dykes', 'Reginald Heber', 'Classic Trinity hymn, perfect for mixed choir arrangements', 'https://hymnary.org/text/holy_holy_holy_lord_god_almighty', 'Hymnary', 'English', 'SATB', 'Intermediate', 'Sacred', NULL, 'Holy Holy Holy John B. Dykes Reginald Heber Classic Trinity hymn perfect for mixed choir arrangements'),
(uuid_generate_v4(), 'O Come, O Come Emmanuel', 'Traditional / Various arrangements', 'Latin antiphon', 'Ancient Advent hymn, beautiful for choir during Christmas season', 'https://hymnary.org/text/o_come_o_come_emmanuel', 'Hymnary', 'English', 'SATB', 'Easy', 'Sacred', 'Advent', 'O Come O Come Emmanuel Traditional Various arrangements Latin antiphon Ancient Advent hymn beautiful for choir during Christmas season'),
(uuid_generate_v4(), 'Silent Night', 'Franz Gruber', 'Joseph Mohr', 'World''s most beloved Christmas carol, perfect for choir arrangements', 'https://hymnary.org/text/silent_night_holy_night_all_is_calm', 'Hymnary', 'English', 'SATB', 'Easy', 'Sacred', 'Christmas', 'Silent Night Franz Gruber Joseph Mohr World''s most beloved Christmas carol perfect for choir arrangements'),

-- Classical Choral Works
(uuid_generate_v4(), 'Messiah - Hallelujah Chorus', 'George Frideric Handel', 'Charles Jennens', 'The most famous choral movement from Handel''s Messiah, triumphant Easter music for SATB choir', 'https://imslp.org/wiki/Messiah,_HWV_56_(Handel,_George_Frideric)', 'IMSLP', 'English', 'SATB', 'Advanced', 'Sacred', 'Easter', 'Messiah Hallelujah Chorus George Frideric Handel Charles Jennens The most famous choral movement from Handel''s Messiah triumphant Easter music for SATB choir'),
(uuid_generate_v4(), 'Requiem - Dies Irae', 'Wolfgang Amadeus Mozart', 'Latin Requiem Mass', 'Dramatic movement from Mozart''s Requiem, powerful piece for experienced choirs', 'https://imslp.org/wiki/Requiem,_K.626_(Mozart,_Wolfgang_Amadeus)', 'IMSLP', 'Latin', 'SATB', 'Advanced', 'Funeral', NULL, 'Requiem Dies Irae Wolfgang Amadeus Mozart Latin Requiem Mass Dramatic movement from Mozart''s Requiem powerful piece for experienced choirs'),
(uuid_generate_v4(), 'Te Deum', 'Antonín Dvořák', 'Latin Te Deum text', 'Majestic setting of the Te Deum for choir, soloists and orchestra', 'https://imslp.org/wiki/Te_Deum,_Op.103_(Dvořák,_Antonín)', 'IMSLP', 'Latin', 'SATB', 'Advanced', 'Sacred', NULL, 'Te Deum Antonín Dvořák Latin Te Deum text Majestic setting of the Te Deum for choir soloists and orchestra'),
(uuid_generate_v4(), 'Locus Iste', 'Anton Bruckner', 'Latin antiphon', 'Sacred motet for unaccompanied mixed choir, perfect for church choirs', 'https://imslp.org/wiki/Locus_iste,_WAB_23_(Bruckner,_Anton)', 'IMSLP', 'Latin', 'SATB', 'Intermediate', 'Sacred', NULL, 'Locus Iste Anton Bruckner Latin antiphon Sacred motet for unaccompanied mixed choir perfect for church choirs'),
(uuid_generate_v4(), 'Ave Verum Corpus', 'Wolfgang Amadeus Mozart', 'Latin hymn', 'Beautiful sacred motet for mixed choir, Mozart''s last completed sacred work', 'https://imslp.org/wiki/Ave_verum_corpus,_K.618_(Mozart,_Wolfgang_Amadeus)', 'IMSLP', 'Latin', 'SATB', 'Easy', 'Sacred', NULL, 'Ave Verum Corpus Wolfgang Amadeus Mozart Latin hymn Beautiful sacred motet for mixed choir Mozart''s last completed sacred work'),
(uuid_generate_v4(), 'Gloria in Excelsis Deo', 'Antonio Vivaldi', 'Latin Gloria text', 'Joyful Christmas Gloria for mixed choir and orchestra', 'https://imslp.org/wiki/Gloria_in_D_major,_RV_589_(Vivaldi,_Antonio)', 'IMSLP', 'Latin', 'SATB', 'Advanced', 'Sacred', 'Christmas', 'Gloria in Excelsis Deo Antonio Vivaldi Latin Gloria text Joyful Christmas Gloria for mixed choir and orchestra');

-- Insert initial ingestion jobs
INSERT INTO ingestion_jobs (id, source, url, parser, schedule, status) VALUES
(uuid_generate_v4(), 'IMSLP', 'https://imslp.org/wiki/Category:For_female_chorus', 'IMSLPParser', '0 2 * * *', 'active'),
(uuid_generate_v4(), 'MuseScore', 'https://musescore.com/sheetmusic/womens-choir', 'MuseScoreParser', '0 */6 * * *', 'active'),
(uuid_generate_v4(), 'SundMusik', 'https://sundmusik.com/product-category/kornoter/damkor/', 'SundMusikParser', '0 3 * * 0', 'active');



