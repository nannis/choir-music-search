#!/usr/bin/env node

/**
 * Script to update the database source constraint and add female choir music
 * Uses the Supabase REST API to execute SQL commands
 */

const SUPABASE_URL = 'https://kqjccswtdxkffghuijhu.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtxamNjc3d0ZHhrZmZnaHVpamh1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwOTMwMzIsImV4cCI6MjA3MzY2OTAzMn0.fBcS1Wn5m2Kn-yt9_PF9dyGlIPocJd6MuinvDZ4q3MU';

async function executeSQL(sql) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      'apikey': SUPABASE_ANON_KEY
    },
    body: JSON.stringify({ sql })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`SQL execution failed: ${response.status} ${response.statusText}\n${error}`);
  }

  return await response.json();
}

async function updateDatabaseSources() {
  console.log('🔧 Updating database source constraint...');
  
  try {
    // First, drop the existing constraint
    console.log('📝 Dropping existing source constraint...');
    await executeSQL('ALTER TABLE songs DROP CONSTRAINT IF EXISTS songs_source_check;');
    
    // Add the new constraint with all source types
    console.log('📝 Adding new source constraint...');
    await executeSQL(`
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
    `);
    
    console.log('✅ Database source constraint updated successfully!');
    
    // Now add the female choir music via the API
    console.log('🎵 Adding female choir music via API...');
    
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

    const apiUrl = `${SUPABASE_URL}/functions/v1/choir-music-api/add-songs`;
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      },
      body: JSON.stringify({
        songs: femaleChoirMusic
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API request failed: ${response.status} ${response.statusText}\n${errorText}`);
    }

    const result = await response.json();
    
    console.log('✅ Successfully added female choir music!');
    console.log(`📊 Result: ${result.message}`);
    
    if (result.songs && result.songs.length > 0) {
      console.log(`🎼 Added ${result.songs.length} songs:`);
      result.songs.forEach((song, index) => {
        console.log(`   ${index + 1}. ${song.title} by ${song.composer} (${song.source})`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error updating database:', error.message);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  updateDatabaseSources();
}

module.exports = { updateDatabaseSources };
