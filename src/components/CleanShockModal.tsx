import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Zap, ShieldAlert, CheckCircle2, ArrowRight } from 'lucide-react';
import { ShockEvent } from '../utils/shockEvents';
import { formatINR } from '../utils/financeEngine';

interface CleanShockModalProps {
  event: ShockEvent;
  currentBalance: number;
  savingsGoal: number;
  daysRemaining: number;
  isOpen: boolean;
  onClose: () => void;
  onResolve: (choice: 'daily' | 'vault', event: ShockEvent) => void;
}

export const CleanShockModal: React.FC<CleanShockModalProps> = ({
  event,
  currentBalance,
  savingsGoal,
  daysRemaining,
  isOpen,
  onClose,
  onResolve,
}) => {
  const [choice, setChoice] = useState<'daily' | 'vault'>('daily');

  if (!isOpen) return null;

  const shockAmount = Math.abs(event.amount);
  const isBonus = event.type === 'bonus';

  // Math previews
  const newBalanceIfDaily = isBonus 
    ? currentBalance + shockAmount 
    : Math.max(0, currentBalance - shockAmount);
  const newDailyIfDaily = Math.round(newBalanceIfDaily / Math.max(1, daysRemaining));

  const newSavingsIfVault = isBonus 
    ? savingsGoal + shockAmount 
    : Math.max(0, savingsGoal - shockAmount);
  const currentDaily = Math.round(currentBalance / Math.max(1, daysRemaining));

  const handleConfirm = () => {
    onResolve(choice, event);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="relative w-full max-w-lg rounded-3xl bg-[#0c101b] border border-white/10 shadow-2xl p-6 sm:p-8 overflow-hidden"
      >
        {/* Ambient Glow */}
        <div className={`absolute top-0 right-0 w-72 h-72 rounded-full blur-3xl pointer-events-none opacity-20 ${
          isBonus ? 'bg-emerald-500' : 'bg-rose-500'
        }`} />

        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-5">
          <div className="flex items-center gap-3">
            <span className="text-4xl p-2.5 rounded-2xl bg-white/[0.04] border border-white/[0.08]">
              {event.emoji}
            </span>
            <div>
              <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider ${
                isBonus ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
              }`}>
                {isBonus ? 'CASH WINDFALL 🎉' : 'LIFE SHOCK 🎲'}
              </span>
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

        {/* Shock Amount & Story Banner */}
        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.08] mb-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono uppercase text-slate-400 font-bold">
              {isBonus ? 'Windfall Inflow:' : 'Immediate Cost Impact:'}
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

        {/* 2 Strategic Choices */}
        <div className="space-y-3 mb-6">
          <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 font-bold">
            Choose How to Handle This:
          </label>

          {/* Choice A: Daily Balance */}
          <div
            onClick={() => setChoice('daily')}
            className={`p-4 rounded-2xl border transition-all cursor-pointer ${
              choice === 'daily'
                ? 'bg-violet-950/30 border-violet-500/60 ring-2 ring-violet-500/30 shadow-sm'
                : 'bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.04]'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-sm font-bold text-white flex items-center gap-2">
                <Zap className="w-4 h-4 text-violet-400" />
                <span>Absorb in Daily Balance</span>
              </span>
              <span className="text-[10px] font-mono text-emerald-400">
                Savings Safe (₹{savingsGoal})
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed mb-2">
              Deducts directly from your liquid balance. Daily safe-to-spend adjusts from {formatINR(currentDaily)} to {formatINR(newDailyIfDaily)}/day.
            </p>
          </div>

          {/* Choice B: Savings Vault */}
          <div
            onClick={() => setChoice('vault')}
            className={`p-4 rounded-2xl border transition-all cursor-pointer ${
              choice === 'vault'
                ? 'bg-amber-950/30 border-amber-500/60 ring-2 ring-amber-500/30 shadow-sm'
                : 'bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.04]'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-sm font-bold text-white flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-400" />
                <span>Deduct from Savings Vault</span>
              </span>
              <span className="text-[10px] font-mono text-amber-400">
                Daily Untouched ({formatINR(currentDaily)}/d)
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed mb-2">
              Keeps your daily spending pace undisturbed, but draws down your emergency savings shield to {formatINR(newSavingsIfVault)}.
            </p>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 text-black font-display font-extrabold text-xs shadow-lg transition-all cursor-pointer flex items-center gap-1.5"
          >
            <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
            <span>Apply Resolution</span>
          </button>
        </div>

      </motion.div>
    </div>
  );
};
