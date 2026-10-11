import React from 'react';
import { motion } from 'framer-motion';
import { X, ShieldCheck, Activity, Flame, ShieldAlert, Award, Lightbulb, CheckCircle2 } from 'lucide-react';
import { SimulationMetrics, FinancialState } from '../types/finance';
import { formatINR } from '../utils/financeEngine';

interface HealthScoreModalProps {
  state: FinancialState;
  metrics: SimulationMetrics;
  onClose: () => void;
}

export const HealthScoreModal: React.FC<HealthScoreModalProps> = ({
  state,
  metrics,
  onClose,
}) => {
  const { financialHealthScore, riskLevel, healthBreakdown, statusLabel, statusQuote, dailySafeToSpend } = metrics;
  const { runwayPaceScore, savingsShieldScore, burnDisciplineScore } = healthBreakdown;

  const getScoreTheme = () => {
    if (riskLevel === 'LOW') {
      return {
        text: 'text-emerald-400',
        bg: 'bg-emerald-500/10',
        border: 'border-emerald-500/30',
        glow: 'shadow-glow-emerald',
      };
    } else if (riskLevel === 'MODERATE') {
      return {
        text: 'text-amber-400',
        bg: 'bg-amber-500/10',
        border: 'border-amber-500/30',
        glow: 'shadow-glow-amber',
      };
    } else {
      return {
        text: 'text-rose-400',
        bg: 'bg-rose-500/10',
        border: 'border-rose-500/30',
        glow: 'shadow-glow-rose',
      };
    }
  };

  const theme = getScoreTheme();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-lg rounded-3xl p-6 sm:p-7 bg-[#0d121c] border border-white/10 shadow-2xl overflow-hidden"
      >
        {/* Glow */}
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-emerald-600/10 blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-display font-extrabold text-white">
                Financial Health Score Diagnostic
              </h2>
              <p className="text-xs text-slate-400">
                Deep dive into your 0–1000 runway solvency index
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Score Dial / Hero Stat */}
        <div className={`p-5 rounded-2xl border text-center mb-6 ${theme.bg} ${theme.border} ${theme.glow}`}>
          <div className="text-[11px] font-mono uppercase font-bold text-slate-400 mb-1">
            Current Solvency Rating
          </div>
          <div className={`text-5xl font-display font-black ${theme.text}`}>
            {financialHealthScore}
            <span className="text-lg font-mono text-slate-500"> / 1000</span>
          </div>
          <div className="inline-block mt-2 px-3 py-1 rounded-full text-xs font-bold font-mono uppercase bg-black/40 border border-white/10 text-white">
            {statusLabel} • {riskLevel} RISK
          </div>
          <p className="text-xs text-slate-300 mt-3 font-medium max-w-sm mx-auto">
            "{statusQuote}"
          </p>
        </div>

        {/* 3 Pillars Breakdown */}
        <div className="space-y-3 mb-6">
          <div className="text-[11px] font-mono uppercase font-bold text-slate-400">
            Score Components:
          </div>

          {/* 1. Runway Pace */}
          <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5">
            <div className="flex justify-between items-center text-xs mb-1.5">
              <span className="font-bold text-white flex items-center gap-1.5">
                <Award className="w-4 h-4 text-emerald-400" />
                Runway Pace (Daily Safe-To-Spend)
              </span>
              <span className="font-mono font-bold text-emerald-400">
                {runwayPaceScore} / 400 pts
              </span>
            </div>
            <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
              <div 
                className="h-full bg-emerald-400 rounded-full"
                style={{ width: `${(runwayPaceScore / 400) * 100}%` }}
              />
            </div>
            <div className="text-[10px] text-slate-400 mt-1 font-mono">
              Safe-to-spend: {formatINR(dailySafeToSpend)}/day vs ₹210 baseline
            </div>
          </div>

          {/* 2. Savings Shield */}
          <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5">
            <div className="flex justify-between items-center text-xs mb-1.5">
              <span className="font-bold text-white flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-violet-400" />
                Savings Shield Vault
              </span>
              <span className="font-mono font-bold text-violet-400">
                {savingsShieldScore} / 300 pts
              </span>
            </div>
            <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
              <div 
                className="h-full bg-violet-400 rounded-full"
                style={{ width: `${(savingsShieldScore / 300) * 100}%` }}
              />
            </div>
            <div className="text-[10px] text-slate-400 mt-1 font-mono">
              Protected ₹1,500 locked vault + ₹2,200 fixed subscriptions
            </div>
          </div>

          {/* 3. Burn Discipline */}
          <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5">
            <div className="flex justify-between items-center text-xs mb-1.5">
              <span className="font-bold text-white flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-cyan-400" />
                Burn Rate Discipline
              </span>
              <span className="font-mono font-bold text-cyan-400">
                {burnDisciplineScore} / 300 pts
              </span>
            </div>
            <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
              <div 
                className="h-full bg-cyan-400 rounded-full"
                style={{ width: `${(burnDisciplineScore / 300) * 100}%` }}
              />
            </div>
            <div className="text-[10px] text-slate-400 mt-1 font-mono">
              Current burn speed vs ₹333/day expected monthly pace
            </div>
          </div>

        </div>

        {/* Gen-Z Pro-Tips */}
        <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 flex items-start gap-2.5">
          <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="text-xs text-slate-300">
            <span className="font-bold text-white">Flight Deck Co-pilot Tip: </span>
            {riskLevel === 'LOW' 
              ? 'Keep your micro-spending consistent. You have enough discretionary cushion to end the month with a surplus.'
              : riskLevel === 'MODERATE'
              ? 'Pause unused subscriptions or apply the 24-hour rule before any purchase above ₹1,000.'
              : 'Emergency brake recommended: Cut all dining out and social spend for 48 hours to restore safe runway.'}
          </div>
        </div>

        <div className="mt-5 pt-4 border-t border-white/5 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold transition-colors cursor-pointer"
          >
            Got It
          </button>
        </div>

      </motion.div>
    </div>
  );
};
