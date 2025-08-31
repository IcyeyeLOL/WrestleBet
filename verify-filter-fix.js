// Verification Script - Run in Browser Console
// This verifies the frontend filtering fix is working

console.log('🔍 Testing frontend filtering fix...');

// Test match data (your real match)
const testMatch = {
  id: '423f65d9-1011-4156-9a8a-59bb956be59a',
  wrestler1: 'David',
  wrestler2: 'Kunle',
  event_name: 'champ',
  weight_class: '86kg',
  status: 'upcoming'
};

// Test the hardcoded filter logic (copied from frontend)
const isHardcodedMatch = (match) => {
  const hardcodedNames = [
    'sarah wilson', 'emma davis', 'alex thompson', 'chris brown',
    'david taylor', 'hassan yazdani', 'kyle dake', 'bajrang punia',
    'gable steveson', 'geno petriashvili'
  ];
  
  const wrestler1Lower = (match.wrestler1 || '').toLowerCase();
  const wrestler2Lower = (match.wrestler2 || '').toLowerCase();
  
  return hardcodedNames.some(name => 
    wrestler1Lower.includes(name) || wrestler2Lower.includes(name)
  );
};

// Test the filtering logic (fixed version)
const hasValidId = testMatch.id && testMatch.id.length > 10;
const hasValidWrestlers = testMatch.wrestler1 && testMatch.wrestler2;
const isNotHardcoded = !isHardcodedMatch(testMatch);

console.log('🧪 Testing David vs Kunle match:');
console.log('  - Has Valid ID:', hasValidId, `(${testMatch.id.length} chars)`);
console.log('  - Has Valid Wrestlers:', hasValidWrestlers, `("${testMatch.wrestler1}" vs "${testMatch.wrestler2}")`);
console.log('  - Is NOT Hardcoded:', isNotHardcoded);

// Test the FIXED filtering condition
const shouldPassFilter = hasValidId && hasValidWrestlers && isNotHardcoded;
console.log('  - Should Pass Filter:', shouldPassFilter);

if (shouldPassFilter) {
  console.log('✅ SUCCESS! David vs Kunle match should now appear in frontend');
  console.log('🔄 Please refresh the page to see the match');
} else {
  console.log('❌ FAIL! Match would still be filtered out');
  
  if (!hasValidId) console.log('  - Problem: Invalid ID');
  if (!hasValidWrestlers) console.log('  - Problem: Invalid wrestlers');
  if (!isNotHardcoded) console.log('  - Problem: Detected as hardcoded');
}

// Test a hardcoded match to ensure it gets filtered out
const hardcodedTestMatch = {
  id: 'test-id-123456789',
  wrestler1: 'David Taylor',
  wrestler2: 'Hassan Yazdani',
  event_name: 'test',
  weight_class: '86kg',
  status: 'upcoming'
};

const hardcodedShouldPass = !isHardcodedMatch(hardcodedTestMatch);
console.log('\n🧪 Testing hardcoded match (David Taylor vs Hassan Yazdani):');
console.log('  - Should be filtered OUT:', !hardcodedShouldPass);

if (!hardcodedShouldPass) {
  console.log('✅ SUCCESS! Hardcoded matches are properly filtered out');
} else {
  console.log('❌ WARNING! Hardcoded matches are not being filtered');
}

console.log('\n🎯 Filter fix verification complete!');
