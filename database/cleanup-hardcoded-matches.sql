-- Clean up hardcoded and duplicate matches
-- Run this in Supabase SQL editor to remove unwanted match data

-- First, let's see what matches currently exist
SELECT 
    id,
    wrestler1,
    wrestler2,
    event_name,
    status,
    created_at,
    COUNT(*) OVER (PARTITION BY wrestler1, wrestler2, event_name) as duplicates
FROM matches 
ORDER BY created_at DESC;

-- Delete any matches with hardcoded data
DELETE FROM matches 
WHERE wrestler1 LIKE '%demo%' 
   OR wrestler2 LIKE '%demo%'
   OR event_name LIKE '%demo%';

-- Delete duplicate matches (keep only the most recent one for each unique match)
DELETE FROM matches 
WHERE id IN (
    SELECT id FROM (
        SELECT id,
               ROW_NUMBER() OVER (
                   PARTITION BY wrestler1, wrestler2, event_name 
                   ORDER BY created_at DESC
               ) as rn
        FROM matches
    ) t
    WHERE t.rn > 1
);

-- Delete any matches with placeholder data
DELETE FROM matches 
WHERE wrestler1 IN ('David Taylor', 'Kyle Dake', 'Gable Steveson', 'Frank Chamizo')
   OR wrestler2 IN ('Hassan Yazdani', 'Bajrang Punia', 'Geno Petriashvili', 'Yuki Takahashi')
   OR event_name IN ('World Wrestling Championships 2025', 'European Championships', 'Pan American Championships', 'Asian Championships');

-- Clear all votes to start fresh
DELETE FROM votes;

-- Clear all bets to start fresh
DELETE FROM bets;

-- Clear all transactions to start fresh
DELETE FROM wrestlecoin_transactions;

-- Verify the cleanup
SELECT 
    'Cleanup completed!' as status,
    COUNT(*) as remaining_matches
FROM matches;

-- Show remaining matches
SELECT 
    id,
    wrestler1,
    wrestler2,
    event_name,
    status,
    created_at
FROM matches 
ORDER BY created_at DESC;
