-- Database Schema Fix Script
-- Run this in the Supabase SQL Editor to fix the existing database schema
-- This script only makes the necessary changes to match the original schema

-- 1. Fix user_submissions table structure
-- Drop the incorrect columns and recreate with correct structure
ALTER TABLE user_submissions DROP COLUMN IF EXISTS user_email;
ALTER TABLE user_submissions DROP COLUMN IF EXISTS song_title;
ALTER TABLE user_submissions DROP COLUMN IF EXISTS created_at;
ALTER TABLE user_submissions DROP COLUMN IF EXISTS updated_at;
ALTER TABLE user_submissions DROP COLUMN IF EXISTS admin_notes;

-- Add the correct columns
ALTER TABLE user_submissions ADD COLUMN IF NOT EXISTS user_id UUID;
ALTER TABLE user_submissions ADD COLUMN IF NOT EXISTS title VARCHAR(255);
ALTER TABLE user_submissions ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE user_submissions ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMP NULL;
ALTER TABLE user_submissions ADD COLUMN IF NOT EXISTS reviewed_by UUID;
ALTER TABLE user_submissions ADD COLUMN IF NOT EXISTS review_notes TEXT;

-- Add metadata columns if they don't exist
ALTER TABLE user_submissions ADD COLUMN IF NOT EXISTS language VARCHAR(50);
ALTER TABLE user_submissions ADD COLUMN IF NOT EXISTS voicing VARCHAR(20);
ALTER TABLE user_submissions ADD COLUMN IF NOT EXISTS difficulty VARCHAR(20);
ALTER TABLE user_submissions ADD COLUMN IF NOT EXISTS season VARCHAR(50);
ALTER TABLE user_submissions ADD COLUMN IF NOT EXISTS theme VARCHAR(50);

-- Make title and composer NOT NULL if they aren't already
ALTER TABLE user_submissions ALTER COLUMN title SET NOT NULL;
ALTER TABLE user_submissions ALTER COLUMN composer SET NOT NULL;

-- 2. Fix ingestion_jobs table structure
-- Make schedule nullable (as in original)
ALTER TABLE ingestion_jobs ALTER COLUMN schedule DROP NOT NULL;

-- 3. Remove the unique constraint from songs table if it exists
ALTER TABLE songs DROP CONSTRAINT IF EXISTS idx_title;

-- 4. Create the missing function and triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers if they don't exist
DROP TRIGGER IF EXISTS update_songs_updated_at ON songs;
CREATE TRIGGER update_songs_updated_at BEFORE UPDATE ON songs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_ingestion_jobs_updated_at ON ingestion_jobs;
CREATE TRIGGER update_ingestion_jobs_updated_at BEFORE UPDATE ON ingestion_jobs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 5. Fix indexes to match original schema
-- Drop incorrect indexes
DROP INDEX IF EXISTS idx_user_submissions_created;
DROP INDEX IF EXISTS idx_ingestion_jobs_status;
DROP INDEX IF EXISTS idx_ingestion_jobs_next_run;

-- Create correct indexes
CREATE INDEX IF NOT EXISTS idx_user_submissions_submitted_at ON user_submissions (submitted_at);
CREATE INDEX IF NOT EXISTS idx_ingestion_jobs_source_status ON ingestion_jobs (source, status);
CREATE INDEX IF NOT EXISTS idx_ingestion_jobs_next_run ON ingestion_jobs (next_run);

-- 6. Remove query_cache table if it exists (not in original schema)
DROP TABLE IF EXISTS query_cache;

-- 7. Update the source constraint to include new sources (if not already done)
ALTER TABLE songs DROP CONSTRAINT IF EXISTS songs_source_check;
ALTER TABLE songs ADD CONSTRAINT songs_source_check CHECK (source IN ('IMSLP', 'Hymnary', 'ChoralNet', 'MuseScore', 'SundMusik', 'ChorusOnline', 'HalLeonard', 'FluegelMusic', 'CarusVerlag', 'SchottMusic', 'StrettaMusic', 'CPDL', 'Musopen', 'Other'));

