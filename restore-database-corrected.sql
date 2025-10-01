-- Database Restoration Script - Corrected to Match Original Schema
-- Run this in the Supabase SQL Editor to restore the database exactly as it was

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Main songs table with PostgreSQL full-text search
CREATE TABLE IF NOT EXISTS songs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  composer VARCHAR(255) NOT NULL,
  text_writer VARCHAR(255),
  description TEXT,
  source_link VARCHAR(500) NOT NULL,
  audio_link VARCHAR(500),
  source VARCHAR(20) NOT NULL CHECK (source IN ('IMSLP', 'Hymnary', 'ChoralNet', 'MuseScore', 'SundMusik', 'ChorusOnline', 'HalLeonard', 'FluegelMusic', 'CarusVerlag', 'SchottMusic', 'StrettaMusic', 'CPDL', 'Musopen', 'Other')),
  
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
  is_active BOOLEAN DEFAULT TRUE
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_songs_title ON songs (title);
CREATE INDEX IF NOT EXISTS idx_songs_composer ON songs (composer);
CREATE INDEX IF NOT EXISTS idx_songs_source ON songs (source);
CREATE INDEX IF NOT EXISTS idx_songs_language_voicing ON songs (language, voicing);
CREATE INDEX IF NOT EXISTS idx_songs_difficulty_theme ON songs (difficulty, theme);
CREATE INDEX IF NOT EXISTS idx_songs_active_updated ON songs (is_active, updated_at);

-- Full-text search index
CREATE INDEX IF NOT EXISTS idx_songs_search_text ON songs USING gin(to_tsvector('english', search_text || ' ' || title || ' ' || composer || ' ' || COALESCE(description, '')));

-- User submissions table for community contributions (CORRECTED SCHEMA)
CREATE TABLE IF NOT EXISTS user_submissions (
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
  review_notes TEXT
);

CREATE INDEX IF NOT EXISTS idx_user_submissions_status ON user_submissions (status);
CREATE INDEX IF NOT EXISTS idx_user_submissions_submitted_at ON user_submissions (submitted_at);

-- Data ingestion jobs table (CORRECTED SCHEMA)
CREATE TABLE IF NOT EXISTS ingestion_jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  source VARCHAR(50) NOT NULL,
  url VARCHAR(500) NOT NULL,
  parser VARCHAR(100) NOT NULL,
  schedule VARCHAR(100), -- cron expression (NULLABLE as in original)
  last_run TIMESTAMP NULL,
  next_run TIMESTAMP NULL,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'paused', 'error')),
  error_message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_ingestion_jobs_source_status ON ingestion_jobs (source, status);
CREATE INDEX IF NOT EXISTS idx_ingestion_jobs_next_run ON ingestion_jobs (next_run);

-- Function to update updated_at timestamp (MISSING FROM ORIGINAL RESTORATION)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at (MISSING FROM ORIGINAL RESTORATION)
CREATE TRIGGER update_songs_updated_at BEFORE UPDATE ON songs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ingestion_jobs_updated_at BEFORE UPDATE ON ingestion_jobs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert initial data (EXACTLY AS IN ORIGINAL)
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

-- Insert initial ingestion jobs (EXACTLY AS IN ORIGINAL)
INSERT INTO ingestion_jobs (id, source, url, parser, schedule, status) VALUES
(uuid_generate_v4(), 'IMSLP', 'https://imslp.org/wiki/Category:For_female_chorus', 'IMSLPParser', '0 2 * * *', 'active'),
(uuid_generate_v4(), 'MuseScore', 'https://musescore.com/sheetmusic/womens-choir', 'MuseScoreParser', '0 */6 * * *', 'active'),
(uuid_generate_v4(), 'SundMusik', 'https://sundmusik.com/product-category/kornoter/damkor/', 'SundMusikParser', '0 3 * * 0', 'active');

-- Add the new female choir music sources to the existing data
INSERT INTO ingestion_jobs (id, source, url, parser, schedule, status) VALUES
(uuid_generate_v4(), 'ChorusOnline', 'https://www.chorusonline.com/sheet-music-female-choir', 'ChorusOnlineParser', '0 4 * * *', 'active'),
(uuid_generate_v4(), 'HalLeonard', 'https://www.halleonard.com/search?q=women%27s+choir', 'HalLeonardParser', '0 5 * * 0', 'active'),
(uuid_generate_v4(), 'CPDL', 'https://www.cpdl.org/wiki/index.php/Category:Women%27s_choir', 'CPDLParser', '0 6 * * 0', 'active');

