import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  X, 
  AlertTriangle, 
  ShieldAlert, 
  ShieldCheck, 
  ArrowRight, 
  Zap, 
  Lock, 
  Unlock, 
  Sparkles,
  TrendingDown,
  CheckCircle2,
  HelpCircle
} from 'lucide-react';
import { FinancialState, SimulationMetrics } from '../types/finance';
import { ShockEvent } from '../utils/shockEvents';
import { computeSimulationMetrics, formatINR } from '../utils/financeEngine';

interface ShockConsequenceModalProps {
  event: ShockEvent;
  state: FinancialState;
  metrics: SimulationMetrics;
  onResolveShock: (choice: 'daily' | 'vault', event: ShockEvent) => void;
  onClose: () => void;
}

export const ShockConsequenceModal: React.FC<ShockConsequenceModalProps> = ({
  event,
  state,
  metrics,
  onResolveShock,
  onClose,
}) => {
  const [selectedChoice, setSelectedChoice] = useState<'daily' | 'vault'>('daily');
  const isBonus = event.type === 'bonus';
  const shockAmount = Math.abs(event.amount);

  // Compute Hypothetical State for Choice A ("Absorb in Daily Budget")
  const stateChoiceA: FinancialState = isBonus
    ? {
        ...state,
        currentBalance: state.currentBalance + shockAmount,
      }
    : {
        ...state,
        currentBalance: Math.max(0, state.currentBalance - shockAmount),
      };
  const metricsChoiceA = computeSimulationMetrics(stateChoiceA);

  // Compute Hypothetical State for Choice B ("Deduct from Savings Vault")
  const stateChoiceB: FinancialState = isBonus
    ? {
        ...state,
        currentBalance: state.currentBalance + shockAmount,
        savingsGoal: state.savingsGoal + shockAmount,
      }
    : {
        ...state,
        currentBalance: Math.max(0, state.currentBalance - shockAmount),
        savingsGoal: Math.max(0, state.savingsGoal - shockAmount),
      };
  const metricsChoiceB = computeSimulationMetrics(stateChoiceB);

  // Active simulated outcome based on selected choice
  const activeSimState = selectedChoice === 'daily' ? stateChoiceA : stateChoiceB;
  const activeSimMetrics = selectedChoice === 'daily' ? metricsChoiceA : metricsChoiceB;

  // Determine recommendation badge
  const isChoiceASafer = metricsChoiceA.financialHealthScore >= metricsChoiceB.financialHealthScore;

  const handleConfirm = () => {
    onResolveShock(selectedChoice, event);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 15 }}
        className="relative w-full max-w-xl rounded-3xl p-6 sm:p-8 bg-[#0d121c] border border-white/10 shadow-2xl overflow-hidden"
      >
        {/* Background Ambient Glow */}
        <div className={`absolute top-0 right-0 w-80 h-80 rounded-full blur-3xl pointer-events-none opacity-20 ${
          isBonus ? 'bg-emerald-500' : event.severity === 'critical' ? 'bg-rose-600' : 'bg-amber-500'
        }`} />

        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-5">
          <div className="flex items-center gap-3">
            <span className="text-4xl p-2.5 rounded-2xl bg-white/5 border border-white/10">
              {event.emoji}
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider ${
                  isBonus 
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : event.severity === 'critical'
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                }`}>
                  {isBonus ? 'CASH WINDFALL 🎁' : 'UNEXPECTED SHOCK ⚡'}
                </span>
                <span className="text-xs font-mono text-slate-400">
                  {event.category}
                </span>
              </div>
              <h2 className="text-xl font-display font-extrabold text-white mt-1">
                {event.title}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Shock Story & Amount Banner */}
        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 mb-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono uppercase text-slate-400 font-bold">
              {isBonus ? 'Amount Credited:' : 'Immediate Financial Shock:'}
            </span>
            <span className={`text-xl font-display font-black font-mono ${
              isBonus ? 'text-emerald-400' : 'text-rose-400'
            }`}>
              {isBonus ? `+${formatINR(shockAmount)}` : `-${formatINR(shockAmount)}`}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed">
            {event.story}
          </p>
        </div>

        {/* 2 Strategic Choices Selector */}
        <div className="mb-5">
          <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400 mb-2.5 flex items-center justify-between">
            <span>Select Resolution Strategy:</span>
            <span className="text-[10px] text-emerald-400">
              {isChoiceASafer ? 'Choice A Recommended' : 'Choice B Recommended'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            
            {/* Choice A Card */}
            <div
              onClick={() => setSelectedChoice('daily')}
              className={`p-4 rounded-2xl border transition-all cursor-pointer relative ${
                selectedChoice === 'daily'
                  ? 'bg-violet-950/30 border-violet-500/60 ring-2 ring-violet-500/30 shadow-glow-violet'
                  : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.05]'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-violet-400" />
                  {isBonus ? 'Boost Daily Pool' : 'Absorb in Daily Pool'}
                </span>
                {isChoiceASafer && (
                  <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    RECOMMENDED
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 leading-relaxed mb-3">
                {event.dailyPaceAdvice}
              </p>
              <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px] font-mono">
                <span className="text-slate-500">Vault:</span>
                <span className="text-emerald-400 font-bold">₹{stateChoiceA.savingsGoal} (Shielded)</span>
              </div>
            </div>

            {/* Choice B Card */}
            <div
              onClick={() => setSelectedChoice('vault')}
              className={`p-4 rounded-2xl border transition-all cursor-pointer relative ${
                selectedChoice === 'vault'
                  ? 'bg-amber-950/30 border-amber-500/60 ring-2 ring-amber-500/30 shadow-glow-amber'
                  : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.05]'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-amber-400" />
                  {isBonus ? 'Lock into Savings Vault' : 'Deduct from Savings Vault'}
                </span>
                {!isChoiceASafer && (
                  <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    RECOMMENDED
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 leading-relaxed mb-3">
                {event.vaultAdvice}
              </p>
              <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px] font-mono">
                <span className="text-slate-500">Vault:</span>
                <span className={`font-bold ${stateChoiceB.savingsGoal < 1000 ? 'text-rose-400' : 'text-amber-400'}`}>
                  ₹{stateChoiceB.savingsGoal} ({stateChoiceB.savingsGoal < 1000 ? 'Depleted' : 'Adjusted'})
                </span>
              </div>
            </div>

          </div>
        </div>

        {/* Live Impact Preview Box */}
        <div className="p-4 rounded-2xl bg-black/40 border border-white/10 mb-6">
          <div className="text-[10px] font-mono uppercase text-slate-400 font-bold mb-2.5">
            Simulated Outcome ({selectedChoice === 'daily' ? 'Choice A: Daily Absorption' : 'Choice B: Vault Deduction'}):
          </div>

          <div className="grid grid-cols-3 gap-2 text-center">
            
            <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
              <div className="text-[10px] font-mono text-slate-500 uppercase">Daily Safe-To-Spend</div>
              <div className="flex items-baseline justify-center gap-1 mt-0.5">
                <span className="text-xs font-mono text-slate-500 line-through">
                  {formatINR(metrics.dailySafeToSpend)}
                </span>
                <ArrowRight className="w-2.5 h-2.5 text-slate-600" />
                <span className={`text-sm font-display font-black ${
                  activeSimMetrics.dailySafeToSpend < metrics.dailySafeToSpend ? 'text-amber-400' : 'text-emerald-400'
                }`}>
                  {formatINR(activeSimMetrics.dailySafeToSpend)}
                </span>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
              <div className="text-[10px] font-mono text-slate-500 uppercase">Health Score</div>
              <div className="flex items-baseline justify-center gap-1 mt-0.5">
                <span className="text-xs font-mono text-slate-500 line-through">
                  {metrics.financialHealthScore}
                </span>
                <ArrowRight className="w-2.5 h-2.5 text-slate-600" />
                <span className={`text-sm font-display font-black ${
                  activeSimMetrics.financialHealthScore < metrics.financialHealthScore ? 'text-rose-400' : 'text-emerald-400'
                }`}>
                  {activeSimMetrics.financialHealthScore}
                </span>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
              <div className="text-[10px] font-mono text-slate-500 uppercase">Risk Level</div>
              <div className="mt-1">
                <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                  activeSimMetrics.riskLevel === 'LOW'
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : activeSimMetrics.riskLevel === 'MODERATE'
                    ? 'bg-amber-500/20 text-amber-400'
                    : 'bg-rose-500/20 text-rose-400'
                }`}>
                  {activeSimMetrics.riskLevel}
                </span>
              </div>
            </div>

          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
          >
            Cancel
          </button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleConfirm}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs font-sans transition-all cursor-pointer shadow-lg ${
              isBonus
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-black shadow-glow-emerald hover:brightness-110'
                : selectedChoice === 'daily'
                ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-glow-violet hover:brightness-110'
                : 'bg-gradient-to-r from-amber-500 to-orange-500 text-black shadow-glow-amber hover:brightness-110'
            }`}
          >
            <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
            <span>Confirm Resolution ({selectedChoice === 'daily' ? 'Daily Absorption' : 'Vault Tap'})</span>
          </motion.button>
        </div>

      </motion.div>
    </div>
  );
};
