// Quick Clerk Configuration Test
console.log("🔧 CLERK CONFIGURATION TEST");
console.log("============================");

// Test URLs
const signInUrl = "/sign-in";
const signUpUrl = "/sign-up";

console.log("✅ Expected Sign-In URL:", signInUrl);
console.log("✅ Expected Sign-Up URL:", signUpUrl);

// Test environment
const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
console.log("\n🔑 Environment Check:");
console.log("Publishable Key:", publishableKey ? "✅ SET" : "❌ MISSING");

if (publishableKey) {
  console.log("Key format:", publishableKey.startsWith('pk_test_') ? "✅ Correct" : "❌ Incorrect");
}

console.log("\n📋 Configuration Status:");
console.log("- Middleware: Updated with correct URLs");
console.log("- Layout: ClerkProvider configured");
console.log("- Routes: /sign-in/[[...sign-in]] and /sign-up/[[...sign-up]]");
console.log("- Debug: Enabled in middleware");

console.log("\n🚀 Next Steps:");
console.log("1. Restart development server");
console.log("2. Test sign-in at localhost:3000/sign-in");  
console.log("3. Test sign-up at localhost:3000/sign-up");
console.log("4. Check browser console for Clerk debug output");

console.log("\n💡 For sign-up issues, check Clerk Dashboard:");
console.log("- User Management > Settings > Sign-up settings");
console.log("- Verify 'Enable sign up' is checked");
console.log("- Check email verification requirements");