-- Add sample female choir music from various sources
INSERT INTO songs (title, composer, text_writer, description, source_link, audio_link, source, language, voicing, difficulty, theme, season, search_text) VALUES
-- ChorusOnline Works (Modern arrangements with audio)
('It''s Raining Men', 'The Pointer Sisters', 'Paul Jabara, Paul Shaffer', 'Popular hit arranged for SSA choir with practice MP3 files', 'https://www.chorusonline.com/sheet-music-female-choir', 'https://www.chorusonline.com/audio/its-raining-men-ssa.mp3', 'ChorusOnline', 'English', 'SSA', 'Intermediate', 'Popular', NULL, 'It''s Raining Men The Pointer Sisters Paul Jabara Paul Shaffer Popular hit arranged for SSA choir with practice MP3 files'),
('Free Your Mind', 'En Vogue', 'Denise Matthews, Thomas McElroy', 'R&B classic arranged for SSAA choir with audio samples', 'https://www.chorusonline.com/sheet-music-female-choir', 'https://www.chorusonline.com/audio/free-your-mind-ssaa.mp3', 'ChorusOnline', 'English', 'SSAA', 'Advanced', 'Popular', NULL, 'Free Your Mind En Vogue Denise Matthews Thomas McElroy R&B classic arranged for SSAA choir with audio samples'),
('I''m Outta Love', 'Anastacia', 'Anastacia, Sam Watters, Louis Biancaniello', 'Pop hit arranged for SSA choir with practice tracks', 'https://www.chorusonline.com/sheet-music-female-choir', 'https://www.chorusonline.com/audio/im-outta-love-ssa.mp3', 'ChorusOnline', 'English', 'SSA', 'Intermediate', 'Popular', NULL, 'I''m Outta Love Anastacia Sam Watters Louis Biancaniello Pop hit arranged for SSA choir with practice tracks'),

-- Hal Leonard Works (Professional arrangements with rehearsal tracks)
('Let The Women Sing! A Cappella Collection', 'Various Composers', 'Various', 'Collection of 10 reproducible choral works for SSA voices with digital rehearsal mixes', 'https://www.halleonard.com/product/35032621/let-the-women-sing-a-cappella', 'https://www.halleonard.com/audio/let-the-women-sing-demo.mp3', 'HalLeonard', 'English', 'SSA', 'Intermediate', 'Sacred', NULL, 'Let The Women Sing A Cappella Collection Various Composers Collection of 10 reproducible choral works for SSA voices with digital rehearsal mixes'),
('The Sound of Music for Female Singers', 'Richard Rodgers', 'Oscar Hammerstein II', 'Classic musical selections arranged for women''s choir with demo and backing tracks', 'https://www.halleonard.com/product/280849/the-sound-of-music-for-female-singers', 'https://www.halleonard.com/audio/sound-of-music-female-demo.mp3', 'HalLeonard', 'English', 'SSA', 'Easy', 'Musical', NULL, 'The Sound of Music for Female Singers Richard Rodgers Oscar Hammerstein II Classic musical selections arranged for women''s choir with demo and backing tracks'),

-- Fluegel Music Works (High-quality arrangements)
('Hallelujah', 'Leonard Cohen', 'Leonard Cohen', 'Beautiful arrangement of Leonard Cohen''s classic for women''s choir', 'https://www.fluegelmusic.com/en/chor-arrangements', 'https://www.fluegelmusic.com/audio/hallelujah-female-choir.mp3', 'FluegelMusic', 'English', 'SSAA', 'Intermediate', 'Popular', NULL, 'Hallelujah Leonard Cohen Beautiful arrangement of Leonard Cohen''s classic for women''s choir'),
('Fields of Gold', 'Sting', 'Sting', 'Ethereal arrangement of Sting''s hit for SSA choir', 'https://www.fluegelmusic.com/en/chor-arrangements', 'https://www.fluegelmusic.com/audio/fields-of-gold-ssa.mp3', 'FluegelMusic', 'English', 'SSA', 'Intermediate', 'Popular', NULL, 'Fields of Gold Sting Ethereal arrangement of Sting''s hit for SSA choir'),

