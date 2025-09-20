-- Add SSAA and SSA choir music to the database
INSERT INTO songs (title, composer, text_writer, description, source_link, source, language, voicing, difficulty, theme, season, search_text) VALUES

-- SSAA Pieces
('Ave Maria', 'Josquin des Prez', 'Latin antiphon', 'Renaissance masterpiece for women''s voices, beautiful polyphonic setting', 'https://imslp.org/wiki/Ave_Maria_(Josquin_des_Prez)', 'IMSLP', 'Latin', 'SSAA', 'Intermediate', 'Sacred', NULL, 'Ave Maria Josquin des Prez Latin antiphon Renaissance masterpiece women voices beautiful polyphonic setting'),

('O Virgo Virginum', 'Giovanni Pierluigi da Palestrina', 'Latin antiphon', 'Elegant Renaissance motet for women''s choir, perfect for church services', 'https://imslp.org/wiki/O_Virgo_Virginum_(Palestrina,_Giovanni_Pierluigi_da)', 'IMSLP', 'Latin', 'SSAA', 'Intermediate', 'Sacred', NULL, 'O Virgo Virginum Palestrina Latin antiphon elegant Renaissance motet women choir perfect church services'),

('Salve Regina', 'Tomás Luis de Victoria', 'Latin hymn', 'Beautiful Marian hymn for women''s voices, rich Renaissance harmonies', 'https://imslp.org/wiki/Salve_Regina_(Victoria,_Tomás_Luis_de)', 'IMSLP', 'Latin', 'SSAA', 'Advanced', 'Sacred', NULL, 'Salve Regina Victoria Latin hymn beautiful Marian women voices rich Renaissance harmonies'),

('Ave Maris Stella', 'Claudio Monteverdi', 'Latin hymn', 'Baroque gem for women''s choir, Monteverdi''s exquisite vocal writing', 'https://imslp.org/wiki/Ave_Maris_Stella_(Monteverdi,_Claudio)', 'IMSLP', 'Latin', 'SSAA', 'Advanced', 'Sacred', NULL, 'Ave Maris Stella Monteverdi Latin hymn Baroque gem women choir exquisite vocal writing'),

('Amazing Grace', 'John Newton / Arr. for SSAA', 'John Newton', 'Beloved hymn arranged specifically for women''s voices with rich harmonies', 'https://hymnary.org/text/amazing_grace_how_sweet_the_sound', 'Hymnary', 'English', 'SSAA', 'Easy', 'Sacred', NULL, 'Amazing Grace John Newton arranged women voices beloved hymn rich harmonies'),

('How Great Thou Art', 'Stuart K. Hine / Arr. SSAA', 'Stuart K. Hine', 'Popular hymn arranged for women''s choir, beautiful four-part harmony', 'https://hymnary.org/text/o_lord_my_god_when_i_in_awesome_wonder', 'Hymnary', 'English', 'SSAA', 'Intermediate', 'Sacred', NULL, 'How Great Thou Art Stuart Hine arranged women choir popular hymn four-part harmony'),

('Silent Night', 'Franz Gruber / SSAA Arrangement', 'Joseph Mohr', 'Christmas carol arranged for women''s voices, perfect for holiday concerts', 'https://hymnary.org/text/silent_night_holy_night_all_is_calm', 'Hymnary', 'English', 'SSAA', 'Easy', 'Sacred', 'Christmas', 'Silent Night Gruber SSAA arrangement women voices Christmas carol holiday concerts'),

-- SSA Pieces
('Ave Maria', 'Franz Schubert / SSA Arrangement', 'Sir Walter Scott', 'Schubert''s beloved Ave Maria arranged for three-part women''s voices', 'https://imslp.org/wiki/Ave_Maria,_D.839_(Schubert,_Franz)', 'IMSLP', 'Latin', 'SSA', 'Intermediate', 'Sacred', NULL, 'Ave Maria Schubert SSA arrangement three-part women voices beloved'),

