// Dynamic Match System Test
// Run this in browser console to test the new dynamic match finding

console.log('🧪 Testing Dynamic Match System...')

// Test different search formats
const testSearches = [
  'kunle-ajani',
  'kunleajani',  
  'kunle vs ajani',
  'ajani vs kunle',
  'Kunle Adeleye vs Ajani Thompson',
  'david-taylor',
  'davtay-hastaylo', // Partial match test
  'roman-reigns'
]

const testDynamicMatches = async () => {
  console.log('🔄 Testing dynamic match API...')
  
  // First auto-initialize the database
  try {
    const initResponse = await fetch('/api/matches/dynamic', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'auto-init' })
    })
    const initResult = await initResponse.json()
    console.log('🚀 Auto-init result:', initResult)
  } catch (error) {
    console.log('⚠️ Auto-init error (might already exist):', error.message)
  }
  
  // Test each search format
  for (const searchTerm of testSearches) {
    console.log(`\n🔍 Testing search: "${searchTerm}"`)
    
    try {
      const response = await fetch(`/api/matches/dynamic?search=${encodeURIComponent(searchTerm)}`)
      const result = await response.json()
      
      if (result.found) {
        console.log(`✅ Found match: ${result.match.id} - ${result.match.wrestler1} vs ${result.match.wrestler2}`)
      } else {
        console.log(`❌ No match found for: ${searchTerm}`)
        if (result.suggestions && result.suggestions.length > 0) {
          console.log('💡 Suggestions:', result.suggestions.map(s => s.id).join(', '))
        }
      }
    } catch (error) {
      console.error(`❌ Error testing ${searchTerm}:`, error.message)
    }
    
    // Small delay between tests
    await new Promise(resolve => setTimeout(resolve, 100))
  }
}

const testDynamicBetting = async () => {
  console.log('\n💰 Testing dynamic betting API...')
  
  const testBets = [
    { matchId: 'kunle-ajani', wrestlerChoice: 'wrestler1', betAmount: 10 },
    { matchId: 'kunleajani', wrestlerChoice: 'wrestler2', betAmount: 15 },
    { matchId: 'kunle vs ajani', wrestlerChoice: 'wrestler1', betAmount: 20 }
  ]
  
  for (const bet of testBets) {
    console.log(`\n💸 Testing bet: ${bet.matchId} - ${bet.wrestlerChoice} - ${bet.betAmount}WC`)
    
    try {
      const response = await fetch('/api/bets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'test-user-dynamic',
          matchId: bet.matchId,
          wrestlerChoice: bet.wrestlerChoice,
          betAmount: bet.betAmount,
          odds: 2.5
        })
      })
      
      const result = await response.json()
      
      if (result.success) {
        console.log(`✅ Bet placed successfully:`, result.message)
        if (result.match) {
          console.log(`🥊 Match: ${result.match.wrestler1} vs ${result.match.wrestler2}`)
        }
      } else {
        console.log(`❌ Bet failed:`, result.error)
        if (result.availableMatches) {
          console.log('Available matches:', result.availableMatches.map(m => m.id).join(', '))
        }
      }
    } catch (error) {
      console.error(`❌ Error placing bet:`, error.message)
    }
    
    await new Promise(resolve => setTimeout(resolve, 200))
  }
}

// Run the tests
const runAllTests = async () => {
  console.log('🎯 Starting comprehensive dynamic system test...')
  
  await testDynamicMatches()
  await testDynamicBetting()
  
  console.log('\n🏁 Dynamic system test complete!')
  console.log('✅ If you see successful matches and bets above, the dynamic system is working!')
  console.log('📝 Check the console logs for detailed match finding and scoring information')
}

// Execute the test
runAllTests().catch(console.error)

// Also provide manual test function
window.testDynamicSystem = runAllTests
window.testMatches = testDynamicMatches
window.testBets = testDynamicBetting

console.log('🛠️ Dynamic system test loaded!')
console.log('🎮 Run testDynamicSystem() to test everything')
console.log('🔍 Run testMatches() to test just match finding')
console.log('💰 Run testBets() to test just betting')
