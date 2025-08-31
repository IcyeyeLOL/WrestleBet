-- EMERGENCY HARDCODED MATCH CLEANUP FOR SUPABASE
-- Run this in Supabase SQL Editor to remove all hardcoded matches

-- Step 1: Show current hardcoded matches
SELECT 
    id,
    wrestler1,
    wrestler2,
    'HARDCODED - WILL BE DELETED' as status
FROM matches 
WHERE 
    wrestler1 IN ('Sarah Wilson', 'Emma Davis', 'Alex Thompson', 'Chris Brown', 'David Taylor', 'Hassan Yazdani', 'Kyle Dake', 'Bajrang Punia', 'Gable Steveson', 'Geno Petriashvili', 'Frank Chamizo', 'Yuki Takahashi', 'John Smith', 'Mike Johnson')
    OR
    wrestler2 IN ('Sarah Wilson', 'Emma Davis', 'Alex Thompson', 'Chris Brown', 'David Taylor', 'Hassan Yazdani', 'Kyle Dake', 'Bajrang Punia', 'Gable Steveson', 'Geno Petriashvili', 'Frank Chamizo', 'Yuki Takahashi', 'John Smith', 'Mike Johnson');

-- Step 2: Delete all bets for hardcoded matches
DELETE FROM bets 
WHERE match_id IN (
    SELECT id FROM matches 
    WHERE 
        wrestler1 IN ('Sarah Wilson', 'Emma Davis', 'Alex Thompson', 'Chris Brown', 'David Taylor', 'Hassan Yazdani', 'Kyle Dake', 'Bajrang Punia', 'Gable Steveson', 'Geno Petriashvili', 'Frank Chamizo', 'Yuki Takahashi', 'John Smith', 'Mike Johnson')
        OR
        wrestler2 IN ('Sarah Wilson', 'Emma Davis', 'Alex Thompson', 'Chris Brown', 'David Taylor', 'Hassan Yazdani', 'Kyle Dake', 'Bajrang Punia', 'Gable Steveson', 'Geno Petriashvili', 'Frank Chamizo', 'Yuki Takahashi', 'John Smith', 'Mike Johnson')
);

-- Step 3: Delete all votes for hardcoded matches
DELETE FROM votes 
WHERE match_id IN (
    SELECT id FROM matches 
    WHERE 
        wrestler1 IN ('Sarah Wilson', 'Emma Davis', 'Alex Thompson', 'Chris Brown', 'David Taylor', 'Hassan Yazdani', 'Kyle Dake', 'Bajrang Punia', 'Gable Steveson', 'Geno Petriashvili', 'Frank Chamizo', 'Yuki Takahashi', 'John Smith', 'Mike Johnson')
        OR
        wrestler2 IN ('Sarah Wilson', 'Emma Davis', 'Alex Thompson', 'Chris Brown', 'David Taylor', 'Hassan Yazdani', 'Kyle Dake', 'Bajrang Punia', 'Gable Steveson', 'Geno Petriashvili', 'Frank Chamizo', 'Yuki Takahashi', 'John Smith', 'Mike Johnson')
);

-- Step 4: Delete all hardcoded matches
DELETE FROM matches 
WHERE 
    wrestler1 IN ('Sarah Wilson', 'Emma Davis', 'Alex Thompson', 'Chris Brown', 'David Taylor', 'Hassan Yazdani', 'Kyle Dake', 'Bajrang Punia', 'Gable Steveson', 'Geno Petriashvili', 'Frank Chamizo', 'Yuki Takahashi', 'John Smith', 'Mike Johnson')
    OR
    wrestler2 IN ('Sarah Wilson', 'Emma Davis', 'Alex Thompson', 'Chris Brown', 'David Taylor', 'Hassan Yazdani', 'Kyle Dake', 'Bajrang Punia', 'Gable Steveson', 'Geno Petriashvili', 'Frank Chamizo', 'Yuki Takahashi', 'John Smith', 'Mike Johnson');

-- Step 5: Show remaining matches (should only be admin-created ones)
SELECT 
    id,
    wrestler1,
    wrestler2,
    status,
    created_at,
    'ADMIN CREATED - KEPT' as note
FROM matches 
ORDER BY created_at DESC;

-- Step 6: Show final count
SELECT 
    COUNT(*) as remaining_matches,
    'All hardcoded matches should be gone' as status
FROM matches;
