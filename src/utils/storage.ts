import { FinancialState, SubscriptionItem, Transaction, UserSession } from '../types/finance';

const STORAGE_KEYS = {
  SESSION: 'runway30_user_session',
  STATE: 'runway30_user_state',
  SUBSCRIPTIONS: 'runway30_subscriptions',
  TRANSACTIONS: 'runway30_transactions',
};

export function saveUserSession(session: UserSession): void {
  try {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(session));
  } catch (err) {
    console.error('Failed to save Runway30 session to localStorage', err);
  }
}

export function loadUserSession(): UserSession | null {
  try {
    if (typeof window === 'undefined') return null;
    const raw = localStorage.getItem(STORAGE_KEYS.SESSION);
    if (!raw) return null;
    return JSON.parse(raw) as UserSession;
  } catch (err) {
    console.error('Failed to load Runway30 session from localStorage', err);
    return null;
  }
}

export function clearUserSession(): void {
  try {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(STORAGE_KEYS.SESSION);
  } catch (err) {
    console.error('Failed to clear Runway30 session', err);
  }
}

export function saveRunwayState(
  state: FinancialState,
  subscriptions: SubscriptionItem[],
  transactions: Transaction[]
): void {
  try {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.STATE, JSON.stringify(state));
    localStorage.setItem(STORAGE_KEYS.SUBSCRIPTIONS, JSON.stringify(subscriptions));
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
  } catch (err) {
    console.error('Failed to save Runway30 state to localStorage', err);
  }
}

export function loadRunwayState(): {
  state: FinancialState;
  subscriptions: SubscriptionItem[];
  transactions: Transaction[];
} | null {
  try {
    if (typeof window === 'undefined') return null;
    const rawState = localStorage.getItem(STORAGE_KEYS.STATE);
    const rawSubs = localStorage.getItem(STORAGE_KEYS.SUBSCRIPTIONS);
    const rawTx = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);

    if (!rawState) return null;

    const state = JSON.parse(rawState) as FinancialState;
    const subscriptions = rawSubs ? (JSON.parse(rawSubs) as SubscriptionItem[]) : [];
    const transactions = rawTx ? (JSON.parse(rawTx) as Transaction[]) : [];

    return { state, subscriptions, transactions };
  } catch (err) {
    console.error('Failed to load Runway30 state from localStorage', err);
    return null;
  }
}

export function clearRunwayState(): void {
  try {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(STORAGE_KEYS.STATE);
    localStorage.removeItem(STORAGE_KEYS.SUBSCRIPTIONS);
    localStorage.removeItem(STORAGE_KEYS.TRANSACTIONS);
  } catch (err) {
    console.error('Failed to clear Runway30 state', err);
  }
}
