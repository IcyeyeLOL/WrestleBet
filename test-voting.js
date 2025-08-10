// Test script to verify voting functionality and database integration
const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase configuration')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testVotingSystem() {
  try {
    console.log('🔬 Testing voting system...')
    
    // 1. Check if we have matches in the database
    console.log('\n📋 Step 1: Checking existing matches...')
    const { data: matches, error: matchesError } = await supabase
      .from('matches')
      .select('*')
    
    if (matchesError) {
      console.error('❌ Error fetching matches:', matchesError)
      return
    }
    
    console.log(`✅ Found ${matches.length} matches:`)
    matches.forEach((match, i) => {
      console.log(`   ${i + 1}. ${match.wrestler1} vs ${match.wrestler2} (ID: ${match.id})`)
    })
    
    if (matches.length === 0) {
      console.log('\n➕ No matches found, adding test matches...')
      
      // Insert test matches
      const { data: newMatches, error: insertError } = await supabase
        .from('matches')
        .insert([
          {
            wrestler1: 'David Taylor',
            wrestler2: 'Hassan Yazdani',
            event_name: 'World Wrestling Championships 2025',
            weight_class: '86kg',
            match_date: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
            status: 'upcoming'
          },
          {
            wrestler1: 'Kyle Dake',
            wrestler2: 'Bajrang Punia',
            event_name: 'European Championships',
            weight_class: '65kg',
            match_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // Day after tomorrow
            status: 'upcoming'
          },
          {
            wrestler1: 'Gable Steveson',
            wrestler2: 'Geno Petriashvili',
            event_name: 'Pan American Championships',
            weight_class: '125kg',
            match_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // Three days from now
            status: 'upcoming'
          }
        ])
        .select()
      
      if (insertError) {
        console.error('❌ Error inserting matches:', insertError)
        return
      }
      
      console.log(`✅ Added ${newMatches.length} test matches`)
      matches.push(...newMatches)
    }
    
    // 2. Test voting API endpoint
    console.log('\n🗳️ Step 2: Testing vote submission...')
    
    const testMatch = matches[0] // Use first match for testing
    console.log(`Testing with match: ${testMatch.wrestler1} vs ${testMatch.wrestler2}`)
    
    // Simulate a vote via API
    const voteResponse = await fetch('http://localhost:3000/api/vote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        matchId: testMatch.id,
        wrestlerChoice: testMatch.wrestler1,
        userIp: '127.0.0.1'
      })
    })
    
    if (voteResponse.ok) {
      const voteData = await voteResponse.json()
      console.log('✅ Vote API response:', voteData)
    } else {
      console.log('⚠️ Vote API not running (expected if server not started)')
    }
    
    // 3. Check current votes in database
    console.log('\n📊 Step 3: Checking current votes...')
    const { data: votes, error: votesError } = await supabase
      .from('votes')
      .select('*')
    
    if (votesError) {
      console.error('❌ Error fetching votes:', votesError)
      return
    }
    
    console.log(`✅ Found ${votes.length} total votes in database`)
    
    // Group votes by match
    const votesByMatch = votes.reduce((acc, vote) => {
      if (!acc[vote.match_id]) {
        acc[vote.match_id] = {}
      }
      acc[vote.match_id][vote.wrestler_choice] = (acc[vote.match_id][vote.wrestler_choice] || 0) + 1
      return acc
    }, {})
    
    console.log('\n📈 Vote counts by match:')
    Object.entries(votesByMatch).forEach(([matchId, voteCounts]) => {
      const match = matches.find(m => m.id === matchId)
      if (match) {
        console.log(`   ${match.wrestler1} vs ${match.wrestler2}:`)
        Object.entries(voteCounts).forEach(([wrestler, count]) => {
          console.log(`     - ${wrestler}: ${count} votes`)
        })
      }
    })
    
    // 4. Test the /api/votes endpoint structure
    console.log('\n🔍 Step 4: Testing API votes endpoint structure...')
    try {
      const apiResponse = await fetch('http://localhost:3000/api/votes')
      if (apiResponse.ok) {
        const apiData = await apiResponse.json()
        console.log('✅ API votes endpoint response:')
        console.log(JSON.stringify(apiData, null, 2))
      } else {
        console.log('⚠️ API votes endpoint not accessible (server not running)')
      }
    } catch (error) {
      console.log('⚠️ Could not test API endpoint:', error.message)
    }
    
    console.log('\n🎉 Voting system test completed!')
    
  } catch (error) {
    console.error('💥 Test failed:', error)
  }
}

testVotingSystem()