-- 8. Add missing ingestion jobs for new sources (if they don't exist)
INSERT INTO ingestion_jobs (id, source, url, parser, schedule, status) 
SELECT uuid_generate_v4(), 'ChorusOnline', 'https://www.chorusonline.com/sheet-music-female-choir', 'ChorusOnlineParser', '0 4 * * *', 'active'
WHERE NOT EXISTS (SELECT 1 FROM ingestion_jobs WHERE source = 'ChorusOnline');

INSERT INTO ingestion_jobs (id, source, url, parser, schedule, status) 
SELECT uuid_generate_v4(), 'HalLeonard', 'https://www.halleonard.com/search?q=women%27s+choir', 'HalLeonardParser', '0 5 * * 0', 'active'
WHERE NOT EXISTS (SELECT 1 FROM ingestion_jobs WHERE source = 'HalLeonard');

INSERT INTO ingestion_jobs (id, source, url, parser, schedule, status) 
SELECT uuid_generate_v4(), 'CPDL', 'https://www.cpdl.org/wiki/index.php/Category:Women%27s_choir', 'CPDLParser', '0 6 * * 0', 'active'
WHERE NOT EXISTS (SELECT 1 FROM ingestion_jobs WHERE source = 'CPDL');

-- 9. Add sample female choir music (if not already added)
INSERT INTO songs (title, composer, text_writer, description, source_link, audio_link, source, language, voicing, difficulty, theme, season, search_text) 
SELECT * FROM (VALUES
-- ChorusOnline Works
('It''s Raining Men', 'The Pointer Sisters', 'Paul Jabara, Paul Shaffer', 'Popular hit arranged for SSA choir with practice MP3 files', 'https://www.chorusonline.com/sheet-music-female-choir', 'https://www.chorusonline.com/audio/its-raining-men-ssa.mp3', 'ChorusOnline', 'English', 'SSA', 'Intermediate', 'Popular', NULL, 'It''s Raining Men The Pointer Sisters Paul Jabara Paul Shaffer Popular hit arranged for SSA choir with practice MP3 files'),
('Free Your Mind', 'En Vogue', 'Denise Matthews, Thomas McElroy', 'R&B classic arranged for SSAA choir with audio samples', 'https://www.chorusonline.com/sheet-music-female-choir', 'https://www.chorusonline.com/audio/free-your-mind-ssaa.mp3', 'ChorusOnline', 'English', 'SSAA', 'Advanced', 'Popular', NULL, 'Free Your Mind En Vogue Denise Matthews Thomas McElroy R&B classic arranged for SSAA choir with audio samples'),
('I''m Outta Love', 'Anastacia', 'Anastacia, Sam Watters, Louis Biancaniello', 'Pop hit arranged for SSA choir with practice tracks', 'https://www.chorusonline.com/sheet-music-female-choir', 'https://www.chorusonline.com/audio/im-outta-love-ssa.mp3', 'ChorusOnline', 'English', 'SSA', 'Intermediate', 'Popular', NULL, 'I''m Outta Love Anastacia Sam Watters Louis Biancaniello Pop hit arranged for SSA choir with practice tracks'),

-- Hal Leonard Works
('Let The Women Sing! A Cappella Collection', 'Various Composers', 'Various', 'Collection of 10 reproducible choral works for SSA voices with digital rehearsal mixes', 'https://www.halleonard.com/product/35032621/let-the-women-sing-a-cappella', 'https://www.halleonard.com/audio/let-the-women-sing-demo.mp3', 'HalLeonard', 'English', 'SSA', 'Intermediate', 'Sacred', NULL, 'Let The Women Sing A Cappella Collection Various Composers Collection of 10 reproducible choral works for SSA voices with digital rehearsal mixes'),
('The Sound of Music for Female Singers', 'Richard Rodgers', 'Oscar Hammerstein II', 'Classic musical selections arranged for women''s choir with demo and backing tracks', 'https://www.halleonard.com/product/280849/the-sound-of-music-for-female-singers', 'https://www.halleonard.com/audio/sound-of-music-female-demo.mp3', 'HalLeonard', 'English', 'SSA', 'Easy', 'Musical', NULL, 'The Sound of Music for Female Singers Richard Rodgers Oscar Hammerstein II Classic musical selections arranged for women''s choir with demo and backing tracks'),

-- Fluegel Music Works
('Hallelujah', 'Leonard Cohen', 'Leonard Cohen', 'Beautiful arrangement of Leonard Cohen''s classic for women''s choir', 'https://www.fluegelmusic.com/en/chor-arrangements', 'https://www.fluegelmusic.com/audio/hallelujah-female-choir.mp3', 'FluegelMusic', 'English', 'SSAA', 'Intermediate', 'Popular', NULL, 'Hallelujah Leonard Cohen Beautiful arrangement of Leonard Cohen''s classic for women''s choir'),
('Fields of Gold', 'Sting', 'Sting', 'Ethereal arrangement of Sting''s hit for SSA choir', 'https://www.fluegelmusic.com/en/chor-arrangements', 'https://www.fluegelmusic.com/audio/fields-of-gold-ssa.mp3', 'FluegelMusic', 'English', 'SSA', 'Intermediate', 'Popular', NULL, 'Fields of Gold Sting Ethereal arrangement of Sting''s hit for SSA choir'),

-- Carus-Verlag Works
('Ave Maria', 'Franz Biebl', 'Latin text', 'Beautiful Ave Maria setting for women''s choir, 4-part a cappella', 'https://www.carus-verlag.com/en/choral-music/choral-music-by-scoring/equal-voices/women-s-choir/', 'https://www.carus-verlag.com/audio/ave-maria-biebl-female.mp3', 'CarusVerlag', 'Latin', 'SSAA', 'Advanced', 'Sacred', NULL, 'Ave Maria Franz Biebl Latin text Beautiful Ave Maria setting for women''s choir 4-part a cappella'),
('O Magnum Mysterium', 'Morten Lauridsen', 'Latin antiphon', 'Contemporary setting of the Christmas antiphon for women''s choir', 'https://www.carus-verlag.com/en/choral-music/choral-music-by-scoring/equal-voices/women-s-choir/', 'https://www.carus-verlag.com/audio/o-magnum-mysterium-lauridsen-female.mp3', 'CarusVerlag', 'Latin', 'SSAA', 'Advanced', 'Sacred', 'Christmas', 'O Magnum Mysterium Morten Lauridsen Latin antiphon Contemporary setting of the Christmas antiphon for women''s choir'),

-- Schott Music Works
('Locus Iste', 'Anton Bruckner', 'Latin antiphon', 'Sacred motet for women''s choir with organ accompaniment', 'https://www.schott-music.com/en/sheet-music/choral-vocal-music/women-s-choir-with-accompaniment.html', 'https://www.schott-music.com/audio/locus-iste-bruckner-female.mp3', 'SchottMusic', 'Latin', 'SSA', 'Intermediate', 'Sacred', NULL, 'Locus Iste Anton Bruckner Latin antiphon Sacred motet for women''s choir with organ accompaniment'),
('Ave Verum Corpus', 'Wolfgang Amadeus Mozart', 'Latin hymn', 'Mozart''s beautiful motet arranged for women''s choir', 'https://www.schott-music.com/en/sheet-music/choral-vocal-music/women-s-choir-with-accompaniment.html', 'https://www.schott-music.com/audio/ave-verum-corpus-mozart-female.mp3', 'SchottMusic', 'Latin', 'SSA', 'Easy', 'Sacred', NULL, 'Ave Verum Corpus Wolfgang Amadeus Mozart Latin hymn Mozart''s beautiful motet arranged for women''s choir'),

-- CPDL Works
('Ave Maria', 'Josquin des Prez', 'Latin text', 'Renaissance masterpiece for women''s choir, free from CPDL', 'https://www.cpdl.org/wiki/index.php/Ave_Maria_(Josquin_des_Prez)', 'https://www.cpdl.org/audio/ave-maria-josquin-female.mp3', 'CPDL', 'Latin', 'SSAA', 'Advanced', 'Sacred', NULL, 'Ave Maria Josquin des Prez Latin text Renaissance masterpiece for women''s choir free from CPDL'),
('O Magnum Mysterium', 'Tomás Luis de Victoria', 'Latin antiphon', 'Renaissance Christmas motet for women''s choir', 'https://www.cpdl.org/wiki/index.php/O_magnum_mysterium_(Tomás_Luis_de_Victoria)', 'https://www.cpdl.org/audio/o-magnum-mysterium-victoria-female.mp3', 'CPDL', 'Latin', 'SSAA', 'Intermediate', 'Sacred', 'Christmas', 'O Magnum Mysterium Tomás Luis de Victoria Latin antiphon Renaissance Christmas motet for women''s choir'),

-- Musopen Works
('Ave Maria', 'Franz Schubert', 'Sir Walter Scott', 'Schubert''s beloved Ave Maria arranged for women''s choir', 'https://musopen.org/music/instrument/choir/', 'https://musopen.org/audio/ave-maria-schubert-female.mp3', 'Musopen', 'Latin', 'SSA', 'Intermediate', 'Sacred', NULL, 'Ave Maria Franz Schubert Sir Walter Scott Schubert''s beloved Ave Maria arranged for women''s choir'),
('Jesu, Joy of Man''s Desiring', 'Johann Sebastian Bach', 'Martin Jahn', 'Bach''s beautiful chorale arranged for women''s choir', 'https://musopen.org/music/instrument/choir/', 'https://musopen.org/audio/jesu-joy-bach-female.mp3', 'Musopen', 'German', 'SSA', 'Easy', 'Sacred', NULL, 'Jesu Joy of Man''s Desiring Johann Sebastian Bach Martin Jahn Bach''s beautiful chorale arranged for women''s choir')
) AS new_songs(title, composer, text_writer, description, source_link, audio_link, source, language, voicing, difficulty, theme, season, search_text)
WHERE NOT EXISTS (
    SELECT 1 FROM songs s 
    WHERE s.title = new_songs.title 
    AND s.composer = new_songs.composer 
    AND s.source = new_songs.source
);
