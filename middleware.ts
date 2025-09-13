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
  '/admin(.*)' // Allow admin routes without authentication
]);

// Define admin routes that require admin privileges
const isAdminRoute = createRouteMatcher([
  '/admin(.*)',
  '/api/admin(.*)'
]);

export default clerkMiddleware(async (auth, req) => {
  // Protect all routes except public ones
  if (!isPublicRoute(req)) {
    await auth.protect();
  }
  
  // Admin routes are now public - authentication is handled by the AdminLayout component
  // This allows users to access /admin and enter the admin key without being forced to sign in first
}, { 
  debug: process.env.NODE_ENV === 'development',
  signInUrl: '/sign-in',
  signUpUrl: '/sign-up',
  afterSignInUrl: '/',
  afterSignUpUrl: '/'
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};