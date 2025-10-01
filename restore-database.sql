-- Database Restoration Script
-- Run this in the Supabase SQL Editor to restore the entire database
-- This recreates all tables, indexes, and data that was lost

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
  is_active BOOLEAN DEFAULT TRUE,
  
  -- Indexes for performance
  CONSTRAINT idx_title UNIQUE (title, composer)
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

-- User submissions table for community contributions
CREATE TABLE IF NOT EXISTS user_submissions (
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

CREATE INDEX IF NOT EXISTS idx_user_submissions_status ON user_submissions (status);
CREATE INDEX IF NOT EXISTS idx_user_submissions_created ON user_submissions (created_at);

-- Data ingestion jobs table for automated music discovery
CREATE TABLE IF NOT EXISTS ingestion_jobs (
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

CREATE INDEX IF NOT EXISTS idx_ingestion_jobs_status ON ingestion_jobs (status);
CREATE INDEX IF NOT EXISTS idx_ingestion_jobs_next_run ON ingestion_jobs (next_run);

-- Query cache table for performance optimization
CREATE TABLE IF NOT EXISTS query_cache (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  query_hash VARCHAR(64) UNIQUE NOT NULL,
  query_text TEXT NOT NULL,
  results JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_query_cache_expires ON query_cache (expires_at);

-- Insert initial sample data
INSERT INTO songs (title, composer, text_writer, description, source_link, source, language, voicing, difficulty, theme, season, search_text) VALUES
-- IMSLP Works
('Ave Maria', 'Franz Schubert', 'Sir Walter Scott', 'Beloved sacred song with beautiful melody', 'https://imslp.org/wiki/Ave_Maria,_D.839_(Schubert,_Franz)', 'IMSLP', 'Latin', 'SATB', 'Intermediate', 'Sacred', NULL, 'Ave Maria Schubert Scott beloved sacred song beautiful melody'),
('Panis Angelicus', 'César Franck', 'Thomas Aquinas', 'Beautiful sacred song for solo voice and choir', 'https://imslp.org/wiki/Panis_Angelicus_(Franck,_César)', 'IMSLP', 'Latin', 'SATB', 'Intermediate', 'Sacred', NULL, 'Panis Angelicus Franck Aquinas beautiful sacred song solo voice choir'),
('Ave Verum Corpus', 'Wolfgang Amadeus Mozart', 'Latin hymn', 'Sacred motet with elegant simplicity', 'https://imslp.org/wiki/Ave_verum_corpus,_K.618_(Mozart,_Wolfgang_Amadeus)', 'IMSLP', 'Latin', 'SATB', 'Easy', 'Sacred', NULL, 'Ave Verum Corpus Mozart Latin hymn sacred motet elegant simplicity'),
('Mass in B minor - Kyrie', 'Johann Sebastian Bach', 'Latin Mass Ordinary', 'Opening movement of Bach''s monumental Mass in B minor', 'https://imslp.org/wiki/Mass_in_B_minor,_BWV_232_(Bach,_Johann_Sebastian)', 'IMSLP', 'Latin', 'SATB', 'Advanced', 'Sacred', NULL, 'Mass in B minor Kyrie Johann Sebastian Bach Latin Mass Ordinary Opening movement of Bach''s monumental Mass in B minor'),
('Jesu, Joy of Man''s Desiring', 'Johann Sebastian Bach', 'Martin Jahn', 'Beautiful chorale from Bach''s Cantata 147, perfect for choir arrangements', 'https://imslp.org/wiki/Herz_und_Mund_und_Tat_und_Leben,_BWV_147_(Bach,_Johann_Sebastian)', 'IMSLP', 'German', 'SATB', 'Intermediate', 'Sacred', NULL, 'Jesu Joy of Man''s Desiring Johann Sebastian Bach Martin Jahn Beautiful chorale from Bach''s Cantata 147 perfect for choir arrangements'),
('O Magnum Mysterium', 'Tomás Luis de Victoria', 'Latin antiphon', 'Renaissance masterpiece for Christmas season', 'https://imslp.org/wiki/O_magnum_mysterium_(Victoria,_Tomás_Luis_de)', 'IMSLP', 'Latin', 'SATB', 'Intermediate', 'Sacred', 'Christmas', 'O Magnum Mysterium Tomás Luis de Victoria Latin antiphon Renaissance masterpiece for Christmas season'),
('Veni Creator Spiritus', 'Giovanni Pierluigi da Palestrina', 'Rabanus Maurus', 'Classic hymn to the Holy Spirit, Renaissance polyphony', 'https://imslp.org/wiki/Veni_Creator_Spiritus_(Palestrina,_Giovanni_Pierluigi_da)', 'IMSLP', 'Latin', 'SATB', 'Advanced', 'Sacred', NULL, 'Veni Creator Spiritus Giovanni Pierluigi da Palestrina Rabanus Maurus Classic hymn to the Holy Spirit Renaissance polyphony'),
('Messiah - Hallelujah Chorus', 'George Frideric Handel', 'Charles Jennens', 'The most famous choral movement from Handel''s Messiah, triumphant Easter music for SATB choir', 'https://imslp.org/wiki/Messiah,_HWV_56_(Handel,_George_Frideric)', 'IMSLP', 'English', 'SATB', 'Advanced', 'Sacred', 'Easter', 'Messiah Hallelujah Chorus George Frideric Handel Charles Jennens The most famous choral movement from Handel''s Messiah triumphant Easter music for SATB choir'),
('Requiem - Dies Irae', 'Wolfgang Amadeus Mozart', 'Latin Requiem Mass', 'Dramatic movement from Mozart''s Requiem, powerful piece for experienced choirs', 'https://imslp.org/wiki/Requiem,_K.626_(Mozart,_Wolfgang_Amadeus)', 'IMSLP', 'Latin', 'SATB', 'Advanced', 'Funeral', NULL, 'Requiem Dies Irae Wolfgang Amadeus Mozart Latin Requiem Mass Dramatic movement from Mozart''s Requiem powerful piece for experienced choirs'),
('Te Deum', 'Antonín Dvořák', 'Latin Te Deum text', 'Majestic setting of the Te Deum for choir, soloists and orchestra', 'https://imslp.org/wiki/Te_Deum,_Op.103_(Dvořák,_Antonín)', 'IMSLP', 'Latin', 'SATB', 'Advanced', 'Sacred', NULL, 'Te Deum Antonín Dvořák Latin Te Deum text Majestic setting of the Te Deum for choir soloists and orchestra'),
('Locus Iste', 'Anton Bruckner', 'Latin antiphon', 'Sacred motet for unaccompanied mixed choir, perfect for church choirs', 'https://imslp.org/wiki/Locus_iste,_WAB_23_(Bruckner,_Anton)', 'IMSLP', 'Latin', 'SATB', 'Intermediate', 'Sacred', NULL, 'Locus Iste Anton Bruckner Latin antiphon Sacred motet for unaccompanied mixed choir perfect for church choirs'),
('Ave Verum Corpus', 'Wolfgang Amadeus Mozart', 'Latin hymn', 'Beautiful sacred motet for mixed choir, Mozart''s last completed sacred work', 'https://imslp.org/wiki/Ave_verum_corpus,_K.618_(Mozart,_Wolfgang_Amadeus)', 'IMSLP', 'Latin', 'SATB', 'Easy', 'Sacred', NULL, 'Ave Verum Corpus Wolfgang Amadeus Mozart Latin hymn Beautiful sacred motet for mixed choir Mozart''s last completed sacred work'),
('Gloria in Excelsis Deo', 'Antonio Vivaldi', 'Latin Gloria text', 'Joyful Christmas Gloria for mixed choir and orchestra', 'https://imslp.org/wiki/Gloria_in_D_major,_RV_589_(Vivaldi,_Antonio)', 'IMSLP', 'Latin', 'SATB', 'Advanced', 'Sacred', 'Christmas', 'Gloria in Excelsis Deo Antonio Vivaldi Latin Gloria text Joyful Christmas Gloria for mixed choir and orchestra'),

-- Hymnary Works
('Amazing Grace', 'John Newton / Traditional', 'John Newton', 'Most beloved hymn in English, suitable for choir arrangement in various styles', 'https://hymnary.org/text/amazing_grace_how_sweet_the_sound', 'Hymnary', 'English', 'SATB', 'Easy', 'Sacred', NULL, 'Amazing Grace John Newton Traditional Most beloved hymn in English suitable for choir arrangement in various styles'),
('How Great Thou Art', 'Stuart K. Hine / Traditional Swedish melody', 'Stuart K. Hine', 'Popular Christian hymn, excellent for choir with rich harmonies', 'https://hymnary.org/text/o_lord_my_god_when_i_in_awesome_wonder', 'Hymnary', 'English', 'SATB', 'Intermediate', 'Sacred', NULL, 'How Great Thou Art Stuart K. Hine Traditional Swedish melody Popular Christian hymn excellent for choir with rich harmonies'),
('Holy, Holy, Holy', 'John B. Dykes', 'Reginald Heber', 'Classic Trinity hymn, perfect for mixed choir arrangements', 'https://hymnary.org/text/holy_holy_holy_lord_god_almighty', 'Hymnary', 'English', 'SATB', 'Intermediate', 'Sacred', NULL, 'Holy Holy Holy John B. Dykes Reginald Heber Classic Trinity hymn perfect for mixed choir arrangements'),
('O Come, O Come Emmanuel', 'Traditional / Various arrangements', 'Latin antiphon', 'Ancient Advent hymn, beautiful for choir during Christmas season', 'https://hymnary.org/text/o_come_o_come_emmanuel', 'Hymnary', 'English', 'SATB', 'Easy', 'Sacred', 'Advent', 'O Come O Come Emmanuel Traditional Various arrangements Latin antiphon Ancient Advent hymn beautiful for choir during Christmas season'),
('Silent Night', 'Franz Gruber', 'Joseph Mohr', 'World''s most beloved Christmas carol, perfect for choir arrangements', 'https://hymnary.org/text/silent_night_holy_night_all_is_calm', 'Hymnary', 'English', 'SATB', 'Easy', 'Sacred', 'Christmas', 'Silent Night Franz Gruber Joseph Mohr World''s most beloved Christmas carol perfect for choir arrangements'),

-- ChoralNet Works
('The Lord Bless You and Keep You', 'John Rutter', 'Numbers 6:24-26', 'Contemporary blessing with beautiful harmonies', 'https://choralnet.org/view/123456', 'ChoralNet', 'English', 'SATB', 'Intermediate', 'Sacred', NULL, 'Lord Bless You Keep You Rutter Numbers contemporary blessing beautiful harmonies'),
('For the Beauty of the Earth', 'John Rutter', 'Folliott S. Pierpoint', 'Joyful hymn celebrating creation', 'https://choralnet.org/view/123457', 'ChoralNet', 'English', 'SATB', 'Easy', 'Sacred', NULL, 'Beauty Earth Rutter Pierpoint joyful hymn celebrating creation'),
('The Road Home', 'Stephen Paulus', 'Michael Dennis Browne', 'Contemporary choral work with beautiful text', 'https://choralnet.org/view/123458', 'ChoralNet', 'English', 'SATB', 'Advanced', 'Sacred', NULL, 'Road Home Paulus Browne contemporary choral work beautiful text'),
('Sure on This Shining Night', 'Morten Lauridsen', 'James Agee', 'Romantic choral setting of poetry', 'https://choralnet.org/view/123459', 'ChoralNet', 'English', 'SATB', 'Advanced', 'Sacred', NULL, 'Sure Shining Night Lauridsen Agee romantic choral setting poetry'),

-- MuseScore Works
('Danny Boy', 'Traditional Irish', 'Frederic Weatherly', 'Emotional Irish ballad', 'https://musescore.com/sheetmusic/danny-boy', 'MuseScore', 'English', 'SATB', 'Intermediate', 'Folk', NULL, 'Danny Boy Traditional Irish Weatherly emotional ballad'),
('Shenandoah', 'Traditional American', 'Traditional', 'Hauntingly beautiful folk song', 'https://musescore.com/sheetmusic/shenandoah', 'MuseScore', 'English', 'SATB', 'Easy', 'Folk', NULL, 'Shenandoah Traditional American hauntingly beautiful folk song'),

-- Christmas Works
('In the Bleak Midwinter', 'Gustav Holst', 'Christina Rossetti', 'Poetic Christmas carol', 'https://hymnary.org/text/in_the_bleak_midwinter', 'Hymnary', 'English', 'SATB', 'Intermediate', 'Sacred', 'Christmas', 'Bleak Midwinter Holst Rossetti poetic Christmas carol'),

-- Classical Works
('Ave Maria', 'Anton Bruckner', 'Latin hymn', 'Romantic setting with lush harmonies', 'https://imslp.org/wiki/Ave_Maria,_WAB_6_(Bruckner,_Anton)', 'IMSLP', 'Latin', 'SATB', 'Advanced', 'Sacred', NULL, 'Ave Maria Bruckner Latin hymn Romantic setting lush harmonies');

-- Insert SSAA and SSA music
INSERT INTO songs (title, composer, text_writer, description, source_link, source, language, voicing, difficulty, theme, season, search_text) VALUES
-- IMSLP SSAA Works
('Ave Maria', 'Josquin des Prez', 'Latin antiphon', 'Renaissance masterpiece for women''s voices, beautiful polyphonic setting', 'https://imslp.org/wiki/Ave_Maria_(Josquin_des_Prez)', 'IMSLP', 'Latin', 'SSAA', 'Intermediate', 'Sacred', NULL, 'Ave Maria Josquin des Prez Latin antiphon Renaissance masterpiece women voices beautiful polyphonic setting'),
('O Virgo Virginum', 'Giovanni Pierluigi da Palestrina', 'Latin antiphon', 'Elegant Renaissance motet for women''s choir, perfect for church services', 'https://imslp.org/wiki/O_Virgo_Virginum_(Palestrina,_Giovanni_Pierluigi_da)', 'IMSLP', 'Latin', 'SSAA', 'Intermediate', 'Sacred', NULL, 'O Virgo Virginum Palestrina Latin antiphon elegant Renaissance motet women choir perfect church services'),
('Salve Regina', 'Tomás Luis de Victoria', 'Latin hymn', 'Beautiful Marian hymn for women''s voices, rich Renaissance harmonies', 'https://imslp.org/wiki/Salve_Regina_(Victoria,_Tomás_Luis_de)', 'IMSLP', 'Latin', 'SSAA', 'Advanced', 'Sacred', NULL, 'Salve Regina Victoria Latin hymn beautiful Marian women voices rich Renaissance harmonies'),
('Ave Maris Stella', 'Claudio Monteverdi', 'Latin hymn', 'Baroque gem for women''s choir, Monteverdi''s exquisite vocal writing', 'https://imslp.org/wiki/Ave_Maris_Stella_(Monteverdi,_Claudio)', 'IMSLP', 'Latin', 'SSAA', 'Advanced', 'Sacred', NULL, 'Ave Maris Stella Monteverdi Latin hymn Baroque gem women choir exquisite vocal writing'),

-- Hymnary SSAA Works
('Amazing Grace', 'John Newton / Arr. for SSAA', 'John Newton', 'Beloved hymn arranged specifically for women''s voices with rich harmonies', 'https://hymnary.org/text/amazing_grace_how_sweet_the_sound', 'Hymnary', 'English', 'SSAA', 'Easy', 'Sacred', NULL, 'Amazing Grace John Newton arranged women voices beloved hymn rich harmonies'),
('How Great Thou Art', 'Stuart K. Hine / Arr. SSAA', 'Stuart K. Hine', 'Popular hymn arranged for women''s choir, beautiful four-part harmony', 'https://hymnary.org/text/o_lord_my_god_when_i_in_awesome_wonder', 'Hymnary', 'English', 'SSAA', 'Intermediate', 'Sacred', NULL, 'How Great Thou Art Stuart Hine arranged women choir popular hymn four-part harmony'),
('Silent Night', 'Franz Gruber / SSAA Arrangement', 'Joseph Mohr', 'Christmas carol arranged for women''s voices, perfect for holiday concerts', 'https://hymnary.org/text/silent_night_holy_night_all_is_calm', 'Hymnary', 'English', 'SSAA', 'Easy', 'Sacred', 'Christmas', 'Silent Night Gruber SSAA arrangement women voices Christmas carol holiday concerts'),

-- SSA (Soprano, Soprano, Alto) Pieces
('Ave Maria', 'Franz Schubert / SSA Arrangement', 'Sir Walter Scott', 'Schubert''s beloved Ave Maria arranged for three-part women''s voices', 'https://imslp.org/wiki/Ave_Maria,_D.839_(Schubert,_Franz)', 'IMSLP', 'Latin', 'SSA', 'Intermediate', 'Sacred', NULL, 'Ave Maria Schubert SSA arrangement three-part women voices beloved'),
('Panis Angelicus', 'César Franck', 'Thomas Aquinas', 'Beautiful sacred song for women''s trio, Franck''s lyrical masterpiece', 'https://imslp.org/wiki/Panis_Angelicus_(Franck,_César)', 'IMSLP', 'Latin', 'SSA', 'Intermediate', 'Sacred', NULL, 'Panis Angelicus Franck women trio beautiful sacred song lyrical masterpiece'),
('Ave Verum Corpus', 'Wolfgang Amadeus Mozart / SSA', 'Latin hymn', 'Mozart''s sacred motet arranged for women''s voices, elegant simplicity', 'https://imslp.org/wiki/Ave_verum_corpus,_K.618_(Mozart,_Wolfgang_Amadeus)', 'IMSLP', 'Latin', 'SSA', 'Easy', 'Sacred', NULL, 'Ave Verum Corpus Mozart SSA women voices sacred motet elegant simplicity'),

-- Modern SSAA Works
('The Lord Bless You and Keep You', 'John Rutter', 'Numbers 6:24-26', 'Contemporary blessing for women''s choir, Rutter''s signature style', 'https://hymnary.org/text/the_lord_bless_you_and_keep_you', 'Hymnary', 'English', 'SSAA', 'Intermediate', 'Sacred', NULL, 'Lord Bless You Keep You Rutter contemporary blessing women choir signature style'),
('For the Beauty of the Earth', 'John Rutter', 'Folliott S. Pierpoint', 'Joyful hymn for women''s voices, celebrating creation and nature', 'https://hymnary.org/text/for_the_beauty_of_the_earth', 'Hymnary', 'English', 'SSAA', 'Easy', 'Sacred', NULL, 'Beauty Earth Rutter joyful hymn women voices celebrating creation nature'),

-- Folk Song Arrangements
('Danny Boy', 'Traditional Irish / SSAA Arr.', 'Frederic Weatherly', 'Irish ballad arranged for women''s choir, emotional and expressive', 'https://hymnary.org/text/danny_boy', 'Hymnary', 'English', 'SSAA', 'Intermediate', 'Folk', NULL, 'Danny Boy Traditional Irish SSAA women choir Irish ballad emotional expressive'),
('Shenandoah', 'Traditional American / SSA', 'Traditional', 'American folk song for women''s trio, hauntingly beautiful', 'https://hymnary.org/text/shenandoah', 'Hymnary', 'English', 'SSA', 'Easy', 'Folk', NULL, 'Shenandoah Traditional American SSA women trio folk song hauntingly beautiful'),

-- Christmas SSAA/SSA
('O Come, O Come Emmanuel', 'Traditional / SSAA Arr.', 'Latin antiphon', 'Advent hymn arranged for women''s voices, perfect for Christmas season', 'https://hymnary.org/text/o_come_o_come_emmanuel', 'Hymnary', 'English', 'SSAA', 'Easy', 'Sacred', 'Advent', 'O Come Emmanuel Traditional SSAA women voices Advent hymn Christmas season'),
('In the Bleak Midwinter', 'Gustav Holst / SSA', 'Christina Rossetti', 'Poetic Christmas carol for women''s trio, Holst''s delicate setting', 'https://hymnary.org/text/in_the_bleak_midwinter', 'Hymnary', 'English', 'SSA', 'Intermediate', 'Sacred', 'Christmas', 'Bleak Midwinter Holst SSA women trio poetic Christmas carol delicate setting'),

-- Classical SSAA
('Locus Iste', 'Anton Bruckner / SSAA Arr.', 'Latin antiphon', 'Sacred motet arranged for women''s voices, Bruckner''s rich harmonies', 'https://imslp.org/wiki/Locus_iste,_WAB_23_(Bruckner,_Anton)', 'IMSLP', 'Latin', 'SSAA', 'Advanced', 'Sacred', NULL, 'Locus Iste Bruckner SSAA women voices sacred motet rich harmonies'),
('Ave Maria', 'Anton Bruckner / SSA', 'Latin hymn', 'Bruckner''s Ave Maria arranged for women''s trio, lush Romantic harmonies', 'https://imslp.org/wiki/Ave_Maria,_WAB_6_(Bruckner,_Anton)', 'IMSLP', 'Latin', 'SSA', 'Advanced', 'Sacred', NULL, 'Ave Maria Bruckner SSA women trio lush Romantic harmonies');

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

-- Insert initial ingestion jobs
INSERT INTO ingestion_jobs (source, url, parser, schedule, status) VALUES
('IMSLP', 'https://imslp.org/wiki/Category:For_female_chorus', 'IMSLPParser', '0 2 * * *', 'active'),
('MuseScore', 'https://musescore.com/sheetmusic/womens-choir', 'MuseScoreParser', '0 */6 * * *', 'active'),
('SundMusik', 'https://sundmusik.com/product-category/kornoter/damkor/', 'SundMusikParser', '0 3 * * 0', 'active'),
('ChorusOnline', 'https://www.chorusonline.com/sheet-music-female-choir', 'ChorusOnlineParser', '0 4 * * *', 'active'),
('HalLeonard', 'https://www.halleonard.com/search?q=women%27s+choir', 'HalLeonardParser', '0 5 * * 0', 'active'),
('CPDL', 'https://www.cpdl.org/wiki/index.php/Category:Women%27s_choir', 'CPDLParser', '0 6 * * 0', 'active');
