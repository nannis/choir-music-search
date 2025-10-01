-- Update database source constraint and add female choir music
-- Run this in the Supabase SQL Editor

-- Drop the existing check constraint
ALTER TABLE songs DROP CONSTRAINT IF EXISTS songs_source_check;

-- Add the new check constraint with all source types including female choir sources
ALTER TABLE songs ADD CONSTRAINT songs_source_check 
CHECK (source IN (
  'IMSLP', 
  'Hymnary', 
  'ChoralNet', 
  'MuseScore', 
  'SundMusik', 
  'ChorusOnline', 
  'HalLeonard', 
  'FluegelMusic', 
  'CarusVerlag', 
  'SchottMusic', 
  'StrettaMusic', 
  'CPDL', 
  'Musopen', 
  'Other'
));

-- Insert sample female choir music from various sources
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

-- Add ingestion jobs for the new sources
INSERT INTO ingestion_jobs (source, url, parser, schedule, status) VALUES
('ChorusOnline', 'https://www.chorusonline.com/sheet-music-female-choir', 'ChorusOnlineParser', '0 4 * * *', 'active'),
('HalLeonard', 'https://www.halleonard.com/search?q=women%27s+choir', 'HalLeonardParser', '0 5 * * 0', 'active'),
('CPDL', 'https://www.cpdl.org/wiki/index.php/Category:Women%27s_choir', 'CPDLParser', '0 6 * * 0', 'active');
