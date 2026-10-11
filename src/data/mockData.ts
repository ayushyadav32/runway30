import { SubscriptionItem, Transaction, FinancialState } from '../types/finance';

export const CLEAN_ZERO_STATE: FinancialState = {
  totalBudget: 10000,
  currentDay: 1,
  currentBalance: 10000,
  fixedCommitments: 0,
  savingsGoal: 1500,
  isSavingsLocked: true,
  cycleDays: 30,
  userTag: '@runway_pilot',
  userAvatar: '⚡',
  isOnboarded: false,
};

export const DEMO_SAMPLE_STATE: FinancialState = {
  totalBudget: 10000,
  currentDay: 2,
  currentBalance: 7450,
  fixedCommitments: 1918,
  savingsGoal: 1500,
  isSavingsLocked: true,
  cycleDays: 30,
  userTag: 'Alex',
  userAvatar: '⚡',
  isOnboarded: true,
};

export const INITIAL_FINANCIAL_STATE: FinancialState = CLEAN_ZERO_STATE;

export const INITIAL_SUBSCRIPTIONS: SubscriptionItem[] = [
  {
    id: 'sub-spotify',
    name: 'Spotify Premium Individual',
    amount: 119,
    dueDay: 6,
    category: 'Streaming & Audio',
    active: true,
  },
  {
    id: 'sub-wifi',
    name: 'Fiber Broadband (Airtel/Jio)',
    amount: 799,
    dueDay: 14,
    category: 'Utilities & Internet',
    active: true,
  },
  {
    id: 'sub-gym',
    name: 'Cult.fit / Gym Membership',
    amount: 1000,
    dueDay: 18,
    category: 'Fitness & Health',
    active: true,
  },
];

export const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx-8',
    title: 'Uber to Design Studio',
    amount: 321,
    category: 'Transit',
    day: 8,
    time: '11:42 AM',
    note: 'Rush hour surcharge split',
  },
  {
    id: 'tx-7',
    title: 'Weekend Bowling & Arcade',
    amount: 520,
    category: 'Social',
    day: 7,
    time: '08:15 PM',
    note: 'Neon alley hangout with squad',
  },
  {
    id: 'tx-6',
    title: 'Spotify Premium Autopay',
    amount: 119,
    category: 'Subscriptions',
    day: 6,
    time: '09:00 AM',
    note: 'Monthly subscription cycle',
  },
  {
    id: 'tx-5',
    title: 'Apollo Pharmacy First-Aid',
    amount: 380,
    category: 'Emergency',
    day: 5,
    time: '04:30 PM',
    note: 'Vitamins & band-aids',
  },
  {
    id: 'tx-4',
    title: 'Blue Tokai Cold Brew & Croissant',
    amount: 220,
    category: 'Social',
    day: 4,
    time: '03:10 PM',
    note: 'Study session chill',
  },
  {
    id: 'tx-3',
    title: 'Metro Smart Card Auto-load',
    amount: 350,
    category: 'Transit',
    day: 3,
    time: '08:45 AM',
    note: '2-week transit card top-up',
  },
  {
    id: 'tx-2',
    title: 'Blinkit Fresh Groceries & Protein',
    amount: 640,
    category: 'Food',
    day: 2,
    time: '07:20 PM',
    note: 'Oats, berries, almond milk',
  },
];

export const WHAT_IF_PRESETS = [
  {
    title: 'Concert Pass',
    amount: 1800,
    category: 'Social' as const,
    emoji: '🎟️',
    tag: 'Live Gig',
  },
  {
    title: 'Sneakers',
    amount: 2500,
    category: 'Shopping' as const,
    emoji: '👟',
    tag: 'Fresh Kicks',
  },
  {
    title: 'Cafe date',
    amount: 600,
    category: 'Hangout' as const,
    emoji: '☕',
    tag: 'Chill Vibe',
  },
  {
    title: 'Nike Air Dunk Lows',
    amount: 3499,
    category: 'Shopping' as const,
    emoji: '🔥',
    tag: 'Fashion Flex',
  },
  {
    title: 'Weekend Fest Pass',
    amount: 2800,
    category: 'Social' as const,
    emoji: '🎪',
    tag: 'Experience',
  },
];