('Panis Angelicus', 'César Franck', 'Thomas Aquinas', 'Beautiful sacred song for women''s trio, Franck''s lyrical masterpiece', 'https://imslp.org/wiki/Panis_Angelicus_(Franck,_César)', 'IMSLP', 'Latin', 'SSA', 'Intermediate', 'Sacred', NULL, 'Panis Angelicus Franck women trio beautiful sacred song lyrical masterpiece'),

('Ave Verum Corpus', 'Wolfgang Amadeus Mozart / SSA', 'Latin hymn', 'Mozart''s sacred motet arranged for women''s voices, elegant simplicity', 'https://imslp.org/wiki/Ave_verum_corpus,_K.618_(Mozart,_Wolfgang_Amadeus)', 'IMSLP', 'Latin', 'SSA', 'Easy', 'Sacred', NULL, 'Ave Verum Corpus Mozart SSA women voices sacred motet elegant simplicity'),

('The Lord Bless You and Keep You', 'John Rutter', 'Numbers 6:24-26', 'Contemporary blessing for women''s choir, Rutter''s signature style', 'https://hymnary.org/text/the_lord_bless_you_and_keep_you', 'Hymnary', 'English', 'SSAA', 'Intermediate', 'Sacred', NULL, 'Lord Bless You Keep You Rutter contemporary blessing women choir signature style'),

('For the Beauty of the Earth', 'John Rutter', 'Folliott S. Pierpoint', 'Joyful hymn for women''s voices, celebrating creation and nature', 'https://hymnary.org/text/for_the_beauty_of_the_earth', 'Hymnary', 'English', 'SSAA', 'Easy', 'Sacred', NULL, 'Beauty Earth Rutter joyful hymn women voices celebrating creation nature'),

('Danny Boy', 'Traditional Irish / SSAA Arr.', 'Frederic Weatherly', 'Irish ballad arranged for women''s choir, emotional and expressive', 'https://hymnary.org/text/danny_boy', 'Hymnary', 'English', 'SSAA', 'Intermediate', 'Folk', NULL, 'Danny Boy Traditional Irish SSAA women choir Irish ballad emotional expressive'),

('Shenandoah', 'Traditional American / SSA', 'Traditional', 'American folk song for women''s trio, hauntingly beautiful', 'https://hymnary.org/text/shenandoah', 'Hymnary', 'English', 'SSA', 'Easy', 'Folk', NULL, 'Shenandoah Traditional American SSA women trio folk song hauntingly beautiful'),

('O Come, O Come Emmanuel', 'Traditional / SSAA Arr.', 'Latin antiphon', 'Advent hymn arranged for women''s voices, perfect for Christmas season', 'https://hymnary.org/text/o_come_o_come_emmanuel', 'Hymnary', 'English', 'SSAA', 'Easy', 'Sacred', 'Advent', 'O Come Emmanuel Traditional SSAA women voices Advent hymn Christmas season'),

('In the Bleak Midwinter', 'Gustav Holst / SSA', 'Christina Rossetti', 'Poetic Christmas carol for women''s trio, Holst''s delicate setting', 'https://hymnary.org/text/in_the_bleak_midwinter', 'Hymnary', 'English', 'SSA', 'Intermediate', 'Sacred', 'Christmas', 'Bleak Midwinter Holst SSA women trio poetic Christmas carol delicate setting'),

('Locus Iste', 'Anton Bruckner / SSAA Arr.', 'Latin antiphon', 'Sacred motet arranged for women''s voices, Bruckner''s rich harmonies', 'https://imslp.org/wiki/Locus_iste,_WAB_23_(Bruckner,_Anton)', 'IMSLP', 'Latin', 'SSAA', 'Advanced', 'Sacred', NULL, 'Locus Iste Bruckner SSAA women voices sacred motet rich harmonies'),

('Ave Maria', 'Anton Bruckner / SSA', 'Latin hymn', 'Bruckner''s Ave Maria arranged for women''s trio, lush Romantic harmonies', 'https://imslp.org/wiki/Ave_Maria,_WAB_6_(Bruckner,_Anton)', 'IMSLP', 'Latin', 'SSA', 'Advanced', 'Sacred', NULL, 'Ave Maria Bruckner SSA women trio lush Romantic harmonies');
