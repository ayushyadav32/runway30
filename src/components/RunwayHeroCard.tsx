import React from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Sparkles, Coffee, Car, Pizza, ArrowUpRight, Compass } from 'lucide-react';
import { SimulationMetrics, FinancialState } from '../types/finance';
import { formatINR } from '../utils/financeEngine';
import { FinancialCore3D } from './FinancialCore3D';

interface RunwayHeroCardProps {
  state: FinancialState;
  metrics: SimulationMetrics;
  onQuickBurn: (amount: number, title: string, category: 'Food' | 'Transit' | 'Social') => void;
  onOpenSimulator: () => void;
}

export const RunwayHeroCard: React.FC<RunwayHeroCardProps> = ({
  state,
  metrics,
  onQuickBurn,
  onOpenSimulator,
}) => {
  const { currentDay, savingsGoal, fixedCommitments } = state;
  const {
    daysRemaining,
    discretionaryPool,
    dailySafeToSpend,
    riskLevel,
    financialHealthScore,
    statusLabel,
  } = metrics;

  // 3D Card tilt motion physics
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 150, damping: 20 });
  const mouseYSpring = useSpring(y, { stiffness: 150, damping: 20 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ['5deg', '-5deg']);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ['-5deg', '5deg']);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  // Dynamic styling based on Risk Level
  const getThemeColors = () => {
    switch (riskLevel) {
      case 'LOW':
        return {
          glow: 'shadow-[0_0_50px_-10px_rgba(0,245,155,0.25)]',
          border: 'border-emerald-500/30 hover:border-emerald-400/50',
          gradientText: 'from-emerald-300 via-teal-200 to-cyan-300',
          badgeBg: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300',
          poolBg: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
          accent: '#00F59B',
        };
      case 'MODERATE':
        return {
          glow: 'shadow-[0_0_50px_-10px_rgba(255,184,0,0.25)]',
          border: 'border-amber-500/30 hover:border-amber-400/50',
          gradientText: 'from-amber-200 via-yellow-100 to-amber-300',
          badgeBg: 'bg-amber-500/15 border-amber-500/30 text-amber-300',
          poolBg: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
          accent: '#FFB800',
        };
      case 'CRITICAL':
      default:
        return {
          glow: 'shadow-[0_0_50px_-10px_rgba(255,42,109,0.3)]',
          border: 'border-rose-500/40 hover:border-rose-400/60',
          gradientText: 'from-rose-300 via-red-200 to-pink-300',
          badgeBg: 'bg-rose-500/20 border-rose-500/40 text-rose-300',
          poolBg: 'bg-rose-500/15 border-rose-500/30 text-rose-400',
          accent: '#FF2A6D',
        };
    }
  };

  const theme = getThemeColors();

  // Runway fuel gauge calculation
  const initialDiscretionary = Math.max(1, 10000 - fixedCommitments - savingsGoal);
  const fuelPct = Math.max(0, Math.min(100, Math.round((discretionaryPool / initialDiscretionary) * 100)));

  return (
    <div style={{ perspective: 1200 }} className="w-full">
      <motion.div
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          rotateX,
          rotateY,
          transformStyle: 'preserve-3d',
        }}
        className={`relative overflow-hidden rounded-3xl p-6 sm:p-8 backdrop-blur-2xl bg-gradient-to-br from-[#0e1320]/90 via-[#0a0e18]/90 to-[#07090e]/95 border transition-all duration-300 ${theme.border} ${theme.glow}`}
      >
        {/* Subtle holographic ambient glows */}
        <div 
          className="absolute -top-24 -right-24 w-72 h-72 rounded-full blur-3xl pointer-events-none opacity-20"
          style={{ background: theme.accent }}
        />
        <div className="absolute -bottom-24 -left-24 w-60 h-60 rounded-full bg-violet-600/15 blur-3xl pointer-events-none" />
        
        {/* Top Header inside Card */}
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-2">
            <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-white/5 border border-white/10 text-white">
              <Compass className="w-4 h-4 text-emerald-400" />
            </span>
            <span className="text-xs font-mono font-bold tracking-wider text-slate-300 uppercase">
              Financial Flight Deck
            </span>
            <span className="text-slate-600">•</span>
            <span className="text-xs font-mono text-slate-400">
              Day {currentDay} of {state.cycleDays || 30}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold font-mono border ${theme.badgeBg}`}>
              <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
              {statusLabel.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Main Grid: Left Metric | Center 3D WebGL Core | Right Fuel Tank */}
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          
          {/* Column 1: Daily Safe-to-Spend */}
          <div className="lg:col-span-5">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-400 font-mono">
                Daily Safe-To-Spend
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-slate-300 font-mono">
                {daysRemaining} Days Left
              </span>
            </div>

            <div className="flex items-baseline gap-3 my-1">
              <motion.h1
                key={dailySafeToSpend}
                data-testid="metric-daily-allowance"
                initial={{ scale: 0.96, opacity: 0.8 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                className={`text-4xl sm:text-6xl font-display font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r ${theme.gradientText}`}
              >
                {formatINR(dailySafeToSpend, false)}
              </motion.h1>
              <span className="text-sm sm:text-base font-bold text-slate-400 font-mono">
                / day
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-400 font-medium max-w-md mt-2 leading-relaxed">
              Discretionary pool of <span className="font-bold text-slate-200">{formatINR(discretionaryPool)}</span> safely divided across the next <span className="font-bold text-slate-200">{daysRemaining} days</span> without touching your ₹1,500 locked savings vault.
            </p>
          </div>

          {/* Column 2: Interactive 3D WebGL Financial Core */}
          <div className="lg:col-span-4 flex items-center justify-center py-2 sm:py-0">
            <FinancialCore3D
              healthScore={financialHealthScore}
              riskLevel={riskLevel}
            />
          </div>

          {/* Column 3: Runway Fuel Gauge & CTA */}
          <div className="lg:col-span-3 flex flex-col gap-3">
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-md">
              <div className="flex items-center justify-between text-xs font-mono mb-2">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  Runway Fuel Tank
                </span>
                <span className="font-bold text-white">{fuelPct}% Intact</span>
              </div>

              {/* Progress bar */}
              <div className="w-full h-2.5 rounded-full bg-slate-900 border border-white/5 overflow-hidden p-0.5">
                <motion.div
                  className="h-full rounded-full"
                  style={{
                    background: riskLevel === 'LOW' 
                      ? 'linear-gradient(90deg, #00F59B, #00F0FF)' 
                      : riskLevel === 'MODERATE' 
                      ? 'linear-gradient(90deg, #FFB800, #F59E0B)' 
                      : 'linear-gradient(90deg, #FF2A6D, #F43F5E)'
                  }}
                  initial={false}
                  animate={{ width: `${fuelPct}%` }}
                  transition={{ type: "spring", stiffness: 200, damping: 25 }}
                />
              </div>

              <div className="flex justify-between items-center mt-2.5 text-[11px] font-mono text-slate-400">
                <span>Discretionary Pool:</span>
                <span className="font-bold text-white">{formatINR(discretionaryPool)}</span>
              </div>
            </div>

            {/* Quick CTA to What-If Decision Simulator */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onOpenSimulator}
              className="flex items-center justify-between px-4 py-2.5 rounded-2xl bg-gradient-to-r from-violet-600/30 to-purple-600/20 hover:from-violet-600/40 hover:to-purple-600/30 border border-violet-500/30 text-xs font-bold text-violet-200 transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-violet-400 group-hover:rotate-12 transition-transform" />
                <span>What-If Simulator</span>
              </div>
              <ArrowUpRight className="w-4 h-4 text-violet-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </motion.button>
          </div>

        </div>

        {/* Bottom Section: Micro-Burn Fast Action Pills for Instant Feedback */}
        <div className="relative z-10 mt-6 pt-5 border-t border-white/[0.08]">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
              <span>Instant Test Micro-Spend:</span>
              <span className="text-[10px] text-slate-500 hidden sm:inline">(Deducts balance &amp; recalculates live)</span>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onQuickBurn(120, 'Cold Brew Coffee', 'Social')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-slate-200 transition-colors"
                title="Deduct ₹120 for Coffee"
              >
                <Coffee className="w-3.5 h-3.5 text-amber-400" />
                <span>☕ -₹120 Brew</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onQuickBurn(280, 'Quick Cab Ride', 'Transit')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-slate-200 transition-colors"
                title="Deduct ₹280 for Cab"
              >
                <Car className="w-3.5 h-3.5 text-cyan-400" />
                <span>🚕 -₹280 Cab</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onQuickBurn(450, 'Gourmet Dinner Split', 'Food')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-slate-200 transition-colors"
                title="Deduct ₹450 for Food"
              >
                <Pizza className="w-3.5 h-3.5 text-rose-400" />
                <span>🍕 -₹450 Feast</span>
              </motion.button>
            </div>
          </div>
        </div>

      </motion.div>
    </div>
  );
};
