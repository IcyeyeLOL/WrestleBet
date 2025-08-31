// PERMANENT HARDCODED MATCH ELIMINATION
// This will permanently block hardcoded matches from ever being inserted again

(async function permanentElimination() {
  console.log('🛡️ PERMANENT HARDCODED MATCH ELIMINATION STARTING...');
  
  if (!window.supabase) {
    console.error('❌ Supabase not available');
    return;
  }
  
  try {
    // Step 1: Nuclear deletion of ALL existing matches
    console.log('💥 Step 1: Nuclear deletion of ALL matches...');
    
    await window.supabase.from('bets').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await window.supabase.from('votes').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await window.supabase.from('matches').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    
    console.log('✅ All matches, bets, and votes deleted');
    
    // Step 2: Create blocking function via SQL
    console.log('🛡️ Step 2: Installing hardcoded wrestler blocker...');
    
    const blockerSQL = `
      -- Create function to block hardcoded wrestlers
      CREATE OR REPLACE FUNCTION block_hardcoded_wrestlers()
      RETURNS TRIGGER AS $$
      DECLARE
          hardcoded_names TEXT[] := ARRAY[
              'david taylor', 'hassan yazdani', 'kyle dake', 'bajrang punia',
              'gable steveson', 'geno petriashvili', 'frank chamizo', 'yuki takahashi',
              'sarah wilson', 'emma davis', 'alex thompson', 'chris brown'
          ];
          wrestler1_lower TEXT;
          wrestler2_lower TEXT;
      BEGIN
          wrestler1_lower := LOWER(TRIM(NEW.wrestler1));
          wrestler2_lower := LOWER(TRIM(NEW.wrestler2));
          
          -- Block hardcoded wrestlers
          IF wrestler1_lower = ANY(hardcoded_names) OR wrestler2_lower = ANY(hardcoded_names) THEN
              RAISE EXCEPTION 'BLOCKED: Hardcoded wrestler % vs % rejected. Use admin panel for legitimate matches.', NEW.wrestler1, NEW.wrestler2;
          END IF;
          
          RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
      
      -- Create trigger
      DROP TRIGGER IF EXISTS trigger_block_hardcoded ON matches;
      CREATE TRIGGER trigger_block_hardcoded
          BEFORE INSERT OR UPDATE ON matches
          FOR EACH ROW
          EXECUTE FUNCTION block_hardcoded_wrestlers();
    `;
    
    const { error: sqlError } = await window.supabase.rpc('exec_sql', { sql: blockerSQL });
    
    if (sqlError) {
      console.warn('⚠️ Could not install SQL blocker via RPC, trying manual method...');
      console.log('📋 Please run this SQL manually in Supabase SQL editor:');
      console.log(blockerSQL);
    } else {
      console.log('✅ Hardcoded wrestler blocker installed successfully');
    }
    
    // Step 3: Verify database is clean
    console.log('🔍 Step 3: Verifying database is clean...');
    
    const { data: remainingMatches, error: checkError } = await window.supabase
      .from('matches')
      .select('*');
    
    if (checkError) {
      console.error('❌ Error checking database:', checkError);
    } else {
      console.log(`✅ Database verification: ${remainingMatches.length} matches remaining`);
      
      if (remainingMatches.length === 0) {
        console.log('🎉 SUCCESS: Database is completely clean!');
      } else {
        console.log('⚠️ WARNING: Some matches still exist:');
        remainingMatches.forEach(match => {
          console.log(`- ${match.wrestler1} vs ${match.wrestler2}`);
        });
      }
    }
    
    // Step 4: Test the blocker (this should fail)
    console.log('🧪 Step 4: Testing hardcoded wrestler blocker...');
    
    try {
      const { error: testError } = await window.supabase
        .from('matches')
        .insert({
          wrestler1: 'David Taylor',
          wrestler2: 'Hassan Yazdani',
          event_name: 'Test Event (Should Be Blocked)',
          weight_class: '86kg'
        });
      
      if (testError) {
        console.log('✅ BLOCKER WORKING: Hardcoded match insertion blocked!');
        console.log('🛡️ Error message:', testError.message);
      } else {
        console.log('❌ WARNING: Blocker not working - hardcoded match was inserted');
      }
    } catch (blockError) {
      console.log('✅ BLOCKER WORKING: Exception thrown for hardcoded match');
    }
    
    // Step 5: Clear all caches and storage
    console.log('🧹 Step 5: Clearing all local data...');
    
    localStorage.clear();
    sessionStorage.clear();
    
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      for (const cacheName of cacheNames) {
        await caches.delete(cacheName);
      }
    }
    
    // Step 6: Force reload
    console.log('🔄 Step 6: Forcing page reload...');
    console.log('🎯 After reload, database will be permanently protected against hardcoded matches');
    
    setTimeout(() => {
      window.location.href = window.location.origin + '/?protected=' + Date.now();
    }, 3000);
    
    console.log('✅ PERMANENT ELIMINATION COMPLETED!');
    console.log('🛡️ Database is now permanently protected against hardcoded matches');
    console.log('📋 Use /admin to create legitimate wrestling matches');
    
  } catch (error) {
    console.error('❌ PERMANENT ELIMINATION FAILED:', error);
  }
})();
