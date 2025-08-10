console.log('🔍 Checking Clerk Environment Variables...');
console.log('================================================');

// Check if environment variables are loaded
const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
const secretKey = process.env.CLERK_SECRET_KEY;

console.log('📊 Environment Check:');
console.log('---------------------');
console.log('✅ NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY:', publishableKey ? 'SET ✓' : 'MISSING ❌');
console.log('✅ CLERK_SECRET_KEY:', secretKey ? 'SET ✓' : 'MISSING ❌');

if (publishableKey) {
  console.log('🔑 Publishable Key Preview:', publishableKey.substring(0, 20) + '...');
}

console.log('\n🎯 Expected Values:');
console.log('- Publishable key should start with: pk_test_');
console.log('- Secret key should start with: sk_test_');

if (publishableKey?.startsWith('pk_test_')) {
  console.log('✅ Publishable key format is correct');
} else {
  console.log('❌ Publishable key format issue');
}

if (secretKey?.startsWith('sk_test_')) {
  console.log('✅ Secret key format is correct');
} else {
  console.log('❌ Secret key format issue');
}

console.log('\n🚀 If everything looks good, Clerk should work!');
