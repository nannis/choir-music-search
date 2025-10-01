-- Remove Duplicates and Prevent Future Duplicates Script
-- Run this in the Supabase SQL Editor to clean up duplicates and add prevention

-- 1. First, let's see what duplicates we have
-- This query will show us the duplicates (run this first to see what will be removed)
/*
SELECT title, composer, source, COUNT(*) as count
FROM songs 
GROUP BY title, composer, source 
HAVING COUNT(*) > 1
ORDER BY count DESC, title;
*/

-- 2. Add a checksum column to songs table for duplicate detection
ALTER TABLE songs ADD COLUMN IF NOT EXISTS content_hash VARCHAR(64);

-- 3. Create a function to generate content hash
CREATE OR REPLACE FUNCTION generate_content_hash(
    p_title VARCHAR(255),
    p_composer VARCHAR(255),
    p_source VARCHAR(20),
    p_voicing VARCHAR(20),
    p_language VARCHAR(50)
) RETURNS VARCHAR(64) AS $$
BEGIN
    -- Create a hash from the key identifying fields
    -- Normalize text by converting to lowercase and trimming whitespace
    RETURN encode(
        digest(
            LOWER(TRIM(p_title)) || '|' || 
            LOWER(TRIM(p_composer)) || '|' || 
            LOWER(TRIM(p_source)) || '|' || 
            COALESCE(LOWER(TRIM(p_voicing)), '') || '|' || 
            COALESCE(LOWER(TRIM(p_language)), ''),
            'sha256'
        ),
        'hex'
    );
END;
$$ LANGUAGE plpgsql;

-- 4. Update existing records with content hash
UPDATE songs 
SET content_hash = generate_content_hash(title, composer, source, voicing, language)
WHERE content_hash IS NULL;

-- 5. Remove duplicates, keeping the most recent one
WITH duplicates AS (
    SELECT id,
           ROW_NUMBER() OVER (
               PARTITION BY content_hash 
               ORDER BY created_at DESC, updated_at DESC
           ) as rn
    FROM songs
    WHERE content_hash IS NOT NULL
)
DELETE FROM songs 
WHERE id IN (
    SELECT id FROM duplicates WHERE rn > 1
);

-- 6. Add unique constraint on content_hash to prevent future duplicates
ALTER TABLE songs ADD CONSTRAINT songs_content_hash_unique UNIQUE (content_hash);

