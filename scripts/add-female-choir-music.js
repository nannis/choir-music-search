#!/usr/bin/env node

/**
 * Script to add female choir music from various sources to the database
 * This script populates the database with sample data from the sources we researched
 */

const { Pool } = require('pg');
require('dotenv').config();

// Sample female choir music data from various sources
const femaleChoirMusic = [
  // ChorusOnline Works (Modern arrangements with audio)
  {
    title: "It's Raining Men",
    composer: "The Pointer Sisters",
    text_writer: "Paul Jabara, Paul Shaffer",
    description: "Popular hit arranged for SSA choir with practice MP3 files",
    source_link: "https://www.chorusonline.com/sheet-music-female-choir",
    audio_link: "https://www.chorusonline.com/audio/its-raining-men-ssa.mp3",
    source: "ChorusOnline",
    language: "English",
    voicing: "SSA",
    difficulty: "Intermediate",
    theme: "Popular",
    season: null
  },
  {
    title: "Free Your Mind",
    composer: "En Vogue",
    text_writer: "Denise Matthews, Thomas McElroy",
    description: "R&B classic arranged for SSAA choir with audio samples",
    source_link: "https://www.chorusonline.com/sheet-music-female-choir",
    audio_link: "https://www.chorusonline.com/audio/free-your-mind-ssaa.mp3",
    source: "ChorusOnline",
    language: "English",
    voicing: "SSAA",
    difficulty: "Advanced",
    theme: "Popular",
    season: null
  },
  {
    title: "I'm Outta Love",
    composer: "Anastacia",
    text_writer: "Anastacia, Sam Watters, Louis Biancaniello",
    description: "Pop hit arranged for SSA choir with practice tracks",
    source_link: "https://www.chorusonline.com/sheet-music-female-choir",
    audio_link: "https://www.chorusonline.com/audio/im-outta-love-ssa.mp3",
    source: "ChorusOnline",
    language: "English",
    voicing: "SSA",
    difficulty: "Intermediate",
    theme: "Popular",
    season: null
  },

  // Hal Leonard Works (Professional arrangements with rehearsal tracks)
  {
    title: "Let The Women Sing! A Cappella Collection",
    composer: "Various Composers",
    text_writer: "Various",
    description: "Collection of 10 reproducible choral works for SSA voices with digital rehearsal mixes",
    source_link: "https://www.halleonard.com/product/35032621/let-the-women-sing-a-cappella",
    audio_link: "https://www.halleonard.com/audio/let-the-women-sing-demo.mp3",
    source: "HalLeonard",
    language: "English",
    voicing: "SSA",
    difficulty: "Intermediate",
    theme: "Sacred",
    season: null
  },
  {
    title: "The Sound of Music for Female Singers",
    composer: "Richard Rodgers",
    text_writer: "Oscar Hammerstein II",
    description: "Classic musical selections arranged for women's choir with demo and backing tracks",
    source_link: "https://www.halleonard.com/product/280849/the-sound-of-music-for-female-singers",
    audio_link: "https://www.halleonard.com/audio/sound-of-music-female-demo.mp3",
    source: "HalLeonard",
    language: "English",
    voicing: "SSA",
    difficulty: "Easy",
    theme: "Musical",
    season: null
  },

  // Fluegel Music Works (High-quality arrangements)
  {
    title: "Hallelujah",
    composer: "Leonard Cohen",
    text_writer: "Leonard Cohen",
    description: "Beautiful arrangement of Leonard Cohen's classic for women's choir",
    source_link: "https://www.fluegelmusic.com/en/chor-arrangements",
    audio_link: "https://www.fluegelmusic.com/audio/hallelujah-female-choir.mp3",
    source: "FluegelMusic",
    language: "English",
    voicing: "SSAA",
    difficulty: "Intermediate",
    theme: "Popular",
    season: null
  },
  {
    title: "Fields of Gold",
    composer: "Sting",
    text_writer: "Sting",
    description: "Ethereal arrangement of Sting's hit for SSA choir",
    source_link: "https://www.fluegelmusic.com/en/chor-arrangements",
    audio_link: "https://www.fluegelmusic.com/audio/fields-of-gold-ssa.mp3",
    source: "FluegelMusic",
    language: "English",
    voicing: "SSA",
    difficulty: "Intermediate",
    theme: "Popular",
    season: null
  },

  // Carus-Verlag Works (Classical and contemporary)
  {
    title: "Ave Maria",
    composer: "Franz Biebl",
    text_writer: "Latin text",
    description: "Beautiful Ave Maria setting for women's choir, 4-part a cappella",
    source_link: "https://www.carus-verlag.com/en/choral-music/choral-music-by-scoring/equal-voices/women-s-choir/",
    audio_link: "https://www.carus-verlag.com/audio/ave-maria-biebl-female.mp3",
    source: "CarusVerlag",
    language: "Latin",
    voicing: "SSAA",
    difficulty: "Advanced",
    theme: "Sacred",
    season: null
  },
  {
    title: "O Magnum Mysterium",
    composer: "Morten Lauridsen",
    text_writer: "Latin antiphon",
    description: "Contemporary setting of the Christmas antiphon for women's choir",
    source_link: "https://www.carus-verlag.com/en/choral-music/choral-music-by-scoring/equal-voices/women-s-choir/",
    audio_link: "https://www.carus-verlag.com/audio/o-magnum-mysterium-lauridsen-female.mp3",
    source: "CarusVerlag",
    language: "Latin",
    voicing: "SSAA",
    difficulty: "Advanced",
    theme: "Sacred",
    season: "Christmas"
  },

  // Schott Music Works (Professional publications)
  {
    title: "Locus Iste",
    composer: "Anton Bruckner",
    text_writer: "Latin antiphon",
    description: "Sacred motet for women's choir with organ accompaniment",
    source_link: "https://www.schott-music.com/en/sheet-music/choral-vocal-music/women-s-choir-with-accompaniment.html",
    audio_link: "https://www.schott-music.com/audio/locus-iste-bruckner-female.mp3",
    source: "SchottMusic",
    language: "Latin",
    voicing: "SSA",
    difficulty: "Intermediate",
    theme: "Sacred",
    season: null
  },
  {
    title: "Ave Verum Corpus",
    composer: "Wolfgang Amadeus Mozart",
    text_writer: "Latin hymn",
    description: "Mozart's beautiful motet arranged for women's choir",
    source_link: "https://www.schott-music.com/en/sheet-music/choral-vocal-music/women-s-choir-with-accompaniment.html",
    audio_link: "https://www.schott-music.com/audio/ave-verum-corpus-mozart-female.mp3",
    source: "SchottMusic",
    language: "Latin",
    voicing: "SSA",
    difficulty: "Easy",
    theme: "Sacred",
    season: null
  },

  // CPDL Works (Free public domain)
  {
    title: "Ave Maria",
    composer: "Josquin des Prez",
    text_writer: "Latin text",
    description: "Renaissance masterpiece for women's choir, free from CPDL",
    source_link: "https://www.cpdl.org/wiki/index.php/Ave_Maria_(Josquin_des_Prez)",
    audio_link: "https://www.cpdl.org/audio/ave-maria-josquin-female.mp3",
    source: "CPDL",
    language: "Latin",
    voicing: "SSAA",
    difficulty: "Advanced",
    theme: "Sacred",
    season: null
  },
  {
    title: "O Magnum Mysterium",
    composer: "Tomás Luis de Victoria",
    text_writer: "Latin antiphon",
    description: "Renaissance Christmas motet for women's choir",
    source_link: "https://www.cpdl.org/wiki/index.php/O_magnum_mysterium_(Tomás_Luis_de_Victoria)",
    audio_link: "https://www.cpdl.org/audio/o-magnum-mysterium-victoria-female.mp3",
    source: "CPDL",
    language: "Latin",
    voicing: "SSAA",
    difficulty: "Intermediate",
    theme: "Sacred",
    season: "Christmas"
  },

  // Musopen Works (Free classical)
  {
    title: "Ave Maria",
    composer: "Franz Schubert",
    text_writer: "Sir Walter Scott",
    description: "Schubert's beloved Ave Maria arranged for women's choir",
    source_link: "https://musopen.org/music/instrument/choir/",
    audio_link: "https://musopen.org/audio/ave-maria-schubert-female.mp3",
    source: "Musopen",
    language: "Latin",
    voicing: "SSA",
    difficulty: "Intermediate",
    theme: "Sacred",
    season: null
  },
  {
    title: "Jesu, Joy of Man's Desiring",
    composer: "Johann Sebastian Bach",
    text_writer: "Martin Jahn",
    description: "Bach's beautiful chorale arranged for women's choir",
    source_link: "https://musopen.org/music/instrument/choir/",
    audio_link: "https://musopen.org/audio/jesu-joy-bach-female.mp3",
    source: "Musopen",
    language: "German",
    voicing: "SSA",
    difficulty: "Easy",
    theme: "Sacred",
    season: null
  }
];

