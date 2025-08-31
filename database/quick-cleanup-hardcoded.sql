-- Quick cleanup of hardcoded wrestlers
-- Run this in Supabase SQL editor to remove specific hardcoded data

-- First, let's see what matches currently exist
SELECT 
    id,
    wrestler1,
    wrestler2,
    event_name,
    status,
    created_at
FROM matches 
ORDER BY created_at DESC;

-- Delete matches with specific hardcoded wrestler names
DELETE FROM matches 
WHERE wrestler1 IN (
    'David Taylor',
    'Kyle Dake', 
    'Gable Steveson',
    'Frank Chamizo',
    'John Smith',
    'Alex Thompson',
    'Sarah Wilson',
    'David'
)
OR wrestler2 IN (
    'Hassan Yazdani',
    'Bajrang Punia',
    'Geno Petriashvili', 
    'Yuki Takahashi',
    'Mike Johnson',
    'Chris Brown',
    'Emma Davis'
)
OR event_name IN (
    'World Wrestling Championships 2025',
    'European Championships',
    'Pan American Championships',
    'Asian Championships'
);

-- Delete any matches with demo or test in the name
DELETE FROM matches 
WHERE wrestler1 LIKE '%demo%' 
   OR wrestler2 LIKE '%demo%'
   OR wrestler1 LIKE '%test%'
   OR wrestler2 LIKE '%test%'
   OR event_name LIKE '%demo%'
   OR event_name LIKE '%test%';

-- Clear all related data
DELETE FROM votes;
DELETE FROM bets;
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
