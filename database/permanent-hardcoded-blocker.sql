-- PERMANENT HARDCODED MATCH BLOCKER
-- This will prevent any hardcoded matches from being inserted ever again

-- Step 1: Delete ALL existing matches (nuclear cleanup)
DELETE FROM bets WHERE match_id IN (SELECT id FROM matches);
DELETE FROM votes WHERE match_id IN (SELECT id FROM matches);
DELETE FROM matches;

-- Step 2: Create a function to block hardcoded wrestler names
CREATE OR REPLACE FUNCTION block_hardcoded_wrestlers()
RETURNS TRIGGER AS $$
DECLARE
    hardcoded_names TEXT[] := ARRAY[
        'david taylor', 'hassan yazdani', 'kyle dake', 'bajrang punia',
        'gable steveson', 'geno petriashvili', 'frank chamizo', 'yuki takahashi',
        'sarah wilson', 'emma davis', 'alex thompson', 'chris brown',
        'takuto otoguro', 'john smith', 'mike johnson'
    ];
    wrestler1_lower TEXT;
    wrestler2_lower TEXT;
BEGIN
    wrestler1_lower := LOWER(TRIM(NEW.wrestler1));
    wrestler2_lower := LOWER(TRIM(NEW.wrestler2));
    
    -- Check if either wrestler is in the hardcoded list
    IF wrestler1_lower = ANY(hardcoded_names) OR wrestler2_lower = ANY(hardcoded_names) THEN
        RAISE EXCEPTION 'BLOCKED: Hardcoded wrestler detected - % vs %. Use admin panel to create legitimate matches.', NEW.wrestler1, NEW.wrestler2;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 3: Create trigger to block hardcoded insertions
DROP TRIGGER IF EXISTS trigger_block_hardcoded ON matches;
CREATE TRIGGER trigger_block_hardcoded
    BEFORE INSERT OR UPDATE ON matches
    FOR EACH ROW
    EXECUTE FUNCTION block_hardcoded_wrestlers();

-- Step 4: Add a verification function
CREATE OR REPLACE FUNCTION verify_clean_database()
RETURNS TEXT AS $$
DECLARE
    match_count INTEGER;
    hardcoded_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO match_count FROM matches;
    
    SELECT COUNT(*) INTO hardcoded_count 
    FROM matches 
    WHERE 
        LOWER(wrestler1) IN ('david taylor', 'hassan yazdani', 'kyle dake', 'bajrang punia', 'gable steveson', 'geno petriashvili', 'frank chamizo', 'yuki takahashi', 'sarah wilson', 'emma davis', 'alex thompson', 'chris brown')
        OR 
        LOWER(wrestler2) IN ('david taylor', 'hassan yazdani', 'kyle dake', 'bajrang punia', 'gable steveson', 'geno petriashvili', 'frank chamizo', 'yuki takahashi', 'sarah wilson', 'emma davis', 'alex thompson', 'chris brown');
    
    RETURN FORMAT('Database Status: %s total matches, %s hardcoded matches. %s', 
                  match_count, 
                  hardcoded_count,
                  CASE WHEN hardcoded_count > 0 THEN 'CLEANUP NEEDED!' ELSE 'CLEAN!' END);
END;
$$ LANGUAGE plpgsql;

-- Step 5: Test the blocker (this should fail)
-- INSERT INTO matches (wrestler1, wrestler2, event_name, weight_class) 
-- VALUES ('David Taylor', 'Hassan Yazdani', 'Test Event', '86kg');

-- Step 6: Verification
SELECT verify_clean_database() as status;

-- Success message
SELECT 'PERMANENT HARDCODED BLOCKER ACTIVATED! No hardcoded matches can be inserted.' as message;
