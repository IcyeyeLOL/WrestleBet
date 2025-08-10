# WrestleBet - AI Coding Instructions

## Architecture Overview

WrestleBet is a Next.js 15 wrestling betting platform using:
- **Stack**: Next.js App Router, React 19, Tailwind CSS, TypeScript/JavaScript hybrid
- **Database**: Supabase (PostgreSQL) with real-time subscriptions
- **Auth**: Clerk for user management with middleware protection
- **Payments**: Stripe for WrestleCoin purchases and donations
- **Currency**: Custom WrestleCoin (WC) system with precision calculations

## Core Business Logic

### Betting System Architecture
The app uses a **dual-context architecture** for betting state:
- `SimpleBettingContext.jsx` - Main betting logic with global database sync
- `CurrencyContext.jsx` - WrestleCoin balance management with precision math
- Real-time odds calculation: `odds = totalPool / wrestlerPool` (minimum 1.10)
- Betting pools drive percentages/odds, NOT vote counts

### Critical Data Flow
```
User Vote/Bet → Context State → API Route → Supabase → Real-time UI Update
```

Key files: `app/api/vote/route.js`, `app/api/bets/route.js`, `app/contexts/SimpleBettingContext.jsx`

## Database Schema (Supabase)
Primary tables:
- `matches` - Wrestling matches with wrestler pairs, events, dates
- `votes` - User votes (supports anonymous via IP tracking)  
- `bets` - User bets with WrestleCoin amounts and odds
- `users` - Clerk user integration
- `wrestlecoin_transactions` - All WC transaction history

Schema files: `database/schema-updated-currency.sql`, `database/init-global-matches.sql`

## Development Workflow

### Essential Scripts
```bash
npm run dev           # Start dev server (standard)
npm run dev:turbo     # Start dev server with Turbopack (faster builds)
npm run build         # Production build  
npm run lint          # ESLint check
npm run lint:fix      # Auto-fix linting issues
npm run type-check    # TypeScript validation without build
```

### Debug Utilities (In Browser Console)
- `debug-betting-system.js` - Complete betting system reset and test
- `clear-wrestlebet-data.js` - Clear all localStorage data
- `test-*.js` files - Individual feature testing scripts

### Environment Variables
Required: `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `STRIPE_SECRET_KEY`

### Build System Notes
- Use `npm run dev` for stable development
- Use `npm run dev:turbo` only when Turbopack permissions are fixed
- Turbopack may have issues with Windows filesystem permissions

## Project-Specific Patterns

### Context Usage Pattern
Always wrap betting operations in try-catch with localStorage fallback:
```javascript
// Global database first, localStorage fallback
try {
  const response = await fetch('/api/endpoint');
  // Handle response
} catch (error) {
  console.log('⚠️ Database unavailable, using localStorage');
  // Fallback to localStorage
}
```

### WrestleCoin Precision
Use `preciseCurrencyCalculation()` for all currency operations:
```javascript
const preciseCurrencyCalculation = (amount) => Math.round(amount * 100) / 100;
```

### Match Key Mapping
Frontend uses simplified keys, API uses full names:
```javascript
// UI: 'taylor-yazdani' → API: 'David Taylor', 'Hassan Yazdani'
// Always map between these in vote/bet handlers
```

## Critical Integration Points

### Clerk Auth Middleware
Protected routes in `middleware.ts`: `/account(.*)`, `/bets(.*)`
Public routes: `/`, `/signin(.*)`, `/signup(.*)`

### Supabase Real-time
All betting data syncs globally across browser tabs via Supabase subscriptions

### Component Architecture
- `FrontPage.jsx` - Main betting interface with live odds
- `SharedHeader.jsx` - Navigation with WrestleCoin balance
- `BettingModal.jsx` - Bet placement interface
- `AdminLayout.jsx` - Match management for administrators

## Error Handling Patterns

### Naming Conflicts
Watch for duplicate hook names across contexts (e.g., multiple `useBetting` exports)
Rename conflicting hooks with descriptive prefixes: `useSimpleBetting`, `useDatabaseBetting`

### State Management
- Immediate UI updates with optimistic state changes
- Background API sync with error recovery
- localStorage backup for offline functionality

## Testing & Debugging

### Browser Console Commands
Run `debug-betting-system.js` to reset and test complete betting flow
Check console for: `🌍 Loading global poll data...`, `✅ Global database sync successful`

### Key Debugging Files
- `BETTING_SYSTEM_FIXES.md` - Historical bug fixes and solutions
- `WC_BETTING_POOLS_IMPLEMENTATION.md` - Betting pool mechanics documentation
- `test-*.js` files - Individual feature tests

## Performance Considerations

### Database Optimization
- Indexes on `match_id`, `user_id` for votes/bets tables
- UUID primary keys throughout
- Row Level Security (RLS) policies for data access

### Frontend Optimization  
- Context state updates trigger automatic re-renders
- Avoid unnecessary re-calculations by memoizing odds calculations
- Use Turbopack for fast development builds

## Common Gotchas
1. **Currency precision**: Always use `preciseCurrencyCalculation()` for WrestleCoin amounts
2. **Match key mapping**: Convert UI keys to database wrestler names in API calls  
3. **Context dependencies**: Use cleanup functions in useEffect to prevent memory leaks
4. **Odds minimums**: Never allow odds below 1.10 to prevent exploitation
5. **Anonymous voting**: Uses IP tracking, not user IDs for public polls
6. **File structure**: Removed duplicate auth routes - use only `/sign-in/[[...sign-in]]` pattern
7. **API validation**: All endpoints now have input validation and proper error handling
8. **Build system**: Default `npm run dev` avoids Turbopack permission issues