-- Carus-Verlag Works (Classical and contemporary)
('Ave Maria', 'Franz Biebl', 'Latin text', 'Beautiful Ave Maria setting for women''s choir, 4-part a cappella', 'https://www.carus-verlag.com/en/choral-music/choral-music-by-scoring/equal-voices/women-s-choir/', 'https://www.carus-verlag.com/audio/ave-maria-biebl-female.mp3', 'CarusVerlag', 'Latin', 'SSAA', 'Advanced', 'Sacred', NULL, 'Ave Maria Franz Biebl Latin text Beautiful Ave Maria setting for women''s choir 4-part a cappella'),
('O Magnum Mysterium', 'Morten Lauridsen', 'Latin antiphon', 'Contemporary setting of the Christmas antiphon for women''s choir', 'https://www.carus-verlag.com/en/choral-music/choral-music-by-scoring/equal-voices/women-s-choir/', 'https://www.carus-verlag.com/audio/o-magnum-mysterium-lauridsen-female.mp3', 'CarusVerlag', 'Latin', 'SSAA', 'Advanced', 'Sacred', 'Christmas', 'O Magnum Mysterium Morten Lauridsen Latin antiphon Contemporary setting of the Christmas antiphon for women''s choir'),

-- Schott Music Works (Professional publications)
('Locus Iste', 'Anton Bruckner', 'Latin antiphon', 'Sacred motet for women''s choir with organ accompaniment', 'https://www.schott-music.com/en/sheet-music/choral-vocal-music/women-s-choir-with-accompaniment.html', 'https://www.schott-music.com/audio/locus-iste-bruckner-female.mp3', 'SchottMusic', 'Latin', 'SSA', 'Intermediate', 'Sacred', NULL, 'Locus Iste Anton Bruckner Latin antiphon Sacred motet for women''s choir with organ accompaniment'),
('Ave Verum Corpus', 'Wolfgang Amadeus Mozart', 'Latin hymn', 'Mozart''s beautiful motet arranged for women''s choir', 'https://www.schott-music.com/en/sheet-music/choral-vocal-music/women-s-choir-with-accompaniment.html', 'https://www.schott-music.com/audio/ave-verum-corpus-mozart-female.mp3', 'SchottMusic', 'Latin', 'SSA', 'Easy', 'Sacred', NULL, 'Ave Verum Corpus Wolfgang Amadeus Mozart Latin hymn Mozart''s beautiful motet arranged for women''s choir'),

-- CPDL Works (Free public domain)
('Ave Maria', 'Josquin des Prez', 'Latin text', 'Renaissance masterpiece for women''s choir, free from CPDL', 'https://www.cpdl.org/wiki/index.php/Ave_Maria_(Josquin_des_Prez)', 'https://www.cpdl.org/audio/ave-maria-josquin-female.mp3', 'CPDL', 'Latin', 'SSAA', 'Advanced', 'Sacred', NULL, 'Ave Maria Josquin des Prez Latin text Renaissance masterpiece for women''s choir free from CPDL'),
('O Magnum Mysterium', 'Tomás Luis de Victoria', 'Latin antiphon', 'Renaissance Christmas motet for women''s choir', 'https://www.cpdl.org/wiki/index.php/O_magnum_mysterium_(Tomás_Luis_de_Victoria)', 'https://www.cpdl.org/audio/o-magnum-mysterium-victoria-female.mp3', 'CPDL', 'Latin', 'SSAA', 'Intermediate', 'Sacred', 'Christmas', 'O Magnum Mysterium Tomás Luis de Victoria Latin antiphon Renaissance Christmas motet for women''s choir'),

-- Musopen Works (Free classical)
('Ave Maria', 'Franz Schubert', 'Sir Walter Scott', 'Schubert''s beloved Ave Maria arranged for women''s choir', 'https://musopen.org/music/instrument/choir/', 'https://musopen.org/audio/ave-maria-schubert-female.mp3', 'Musopen', 'Latin', 'SSA', 'Intermediate', 'Sacred', NULL, 'Ave Maria Franz Schubert Sir Walter Scott Schubert''s beloved Ave Maria arranged for women''s choir'),
('Jesu, Joy of Man''s Desiring', 'Johann Sebastian Bach', 'Martin Jahn', 'Bach''s beautiful chorale arranged for women''s choir', 'https://musopen.org/music/instrument/choir/', 'https://musopen.org/audio/jesu-joy-bach-female.mp3', 'Musopen', 'German', 'SSA', 'Easy', 'Sacred', NULL, 'Jesu Joy of Man''s Desiring Johann Sebastian Bach Martin Jahn Bach''s beautiful chorale arranged for women''s choir');