-- 7. Create a trigger function to automatically generate content hash on insert/update
CREATE OR REPLACE FUNCTION set_content_hash()
RETURNS TRIGGER AS $$
BEGIN
    NEW.content_hash = generate_content_hash(
        NEW.title, 
        NEW.composer, 
        NEW.source, 
        NEW.voicing, 
        NEW.language
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 8. Create trigger to automatically set content hash
DROP TRIGGER IF EXISTS trigger_set_content_hash ON songs;
CREATE TRIGGER trigger_set_content_hash
    BEFORE INSERT OR UPDATE ON songs
    FOR EACH ROW
    EXECUTE FUNCTION set_content_hash();

-- 9. Create an index on content_hash for performance
CREATE INDEX IF NOT EXISTS idx_songs_content_hash ON songs (content_hash);

-- 10. Add a function to safely insert songs (checks for duplicates)
CREATE OR REPLACE FUNCTION insert_song_safe(
    p_title VARCHAR(255),
    p_composer VARCHAR(255),
    p_text_writer VARCHAR(255),
    p_description TEXT,
    p_source_link VARCHAR(500),
    p_audio_link VARCHAR(500),
    p_source VARCHAR(20),
    p_language VARCHAR(50),
    p_voicing VARCHAR(20),
    p_difficulty VARCHAR(20),
    p_theme VARCHAR(50),
    p_season VARCHAR(50),
    p_period VARCHAR(50)
) RETURNS UUID AS $$
DECLARE
    v_content_hash VARCHAR(64);
    v_existing_id UUID;
    v_new_id UUID;
BEGIN
    -- Generate content hash
    v_content_hash := generate_content_hash(p_title, p_composer, p_source, p_voicing, p_language);
    
    -- Check if song already exists
    SELECT id INTO v_existing_id 
    FROM songs 
    WHERE content_hash = v_content_hash;
    
    IF v_existing_id IS NOT NULL THEN
        -- Song already exists, return existing ID
        RAISE NOTICE 'Song already exists: % by % (% %)', p_title, p_composer, p_source, p_voicing;
        RETURN v_existing_id;
    END IF;
    
    -- Insert new song
    INSERT INTO songs (
        title, composer, text_writer, description, source_link, audio_link,
        source, language, voicing, difficulty, theme, season, period,
        search_text, content_hash
    ) VALUES (
        p_title, p_composer, p_text_writer, p_description, p_source_link, p_audio_link,
        p_source, p_language, p_voicing, p_difficulty, p_theme, p_season, p_period,
        p_title || ' ' || p_composer || ' ' || COALESCE(p_text_writer, '') || ' ' || COALESCE(p_description, ''),
        v_content_hash
    ) RETURNING id INTO v_new_id;
    
    RETURN v_new_id;
END;
$$ LANGUAGE plpgsql;

-- 11. Create a function to update existing song if it exists, or insert if it doesn't
CREATE OR REPLACE FUNCTION upsert_song(
    p_title VARCHAR(255),
    p_composer VARCHAR(255),
    p_text_writer VARCHAR(255),
    p_description TEXT,
    p_source_link VARCHAR(500),
    p_audio_link VARCHAR(500),
    p_source VARCHAR(20),
    p_language VARCHAR(50),
    p_voicing VARCHAR(20),
    p_difficulty VARCHAR(20),
    p_theme VARCHAR(50),
    p_season VARCHAR(50),
    p_period VARCHAR(50)
) RETURNS UUID AS $$
DECLARE
    v_content_hash VARCHAR(64);
    v_existing_id UUID;
    v_new_id UUID;
BEGIN
    -- Generate content hash
    v_content_hash := generate_content_hash(p_title, p_composer, p_source, p_voicing, p_language);
    
    -- Check if song already exists
    SELECT id INTO v_existing_id 
    FROM songs 
    WHERE content_hash = v_content_hash;
    
    IF v_existing_id IS NOT NULL THEN
        -- Update existing song
        UPDATE songs SET
            text_writer = COALESCE(p_text_writer, text_writer),
            description = COALESCE(p_description, description),
            source_link = COALESCE(p_source_link, source_link),
            audio_link = COALESCE(p_audio_link, audio_link),
            language = COALESCE(p_language, language),
            voicing = COALESCE(p_voicing, voicing),
            difficulty = COALESCE(p_difficulty, difficulty),
            theme = COALESCE(p_theme, theme),
            season = COALESCE(p_season, season),
            period = COALESCE(p_period, period),
            search_text = p_title || ' ' || p_composer || ' ' || COALESCE(p_text_writer, '') || ' ' || COALESCE(p_description, ''),
            updated_at = CURRENT_TIMESTAMP,
            last_verified = CURRENT_TIMESTAMP
        WHERE id = v_existing_id;
        
        RAISE NOTICE 'Updated existing song: % by % (% %)', p_title, p_composer, p_source, p_voicing;
        RETURN v_existing_id;
    ELSE
        -- Insert new song
        INSERT INTO songs (
            title, composer, text_writer, description, source_link, audio_link,
            source, language, voicing, difficulty, theme, season, period,
            search_text, content_hash
        ) VALUES (
            p_title, p_composer, p_text_writer, p_description, p_source_link, p_audio_link,
            p_source, p_language, p_voicing, p_difficulty, p_theme, p_season, p_period,
            p_title || ' ' || p_composer || ' ' || COALESCE(p_text_writer, '') || ' ' || COALESCE(p_description, ''),
            v_content_hash
        ) RETURNING id INTO v_new_id;
        
        RAISE NOTICE 'Inserted new song: % by % (% %)', p_title, p_composer, p_source, p_voicing;
        RETURN v_new_id;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- 12. Show summary of what was cleaned up
SELECT 
    'Total songs after cleanup' as description,
    COUNT(*) as count
FROM songs
UNION ALL
SELECT 
    'Songs with content hash' as description,
    COUNT(*) as count
FROM songs 
WHERE content_hash IS NOT NULL
UNION ALL
SELECT 
    'Unique content hashes' as description,
    COUNT(DISTINCT content_hash) as count
FROM songs 
WHERE content_hash IS NOT NULL;

-- 13. Show any remaining potential duplicates (should be 0 after cleanup)
SELECT 
    title, 
    composer, 
    source, 
    voicing,
    language,
    COUNT(*) as count
FROM songs 
GROUP BY title, composer, source, voicing, language
HAVING COUNT(*) > 1
ORDER BY count DESC;
