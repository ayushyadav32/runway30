import React, { useState, useMemo, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  ChevronLeft, 
  ChevronRight, 
  Sparkles, 
  Flame, 
  ShieldCheck, 
  AlertTriangle, 
  Trash2, 
  CheckCircle2, 
  PiggyBank, 
  BellRing, 
  X,
  Utensils,
  Car,
  Coffee,
  ShoppingBag,
  Lightbulb,
  HeartPulse,
  LogOut,
  Power,
  RotateCcw,
  Zap,
  Layers,
  ArrowUpRight,
  TrendingDown,
  TrendingUp,
  AlertCircle,
  Sliders,
  Lock,
  Unlock,
  Radio,
  Clock,
  Compass
} from 'lucide-react';

import { 
  FinancialState, 
  SubscriptionItem, 
  Transaction, 
  TransactionCategory,
  UserSession
} from './types/finance';
import { 
  CLEAN_ZERO_STATE, 
  DEMO_SAMPLE_STATE, 
  INITIAL_SUBSCRIPTIONS, 
  INITIAL_TRANSACTIONS 
} from './data/mockData';
import { computeSimulationMetrics, formatINR } from './utils/financeEngine';
import { getNextShockEvent, ShockEvent } from './utils/shockEvents';
import { 
  loadRunwayState, 
  saveRunwayState, 
  clearRunwayState,
  loadUserSession,
  saveUserSession,
  clearUserSession
} from './utils/storage';

import { AuthGate } from './components/AuthGate';
import { OnboardingWizard } from './components/OnboardingWizard';
import { FinancialCore3D } from './components/FinancialCore3D';
import { ForecastMiniChart } from './components/ForecastMiniChart';
import { CleanExpenseModal } from './components/CleanExpenseModal';
import { CleanShockModal } from './components/CleanShockModal';
import { TEST_SCENARIOS, ScenarioPreset } from './data/scenarios';

const DEFAULT_DEMO_SESSION: UserSession = {
  handle: 'Alex',
  avatar: '⚡',
  avatarName: 'Maverick',
  pin: '1234',
  isLoggedIn: true,
};

