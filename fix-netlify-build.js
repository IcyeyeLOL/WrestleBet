const fs = require('fs');
const path = require('path');

// List of API routes that need to be changed from force-static to force-dynamic
const apiRoutesToFix = [
  'app/api/admin/settings/route.js',
  'app/api/admin/users/route.js',
  'app/api/admin/matches/route.js',
  'app/api/admin/analytics/route.js',
  'app/api/admin/process-payouts/route.js',
  'app/api/votes/route.js',
  'app/api/vote/route.js',
  'app/api/payments/webhook/route.js',
  'app/api/payments/create-intent/route.js',
  'app/api/donations/confirm/route.js',
  'app/api/donations/webhook/route.js',
  'app/api/donations/customer-portal/route.js',
  'app/api/donations/create-subscription/route.js',
  'app/api/donations/manage-subscription/route.js',
  'app/api/donations/create-payment-intent/route.js'
];

console.log('🔧 Fixing Netlify build issues...\n');

let fixedCount = 0;
let errorCount = 0;

apiRoutesToFix.forEach(routePath => {
  try {
    if (fs.existsSync(routePath)) {
      let content = fs.readFileSync(routePath, 'utf8');
      
      // Check if the file contains force-static
      if (content.includes('force-static')) {
        // Replace force-static with force-dynamic
        content = content.replace(
          /export const dynamic = 'force-static';/g,
          "export const dynamic = 'force-dynamic';"
        );
        
        // Replace revalidate = false with revalidate = 0
        content = content.replace(
          /export const revalidate = false;/g,
          "export const revalidate = 0;"
        );
        
        // Update comments
        content = content.replace(
          /\/\/ Static export configuration for Next\.js/g,
          "// Dynamic export configuration for Next.js"
        );
        
        fs.writeFileSync(routePath, content);
        console.log(`✅ Fixed: ${routePath}`);
        fixedCount++;
      } else {
        console.log(`⏭️  Skipped: ${routePath} (already dynamic or no static config)`);
      }
    } else {
      console.log(`⚠️  Warning: ${routePath} not found`);
    }
  } catch (error) {
    console.error(`❌ Error fixing ${routePath}:`, error.message);
    errorCount++;
  }
});

console.log(`\n📊 Summary:`);
console.log(`✅ Fixed: ${fixedCount} files`);
console.log(`❌ Errors: ${errorCount} files`);

if (fixedCount > 0) {
  console.log(`\n🎉 Netlify build should now work! The main issues were:`);
  console.log(`1. Missing NEXT_PUBLIC_SUPABASE_URL environment variable`);
  console.log(`2. API routes using force-static instead of force-dynamic`);
  console.log(`3. Incorrect environment variable names in Netlify dashboard`);
  
  console.log(`\n📋 Next steps:`);
  console.log(`1. Update environment variables in Netlify dashboard`);
  console.log(`2. Redeploy your site`);
  console.log(`3. Check build logs for success`);
} else {
  console.log(`\nℹ️  No files needed fixing. Check environment variables in Netlify dashboard.`);
}
