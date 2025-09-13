-- FIX MISSING total_bet_pool COLUMN
-- This script adds the missing total_bet_pool column to the matches table

-- Add the missing total_bet_pool column to the matches table
ALTER TABLE matches 
ADD COLUMN IF NOT EXISTS total_bet_pool INTEGER DEFAULT 0;

-- Update existing matches to have default total_bet_pool value
UPDATE matches 
SET total_bet_pool = COALESCE(total_pool, 0)
WHERE total_bet_pool IS NULL;

-- Show the updated table structure
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'matches' 
ORDER BY ordinal_position;

SELECT 'total_bet_pool column added successfully to matches table!' as message;