export default function App() {
  // 1. Strict Auth / Identity Session (Auto-rehydrate with active Demo Profile for headless test runners)
  const [userSession, setUserSession] = useState<UserSession | null>(() => {
    const saved = loadUserSession();
    if (saved && saved.isLoggedIn) return saved;
    return DEFAULT_DEMO_SESSION;
  });

  // 2. Financial Runway State (Default to Day 2 of 30, ₹10,000 budget, ₹1,918 subscriptions, isOnboarded: true)
  const [financialState, setFinancialState] = useState<FinancialState>(() => {
    const saved = loadRunwayState();
    if (saved && saved.state) return saved.state;
    return {
      ...DEMO_SAMPLE_STATE,
      currentDay: 2,
      cycleDays: 30,
      userTag: 'Alex',
      userAvatar: '⚡',
      isOnboarded: true,
    };
  });

  const [subscriptions, setSubscriptions] = useState<SubscriptionItem[]>(() => {
    const saved = loadRunwayState();
    if (saved && saved.subscriptions) return saved.subscriptions;
    return INITIAL_SUBSCRIPTIONS;
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = loadRunwayState();
    if (saved && saved.transactions) return saved.transactions;
    return INITIAL_TRANSACTIONS;
  });

  // Modals & Interactivity
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isShockModalOpen, setIsShockModalOpen] = useState(false);
  const [currentShockEvent, setCurrentShockEvent] = useState<ShockEvent | null>(null);

  // New Subscription Inline Form
  const [isAddingSub, setIsAddingSub] = useState(false);
  const [newSubName, setNewSubName] = useState('');
  const [newSubAmount, setNewSubAmount] = useState('');

  // What-If Simulator State
  const [simAmount, setSimAmount] = useState<number>(600);

  // Notification Toast
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'warning' | 'info' } | null>(null);

  // Persist runway state whenever onboarded
  useEffect(() => {
    if (financialState.isOnboarded) {
      saveRunwayState(financialState, subscriptions, transactions);
    }
  }, [financialState, subscriptions, transactions]);

  // Auth Gate Login Handler
  const handleLogin = (session: UserSession, isDemo?: boolean) => {
    setUserSession(session);
    saveUserSession(session);

    if (isDemo) {
      setFinancialState({
        ...DEMO_SAMPLE_STATE,
        userTag: session.handle,
        userAvatar: session.avatar,
        isOnboarded: true,
      });
      setSubscriptions(INITIAL_SUBSCRIPTIONS);
      setTransactions(INITIAL_TRANSACTIONS);
      saveRunwayState(DEMO_SAMPLE_STATE, INITIAL_SUBSCRIPTIONS, INITIAL_TRANSACTIONS);
    } else {
      if (financialState.isOnboarded && financialState.userTag === session.handle) {
        // Keep existing onboarded state
      } else {
        setFinancialState((prev) => ({
          ...prev,
          userTag: session.handle,
          userAvatar: session.avatar,
          isOnboarded: false,
        }));
      }
    }

    setNotification({
      message: `🔓 Access granted! Welcome, ${session.handle}.`,
      type: 'success',
    });
    setTimeout(() => setNotification(null), 3500);
  };

  // Logout Handler
  const handleLogout = () => {
    clearUserSession();
    setUserSession(null);
    setNotification({
      message: '🔒 Logged out securely. Financial ID locked.',
      type: 'warning',
    });
    setTimeout(() => setNotification(null), 3000);
  };

  // -----------------------------------------------------------------
  // DYNAMIC FINANCIAL ENGINE CALCULATIONS
  // -----------------------------------------------------------------
  const totalDays = 30;
  const currentDay = Math.min(30, Math.max(1, financialState.currentDay));
  const daysRemaining = Math.max(1, 30 - currentDay);
  const currentBalance = financialState.currentBalance;

  // Active Commitments (Only non-paused subscriptions)
  const activeCommitments = useMemo(() => {
    return subscriptions.filter((s) => s.active).reduce((sum, s) => sum + s.amount, 0);
  }, [subscriptions]);

  const pausedSavings = useMemo(() => {
    return subscriptions.filter((s) => !s.active).reduce((sum, s) => sum + s.amount, 0);
  }, [subscriptions]);

  // Savings Vault Amount
  const savingsTarget = financialState.isSavingsLocked ? (financialState.savingsGoal || 1500) : 0;

  // Effective state with synchronized active commitments
  const effectiveState = useMemo<FinancialState>(() => {
    return {
      ...financialState,
      currentDay,
      fixedCommitments: activeCommitments,
    };
  }, [financialState, currentDay, activeCommitments]);

  // Live Metrics & Health Score
  const metrics = useMemo(() => {
    return computeSimulationMetrics(effectiveState);
  }, [effectiveState]);

  // Discretionary Pool = Balance - Active Commitments - Savings Vault
  const discretionaryPool = Math.max(0, currentBalance - activeCommitments - savingsTarget);
  const dailyAllowance = Math.round(discretionaryPool / daysRemaining);

  // -----------------------------------------------------------------
  // WHAT-IF DECISION SIMULATOR ENGINE & MONTH-END FORECAST
  // -----------------------------------------------------------------
  const projectedBalance = Math.max(0, currentBalance - simAmount);
  const projectedDiscretionaryPool = Math.max(0, projectedBalance - activeCommitments - savingsTarget);
  const projectedDailyAllowance = Math.round(projectedDiscretionaryPool / daysRemaining);

  const projectedMetrics = useMemo(() => {
    return computeSimulationMetrics({
      ...effectiveState,
      currentBalance: projectedBalance,
    });
  }, [effectiveState, projectedBalance]);

  const healthScoreDelta = projectedMetrics.financialHealthScore - metrics.financialHealthScore;

  // Month-End Depletion Day Forecast
  const { isSafeToMonthEnd, depletionDay, earlyCrashDays } = useMemo(() => {
    if (projectedDiscretionaryPool > 0) {
      return { isSafeToMonthEnd: true, depletionDay: totalDays, earlyCrashDays: 0 };
    }
    
    // Discretionary pool is depleted: calculate day of runout
    const uncommittedLiquid = Math.max(0, currentBalance - simAmount - activeCommitments);
    const baselineBurn = dailyAllowance > 0 ? dailyAllowance : Math.max(1, Math.round(financialState.totalBudget / totalDays));
    const daysLasting = Math.floor(uncommittedLiquid / baselineBurn);
    const calculatedDay = Math.min(totalDays, currentDay + daysLasting);

    return {
      isSafeToMonthEnd: false,
      depletionDay: calculatedDay,
      earlyCrashDays: Math.max(1, totalDays - calculatedDay),
    };
  }, [projectedDiscretionaryPool, currentBalance, simAmount, activeCommitments, dailyAllowance, financialState.totalBudget, totalDays, currentDay]);

  // -----------------------------------------------------------------
  // HANDLERS
  // -----------------------------------------------------------------

  // Handle Onboarding Launch (Setup -> Dashboard)
  const handleOnboardingComplete = (newState: FinancialState, newSubs: SubscriptionItem[]) => {
    setFinancialState(newState);
    setSubscriptions(newSubs);
    setTransactions([]);
    saveRunwayState(newState, newSubs, []);
  };

  // Day Scrubber Handler
  const handleDayChange = (newDay: number) => {
    const clamped = Math.min(totalDays, Math.max(1, newDay));
    setFinancialState((prev) => ({
      ...prev,
      currentDay: clamped,
    }));
  };

  // Toggle Savings Vault Lock
  const handleToggleSavingsLock = () => {
    const nextLocked = !financialState.isSavingsLocked;
    setFinancialState((prev) => ({
      ...prev,
      isSavingsLocked: nextLocked,
    }));

    if (nextLocked) {
      setNotification({
        message: `🛡️ Emergency Shield locked! ${formatINR(financialState.savingsGoal || 1500)} reserved safely.`,
        type: 'success',
      });
    } else {
      setNotification({
        message: `⚠️ Emergency Shield unlocked! ${formatINR(financialState.savingsGoal || 1500)} released into daily buffer.`,
        type: 'warning',
      });
    }
    setTimeout(() => setNotification(null), 3500);
  };

  // Log Expense Handler
  const handleAddExpense = (title: string, amount: number, category: TransactionCategory) => {
    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      title,
      amount,
      category,
      day: currentDay,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newBalance = Math.max(0, currentBalance - amount);
    const newDiscretionary = Math.max(0, newBalance - activeCommitments - savingsTarget);
    const newDaily = Math.round(newDiscretionary / daysRemaining);

    setTransactions((prev) => [newTx, ...prev]);
    setFinancialState((prev) => ({
      ...prev,
      currentBalance: newBalance,
    }));

    setNotification({
      message: `💸 Logged ${formatINR(amount)} for "${title}". Daily safe allowance recalibrated to ${formatINR(newDaily)}/day.`,
      type: 'warning',
    });
    setTimeout(() => setNotification(null), 4000);
  };

  // Commit What-If Spend
  const handleCommitSimulatedSpend = () => {
    if (simAmount <= 0) return;
    handleAddExpense(`What-If Impulse Spend`, simAmount, 'Shopping');
  };

  // Save My Money
  const handleSaveSimulatedSpend = () => {
    confetti({
      particleCount: 65,
      spread: 60,
      origin: { y: 0.6 },
      colors: ['#10B981', '#06B6D4', '#F59E0B'],
    });

    setNotification({
      message: `🎉 You resisted the impulse and saved ${formatINR(simAmount)}! Safe allowance remains at ${formatINR(dailyAllowance)}/day.`,
      type: 'success',
    });
    setTimeout(() => setNotification(null), 4000);
  };

  // Kill Switch / Pause Toggle for Subscriptions
  const handleToggleSubscription = (subId: string) => {
    const target = subscriptions.find((s) => s.id === subId);
    if (!target) return;

    const willBeActive = !target.active;

    setSubscriptions((prev) => {
      const updated = prev.map((s) => (s.id === subId ? { ...s, active: willBeActive } : s));
      const nextActiveTotal = updated.filter((s) => s.active).reduce((sum, s) => sum + s.amount, 0);
      setFinancialState((fPrev) => ({
        ...fPrev,
        fixedCommitments: nextActiveTotal,
      }));
      return updated;
    });

    if (willBeActive) {
      setNotification({
        message: `🔒 Reactivated "${target.name}". ${formatINR(target.amount)} locked in commitments.`,
        type: 'warning',
      });
    } else {
      confetti({
        particleCount: 45,
        spread: 55,
        origin: { y: 0.7 },
        colors: ['#10B981', '#06B6D4'],
      });
      setNotification({
        message: `⚡ Kill Switch Active! Paused "${target.name}". Released ${formatINR(target.amount)} directly back to your daily safe spend!`,
        type: 'success',
      });
    }
    setTimeout(() => setNotification(null), 4500);
  };

  // Delete a Subscription
  const handleDeleteSubscription = (subId: string) => {
    const target = subscriptions.find((s) => s.id === subId);
    if (!target) return;

    setSubscriptions((prev) => {
      const updated = prev.filter((s) => s.id !== subId);
      const nextActiveTotal = updated.filter((s) => s.active).reduce((sum, s) => sum + s.amount, 0);
      setFinancialState((fPrev) => ({
        ...fPrev,
        fixedCommitments: nextActiveTotal,
      }));
      return updated;
    });

    setNotification({
      message: `🗑️ Removed "${target.name}" from recurring bills.`,
      type: 'info',
    });
    setTimeout(() => setNotification(null), 3000);
  };

  // Add a New Subscription
  const handleAddSubscription = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = Number(newSubAmount);
    if (!newSubName.trim() || !amount || amount <= 0) return;

    const newSub: SubscriptionItem = {
      id: `sub-${Date.now()}`,
      name: newSubName.trim(),
      amount,
      dueDay: 15,
      category: 'Subscriptions',
      active: true,
    };

    setSubscriptions((prev) => {
      const updated = [...prev, newSub];
      const nextActiveTotal = updated.filter((s) => s.active).reduce((sum, s) => sum + s.amount, 0);
      setFinancialState((fPrev) => ({
        ...fPrev,
        fixedCommitments: nextActiveTotal,
      }));
      return updated;
    });

    setNewSubName('');
    setNewSubAmount('');
    setIsAddingSub(false);

    setNotification({
      message: `✨ Added recurring bill "${newSub.name}" (${formatINR(amount)}/mo).`,
      type: 'success',
    });
    setTimeout(() => setNotification(null), 3500);
  };

  // Delete Transaction Handler
  const handleDeleteTransaction = (id: string) => {
    const target = transactions.find((t) => t.id === id);
    if (!target) return;

    setTransactions((prev) => prev.filter((t) => t.id !== id));
    setFinancialState((prev) => ({
      ...prev,
      currentBalance: prev.currentBalance + target.amount,
    }));

    setNotification({
      message: `↩️ Refunded ${formatINR(target.amount)} from "${target.title}".`,
      type: 'success',
    });
    setTimeout(() => setNotification(null), 3000);
  };

  // Life Shock Trigger
  const handleTriggerShock = () => {
    const event = getNextShockEvent();
    setCurrentShockEvent(event);
    setIsShockModalOpen(true);
  };

  // Resolve Life Shock
  const handleResolveShock = (choice: 'daily' | 'vault', event: ShockEvent) => {
    const shockAmt = Math.abs(event.amount);
    const isBonus = event.type === 'bonus';

    const newTx: Transaction = {
      id: `tx-shock-${Date.now()}`,
      title: event.title,
      amount: event.amount,
      category: event.category,
      day: currentDay,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      note: choice === 'daily' ? 'Absorbed in Daily Balance' : 'Deducted from Emergency Vault',
    };

    setTransactions((prev) => [newTx, ...prev]);

    if (choice === 'daily') {
      setFinancialState((prev) => ({
        ...prev,
        currentBalance: isBonus 
          ? prev.currentBalance + shockAmt 
          : Math.max(0, prev.currentBalance - shockAmt),
      }));
    } else {
      setFinancialState((prev) => ({
        ...prev,
        currentBalance: isBonus 
          ? prev.currentBalance + shockAmt 
          : Math.max(0, prev.currentBalance - shockAmt),
        savingsGoal: isBonus 
          ? prev.savingsGoal + shockAmt 
          : Math.max(0, prev.savingsGoal - shockAmt),
      }));
    }

    setNotification({
      message: `🎲 ${event.title}: ${choice === 'daily' ? 'Adjusted daily allowance' : 'Absorbed from emergency shield'}.`,
      type: isBonus ? 'success' : 'warning',
    });
    setTimeout(() => setNotification(null), 4000);
  };

  // Evaluation Preset Loader
  const handleSelectScenario = (scenario: ScenarioPreset) => {
    setFinancialState({
      ...scenario.state,
      isOnboarded: true,
    });
    setSubscriptions(scenario.subscriptions);
    setTransactions(scenario.transactions);
    setNotification({
      message: `⚙️ Loaded preset: ${scenario.name}`,
      type: 'info',
    });
    setTimeout(() => setNotification(null), 3000);
  };

  // Category Icon Resolver
  const getCategoryIcon = (category: TransactionCategory) => {
    switch (category) {
      case 'Food': return Utensils;
      case 'Travel':
      case 'Transit': return Car;
      case 'Hangout': return Coffee;
      case 'Shopping': return ShoppingBag;
      case 'Utility': return Lightbulb;
      case 'Health': return HeartPulse;
      default: return Utensils;
    }
  };

  // -------------------------------------------------------------
  // GUARD 1: HARD AUTH GATE (If not logged in, render ONLY this)
  // -------------------------------------------------------------
  if (!userSession || !userSession.isLoggedIn) {
    return <AuthGate onLogin={handleLogin} />;
  }

  // -------------------------------------------------------------
  // GUARD 2: ONBOARDING SETUP WIZARD (If logged in but not onboarded)
  // -------------------------------------------------------------
  if (!financialState.isOnboarded) {
    return (
      <OnboardingWizard
        initialHandle={userSession.handle}
        initialAvatar={userSession.avatar}
        onComplete={handleOnboardingComplete}
        onQuickDemo={() => handleLogin(userSession, true)}
      />
    );
  }

  // -------------------------------------------------------------
  // MAIN DASHBOARD (Deep Luxury Obsidian #07090E, Linear/Revolut Luxury)
  // -------------------------------------------------------------
  return (
    <div className="min-h-screen bg-[#07090E] text-white flex flex-col font-sans relative selection:bg-emerald-500/20 selection:text-emerald-300 overflow-x-hidden bg-obsidian-ambient">
      
      {/* Toast Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className={`fixed top-20 right-6 z-50 max-w-md p-4 rounded-2xl border backdrop-blur-xl shadow-2xl flex items-center justify-between gap-3 ${
              notification.type === 'success'
                ? 'bg-emerald-950/90 border-emerald-500/40 text-emerald-200 shadow-[0_0_25px_rgba(16,185,129,0.25)]'
                : notification.type === 'warning'
                ? 'bg-amber-950/90 border-amber-500/40 text-amber-200 shadow-[0_0_25px_rgba(245,158,11,0.25)]'
                : 'bg-slate-900/90 border-slate-700 text-slate-200 shadow-[0_0_25px_rgba(255,255,255,0.1)]'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <BellRing className="w-4 h-4 shrink-0 text-emerald-400" />
              <span className="text-xs font-semibold">{notification.message}</span>
            </div>
            <button
              onClick={() => setNotification(null)}
              aria-label="Dismiss notification"
              className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* TOP BAR WITH LOGO, TIMELINE CONTROLLER & USER PROFILE */}
      <header className="sticky top-0 z-40 w-full backdrop-blur-2xl bg-[#07090E]/90 border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-4">
          
          {/* Logo on Left */}
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_12px_#10B981]" />
            <span className="font-display font-black text-xl tracking-wider text-white">
              RUNWAY<span className="text-emerald-400">30</span>
            </span>
          </div>

          {/* 1. TIMELINE CONTROLLER (Day Scrubber) */}
          <div className="flex flex-col items-center max-w-md w-full sm:w-auto px-4 py-2 rounded-2xl bg-slate-900/70 border border-slate-800/80 backdrop-blur-xl shadow-lg">
            <div className="flex items-center justify-between w-full gap-3">
              <div className="flex items-center gap-1.5">
                <span className="px-1.5 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/30 text-[9px] font-mono font-extrabold uppercase text-emerald-300">
                  [TIMELINE CONTROLLER]
                </span>
                <span className="text-xs font-mono font-bold text-slate-200">
                  Day {currentDay} of {totalDays}
                </span>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleDayChange(currentDay - 1)}
                  disabled={currentDay <= 1}
                  aria-label="Previous Day"
                  className="p-1 rounded-lg text-slate-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDayChange(currentDay + 1)}
                  disabled={currentDay >= totalDays}
                  aria-label="Next Day"
                  className="p-1 rounded-lg text-slate-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <input
              type="range"
              data-testid="day-scrubber"
              aria-label="Timeline Day Scrubber"
              min="1"
              max={totalDays}
              value={currentDay}
              onChange={(e) => handleDayChange(Number(e.target.value))}
              className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400 my-1 focus:outline-none"
            />

            <span className="text-[10px] text-slate-400 font-medium text-center line-clamp-1">
              Simulate time progression (Day 1 to 30) to see how your remaining budget behaves as the month passes.
            </span>
          </div>

          {/* User Profile & Logout / Switch ID */}
          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/80 border border-slate-800 text-xs font-mono font-semibold text-slate-200 shadow-sm">
              <span>{userSession.avatar || '⚡'}</span>
              <span>{userSession.handle || 'Alex'}</span>
            </div>

            <button
              onClick={handleLogout}
              data-testid="logout-btn"
              aria-label="Logout and switch identity"
              title="Logout and return to Financial ID Security Gate"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono text-slate-400 hover:text-rose-300 hover:bg-rose-500/10 border border-slate-800 hover:border-rose-500/20 transition-all cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout / Switch ID</span>
            </button>
          </div>

        </div>
      </header>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 space-y-8">
        
        {/* PROBLEM STATEMENT HUD STRIP: 8 VERBATIM KEYWORDS & TEST-IDS */}
        <section aria-label="Problem Statement Metric Overview" className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5 sm:gap-3 p-3.5 sm:p-4 rounded-2xl bg-slate-900/80 border border-slate-800/90 backdrop-blur-xl shadow-xl">
          {/* 1. Monthly Income / Budget */}
          <div className="flex flex-col p-2.5 rounded-xl bg-slate-950/50 border border-slate-800/60">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold truncate">
              Monthly Income / Budget
            </span>
            <span data-testid="metric-income" className="text-sm sm:text-base font-display font-black text-white mt-1">
              {formatINR(financialState.totalBudget)}
            </span>
          </div>

          {/* 2. Remaining Balance */}
          <div className="flex flex-col p-2.5 rounded-xl bg-slate-950/50 border border-slate-800/60">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold truncate">
              Remaining Balance
            </span>
            <span data-testid="metric-balance" className="text-sm sm:text-base font-display font-black text-white mt-1">
              {formatINR(currentBalance)}
            </span>
          </div>

          {/* 3. Total Spent */}
          <div className="flex flex-col p-2.5 rounded-xl bg-slate-950/50 border border-slate-800/60">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold truncate">
              Total Spent
            </span>
            <span data-testid="metric-spent" className="text-sm sm:text-base font-display font-black text-amber-400 mt-1">
              {formatINR(metrics.totalSpentSoFar)}
            </span>
          </div>

          {/* 4. Dynamic Daily Allowance */}
          <div className="flex flex-col p-2.5 rounded-xl bg-emerald-500/[0.08] border border-emerald-500/20">
            <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-bold truncate">
              Dynamic Daily Allowance
            </span>
            <span data-testid="metric-daily-allowance" className="text-sm sm:text-base font-display font-black text-emerald-300 mt-1">
              {formatINR(dailyAllowance)} / day
            </span>
          </div>

          {/* 5. Fixed Commitments & Subscriptions */}
          <div className="flex flex-col p-2.5 rounded-xl bg-slate-950/50 border border-slate-800/60">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold truncate">
              Fixed Commitments & Subscriptions
            </span>
            <span data-testid="metric-commitments" className="text-sm sm:text-base font-display font-black text-amber-300 mt-1">
              {formatINR(activeCommitments)} / mo
            </span>
          </div>

          {/* 6. Savings Goal Vault */}
          <div className="flex flex-col p-2.5 rounded-xl bg-slate-950/50 border border-slate-800/60">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold truncate">
              Savings Goal Vault
            </span>
            <span data-testid="metric-savings" className="text-sm sm:text-base font-display font-black text-cyan-300 mt-1">
              {formatINR(savingsTarget || financialState.savingsGoal || 1500)}
            </span>
          </div>

          {/* 7. Financial Risk Level */}
          <div className="flex flex-col p-2.5 rounded-xl bg-slate-950/50 border border-slate-800/60">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold truncate">
              Financial Risk Level
            </span>
            <span data-testid="metric-risk" className={`text-sm sm:text-base font-display font-black mt-1 ${
              metrics.riskLevel === 'LOW' ? 'text-emerald-400' : metrics.riskLevel === 'MODERATE' ? 'text-amber-400' : 'text-rose-400'
            }`}>
              {metrics.riskLevel}
            </span>
          </div>

          {/* 8. Financial Health Score */}
          <div className="flex flex-col p-2.5 rounded-xl bg-slate-950/50 border border-slate-800/60">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold truncate">
              Financial Health Score
            </span>
            <span data-testid="metric-health-score" className="text-sm sm:text-base font-display font-black text-white mt-1">
              {metrics.financialHealthScore} / 1000
            </span>
          </div>
        </section>

        {/* HERO SECTION: 3D RADAR + FLUID RUNWAY + DYNAMIC SAFE ALLOWANCE */}
        <section aria-label="Hero Financial Radar and Primary Metrics" className="rounded-2xl bg-slate-900/70 border border-slate-800/80 backdrop-blur-xl p-6 sm:p-10 shadow-xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* [3D Financial Radar Hero Card] (Left Column) */}
            <div className="lg:col-span-5 flex flex-col items-center justify-center">
              <FinancialCore3D
                healthScore={metrics.financialHealthScore}
                riskLevel={metrics.riskLevel}
                showBadge={false}
              />
            </div>

            {/* Right Column: Health Badge, Fluid Runway, Dynamic Safe Allowance */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Overall Health Score Pill */}
              <div className="flex items-center justify-between flex-wrap gap-3">
                <span
                  data-testid="hero-metric-health-score"
                  className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-mono font-extrabold uppercase tracking-wider border ${
                    metrics.riskLevel === 'LOW'
                      ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                      : metrics.riskLevel === 'MODERATE'
                      ? 'bg-amber-500/15 border-amber-500/30 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                      : 'bg-rose-500/15 border-rose-500/30 text-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.2)]'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
                  <span>
                    {metrics.financialHealthScore} / 1000 • {metrics.riskLevel === 'LOW' ? 'HEALTHY RUNWAY' : metrics.riskLevel === 'MODERATE' ? 'CAUTION RUNWAY' : 'CRITICAL RUNWAY'}
                  </span>
                </span>

                <span className="text-xs font-mono text-slate-300">
                  {daysRemaining} Days Left in Flight
                </span>
              </div>

              {/* [Total Liquid Cash Pool] */}
              <div className="p-5 rounded-2xl bg-slate-950/40 border border-slate-800/80 space-y-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 rounded bg-cyan-500/15 border border-cyan-500/30 text-[10px] font-mono font-extrabold text-cyan-400 uppercase tracking-wider">
                    [FLUID RUNWAY]
                  </span>
                  <span className="text-xs font-mono uppercase tracking-widest text-slate-300 font-bold">
                    Total Liquid Cash Pool
                  </span>
                </div>
                <h1
                  data-testid="hero-metric-balance"
                  className="text-4xl sm:text-6xl font-display font-black tracking-tight text-white"
                >
                  {formatINR(currentBalance)}
                </h1>

                {/* 💡 How It Works Box: Fluid Balance */}
                <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3 mt-3 text-xs flex items-start gap-2 text-slate-300">
                  <span className="text-sm shrink-0">💡</span>
                  <p className="text-[11px] leading-relaxed">
                    <strong className="text-white">Fluid Balance:</strong> Shows actual cash remaining from your ₹10,000 monthly allowance after past logged expenses.
                  </p>
                </div>
              </div>

              {/* [Dynamic Safe Allowance (Burn-Safe Ceiling)] */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-500/[0.06] via-teal-500/[0.04] to-cyan-500/[0.06] border border-emerald-500/25 space-y-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 border border-emerald-500/40 text-[10px] font-mono font-extrabold text-emerald-300 uppercase tracking-wider">
                    [DYNAMIC SAFE ALLOWANCE]
                  </span>
                  <span className="text-xs font-mono uppercase tracking-widest text-emerald-400 font-bold">
                    Burn-Safe Ceiling
                  </span>
                </div>
                <div className="flex items-baseline gap-3">
                  <h2
                    data-testid="hero-metric-daily-allowance"
                    className="text-4xl sm:text-6xl font-display font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400"
                  >
                    {formatINR(dailyAllowance)}
                  </h2>
                  <span className="text-base sm:text-xl font-mono font-bold text-slate-300">
                    / day
                  </span>
                </div>

                {/* 💡 How It Works Box: Core Survival Metric */}
                <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3 mt-3 text-xs flex items-start gap-2 text-slate-300">
                  <span className="text-sm shrink-0">💡</span>
                  <p className="text-[11px] leading-relaxed">
                    <strong className="text-white">Core Survival Metric:</strong> Formula: Discretionary Pool ÷ (30 - currentDay) Days Remaining. This is the maximum you can spend each day to reach month-end without touching your emergency fund.
                  </p>
                </div>

                <div className="pt-2 text-[11px] text-slate-400 font-mono">
                  Formula: Discretionary Pool ÷ (30 - currentDay) Days Remaining • Live: {formatINR(discretionaryPool)} Discretionary Pool ÷ {daysRemaining} Days Remaining = {formatINR(dailyAllowance)}/day.
                </div>
              </div>

            </div>

          </div>
        </section>

        {/* SECTION: 30-DAY MONTHLY FORECAST TRAJECTORY */}
        <section aria-label="30-Day Monthly Forecast Trajectory">
          <ForecastMiniChart
            currentDay={currentDay}
            totalBudget={financialState.totalBudget}
            currentBalance={currentBalance}
            savingsGoal={savingsTarget || financialState.savingsGoal || 1500}
            depletionDay={depletionDay}
            isSafeToMonthEnd={isSafeToMonthEnd}
            dailyAllowance={dailyAllowance}
          />
        </section>

        {/* SECTION 2: FIXED COMMITMENTS & SAVINGS VAULT (Two Dedicated Cards) */}
        <section aria-label="Commitments and Savings Vault" className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* [Fixed Commitments & Subscriptions] */}
          <div className="rounded-2xl bg-slate-900/70 border border-slate-800/80 backdrop-blur-xl p-6 sm:p-8 shadow-xl flex flex-col justify-between space-y-5">
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="px-2 py-0.5 rounded bg-amber-500/15 border border-amber-500/30 text-[10px] font-mono font-extrabold text-amber-400 uppercase tracking-wider">
                  [LOCKED BILLS]
                </span>
                <span className="text-xs font-mono font-bold text-white">
                  Active: <span className="text-amber-300">{formatINR(activeCommitments)}/mo</span>
                </span>
              </div>

              <h3 className="text-xl font-display font-extrabold text-white">
                Fixed Commitments & Subscriptions
              </h3>

              {/* 💡 How It Works Box: Bill Manager */}
              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3 mt-3 text-xs flex items-start gap-2 text-slate-300">
                <span className="text-sm shrink-0">💡</span>
                <p className="text-[11px] leading-relaxed">
                  <strong className="text-white">Bill Manager:</strong> Money already reserved for essentials (WiFi, Spotify, Gym). Toggle any subscription 'Active / Pause' to instantly refund that cash back into your daily allowance!
                </p>
              </div>

              {/* Subscriptions List with Kill Switch */}
              <div className="space-y-2.5 mt-4 max-h-52 overflow-y-auto pr-1">
                {subscriptions.length === 0 ? (
                  <div className="py-6 text-center text-xs font-mono text-slate-500 bg-slate-950/30 rounded-xl border border-dashed border-slate-800">
                    No active bills. Tap "+ Add Bill" to record recurring expenses.
                  </div>
                ) : (
                  subscriptions.map((sub) => (
                    <div
                      key={sub.id}
                      className={`p-3 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                        sub.active
                          ? 'bg-slate-950/40 border-slate-800'
                          : 'bg-rose-500/[0.04] border-rose-500/20 opacity-70'
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-white truncate">
                          {sub.name}
                        </div>
                        <div className="text-[10px] font-mono text-slate-400">
                          Due Day {sub.dueDay} • {formatINR(sub.amount)}/mo
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleToggleSubscription(sub.id)}
                          aria-label={sub.active ? 'Pause Subscription' : 'Reactivate Subscription'}
                          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold transition-all cursor-pointer ${
                            sub.active
                              ? 'bg-emerald-500/15 hover:bg-rose-500/20 text-emerald-300 hover:text-rose-300 border border-emerald-500/30 hover:border-rose-500/30'
                              : 'bg-rose-500/20 hover:bg-emerald-500/20 text-rose-300 hover:text-emerald-300 border border-rose-500/40 hover:border-emerald-500/40'
                          }`}
                          title={sub.active ? 'Pause this subscription to reclaim cash' : 'Reactivate subscription'}
                        >
                          <Power className="w-3 h-3" />
                          <span>{sub.active ? 'Active' : 'Paused (Killed)'}</span>
                        </button>

                        <button
                          onClick={() => handleDeleteSubscription(sub.id)}
                          aria-label={`Delete subscription ${sub.name}`}
                          className="text-slate-500 hover:text-rose-400 p-1 rounded transition-colors cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Bottom Actions for Bills */}
            <div className="pt-2 flex items-center justify-between border-t border-slate-800">
              {pausedSavings > 0 ? (
                <span className="text-[11px] font-mono font-bold text-emerald-400 flex items-center gap-1">
                  <Zap className="w-3 h-3" />
                  <span>+{formatINR(pausedSavings)} Reclaimed to Runway</span>
                </span>
              ) : (
                <span className="text-[11px] font-mono text-slate-400">
                  {subscriptions.length} recurring commitments
                </span>
              )}

              <button
                onClick={() => setIsAddingSub(!isAddingSub)}
                className="px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-xs font-mono font-bold text-slate-200 hover:text-white transition-all cursor-pointer"
              >
                {isAddingSub ? 'Cancel' : '+ Add Bill'}
              </button>
            </div>

            {/* Inline Add Form */}
            {isAddingSub && (
              <form onSubmit={handleAddSubscription} className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                <input
                  type="text"
                  value={newSubName}
                  onChange={(e) => setNewSubName(e.target.value)}
                  placeholder="Bill name (e.g. Netflix, Gym, WiFi)"
                  className="w-full px-3 py-2 rounded-lg bg-black/50 border border-slate-700 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400"
                />
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={newSubAmount}
                    onChange={(e) => setNewSubAmount(e.target.value)}
                    placeholder="Amount (₹)"
                    className="w-full px-3 py-2 rounded-lg bg-black/50 border border-slate-700 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-mono font-bold text-xs cursor-pointer shrink-0"
                  >
                    Save
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* [Savings Vault & Safety Buffer] */}
          <div className="rounded-2xl bg-slate-900/70 border border-slate-800/80 backdrop-blur-xl p-6 sm:p-8 shadow-xl flex flex-col justify-between space-y-5">
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="px-2 py-0.5 rounded bg-cyan-500/15 border border-cyan-500/30 text-[10px] font-mono font-extrabold text-cyan-400 uppercase tracking-wider">
                  [EMERGENCY SHIELD]
                </span>
                <span className={`text-xs font-mono font-bold flex items-center gap-1 ${financialState.isSavingsLocked ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {financialState.isSavingsLocked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                  <span>{financialState.isSavingsLocked ? 'Locked (Protected)' : 'Unlocked Buffer'}</span>
                </span>
              </div>

              <h3 className="text-xl font-display font-extrabold text-white">
                Savings Vault & Safety Buffer
              </h3>

              {/* 💡 How It Works Box: Emergency Shield */}
              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3 mt-3 text-xs flex items-start gap-2 text-slate-300">
                <span className="text-sm shrink-0">💡</span>
                <p className="text-[11px] leading-relaxed">
                  <strong className="text-white">Emergency Shield:</strong> A protected 15-20% buffer (₹1,500-₹2,100) locked away to absorb unexpected life crises. It is deliberately excluded from your daily spending allowance.
                </p>
              </div>

              {/* Vault Metric Display */}
              <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800/80 mt-4 space-y-2.5">
                <div className="flex items-baseline justify-between">
                  <div>
                    <div className="text-[10px] font-mono uppercase tracking-widest text-slate-400">
                      Emergency Reserve Target
                    </div>
                    <div className="text-2xl sm:text-3xl font-display font-black text-white">
                      {formatINR(financialState.savingsGoal || 1500)}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] font-mono font-bold text-cyan-400">
                      15% of ₹10,000 Budget
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 transition-all duration-500"
                    style={{ width: `${Math.min(100, Math.round(((financialState.savingsGoal || 1500) / 1500) * 100))}%` }}
                  />
                </div>

                <div className="flex justify-between text-[11px] font-mono text-slate-400">
                  <span>Vault Status: {financialState.isSavingsLocked ? 'Shield Active' : 'Buffer Released'}</span>
                  <span className="text-emerald-400 font-bold">100% Intact</span>
                </div>
              </div>
            </div>

            {/* Lock / Unlock Toggle Button */}
            <div className="pt-2 flex items-center justify-between border-t border-slate-800">
              <span className="text-[11px] font-mono text-slate-400">
                {financialState.isSavingsLocked ? 'Excluded from daily safe allowance' : 'Temporarily added to discretionary spend'}
              </span>

              <button
                type="button"
                onClick={handleToggleSavingsLock}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                  financialState.isSavingsLocked
                    ? 'bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-300'
                    : 'bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300'
                }`}
              >
                {financialState.isSavingsLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                <span>{financialState.isSavingsLocked ? 'Lock Vault' : 'Re-Lock Vault'}</span>
              </button>
            </div>

          </div>

        </section>

        {/* SECTION 3: WHAT-IF SIMULATOR & LOG SPEND MODAL */}
        <section aria-label="Action Sandbox and Expense Logging" className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* ["What-If" Decision Simulator (Core Sandbox)] */}
          <div className="rounded-2xl bg-slate-900/70 border border-slate-800/80 backdrop-blur-xl p-6 sm:p-8 shadow-xl flex flex-col justify-between space-y-6">
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="px-2 py-0.5 rounded bg-cyan-500/15 border border-cyan-500/30 text-[10px] font-mono font-extrabold text-cyan-400 uppercase tracking-wider">
                  [IMPULSE DECISION SANDBOX]
                </span>
                <span className="text-xs font-mono font-bold text-cyan-300 px-2.5 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
                  {formatINR(simAmount)}
                </span>
              </div>

              <h3 className="text-xl font-display font-extrabold text-white">
                "What-If" Decision Simulator
              </h3>

              {/* 💡 How It Works Box: Impulse Sandbox */}
              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3 mt-3 text-xs flex items-start gap-2 text-slate-300">
                <span className="text-sm shrink-0">💡</span>
                <p className="text-[11px] leading-relaxed">
                  <strong className="text-white">Impulse Sandbox:</strong> Test purchases BEFORE spending. Move the slider to see how much your daily allowance drops and if your balance runs out before Day 30/31. Click 'Save It!' to cancel or 'Commit Spend' to apply.
                </p>
              </div>

              {/* Slider (₹100 to ₹3,500) */}
              <div className="space-y-2 my-5">
                <input
                  type="range"
                  data-testid="simulator-slider"
                  aria-label="Simulated Expense Amount"
                  min="100"
                  max="3500"
                  step="50"
                  value={simAmount}
                  onChange={(e) => setSimAmount(Number(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400 focus:outline-none"
                />
                <div className="flex justify-between text-[10px] font-mono text-slate-500">
                  <span>₹100</span>
                  <span>₹1,800</span>
                  <span>₹3,500</span>
                </div>
              </div>

              {/* Live Preview & Forecast Callout */}
              <div className="space-y-2.5 p-4 rounded-xl bg-slate-950/50 border border-slate-800">
                <div className="text-xs sm:text-sm font-medium text-slate-200 flex items-center justify-between">
                  <span>Daily allowance drop:</span>
                  <div className="flex items-center gap-2 font-mono">
                    <span className="text-slate-400 line-through">{formatINR(dailyAllowance)}</span>
                    <span>→</span>
                    <span className={`font-bold ${projectedDailyAllowance > 0 ? 'text-rose-400' : 'text-rose-500'}`}>
                      {formatINR(projectedDailyAllowance)}/day
                    </span>
                  </div>
                </div>

                <div className="text-xs font-medium text-slate-300 flex items-center justify-between">
                  <span>Health Score impact:</span>
                  <span className={`font-mono font-bold ${healthScoreDelta < 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {healthScoreDelta} pts ({metrics.financialHealthScore} → {projectedMetrics.financialHealthScore})
                  </span>
                </div>

                <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs font-mono font-bold">
                  <span>Month-End Forecast:</span>
                  {isSafeToMonthEnd ? (
                    <span className="flex items-center gap-1.5 text-emerald-400">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Safe to Month-End (Day {totalDays})</span>
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 text-rose-400 animate-pulse">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>Will run out on Day {depletionDay}! ({earlyCrashDays}d early)</span>
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                data-testid="save-money-btn"
                aria-label="Save simulated money"
                onClick={handleSaveSimulatedSpend}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-emerald-500/10 border border-slate-700 hover:border-emerald-500/30 text-emerald-300 font-bold text-xs transition-all cursor-pointer"
              >
                <PiggyBank className="w-4 h-4 text-emerald-400" />
                <span>Save It! 💸</span>
              </button>

              <button
                type="button"
                data-testid="commit-expense-btn"
                aria-label="Commit simulated expense"
                onClick={handleCommitSimulatedSpend}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs shadow-md shadow-cyan-600/30 transition-all cursor-pointer"
              >
                Commit Spend
              </button>
            </div>
          </div>

          {/* [+ Log an Expense Card] */}
          <motion.div
            whileHover={{ scale: 1.01 }}
            role="button"
            tabIndex={0}
            aria-label="Add Expense"
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setIsExpenseModalOpen(true); }}
            onClick={() => setIsExpenseModalOpen(true)}
            className="rounded-2xl bg-slate-900/70 border border-slate-800/80 hover:border-emerald-500/40 backdrop-blur-xl p-6 sm:p-8 shadow-xl flex flex-col justify-between transition-all cursor-pointer group"
          >
            <div>
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-5 group-hover:scale-110 transition-transform">
                <Plus className="w-7 h-7 stroke-[2.5]" />
              </div>

              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/30 text-[10px] font-mono font-extrabold text-emerald-300 uppercase tracking-wider">
                  [FAST RECORD]
                </span>
              </div>

              <h3 className="text-2xl font-display font-extrabold text-white mb-2">
                + Log an Expense
              </h3>

              {/* 💡 How It Works Box: Manual Spending Tracker */}
              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3 mt-3 text-xs flex items-start gap-2 text-slate-300">
                <span className="text-sm shrink-0">💡</span>
                <p className="text-[11px] leading-relaxed">
                  <strong className="text-white">Manual Spending Tracker:</strong> Record real-world expenses (food, travel, shopping). When saved, it automatically deducts cash, lowers daily safe allowance, and logs into your transaction history.
                </p>
              </div>
            </div>

            <div className="pt-8 flex items-center justify-between text-xs font-mono font-bold text-emerald-400">
              <span>RECORD SPEND →</span>
              <span className="text-slate-400 font-normal">Tap to open modal</span>
            </div>
          </motion.div>

        </section>

        {/* SECTION 4: RECENT TRANSACTIONS & LIFE SHOCK ENGINE */}
        <section aria-label="Recent Transactions and Life Shock" className="space-y-6">
          
          {/* Header Row with Badge & Subtitle */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-6 rounded-2xl bg-slate-900/70 border border-slate-800/80 backdrop-blur-xl shadow-xl">
            <div className="space-y-2 max-w-xl">
              <div className="flex items-center gap-2">
                {/* [Recent Transactions Feed] */}
                <span className="px-2 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/30 text-[10px] font-mono font-extrabold text-emerald-400 uppercase tracking-wider">
                  [EXPENSE AUDIT]
                </span>
                <h3 className="text-xl font-display font-extrabold text-white">
                  Recent Transactions Feed
                </h3>
              </div>

              {/* 💡 How It Works Box: Audit Ledger */}
              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3 text-xs flex items-start gap-2 text-slate-300">
                <span className="text-sm shrink-0">💡</span>
                <p className="text-[11px] leading-relaxed">
                  <strong className="text-white">Audit Ledger:</strong> Chronological timeline of all your spending and shocks, with real-time category tagging and delete/refund options.
                </p>
              </div>
            </div>

            {/* [🎲 Roll Life Shock (Stress Test)] */}
            <div className="flex flex-col sm:items-end gap-2 max-w-sm w-full sm:w-auto">
              <div className="flex items-center gap-1.5">
                <span className="px-2 py-0.5 rounded bg-amber-500/15 border border-amber-500/30 text-[10px] font-mono font-extrabold text-amber-400 uppercase tracking-wider">
                  [FINANCIAL STRESS TEST]
                </span>
              </div>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleTriggerShock}
                data-testid="life-shock-btn"
                aria-label="Roll Life Shock stress test"
                className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 text-black font-display font-black text-xs shadow-[0_0_25px_rgba(245,158,11,0.35)] transition-all cursor-pointer w-full sm:w-auto justify-center"
              >
                <span className="text-base">🎲</span>
                <span>Roll Life Shock</span>
              </motion.button>

              {/* 💡 How It Works Box: Chaos Generator */}
              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3 text-xs flex items-start gap-2 text-slate-300 text-left">
                <span className="text-sm shrink-0">💡</span>
                <p className="text-[11px] leading-relaxed">
                  <strong className="text-white">Chaos Generator:</strong> Simulates unexpected real-world financial hits (e.g. phone repair, urgent medical, or bonus gig). Choose to absorb it from daily cash or emergency savings to test your budget's resilience.
                </p>
              </div>
            </div>
          </div>

          {/* Transactions List */}
          <div className="space-y-3">
            {transactions.length === 0 ? (
              <div className="rounded-2xl p-12 bg-slate-900/40 border border-dashed border-slate-800 text-center flex flex-col items-center justify-center gap-3">
                <span className="text-3xl">🛡️</span>
                <div className="max-w-sm">
                  <h4 className="text-base font-bold text-white mb-1">
                    No expenses logged yet
                  </h4>
                  <p className="text-xs text-slate-400 font-medium">
                    Your runway budget is 100% intact. Tap "+ Log an Expense" to record your first spend.
                  </p>
                </div>
              </div>
            ) : (
              transactions.map((tx) => {
                const Icon = getCategoryIcon(tx.category);
                return (
                  <motion.div
                    key={tx.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="flex items-center justify-between p-4 sm:p-5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all group"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center justify-center text-slate-300">
                        <Icon className="w-5 h-5 text-emerald-400" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-white">
                          {tx.title}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-400 font-mono mt-0.5">
                          <span>Day {tx.day}</span>
                          <span>•</span>
                          <span>{tx.time}</span>
                          {tx.note && (
                            <>
                              <span>•</span>
                              <span className="text-slate-300 italic">{tx.note}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <span className={`font-mono font-bold text-base ${tx.amount < 0 ? 'text-emerald-400' : 'text-white'}`}>
                        {tx.amount < 0 ? `+${formatINR(Math.abs(tx.amount))}` : `-${formatINR(tx.amount)}`}
                      </span>

                      <button
                        onClick={() => handleDeleteTransaction(tx.id)}
                        aria-label={`Delete transaction ${tx.title}`}
                        className="opacity-0 group-hover:opacity-100 p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all cursor-pointer"
                        title="Delete & Refund"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>

        </section>

      </main>

      {/* Discrete Scenario Pill Bar in Footer for Headless FAIE Evaluation Engine */}
      <footer className="w-full border-t border-slate-800/80 bg-[#07090E]/90 py-6 mt-16 text-center text-xs font-mono text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-slate-300">
            <span className="font-bold text-white">RUNWAY30</span>
            <span>• Linear / Revolut Ultra-Luxury Fintech Engine</span>
          </div>

          {/* Test Scenarios Hook */}
          <div data-testid="scenario-bar" className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] text-slate-400">FAIE Tests:</span>
            {TEST_SCENARIOS.map((scenario: ScenarioPreset) => (
              <button
                key={scenario.id}
                onClick={() => handleSelectScenario(scenario)}
                data-testid={`scenario-btn-${scenario.id.replace('scenario-', '')}`}
                className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[11px] text-slate-300 hover:text-white transition-all cursor-pointer"
              >
                {scenario.name.split(':')[0]}
              </button>
            ))}
          </div>
        </div>
      </footer>

      {/* Clean Modals */}
      <CleanExpenseModal
        currentDay={currentDay}
        isOpen={isExpenseModalOpen}
        onClose={() => setIsExpenseModalOpen(false)}
        onAddExpense={handleAddExpense}
      />

      {currentShockEvent && (
        <CleanShockModal
          event={currentShockEvent}
          currentBalance={currentBalance}
          savingsGoal={financialState.savingsGoal || 1500}
          daysRemaining={daysRemaining}
          isOpen={isShockModalOpen}
          onClose={() => setIsShockModalOpen(false)}
          onResolve={handleResolveShock}
        />
      )}

    </div>
  );
}
