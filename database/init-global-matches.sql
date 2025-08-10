-- Initialize Global Wrestling Matches
-- Run this in your Supabase SQL Editor to set up global betting

-- Insert the main wrestling matches if they don't exist
INSERT INTO matches (id, wrestler1, wrestler2, event_name, match_date, weight_class)
VALUES 
  (gen_random_uuid(), 'David Taylor', 'Hassan Yazdani', 'World Wrestling Championships 2025', NOW() + INTERVAL '30 days', '86kg'),
  (gen_random_uuid(), 'Kyle Dake', 'Bajrang Punia', 'European Championships', NOW() + INTERVAL '15 days', '65kg'),
  (gen_random_uuid(), 'Gable Steveson', 'Geno Petriashvili', 'Pan American Championships', NOW() + INTERVAL '45 days', '125kg')
ON CONFLICT (wrestler1, wrestler2) DO NOTHING;

-- Add some initial test votes to make the system interesting
-- This simulates some existing community engagement

DO $$
DECLARE
    match_taylor_yazdani UUID;
    match_dake_punia UUID;
    match_steveson_petri UUID;
BEGIN
    -- Get match IDs
    SELECT id INTO match_taylor_yazdani FROM matches WHERE wrestler1 = 'David Taylor' AND wrestler2 = 'Hassan Yazdani';
    SELECT id INTO match_dake_punia FROM matches WHERE wrestler1 = 'Kyle Dake' AND wrestler2 = 'Bajrang Punia';
    SELECT id INTO match_steveson_petri FROM matches WHERE wrestler1 = 'Gable Steveson' AND wrestler2 = 'Geno Petriashvili';
    
    -- Add initial test votes for Taylor vs Yazdani (Taylor favored)
    INSERT INTO votes (match_id, wrestler_choice, user_ip, created_at)
    VALUES 
      (match_taylor_yazdani, 'David Taylor', '192.168.1.100', NOW() - INTERVAL '2 hours'),
      (match_taylor_yazdani, 'David Taylor', '192.168.1.101', NOW() - INTERVAL '1 hour'),
      (match_taylor_yazdani, 'David Taylor', '192.168.1.102', NOW() - INTERVAL '30 minutes'),
      (match_taylor_yazdani, 'Hassan Yazdani', '192.168.1.103', NOW() - INTERVAL '25 minutes'),
      (match_taylor_yazdani, 'David Taylor', '192.168.1.104', NOW() - INTERVAL '15 minutes');
    
    -- Add initial test votes for Dake vs Punia (Close match)
    INSERT INTO votes (match_id, wrestler_choice, user_ip, created_at)
    VALUES 
      (match_dake_punia, 'Kyle Dake', '192.168.1.105', NOW() - INTERVAL '3 hours'),
      (match_dake_punia, 'Bajrang Punia', '192.168.1.106', NOW() - INTERVAL '2 hours'),
      (match_dake_punia, 'Kyle Dake', '192.168.1.107', NOW() - INTERVAL '1 hour'),
      (match_dake_punia, 'Bajrang Punia', '192.168.1.108', NOW() - INTERVAL '45 minutes');
    
    -- Add initial test votes for Steveson vs Petriashvili (Petriashvili favored)
    INSERT INTO votes (match_id, wrestler_choice, user_ip, created_at)
    VALUES 
      (match_steveson_petri, 'Geno Petriashvili', '192.168.1.109', NOW() - INTERVAL '4 hours'),
      (match_steveson_petri, 'Geno Petriashvili', '192.168.1.110', NOW() - INTERVAL '3 hours'),
      (match_steveson_petri, 'Gable Steveson', '192.168.1.111', NOW() - INTERVAL '2 hours'),
      (match_steveson_petri, 'Geno Petriashvili', '192.168.1.112', NOW() - INTERVAL '1 hour');
      
    RAISE NOTICE 'Global wrestling matches and initial votes have been set up!';
END $$;
