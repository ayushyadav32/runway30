import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { 
  Plus, 
  Trash2, 
  ArrowRight, 
  ArrowLeft, 
  Calendar, 
  Receipt, 
  ShieldCheck, 
  Sparkles,
  Zap,
  CheckCircle2,
  Lock
} from 'lucide-react';
import { FinancialState, SubscriptionItem } from '../types/finance';
import { formatINR } from '../utils/financeEngine';

interface OnboardingWizardProps {
  initialHandle?: string;
  initialAvatar?: string;
  onComplete: (state: FinancialState, subscriptions: SubscriptionItem[]) => void;
  onQuickDemo?: () => void;
}

interface CustomBill {
  id: string;
  name: string;
  amount: number;
}

const QUICK_SUGGEST_CHIPS = [
  { name: 'WiFi Broadband', amount: 799 },
  { name: 'Spotify Premium', amount: 119 },
  { name: 'Gym Membership', amount: 1000 },
];

export const OnboardingWizard: React.FC<OnboardingWizardProps> = ({
  initialHandle = '@Alex',
  initialAvatar = '⚡',
  onComplete,
  onQuickDemo,
}) => {
  // 3-Step Wizard: 1 = Cycle & Budget, 2 = Fixed Bills, 3 = Savings Goal
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  // Step 1: Cycle Length & Budget
  const [cycleDays, setCycleDays] = useState<30 | 31>(30);
  const startingBudget = 10000;

  // Step 2: Custom Fixed Commitments & Subscriptions (STARTS WITH 0 / EMPTY LIST)
  const [customBills, setCustomBills] = useState<CustomBill[]>([]);
  const [billName, setBillName] = useState<string>('');
  const [billAmount, setBillAmount] = useState<string>('');

  // Step 3: Emergency Savings Goal (Slider ₹500 to ₹2,500, default marker ₹1,500)
  const [savingsGoal, setSavingsGoal] = useState<number>(1500);

  // Add Custom Bill
  const handleAddBill = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const num = Number(billAmount);
    if (!billName.trim() || !num || num <= 0) return;

    const newBill: CustomBill = {
      id: `bill-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      name: billName.trim(),
      amount: num,
    };

    setCustomBills((prev) => [...prev, newBill]);
    setBillName('');
    setBillAmount('');
  };

  // 1-Click Quick Suggest Chip append
  const handleAddQuickSuggest = (item: { name: string; amount: number }) => {
    const newBill: CustomBill = {
      id: `bill-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      name: item.name,
      amount: item.amount,
    };
    setCustomBills((prev) => [...prev, newBill]);
  };

  // Remove a Bill
  const handleRemoveBill = (id: string) => {
    setCustomBills((prev) => prev.filter((b) => b.id !== id));
  };

  // Calculations
  const totalCommitments = customBills.reduce((sum, b) => sum + b.amount, 0);
  const startingLiquidBalance = Math.max(0, startingBudget - totalCommitments - savingsGoal);
  const dailyAllowance = Math.round(startingLiquidBalance / cycleDays);

  // Final Action: "Launch Live Dashboard ⚡"
  const handleLaunch = () => {
    confetti({
      particleCount: 85,
      spread: 75,
      origin: { y: 0.6 },
      colors: ['#00F59B', '#00F0FF', '#8B5CF6'],
    });

    const subsList: SubscriptionItem[] = customBills.map((b, i) => ({
      id: b.id,
      name: b.name,
      amount: b.amount,
      dueDay: ((i + 1) * 6) % cycleDays || 1,
      category: b.name.toLowerCase().includes('wifi') ? 'Utility' : 'Subscriptions',
      active: true,
    }));

    const newState: FinancialState = {
      totalBudget: startingBudget,
      currentDay: 1,
      currentBalance: startingBudget,
      fixedCommitments: totalCommitments,
      savingsGoal: savingsGoal,
      isSavingsLocked: true,
      cycleDays,
      userTag: initialHandle,
      userAvatar: initialAvatar,
      isOnboarded: true,
    };

    onComplete(newState, subsList);
  };

  return (
    <div className="min-h-screen bg-[#07090E] text-white flex items-center justify-center p-4 sm:p-6 lg:p-8 relative selection:bg-emerald-500/20 selection:text-emerald-300 overflow-hidden bg-obsidian-ambient">
      
      {/* Subtle luxury ambient backlights */}
      <div className="fixed top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[42rem] h-[42rem] bg-emerald-500/[0.045] rounded-full blur-[160px] pointer-events-none" />
      <div className="fixed bottom-10 left-1/4 w-[30rem] h-[30rem] bg-violet-600/[0.035] rounded-full blur-[150px] pointer-events-none" />

      {/* Main Fullscreen Setup Card */}
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-2xl rounded-[2.5rem] bg-[#10121B]/85 border border-white/[0.07] backdrop-blur-2xl shadow-[0_30px_90px_rgba(0,0,0,0.85)] p-8 sm:p-12 overflow-hidden"
      >
        {/* Top Header Pill & Step Breadcrumbs */}
        <div className="flex items-center justify-between gap-3 mb-8">
          <div className="flex items-center gap-2">
            <span className="text-lg">{initialAvatar}</span>
            <span className="text-xs font-mono font-bold text-slate-300">{initialHandle}</span>
          </div>

          {/* Steps Indicator (1, 2, 3) */}
          <div className="flex items-center gap-2">
            {[1, 2, 3].map((step) => (
              <div
                key={step}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-bold transition-all ${
                  currentStep === step
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : currentStep > step
                    ? 'bg-white/10 text-white border border-white/10'
                    : 'bg-white/[0.02] text-slate-600 border border-white/[0.04]'
                }`}
              >
                <span>Step {step}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ========================================================= */}
        {/* STEP 1: CYCLE LENGTH & BUDGET                              */}
        {/* ========================================================= */}
        {currentStep === 1 && (
          <motion.div
            key="step-1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            <div className="space-y-2">
              <h2 className="text-3xl font-display font-extrabold text-white">
                Step 1: Cycle Length &amp; Budget
              </h2>
              <p className="text-slate-400 text-sm font-medium leading-relaxed">
                Choose your monthly billing cycle. Starting budget is fixed at ₹10,000 for this runway simulation.
              </p>
            </div>

            {/* Month Cycle Selector */}
            <div className="space-y-3">
              <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 font-bold">
                Select Month Length
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setCycleDays(30)}
                  className={`p-4 rounded-2xl border text-center transition-all cursor-pointer ${
                    cycleDays === 30
                      ? 'bg-emerald-500/15 border-emerald-400/60 text-white shadow-[0_0_20px_rgba(0,245,155,0.15)] ring-1 ring-emerald-400/30'
                      : 'bg-white/[0.02] border-white/[0.06] text-slate-400 hover:text-white hover:bg-white/[0.04]'
                  }`}
                >
                  <div className="text-2xl font-display font-extrabold mb-1">30 Days</div>
                  <div className="text-xs font-mono text-slate-400">Standard Month Timeline</div>
                </button>

                <button
                  type="button"
                  onClick={() => setCycleDays(31)}
                  className={`p-4 rounded-2xl border text-center transition-all cursor-pointer ${
                    cycleDays === 31
                      ? 'bg-emerald-500/15 border-emerald-400/60 text-white shadow-[0_0_20px_rgba(0,245,155,0.15)] ring-1 ring-emerald-400/30'
                      : 'bg-white/[0.02] border-white/[0.06] text-slate-400 hover:text-white hover:bg-white/[0.04]'
                  }`}
                >
                  <div className="text-2xl font-display font-extrabold mb-1">31 Days</div>
                  <div className="text-xs font-mono text-slate-400">Extended Month Timeline</div>
                </button>
              </div>
            </div>

            {/* Monthly Budget Fixed Badge (₹10,000) */}
            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.08] flex items-center justify-between">
              <div className="flex items-center gap-3.5">
                <span className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold text-xl">
                  ₹
                </span>
                <div>
                  <div className="text-xs font-mono uppercase text-slate-400 font-bold">
                    Monthly Starting Budget
                  </div>
                  <div className="text-2xl font-display font-black text-white">
                    ₹10,000 <span className="text-xs font-mono text-slate-500 font-normal">Fixed Runway</span>
                  </div>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-slate-400">
                Hackathon Standard
              </span>
            </div>

            {/* Navigation Button */}
            <div className="pt-4 flex justify-end">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 text-black font-display font-black text-sm shadow-lg transition-all cursor-pointer flex items-center gap-2"
              >
                <span>Next: Fixed Commitments</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>
          </motion.div>
        )}

        {/* ========================================================= */}
        {/* STEP 2: CUSTOM FIXED COMMITMENTS (STARTS WITH 0)           */}
        {/* ========================================================= */}
        {currentStep === 2 && (
          <motion.div
            key="step-2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="space-y-2">
              <h2 className="text-3xl font-display font-extrabold text-white">
                Step 2: Custom Fixed Commitments
              </h2>
              <p className="text-slate-400 text-sm font-medium leading-relaxed">
                Add recurring bills and subscriptions to deduct upfront. Starts completely empty for your custom setup!
              </p>
            </div>

            {/* Quick-Suggest Chips */}
            <div>
              <div className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold mb-2">
                1-Click Quick Add Suggestions:
              </div>
              <div className="flex flex-wrap gap-2">
                {QUICK_SUGGEST_CHIPS.map((chip) => (
                  <button
                    key={chip.name}
                    type="button"
                    onClick={() => handleAddQuickSuggest(chip)}
                    className="px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-xs font-semibold text-slate-200 transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{chip.name}</span>
                    <span className="font-mono text-emerald-400">+{formatINR(chip.amount)}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Add Custom Bill Inputs */}
            <form onSubmit={handleAddBill} className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.08] space-y-3">
              <div className="text-xs font-mono uppercase tracking-wider text-slate-300 font-bold">
                Add Custom Recurring Bill:
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                <div className="sm:col-span-6">
                  <input
                    type="text"
                    placeholder="Bill Name (e.g. WiFi, Room Share)"
                    value={billName}
                    onChange={(e) => setBillName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500/50"
                  />
                </div>
                <div className="sm:col-span-4">
                  <input
                    type="number"
                    min="1"
                    placeholder="Amount (₹)"
                    value={billAmount}
                    onChange={(e) => setBillAmount(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white font-mono text-sm focus:outline-none focus:border-emerald-500/50"
                  />
                </div>
                <div className="sm:col-span-2">
                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-black font-bold text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[3]" />
                    <span>Add</span>
                  </button>
                </div>
              </div>
            </form>

            {/* Added Bills List (Starts at 0) */}
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {customBills.length === 0 ? (
                <div className="p-4 rounded-2xl bg-white/[0.01] border border-dashed border-white/10 text-center text-xs text-slate-500 font-mono">
                  No bills added yet. Use quick chips above or add custom bills.
                </div>
              ) : (
                customBills.map((bill) => (
                  <div
                    key={bill.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]"
                  >
                    <div className="flex items-center gap-2.5">
                      <Receipt className="w-4 h-4 text-emerald-400" />
                      <span className="text-sm font-semibold text-white">{bill.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-sm font-bold text-white">-{formatINR(bill.amount)}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveBill(bill.id)}
                        aria-label={`Remove bill ${bill.name}`}
                        className="p-1 text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Live Tally Showing Total Fixed Commitments */}
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between font-mono text-xs">
              <span className="text-slate-300 font-bold uppercase">Total Fixed Commitments:</span>
              <span className="text-emerald-400 font-black text-sm">{formatINR(totalCommitments)}</span>
            </div>

            {/* Navigation Buttons */}
            <div className="pt-2 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="px-4 py-2.5 rounded-xl text-xs font-mono text-slate-400 hover:text-white transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>

              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 text-black font-display font-black text-sm shadow-lg transition-all cursor-pointer flex items-center gap-2"
              >
                <span>Next: Savings Goal</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>
          </motion.div>
        )}

        {/* ========================================================= */}
        {/* STEP 3: EMERGENCY SAVINGS GOAL                             */}
        {/* ========================================================= */}
        {currentStep === 3 && (
          <motion.div
            key="step-3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="space-y-2">
              <h2 className="text-3xl font-display font-extrabold text-white">
                Step 3: Emergency Savings Goal
              </h2>
              <p className="text-slate-400 text-sm font-medium leading-relaxed">
                Choose your locked savings vault shield. Protects you against unexpected life shocks.
              </p>
            </div>

            {/* Savings Goal Slider (₹500 to ₹2,500, default ₹1,500) */}
            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.08] space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase text-slate-400 font-bold">
                  Locked Savings Vault Target
                </span>
                <span className="text-2xl font-display font-black text-emerald-400">
                  {formatINR(savingsGoal)}
                </span>
              </div>

              <input
                type="range"
                aria-label="Emergency Savings Goal Slider"
                min="500"
                max="2500"
                step="100"
                value={savingsGoal}
                onChange={(e) => setSavingsGoal(Number(e.target.value))}
                className="w-full h-2.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400 focus:outline-none"
              />

              <div className="flex justify-between text-[11px] font-mono text-slate-500">
                <span>Min: ₹500</span>
                <span className="text-emerald-400 font-bold">Recommended: ₹1,500</span>
                <span>Max: ₹2,500</span>
              </div>
            </div>

            {/* Full Runway Math Summary */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-950/20 via-teal-950/20 to-cyan-950/20 border border-emerald-500/20 space-y-3">
              <div className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold">
                Runway Mathematical Breakdown:
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs font-mono pt-1">
                <div>
                  <span className="text-slate-400">Total Budget:</span>{' '}
                  <span className="text-white font-bold">₹10,000</span>
                </div>
                <div>
                  <span className="text-slate-400">Cycle:</span>{' '}
                  <span className="text-white font-bold">{cycleDays} Days</span>
                </div>
                <div>
                  <span className="text-slate-400">Fixed Commitments:</span>{' '}
                  <span className="text-amber-400 font-bold">-{formatINR(totalCommitments)}</span>
                </div>
                <div>
                  <span className="text-slate-400">Locked Vault:</span>{' '}
                  <span className="text-violet-400 font-bold">-{formatINR(savingsGoal)}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-white/[0.08] flex items-center justify-between">
                <div>
                  <div className="text-[11px] font-mono uppercase text-slate-400">Starting Liquid Balance</div>
                  <div className="text-xl font-display font-black text-emerald-400">{formatINR(startingLiquidBalance)}</div>
                </div>

                <div className="text-right">
                  <div className="text-[11px] font-mono uppercase text-slate-400">Starting Daily Safe Spend</div>
                  <div className="text-xl font-display font-black text-white">{formatINR(dailyAllowance)}/day</div>
                </div>
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="pt-2 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="px-4 py-2.5 rounded-xl text-xs font-mono text-slate-400 hover:text-white transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>

              <button
                type="button"
                onClick={handleLaunch}
                data-testid="enter-dashboard-btn"
                className="px-7 py-4 rounded-2xl bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 hover:from-emerald-300 hover:to-cyan-300 text-black font-display font-black text-sm shadow-[0_0_30px_rgba(0,245,155,0.35)] transition-all cursor-pointer flex items-center gap-2"
              >
                <span>Launch Live Dashboard ⚡</span>
              </button>
            </div>
          </motion.div>
        )}

      </motion.div>

    </div>
  );
};
