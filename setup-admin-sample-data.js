// SAMPLE DATA SETUP FOR ADMIN DASHBOARD TESTING
// Run this script to add sample matches for testing the admin system

const sampleMatches = [
  {
    wrestler1: "Roman Reigns",
    wrestler2: "Cody Rhodes", 
    eventName: "Royal Rumble 2025",
    weightClass: "Heavyweight",
    matchDate: new Date("2025-02-01T20:00:00Z").toISOString(),
    description: "Championship match for the Undisputed WWE Universal Championship",
    isFeatured: true
  },
  {
    wrestler1: "CM Punk",
    wrestler2: "Drew McIntyre",
    eventName: "Royal Rumble 2025", 
    weightClass: "Heavyweight",
    matchDate: new Date("2025-02-01T21:00:00Z").toISOString(),
    description: "Special guest referee match with surprise stipulations",
    isFeatured: true
  },
  {
    wrestler1: "Rhea Ripley",
    wrestler2: "Bianca Belair",
    eventName: "Royal Rumble 2025",
    weightClass: "Women's",
    matchDate: new Date("2025-02-01T19:30:00Z").toISOString(),
    description: "Women's World Championship match",
    isFeatured: false
  },
  {
    wrestler1: "Seth Rollins",
    wrestler2: "Gunther", 
    eventName: "Royal Rumble 2025",
    weightClass: "Heavyweight",
    matchDate: new Date("2025-02-01T22:00:00Z").toISOString(),
    description: "World Heavyweight Championship bout",
    isFeatured: false
  }
];

async function setupSampleData() {
  console.log('🚀 Setting up sample match data for admin testing...');
  
  try {
    for (const match of sampleMatches) {
      console.log(`Creating match: ${match.wrestler1} vs ${match.wrestler2}`);
      
      const response = await fetch('http://localhost:3001/api/admin/matches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...match,
          adminUserId: 'sample-admin-id'
        })
      });
      
      const data = await response.json();
      if (data.success) {
        console.log(`✅ Created: ${data.match.wrestler1} vs ${data.match.wrestler2}`);
      } else {
        console.error(`❌ Failed to create match: ${data.error}`);
      }
    }
    
    console.log('\n🎉 Sample data setup complete!');
    console.log('📍 You can now test the admin dashboard at: http://localhost:3001/admin');
    console.log('🔑 Use admin key: wrestlebet-admin-2025');
    console.log('');
    console.log('✨ Available features:');
    console.log('  • Create, edit, and delete matches');
    console.log('  • Declare match winners and process payouts'); 
    console.log('  • View analytics and user management');
    console.log('  • Configure system settings');
    console.log('  • Monitor payout history');
    
  } catch (error) {
    console.error('❌ Error setting up sample data:', error.message);
    console.log('💡 Make sure your development server is running on localhost:3001');
  }
}

// Auto-run if this file is executed directly
if (require.main === module) {
  setupSampleData();
}

module.exports = { setupSampleData, sampleMatches };
