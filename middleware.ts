import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// Define public routes that should NOT require authentication
const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/votes(.*)',
  '/api/bets(.*)',
  '/api/matches(.*)',
  '/api/admin/matches(.*)',
  '/api/admin/declare-winner(.*)',
  '/api/admin/process-payouts(.*)',
  '/api/admin/delete-all-matches(.*)',
  '/api/admin/settings(.*)',
  '/api/admin/users(.*)',
  '/sso-callback(.*)',
  '/donation(.*)',
  '/stripe-test(.*)',
  '/admin(.*)', // Allow admin routes without authentication
  '/bets(.*)', // Allow bets page - authentication handled by component
  '/account(.*)', // Allow account page - authentication handled by component
  '/donation(.*)', // Allow donation page - authentication handled by component
  '/simple-test(.*)', // Allow simple test page
  '/bets-simple(.*)', // Allow simple bets page
  '/account-simple(.*)', // Allow simple account page
  '/nav-test(.*)', // Allow navigation test page
  '/debug(.*)' // Allow debug page
]);

export default clerkMiddleware(async (auth, req) => {
  // Allow public routes to pass through
  if (isPublicRoute(req)) {
    return;
  }
  
  // Protect all other routes
  await auth.protect();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};