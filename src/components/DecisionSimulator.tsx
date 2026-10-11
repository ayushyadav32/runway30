import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  ShieldCheck, 
  AlertTriangle, 
  Flame, 
  X,
  PiggyBank,
  TrendingDown,
  RotateCcw
} from 'lucide-react';
import { FinancialState, SimulationMetrics, TransactionCategory } from '../types/finance';
import { computeSimulationMetrics, formatINR } from '../utils/financeEngine';
import { WHAT_IF_PRESETS } from '../data/mockData';

interface DecisionSimulatorProps {
  state: FinancialState;
  metrics: SimulationMetrics;
  onCommitPurchase: (title: string, amount: number, category: TransactionCategory) => void;
  onSaveMoney?: (savedAmount: number, itemName: string) => void;
  onClose?: () => void;
  isModal?: boolean;
}

export const DecisionSimulator: React.FC<DecisionSimulatorProps> = ({
  state,
  metrics,
  onCommitPurchase,
  onSaveMoney,
  onClose,
  isModal = false,
}) => {
  const [itemName, setItemName] = useState<string>('Concert Pass');
  const [itemAmount, setItemAmount] = useState<number>(1800);
  const [itemCategory, setItemCategory] = useState<TransactionCategory>('Social');
  const [savedCelebration, setSavedCelebration] = useState<{ amount: number; item: string } | null>(null);

  // Compute hypothetical state
  const simulatedState: FinancialState = {
    ...state,
    currentBalance: Math.max(0, state.currentBalance - itemAmount),
  };

  const simulatedMetrics = computeSimulationMetrics(simulatedState);

  // Delta computations
  const safeToSpendDiff = simulatedMetrics.dailySafeToSpend - metrics.dailySafeToSpend;
  const healthScoreDiff = simulatedMetrics.financialHealthScore - metrics.financialHealthScore;
  const discretionaryDiff = simulatedMetrics.discretionaryPool - metrics.discretionaryPool;

  // Runway Deficit Calculations
  const isMonthEndDeficit = simulatedMetrics.discretionaryPool <= 0;
  const deficitAmount = isMonthEndDeficit ? Math.abs(simulatedMetrics.discretionaryPool) : 0;

  // Determine Gen-Z Verdict
  const getVerdict = () => {
    if (isMonthEndDeficit) {
      return {
        tag: 'MONTH-END DEFICIT 💀',
        title: 'Impulse Danger: Savings Vault Breach',
        desc: `Buying this causes an immediate negative deficit of ₹${deficitAmount.toLocaleString('en-IN')}, wiping your discretionary buffer and invading your locked ₹1,500 savings shield.`,
        theme: 'rose',
        canAfford: false,
      };
    } else if (simulatedMetrics.dailySafeToSpend < 80) {
      return {
        tag: 'SURVIVAL MODE ⚠️',
        title: 'Tight Squeeze Ahead',
        desc: `Your daily safe spend drops to ${formatINR(simulatedMetrics.dailySafeToSpend)}/day for the next ${metrics.daysRemaining} days. You'll need strict discipline on all social plans.`,
        theme: 'amber',
        canAfford: true,
      };
    } else if (simulatedMetrics.dailySafeToSpend < 140) {
      return {
        tag: 'BALANCED PACE ⚖️',
        title: 'Manageable Impact',
        desc: `Daily safe spend adjusts from ${formatINR(metrics.dailySafeToSpend)} to ${formatINR(simulatedMetrics.dailySafeToSpend)}/day. Completely viable if discretionary spending is tempered.`,
        theme: 'cyan',
        canAfford: true,
      };
    } else {
      return {
        tag: 'SAFE RUNWAY 🚀',
        title: 'Green Light! Safe to Cop',
        desc: `Your runway absorbs this cleanly! You still have ${formatINR(simulatedMetrics.dailySafeToSpend)}/day safe for the remaining ${metrics.daysRemaining} days with full savings intact.`,
        theme: 'emerald',
        canAfford: true,
      };
    }
  };

  const verdict = getVerdict();

  const handleApplyPreset = (preset: typeof WHAT_IF_PRESETS[0]) => {
    setItemName(preset.title);
    setItemAmount(preset.amount);
    setItemCategory(preset.category);
    setSavedCelebration(null);
  };

  // Commit purchase into real state
  const handleExecute = () => {
    if (itemAmount <= 0) return;
    onCommitPurchase(itemName || 'Impulse Spend', itemAmount, itemCategory);
    if (onClose) onClose();
  };

  // "Save My Money" Discards simulation and triggers celebration confetti
  const handleSaveMoney = () => {
    if (itemAmount <= 0) return;
    const amountToSave = itemAmount;
    const itemToSave = itemName || 'Impulse Item';

    // Confetti burst
    confetti({
      particleCount: 75,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#00F59B', '#00F0FF', '#FFB800', '#A855F7'],
    });

    setSavedCelebration({ amount: amountToSave, item: itemToSave });

    if (onSaveMoney) {
      onSaveMoney(amountToSave, itemToSave);
    }

    // Auto-reset after a short delay
    setTimeout(() => {
      setItemAmount(0);
      setItemName('');
    }, 2400);
  };

  return (
    <div className={`relative overflow-hidden rounded-3xl p-6 sm:p-7 backdrop-blur-xl bg-[#0d121c]/90 border border-white/10 shadow-glass-card ${isModal ? 'max-w-2xl w-full' : 'w-full'}`}>
      
      {/* Background radial glow */}
      <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-violet-600/10 blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-violet-500/15 border border-violet-500/30 text-violet-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-display font-extrabold text-white flex items-center gap-2">
              "What-If" Decision Simulator
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-violet-300 font-bold">
                PRE-SPEND RADAR
              </span>
            </h2>
            <p className="text-xs text-slate-400 font-medium">
              Simulate any potential purchase before spending a single rupee
            </p>
          </div>
        </div>

        {isModal && onClose && (
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Preset Chips (Concert Pass ₹1,800, Sneakers ₹2,500, Cafe date ₹600) */}
      <div className="mb-5">
        <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center justify-between">
          <span>Popular Gen-Z Purchase Presets:</span>
          <span className="text-[10px] text-violet-400 font-normal">1-Tap to Test</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {WHAT_IF_PRESETS.map((preset) => {
            const isSelected = itemName === preset.title && itemAmount === preset.amount;
            return (
              <button
                key={preset.title}
                type="button"
                onClick={() => handleApplyPreset(preset)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 cursor-pointer ${
                  isSelected
                    ? 'bg-violet-500/30 border-violet-400/60 text-white shadow-glow-violet ring-1 ring-violet-400/30'
                    : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                <span>{preset.emoji}</span>
                <span>{preset.title}</span>
                <span className="font-mono text-[11px] text-violet-300 font-bold">
                  {formatINR(preset.amount)}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Form Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 mb-4">
        <div className="sm:col-span-6">
          <label className="block text-[11px] font-mono font-bold text-slate-300 mb-1 uppercase">
            Simulated Item / Experience
          </label>
          <input
            type="text"
            value={itemName}
            onChange={(e) => {
              setItemName(e.target.value);
              setSavedCelebration(null);
            }}
            placeholder="e.g. Concert Pass, Sneakers, Cafe date"
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-violet-500/60 font-sans"
          />
        </div>

        <div className="sm:col-span-3">
          <label className="block text-[11px] font-mono font-bold text-slate-300 mb-1 uppercase">
            Price (₹)
          </label>
          <input
            type="number"
            min="0"
            max="10000"
            step="50"
            value={itemAmount}
            onChange={(e) => {
              setItemAmount(Math.max(0, Number(e.target.value)));
              setSavedCelebration(null);
            }}
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-white/10 text-white font-mono text-sm focus:outline-none focus:border-violet-500/60"
          />
        </div>

        <div className="sm:col-span-3">
          <label className="block text-[11px] font-mono font-bold text-slate-300 mb-1 uppercase">
            Category
          </label>
          <select
            value={itemCategory}
            onChange={(e) => setItemCategory(e.target.value as TransactionCategory)}
            className="w-full px-3 py-2.5 rounded-xl bg-slate-900/80 border border-white/10 text-white text-sm focus:outline-none focus:border-violet-500/60 font-sans cursor-pointer"
          >
            <option value="Social">☕ Hangout / Social</option>
            <option value="Shopping">🛒 Shopping / Fashion</option>
            <option value="Food">🍔 Food &amp; Dining</option>
            <option value="Travel">🚇 Travel / Transit</option>
            <option value="Emergency">🚨 Emergency / Other</option>
          </select>
        </div>

        {/* Purchase Simulator Slider (₹100 to ₹3,500) */}
        <div className="sm:col-span-12 mt-1">
          <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 mb-1">
            <span>Simulate Amount Slider (₹100 - ₹3,500):</span>
            <span className="font-bold text-violet-300 font-mono text-xs">{formatINR(itemAmount)}</span>
          </div>
          <input
            type="range"
            data-testid="simulator-slider"
            aria-label="Expense Simulator Slider"
            min="100"
            max="3500"
            step="50"
            value={Math.min(3500, Math.max(100, itemAmount || 100))}
            onChange={(e) => {
              setItemAmount(Number(e.target.value));
              setSavedCelebration(null);
            }}
            className="w-full h-2.5 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-violet-400 focus:outline-none border border-white/10"
          />
          <div className="flex justify-between text-[9px] font-mono text-slate-500 mt-1">
            <span>₹100</span>
            <span>₹1,000</span>
            <span>₹2,000</span>
            <span>₹3,500</span>
          </div>
        </div>
      </div>

      {/* Real-time Impact Indicators Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
        
        {/* 1. Projected Daily Safe Spend */}
        <div className="p-3.5 rounded-2xl bg-black/40 border border-white/5 flex flex-col justify-between">
          <div className="text-[10px] font-mono uppercase text-slate-400 font-bold flex items-center justify-between">
            <span>Projected Daily Safe Spend</span>
            <span className={`text-[10px] font-mono font-bold ${safeToSpendDiff < 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
              {safeToSpendDiff < 0 ? `${safeToSpendDiff.toFixed(0)}/d` : '0/d'}
            </span>
          </div>
          <div className="flex items-baseline gap-2 mt-1.5">
            <span className="text-xs font-mono text-slate-500 line-through">
              {formatINR(metrics.dailySafeToSpend)}
            </span>
            <ArrowRight className="w-3 h-3 text-slate-600" />
            <span className={`text-lg font-display font-black ${
              safeToSpendDiff < 0 ? 'text-rose-400' : 'text-emerald-400'
            }`}>
              {formatINR(simulatedMetrics.dailySafeToSpend)}
            </span>
            <span className="text-[10px] text-slate-500 font-mono">/ day</span>
          </div>
          <div className="text-[10px] font-mono text-slate-400 mt-1">
            Across {metrics.daysRemaining} days remaining
          </div>
        </div>

        {/* 2. Runway Burn Risk (Shows negative deficit at month-end if any) */}
        <div className={`p-3.5 rounded-2xl border flex flex-col justify-between ${
          isMonthEndDeficit 
            ? 'bg-rose-950/30 border-rose-500/40' 
            : 'bg-black/40 border-white/5'
        }`}>
          <div className="text-[10px] font-mono uppercase font-bold flex items-center justify-between">
            <span className={isMonthEndDeficit ? 'text-rose-300' : 'text-slate-400'}>
              Runway Burn Risk
            </span>
            <span className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded ${
              isMonthEndDeficit 
                ? 'bg-rose-500/20 text-rose-300' 
                : 'bg-emerald-500/20 text-emerald-300'
            }`}>
              {isMonthEndDeficit ? 'DEFICIT ALERT' : 'SAFE'}
            </span>
          </div>
          
          <div className="mt-1.5">
            {isMonthEndDeficit ? (
              <div className="text-sm font-display font-black text-rose-400 flex items-center gap-1">
                <Flame className="w-4 h-4 text-rose-500 shrink-0" />
                <span>-₹{deficitAmount.toLocaleString('en-IN')} Deficit!</span>
              </div>
            ) : (
              <div className="text-sm font-display font-black text-emerald-400 flex items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>+₹{simulatedMetrics.discretionaryPool.toLocaleString('en-IN')} Surplus</span>
              </div>
            )}
          </div>

          <div className="text-[10px] font-mono text-slate-400 mt-1">
            {isMonthEndDeficit 
              ? 'Wipes pool & attacks ₹1,500 vault' 
              : 'Discretionary buffer intact'}
          </div>
        </div>

        {/* 3. Health Score Impact (Delta badge) */}
        <div className="p-3.5 rounded-2xl bg-black/40 border border-white/5 flex flex-col justify-between">
          <div className="text-[10px] font-mono uppercase text-slate-400 font-bold flex items-center justify-between">
            <span>Health Score Impact</span>
            <span className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded ${
              healthScoreDiff < 0 ? 'bg-amber-500/20 text-amber-300' : 'bg-emerald-500/20 text-emerald-300'
            }`}>
              {healthScoreDiff} PTS
            </span>
          </div>
          
          <div className="flex items-baseline gap-2 mt-1.5">
            <span className="text-xs font-mono text-slate-500 line-through">
              {metrics.financialHealthScore}
            </span>
            <ArrowRight className="w-3 h-3 text-slate-600" />
            <span className={`text-lg font-display font-black ${
              healthScoreDiff < 0 ? 'text-amber-400' : 'text-emerald-400'
            }`}>
              {simulatedMetrics.financialHealthScore}
            </span>
            <span className="text-[10px] font-mono text-slate-500">/ 1000</span>
          </div>

          <div className="text-[10px] font-mono text-slate-400 mt-1">
            Risk rating: <span className="font-bold text-slate-300">{simulatedMetrics.riskLevel}</span>
          </div>
        </div>

      </div>

      {/* Saved Money Celebration Alert */}
      <AnimatePresence>
        {savedCelebration && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            className="mb-5 p-4 rounded-2xl bg-gradient-to-r from-emerald-950/70 to-teal-950/70 border border-emerald-500/40 shadow-glow-emerald flex items-center justify-between gap-3"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl p-2 rounded-xl bg-emerald-500/20 border border-emerald-500/30">
                🎉
              </span>
              <div>
                <h4 className="text-sm font-display font-extrabold text-emerald-300">
                  You saved {formatINR(savedCelebration.amount)}!
                </h4>
                <p className="text-xs text-slate-300">
                  Resisting impulse spend on "{savedCelebration.item}" protected your daily allowance at {formatINR(metrics.dailySafeToSpend)}/day.
                </p>
              </div>
            </div>
            <button
              onClick={() => setSavedCelebration(null)}
              className="text-slate-400 hover:text-white p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Verdict Banner */}
      <div className={`p-4 rounded-2xl border transition-all mb-5 ${
        verdict.theme === 'emerald'
          ? 'bg-emerald-950/20 border-emerald-500/30'
          : verdict.theme === 'cyan'
          ? 'bg-cyan-950/20 border-cyan-500/30'
          : verdict.theme === 'amber'
          ? 'bg-amber-950/20 border-amber-500/30'
          : 'bg-rose-950/30 border-rose-500/40'
      }`}>
        <div className="flex items-center justify-between gap-2 mb-1">
          <div className="flex items-center gap-2">
            <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
              verdict.theme === 'emerald'
                ? 'bg-emerald-500/20 text-emerald-300'
                : verdict.theme === 'cyan'
                ? 'bg-cyan-500/20 text-cyan-300'
                : verdict.theme === 'amber'
                ? 'bg-amber-500/20 text-amber-300'
                : 'bg-rose-500/25 text-rose-300'
            }`}>
              {verdict.tag}
            </span>
            <span className="text-xs sm:text-sm font-bold text-white font-sans">
              {verdict.title}
            </span>
          </div>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          {verdict.desc}
        </p>
      </div>

      {/* Two Action Buttons: Commit Purchase & Save My Money */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <button
          type="button"
          onClick={() => {
            setItemName('');
            setItemAmount(0);
            setSavedCelebration(null);
          }}
          className="flex items-center gap-1.5 text-xs font-mono text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset</span>
        </button>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Button 2: Save My Money (Confetti + Discard) */}
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            type="button"
            data-testid="save-money-btn"
            onClick={handleSaveMoney}
            disabled={itemAmount <= 0}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-emerald-500/10 border border-white/10 hover:border-emerald-500/30 text-emerald-300 font-bold text-xs transition-all cursor-pointer disabled:opacity-40 disabled:pointer-events-none"
          >
            <PiggyBank className="w-4 h-4 text-emerald-400" />
            <span>Save My Money! (Skip Spend)</span>
          </motion.button>

          {/* Button 1: Commit Purchase (Applies to live balance) */}
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            type="button"
            onClick={handleExecute}
            data-testid="commit-expense-btn"
            disabled={itemAmount <= 0}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs font-sans transition-all cursor-pointer shadow-lg disabled:opacity-40 disabled:pointer-events-none ${
              verdict.canAfford
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-black shadow-glow-emerald hover:brightness-110'
                : 'bg-gradient-to-r from-rose-600 to-pink-600 text-white shadow-glow-rose hover:brightness-110'
            }`}
          >
            <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
            <span>Commit Purchase (-{formatINR(itemAmount)})</span>
          </motion.button>
        </div>
      </div>

    </div>
  );
};
