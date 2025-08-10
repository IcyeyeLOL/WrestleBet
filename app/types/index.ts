// Type definitions for WrestleBet application

export interface Wrestler {
  id: string;
  name: string;
  country: string;
  weight: number;
  rank?: number;
}

export interface Match {
  id: string;
  wrestler1: string;
  wrestler2: string;
  weightClass: string;
  event: string;
  date?: string;
  time?: string;
  status: 'upcoming' | 'live' | 'completed';
}

export interface PollData {
  [matchId: string]: Match;
}

export interface BettingPools {
  [matchId: string]: {
    wrestler1: number;
    wrestler2: number;
  };
}

export interface Odds {
  [matchId: string]: {
    [wrestlerKey: string]: string;
  };
}

export interface Bet {
  id: string;
  matchId: string;
  wrestler: string;
  amount: number;
  odds: string;
  status: 'pending' | 'won' | 'lost' | 'cancelled';
  userId?: string;
  createdAt: Date;
  potentialPayout: number;
}

export interface UserVotes {
  [matchId: string]: string;
}

export interface BettingModalState {
  isOpen: boolean;
  matchId: string;
  wrestler: string;
  odds: string;
}

export interface AuthModalState {
  isOpen: boolean;
  mode: 'signin' | 'signup';
  triggeredBy: {
    action: 'vote' | 'bet' | 'url_redirect';
    matchId?: string;
    wrestler?: string;
    odds?: string;
  } | null;
}

export interface CurrencyContextValue {
  balance: number;
  setBalance: (balance: number) => void;
  addToBalance: (amount: number) => void;
  subtractFromBalance: (amount: number) => void;
  getFormattedBalance: () => string;
  getBalanceStatus: () => 'critical' | 'low' | 'normal';
  loading: boolean;
  lastBonusTime: Date | null;
  DAILY_BONUS_AMOUNT: number;
  preciseCurrencyCalculation: (amount: number) => number;
  updateBalanceWithPrecision: (currentBalance: number, change: number) => number;
  dailyBonusAvailable: boolean;
  claimDailyBonus: () => { success: boolean; amount?: number; error?: string };
  getTimeUntilNextBonus: () => { hours: number; minutes: number; seconds: number } | null;
}

export interface BettingContextValue {
  selectedVotes: UserVotes;
  handleVote: (matchId: string, wrestler: string) => void;
  placeBetFromVote: (matchId: string, wrestler: string, odds: string, amount: number) => void;
  pollData: PollData;
  odds: Odds;
  bettingPools: BettingPools;
  bets: Bet[];
  loading: boolean;
}

export interface MatchCardProps {
  matchId: string;
  match: Match;
  selectedVotes: UserVotes;
  odds: Odds;
  bettingPools: BettingPools;
  bets: Bet[];
  hasAlreadyBet: (matchId: string) => boolean;
  getExistingBet: (matchId: string) => Bet | undefined;
  handlePlaceBet: (matchId: string, wrestler: string, odds: string) => void;
  getPercentage: (matchId: string, wrestler: string) => number;
  getTotalWCInPool: (matchId: string) => number;
  getCorrelationIcon: (matchId: string, wrestler: string) => string;
}

export interface ColorScheme {
  wrestler1: string;
  wrestler2: string;
  wrestler1Bg: string;
  wrestler2Bg: string;
  wrestler1Border: string;
  wrestler2Border: string;
  wrestler1Text: string;
  wrestler2Text: string;
}

export interface SentimentCorrelation {
  percentage: number;
  odds: number;
  status: 'strong-favorite' | 'competitive' | 'underdog';
  icon: string;
  isValidCorrelation: boolean;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface BettingPoolsResponse {
  [matchId: string]: {
    wrestler1: number;
    wrestler2: number;
  };
}

export interface VoteResponse {
  success: boolean;
  matchId: string;
  wrestler: string;
  newPercentages: {
    wrestler1: number;
    wrestler2: number;
  };
}

export interface BetResponse {
  success: boolean;
  bet: Bet;
  newBalance: number;
  newOdds: {
    [wrestlerKey: string]: string;
  };
}

// Utility types
export type WrestlerKey = string;
export type MatchId = string;
export type UserId = string;

// Component prop types
export interface ComponentWithClassName {
  className?: string;
}

export interface ComponentWithChildren {
  children: React.ReactNode;
}

// Error types
export interface WrestleBetError extends Error {
  code?: string;
  statusCode?: number;
  context?: Record<string, any>;
}
