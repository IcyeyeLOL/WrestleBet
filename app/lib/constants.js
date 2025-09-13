// Global Constants for WrestleBet Application
// This file ensures all content is consistent across the application

export const APP_CONFIG = {
  // App Information
  name: "WrestleBet",
  tagline: "The Ultimate Wrestling Betting Experience",
  description: "Bet on wrestling matches with WrestleCoins",
  fullDescription: "Bet on your favorite wrestlers with WrestleCoins and watch real-time odds shift with every bet placed by the community!",
  
  // Branding
  logo: "🤼",
  primaryColor: "yellow-400",
  secondaryColor: "slate-900",
  
  // Features
  features: [
    "🏆 Live Betting",
    "💰 Real Prizes", 
    "⚡ Instant Payouts",
    "🎯 Dynamic Odds",
    "📊 Real-Time Stats"
  ],
  
  // Currency
  currency: {
    name: "WrestleCoins",
    symbol: "WC",
    startingBalance: 1000,
    dailyBonus: 50,
    minBet: 10,
    maxBet: 1000
  },
  
  // Navigation
  navigation: [
    { path: "/", label: "Home", icon: "🏠" },
    { path: "/bets", label: "Betting", icon: "🎯" },
    { path: "/account", label: "Account", icon: "👤" },
    { path: "/donation", label: "Donation", icon: "❤️" }
  ],
  
  // Admin Access
  adminAccess: {
    secretSequence: ['a', 'd', 'm', 'i', 'n'],
    mobileLongPress: 2000 // 2 seconds
  },
  
  // Payment Packages
  paymentPackages: [
    { id: "starter", name: "Starter Pack", coins: 1000, price: 9.99, popular: false },
    { id: "popular", name: "Popular Pack", coins: 2500, price: 19.99, popular: true },
    { id: "pro", name: "Pro Pack", coins: 5000, price: 34.99, popular: false },
    { id: "champion", name: "Champion Pack", coins: 10000, price: 59.99, popular: false }
  ],
  
  // Match Defaults
  matchDefaults: {
    eventName: "Championship Match",
    weightClass: "Open Weight",
    status: "upcoming"
  },
  
  // Error Messages
  errors: {
    insufficientFunds: "Insufficient WrestleCoins balance",
    betTooSmall: "Minimum bet is 10 WrestleCoins",
    betTooLarge: "Maximum bet is 1000 WrestleCoins",
    networkError: "Network error. Please try again.",
    authRequired: "Please sign in to place bets"
  },
  
  // Success Messages
  success: {
    betPlaced: "Bet placed successfully!",
    coinsPurchased: "WrestleCoins purchased successfully!",
    profileUpdated: "Profile updated successfully!",
    passwordUpdated: "Password updated successfully!"
  },
  
  // Loading Messages
  loading: {
    matches: "Loading matches...",
    bets: "Loading bets...",
    balance: "Loading balance...",
    payment: "Processing payment...",
    placingBet: "Placing bet..."
  }
};

export const THEME_COLORS = {
  primary: {
    50: "#fefce8",
    100: "#fef9c3", 
    200: "#fef08a",
    300: "#fde047",
    400: "#facc15", // yellow-400
    500: "#eab308",
    600: "#ca8a04",
    700: "#a16207",
    800: "#854d0e",
    900: "#713f12"
  },
  secondary: {
    50: "#f8fafc",
    100: "#f1f5f9",
    200: "#e2e8f0",
    300: "#cbd5e1",
    400: "#94a3b8",
    500: "#64748b",
    600: "#475569",
    700: "#334155",
    800: "#1e293b",
    900: "#0f172a" // slate-900
  }
};

export const ANIMATION_DELAYS = {
  hero: {
    title: 0,
    subtitle: 200,
    features: 400
  },
  cards: {
    stagger: 100
  }
};

// Export individual constants for easy importing
export const APP_NAME = APP_CONFIG.name;
export const APP_TAGLINE = APP_CONFIG.tagline;
export const APP_DESCRIPTION = APP_CONFIG.description;
export const CURRENCY_NAME = APP_CONFIG.currency.name;
export const CURRENCY_SYMBOL = APP_CONFIG.currency.symbol;
export const STARTING_BALANCE = APP_CONFIG.currency.startingBalance;
export const DAILY_BONUS = APP_CONFIG.currency.dailyBonus;
