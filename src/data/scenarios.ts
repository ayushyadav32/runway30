import { FinancialState, SubscriptionItem, Transaction } from '../types/finance';
import { INITIAL_SUBSCRIPTIONS, INITIAL_TRANSACTIONS } from './mockData';

export interface ScenarioPreset {
  id: string;
  name: string;
  badge: string;
  description: string;
  state: FinancialState;
  subscriptions: SubscriptionItem[];
  transactions: Transaction[];
}

export const TEST_SCENARIOS: ScenarioPreset[] = [
  {
    id: 'scenario-1',
    name: 'Scenario 1: Fresh Start',
    badge: 'Day 1 • ₹10,000 Intact',
    description: 'Clean month kickoff: full ₹10k liquid budget, 0 past spends, maximum runway.',
    state: {
      totalBudget: 10000,
      currentDay: 1,
      currentBalance: 10000,
      fixedCommitments: 2200,
      savingsGoal: 1500,
      isSavingsLocked: true,
      cycleDays: 30,
      userTag: '@pilot_fresh',
      userAvatar: '🚀',
      isOnboarded: true,
    },
    subscriptions: INITIAL_SUBSCRIPTIONS,
    transactions: [
      {
        id: 'tx-sc1-init',
        title: 'Monthly Allowance / Salary Credited',
        amount: -10000,
        category: 'Income',
        day: 1,
        time: '09:00 AM',
        note: 'Month kickoff deposit',
      },
    ],
  },
  {
    id: 'scenario-2',
    name: 'Scenario 2: Mid-Month On-Track',
    badge: 'Day 8 • ₹7,450 Safe (Default)',
    description: 'Normal healthy trajectory: 8 days in, disciplined burn, cruise control.',
    state: {
      totalBudget: 10000,
      currentDay: 8,
      currentBalance: 7450,
      fixedCommitments: 2200,
      savingsGoal: 1500,
      isSavingsLocked: true,
      cycleDays: 30,
      userTag: '@ayush_fintech',
      userAvatar: '⚡',
      isOnboarded: true,
    },
    subscriptions: INITIAL_SUBSCRIPTIONS,
    transactions: INITIAL_TRANSACTIONS,
  },
  {
    id: 'scenario-3',
    name: 'Scenario 3: Redline Crisis',
    badge: 'Day 20 • ₹2,100 (Critical Risk)',
    description: 'Severe overburning: ₹2,100 balance fails to cover fixed commitments + savings vault.',
    state: {
      totalBudget: 10000,
      currentDay: 20,
      currentBalance: 2100,
      fixedCommitments: 2200,
      savingsGoal: 1500,
      isSavingsLocked: false,
      cycleDays: 30,
      userTag: '@mayday_pilot',
      userAvatar: '🔥',
      isOnboarded: true,
    },
    subscriptions: INITIAL_SUBSCRIPTIONS,
    transactions: [
      {
        id: 'tx-sc3-1',
        title: 'Concert VIP Passes & Merch',
        amount: 3800,
        category: 'Social',
        day: 19,
        time: '11:30 PM',
        note: 'Impulse weekend festival splurge',
      },
      {
        id: 'tx-sc3-2',
        title: 'Luxury Dinner Splurge',
        amount: 2100,
        category: 'Food',
        day: 16,
        time: '09:45 PM',
        note: 'Steakhouse table split',
      },
      ...INITIAL_TRANSACTIONS,
    ],
  },
  {
    id: 'scenario-4',
    name: 'Scenario 4: Month-End Thriving',
    badge: 'Day 28 • ₹3,300 (+Full Savings)',
    description: 'Month-end mastery: all bills cleared, savings vault fully preserved, surplus cushion.',
    state: {
      totalBudget: 10000,
      currentDay: 28,
      currentBalance: 3300,
      fixedCommitments: 0, // All autopays completed
      savingsGoal: 1500,
      isSavingsLocked: true,
      cycleDays: 30,
      userTag: '@zen_master',
      userAvatar: '💎',
      isOnboarded: true,
    },
    subscriptions: INITIAL_SUBSCRIPTIONS.map((s) => ({ ...s, active: false })), // Paid/settled
    transactions: [
      {
        id: 'tx-sc4-gym',
        title: 'Cult Gym Membership Autopay',
        amount: 1282,
        category: 'Subscriptions',
        day: 18,
        time: '08:00 AM',
        note: 'Cleared',
      },
      {
        id: 'tx-sc4-wifi',
        title: 'Fiber Broadband Autopay',
        amount: 799,
        category: 'Subscriptions',
        day: 14,
        time: '09:00 AM',
        note: 'Cleared',
      },
      ...INITIAL_TRANSACTIONS,
    ],
  },
];
