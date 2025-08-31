-- ULTIMATE HARDCODED MATCH CLEANUP FOR SUPABASE DATABASE
-- Run this script in your Supabase SQL editor to remove all hardcoded wrestling matches

-- Log before cleanup
DO $$ 
DECLARE
    match_count integer;
BEGIN
    SELECT COUNT(*) INTO match_count FROM matches;
    RAISE NOTICE 'Total matches before cleanup: %', match_count;
END $$;

-- Remove all hardcoded matches by wrestler names
DELETE FROM matches WHERE 
    -- Sarah Wilson & Emma Davis matches
    (wrestler1 = 'Sarah Wilson' OR wrestler2 = 'Sarah Wilson') OR
    (wrestler1 = 'Emma Davis' OR wrestler2 = 'Emma Davis') OR
    
    -- Alex Thompson & Chris Brown matches  
    (wrestler1 = 'Alex Thompson' OR wrestler2 = 'Alex Thompson') OR
    (wrestler1 = 'Chris Brown' OR wrestler2 = 'Chris Brown') OR
    
    -- David Taylor & related wrestlers
    (wrestler1 = 'David Taylor' OR wrestler2 = 'David Taylor') OR
    (wrestler1 = 'Hassan Yazdani' OR wrestler2 = 'Hassan Yazdani') OR
    
    -- Kyle Dake & related wrestlers
    (wrestler1 = 'Kyle Dake' OR wrestler2 = 'Kyle Dake') OR
    (wrestler1 = 'Bajrang Punia' OR wrestler2 = 'Bajrang Punia') OR
    
    -- Gable Steveson & related wrestlers
    (wrestler1 = 'Gable Steveson' OR wrestler2 = 'Gable Steveson') OR
    (wrestler1 = 'Geno Petriashvili' OR wrestler2 = 'Geno Petriashvili') OR
    
    -- Frank Chamizo & related wrestlers
    (wrestler1 = 'Frank Chamizo' OR wrestler2 = 'Frank Chamizo') OR
    (wrestler1 = 'Yuki Takahashi' OR wrestler2 = 'Yuki Takahashi') OR
    
    -- John Smith & Mike Johnson (test data)
    (wrestler1 = 'John Smith' OR wrestler2 = 'John Smith') OR
    (wrestler1 = 'Mike Johnson' OR wrestler2 = 'Mike Johnson');

-- Clean up any orphaned votes for deleted matches
DELETE FROM votes WHERE match_id NOT IN (SELECT id FROM matches);

-- Clean up any orphaned bets for deleted matches  
DELETE FROM bets WHERE match_id NOT IN (SELECT id FROM matches);

-- Clean up any orphaned transactions for deleted bets
DELETE FROM wrestlecoin_transactions WHERE related_bet_id NOT IN (SELECT id FROM bets WHERE id IS NOT NULL);

-- Log after cleanup
DO $$ 
DECLARE
    match_count integer;
    vote_count integer;
    bet_count integer;
    trans_count integer;
BEGIN
    SELECT COUNT(*) INTO match_count FROM matches;
    SELECT COUNT(*) INTO vote_count FROM votes;
    SELECT COUNT(*) INTO bet_count FROM bets;
    SELECT COUNT(*) INTO trans_count FROM wrestlecoin_transactions;
    
    RAISE NOTICE '=== CLEANUP COMPLETE ===';
    RAISE NOTICE 'Remaining matches: %', match_count;
    RAISE NOTICE 'Remaining votes: %', vote_count;
    RAISE NOTICE 'Remaining bets: %', bet_count;
    RAISE NOTICE 'Remaining transactions: %', trans_count;
    RAISE NOTICE '========================';
    
    IF match_count = 0 THEN
        RAISE NOTICE '✅ SUCCESS: All hardcoded matches removed!';
        RAISE NOTICE '📝 Use the admin panel to create new matches at /admin';
    ELSE
        RAISE NOTICE '⚠️  WARNING: % matches remain - check if they are admin-created', match_count;
    END IF;
END $$;

-- List any remaining matches for verification
SELECT 
    id,
    wrestler1,
    wrestler2, 
    event_name,
    status,
    created_at
FROM matches 
ORDER BY created_at DESC;
