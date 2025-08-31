-- Fix Supabase Relationship Conflicts
-- Run this in Supabase SQL editor to clean up duplicate foreign key relationships

-- Check for duplicate foreign key constraints
SELECT 
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_name IN ('votes', 'matches', 'bets')
ORDER BY tc.table_name, tc.constraint_name;

-- Drop all existing foreign key constraints to clean up
DO $$ 
BEGIN
    -- Drop votes foreign keys
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_votes_user') THEN
        ALTER TABLE votes DROP CONSTRAINT fk_votes_user;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_votes_match') THEN
        ALTER TABLE votes DROP CONSTRAINT fk_votes_match;
    END IF;
    
    -- Drop bets foreign keys
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_bets_user') THEN
        ALTER TABLE bets DROP CONSTRAINT fk_bets_user;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_bets_match') THEN
        ALTER TABLE bets DROP CONSTRAINT fk_bets_match;
    END IF;
    
    -- Drop transactions foreign keys
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_transactions_user') THEN
        ALTER TABLE wrestlecoin_transactions DROP CONSTRAINT fk_transactions_user;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_transactions_bet') THEN
        ALTER TABLE wrestlecoin_transactions DROP CONSTRAINT fk_transactions_bet;
    END IF;
    
    RAISE NOTICE 'All foreign key constraints dropped successfully';
END $$;

-- Recreate only the necessary foreign key constraints
DO $$ 
BEGIN
    -- Recreate votes -> matches foreign key (only one relationship)
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'votes' AND column_name = 'match_id') 
       AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'matches' AND column_name = 'id') THEN
        ALTER TABLE votes ADD CONSTRAINT fk_votes_match 
        FOREIGN KEY (match_id) REFERENCES matches(id) ON DELETE CASCADE;
        RAISE NOTICE 'Created votes -> matches foreign key';
    END IF;
    
    -- Recreate bets -> matches foreign key
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bets' AND column_name = 'match_id') 
       AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'matches' AND column_name = 'id') THEN
        ALTER TABLE bets ADD CONSTRAINT fk_bets_match 
        FOREIGN KEY (match_id) REFERENCES matches(id) ON DELETE CASCADE;
        RAISE NOTICE 'Created bets -> matches foreign key';
    END IF;
    
    -- Recreate bets -> users foreign key
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bets' AND column_name = 'user_id') 
       AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'id') THEN
        ALTER TABLE bets ADD CONSTRAINT fk_bets_user 
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
        RAISE NOTICE 'Created bets -> users foreign key';
    END IF;
    
    -- Recreate transactions -> users foreign key
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'wrestlecoin_transactions' AND column_name = 'user_id') 
       AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'id') THEN
        ALTER TABLE wrestlecoin_transactions ADD CONSTRAINT fk_transactions_user 
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
        RAISE NOTICE 'Created transactions -> users foreign key';
    END IF;
    
    -- Recreate transactions -> bets foreign key
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'wrestlecoin_transactions' AND column_name = 'related_bet_id') 
       AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bets' AND column_name = 'id') THEN
        ALTER TABLE wrestlecoin_transactions ADD CONSTRAINT fk_transactions_bet 
        FOREIGN KEY (related_bet_id) REFERENCES bets(id) ON DELETE SET NULL;
        RAISE NOTICE 'Created transactions -> bets foreign key';
    END IF;
    
    RAISE NOTICE 'All foreign key constraints recreated successfully';
END $$;

-- Verify the relationships
SELECT 
    'Relationship conflicts fixed successfully!' as status,
    COUNT(*) as total_foreign_keys
FROM information_schema.table_constraints 
WHERE constraint_type = 'FOREIGN KEY' 
    AND table_name IN ('votes', 'matches', 'bets', 'wrestlecoin_transactions');
