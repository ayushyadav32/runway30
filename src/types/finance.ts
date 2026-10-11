export type TransactionCategory = 
  | 'Food' 
  | 'Travel'
  | 'Hangout'
  | 'Shopping'
  | 'Utility'
  | 'Health'
  | 'Transit' 
  | 'Social' 
  | 'Subscriptions' 
  | 'Emergency' 
  | 'Income';

export interface Transaction {
  id: string;
  title: string;
  amount: number; // positive for expense, negative for income/refund
  category: TransactionCategory;
  day: number;
  time: string;
  note?: string;
}

export interface SubscriptionItem {
  id: string;
  name: string;
  amount: number;
  dueDay: number;
  category: string;
  active: boolean;
}

export type RiskLevel = 'LOW' | 'MODERATE' | 'CRITICAL';

export interface UserSession {
  handle: string;
  avatar: string;
  avatarName: string;
  pin: string;
  isLoggedIn: boolean;
}

export interface FinancialState {
  totalBudget: number;       // default ₹10,000
  currentDay: number;        // Day 1 to cycleDays
  currentBalance: number;    // Liquid cash
  fixedCommitments: number;  // Subscriptions & bills
  savingsGoal: number;       // Locked target
  isSavingsLocked: boolean;  // Whether savings vault is locked
  cycleDays: number;         // 30 or 31 days
  userTag: string;           // e.g. '@ayush_fintech'
  userAvatar: string;        // e.g. '⚡'
  isOnboarded: boolean;      // Clean 0-state vs onboarded
}

export interface HealthScoreBreakdown {
  runwayPaceScore: number;    // 0-400
  savingsShieldScore: number; // 0-300
  burnDisciplineScore: number;// 0-300
}

export interface SimulationMetrics {
  daysRemaining: number;
  cycleDays: number;
  discretionaryPool: number;
  dailySafeToSpend: number;
  totalSpentSoFar: number;
  dailyBurnRate: number;
  idealDailyBurnRate: number;
  projectedEndBalance: number;
  projectedSurplus: number;
  financialHealthScore: number; // 0 to 1000
  riskLevel: RiskLevel;
  healthBreakdown: HealthScoreBreakdown;
  statusLabel: string;
  statusQuote: string;
}
