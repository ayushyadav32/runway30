import React from 'react';
import { motion } from 'framer-motion';
import { Wallet, CalendarCheck, Lock, Unlock, Flame, TrendingDown, Layers, ArrowUpRight } from 'lucide-react';
import { FinancialState, SimulationMetrics } from '../types/finance';
import { formatINR } from '../utils/financeEngine';

interface MetricsGridProps {
  state: FinancialState;
  metrics: SimulationMetrics;
  onOpenCommitmentsModal: () => void;
  onToggleSavingsLock: () => void;
  onOpenTopupModal: () => void;
}

export const MetricsGrid: React.FC<MetricsGridProps> = ({
  state,
  metrics,
  onOpenCommitmentsModal,
  onToggleSavingsLock,
  onOpenTopupModal,
}) => {
  const { currentBalance, fixedCommitments, savingsGoal, isSavingsLocked, totalBudget } = state;
  const { totalSpentSoFar, dailyBurnRate, idealDailyBurnRate, discretionaryPool, projectedSurplus } = metrics;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      
      {/* 1. Current Balance */}
      <motion.div
        whileHover={{ y: -3 }}
        className="relative overflow-hidden rounded-2xl p-5 bg-[#0d121c]/80 backdrop-blur-xl border border-white/10 hover:border-emerald-500/30 transition-all shadow-glass-card group"
      >
        <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-3">
          <span className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-slate-300">
            <Wallet className="w-4 h-4 text-emerald-400" />
            Current Balance
          </span>
          <button
            onClick={onOpenTopupModal}
            className="text-[11px] font-mono font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-0.5 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20 transition-all cursor-pointer"
          >
            + Top Up
          </button>
        </div>

        <div className="flex items-baseline gap-2">
          <span data-testid="metric-balance" className="text-2xl sm:text-3xl font-display font-black text-white">
            {formatINR(currentBalance)}
          </span>
        </div>

        <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] font-mono text-slate-400">
          <span>Spent: {formatINR(totalSpentSoFar)}</span>
          <span className="text-slate-500 font-bold">Of ₹10,000 Budget</span>
        </div>
      </motion.div>

      {/* 2. Fixed Commitments (Subscriptions) */}
      <motion.div
        whileHover={{ y: -3 }}
        onClick={onOpenCommitmentsModal}
        className="relative overflow-hidden rounded-2xl p-5 bg-[#0d121c]/80 backdrop-blur-xl border border-white/10 hover:border-cyan-500/30 transition-all shadow-glass-card cursor-pointer group"
      >
        <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-3">
          <span className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-slate-300">
            <CalendarCheck className="w-4 h-4 text-cyan-400" />
            Fixed Subscriptions
          </span>
          <span className="flex items-center gap-1 text-[11px] font-mono text-cyan-400 group-hover:translate-x-0.5 transition-transform">
            Manage <ArrowUpRight className="w-3 h-3" />
          </span>
        </div>

        <div className="flex items-baseline gap-2">
          <span data-testid="metric-commitments" className="text-2xl sm:text-3xl font-display font-black text-white">
            {formatINR(fixedCommitments)}
          </span>
        </div>

        <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] font-mono text-slate-400">
          <span className="truncate">Spotify, WiFi, Gym</span>
          <span className="text-cyan-400 font-bold">3 Active</span>
        </div>
      </motion.div>

      {/* 3. Locked Savings Target */}
      <motion.div
        whileHover={{ y: -3 }}
        className="relative overflow-hidden rounded-2xl p-5 bg-[#0d121c]/80 backdrop-blur-xl border border-white/10 hover:border-violet-500/30 transition-all shadow-glass-card group"
      >
        <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-3">
          <span className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-slate-300">
            {isSavingsLocked ? (
              <Lock className="w-4 h-4 text-violet-400" />
            ) : (
              <Unlock className="w-4 h-4 text-amber-400" />
            )}
            Savings Vault
          </span>
          <button
            onClick={onToggleSavingsLock}
            className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded-md border transition-all cursor-pointer ${
              isSavingsLocked
                ? 'bg-violet-500/10 border-violet-500/30 text-violet-300 hover:bg-violet-500/20'
                : 'bg-amber-500/10 border-amber-500/30 text-amber-300 hover:bg-amber-500/20'
            }`}
          >
            {isSavingsLocked ? 'Locked 🔒' : 'Unlocked 🔓'}
          </button>
        </div>

        <div className="flex items-baseline gap-2">
          <span data-testid="metric-savings" className="text-2xl sm:text-3xl font-display font-black text-white">
            {formatINR(savingsGoal)}
          </span>
          <span className="text-xs font-mono text-violet-400 font-bold">
            (15% Target)
          </span>
        </div>

        <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] font-mono text-slate-400">
          <span>Untouchable Safety Net</span>
          <span className={isSavingsLocked ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>
            {isSavingsLocked ? 'Shielded' : 'At Risk'}
          </span>
        </div>
      </motion.div>

      {/* 4. Burn Pace & Projected Surplus */}
      <motion.div
        whileHover={{ y: -3 }}
        className="relative overflow-hidden rounded-2xl p-5 bg-[#0d121c]/80 backdrop-blur-xl border border-white/10 hover:border-rose-500/30 transition-all shadow-glass-card group"
      >
        <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-3">
          <span className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-slate-300">
            <Flame className="w-4 h-4 text-amber-400" />
            Pace &amp; Burn Rate
          </span>
          <span className={`text-[11px] font-mono font-bold px-1.5 py-0.2 rounded ${
            dailyBurnRate <= idealDailyBurnRate ? 'text-emerald-400 bg-emerald-500/10' : 'text-rose-400 bg-rose-500/10'
          }`}>
            {dailyBurnRate <= idealDailyBurnRate ? 'On Target' : 'Overburning'}
          </span>
        </div>

        <div className="flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-display font-black text-white">
            {formatINR(dailyBurnRate)}
          </span>
          <span className="text-xs font-mono text-slate-400">/ day spent</span>
        </div>

        <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] font-mono text-slate-400">
          <span>Ideal: {formatINR(idealDailyBurnRate)}/d</span>
          <span className={projectedSurplus >= 0 ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
            {projectedSurplus >= 0 ? `+${formatINR(projectedSurplus)} Surplus` : `${formatINR(projectedSurplus)} Deficit`}
          </span>
        </div>
      </motion.div>

    </div>
  );
};