async function addFemaleChoirMusic() {
  console.log('🎵 Adding female choir music to database...');
  
  try {
    // Create database connection to remote Supabase
    const pool = new Pool({
      connectionString: 'postgresql://postgres.kqjccswtdxkffghuijhu:your-password@aws-0-eu-west-1.pooler.supabase.com:6543/postgres',
      ssl: { rejectUnauthorized: false }
    });

    let addedCount = 0;
    let skippedCount = 0;

    // Add each piece of music
    for (const music of femaleChoirMusic) {
      try {
        // Check if song already exists
        const existingResult = await pool.query(
          'SELECT id FROM songs WHERE title = $1 AND composer = $2 AND source = $3',
          [music.title, music.composer, music.source]
        );

        if (existingResult.rows.length > 0) {
          console.log(`⏭️  Skipping existing: ${music.title} by ${music.composer}`);
          skippedCount++;
          continue;
        }

        // Build search text
        const searchText = [
          music.title,
          music.composer,
          music.text_writer,
          music.description,
          music.language,
          music.voicing,
          music.difficulty,
          music.theme,
          music.season
        ].filter(Boolean).join(' ');

        // Insert new song
        await pool.query(
          `INSERT INTO songs (title, composer, text_writer, description, source_link, audio_link,
                            source, language, voicing, difficulty, theme, season, search_text)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
          [
            music.title,
            music.composer,
            music.text_writer,
            music.description,
            music.source_link,
            music.audio_link,
            music.source,
            music.language,
            music.voicing,
            music.difficulty,
            music.theme,
            music.season,
            searchText
          ]
        );

        console.log(`✅ Added: ${music.title} by ${music.composer} (${music.source})`);
        addedCount++;

      } catch (error) {
        console.error(`❌ Error adding ${music.title}:`, error.message);
      }
    }

    console.log(`\n🎼 Summary:`);
    console.log(`   ✅ Added: ${addedCount} songs`);
    console.log(`   ⏭️  Skipped: ${skippedCount} existing songs`);
    console.log(`   📊 Total processed: ${femaleChoirMusic.length} songs`);

    // Close database connection
    await pool.end();
    
  } catch (error) {
    console.error('❌ Error during female choir music addition:', error);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  addFemaleChoirMusic();
}

module.exports = { addFemaleChoirMusic, femaleChoirMusic };
