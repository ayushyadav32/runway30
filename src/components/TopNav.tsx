import React from 'react';
import { motion } from 'framer-motion';
import { Zap, RotateCcw, Plus, ChevronLeft, ChevronRight, ShieldCheck, AlertTriangle, Flame, Dices } from 'lucide-react';
import { FinancialState, SimulationMetrics } from '../types/finance';

interface TopNavProps {
  state: FinancialState;
  metrics: SimulationMetrics;
  onDayChange: (newDay: number) => void;
  onOpenAddModal: () => void;
  onOpenHealthModal: () => void;
  onTriggerShock: () => void;
  onReset: () => void;
  onResetOnboarding?: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  state,
  metrics,
  onDayChange,
  onOpenAddModal,
  onOpenHealthModal,
  onTriggerShock,
  onReset,
  onResetOnboarding,
}) => {
  const { currentDay } = state;
  const { financialHealthScore, riskLevel } = metrics;

  // Determine health badge colors based on riskLevel
  const getHealthBadgeStyle = () => {
    switch (riskLevel) {
      case 'LOW':
        return {
          bg: 'bg-emerald-500/10 hover:bg-emerald-500/20',
          border: 'border-emerald-500/30 hover:border-emerald-500/50',
          text: 'text-emerald-400',
          dot: 'bg-emerald-400 shadow-[0_0_10px_#00F59B]',
          label: 'CRUISE',
          icon: ShieldCheck,
        };
      case 'MODERATE':
        return {
          bg: 'bg-amber-500/10 hover:bg-amber-500/20',
          border: 'border-amber-500/30 hover:border-amber-500/50',
          text: 'text-amber-400',
          dot: 'bg-amber-400 shadow-[0_0_10px_#FFB800]',
          label: 'CAUTION',
          icon: AlertTriangle,
        };
      case 'CRITICAL':
      default:
        return {
          bg: 'bg-rose-500/10 hover:bg-rose-500/20',
          border: 'border-rose-500/30 hover:border-rose-500/50',
          text: 'text-rose-400',
          dot: 'bg-rose-400 shadow-[0_0_10px_#FF2A6D]',
          label: 'MAYDAY',
          icon: Flame,
        };
    }
  };

  const healthStyle = getHealthBadgeStyle();
  const HealthIcon = healthStyle.icon;

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-[#07090e]/80 border-b border-white/[0.07]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 py-3 flex items-center justify-between gap-4">
        
        {/* Brand Logo & Gen-Z Pill */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 via-cyan-500/15 to-violet-500/20 border border-emerald-500/40 shadow-glow-emerald">
            <Zap className="w-5 h-5 text-emerald-400" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 pulse-ring-glow" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-display font-black text-xl tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-slate-400">
                RUNWAY<span className="text-emerald-400">30</span>
              </span>
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-white/[0.06] text-emerald-300 border border-emerald-500/20">
                <span>{state.userAvatar || '⚡'}</span>
                <span>{state.userTag || '@pilot'}</span>
              </span>
            </div>
            <p className="text-[11px] font-medium text-slate-400 hidden sm:block">
              Burn rate &amp; safe-to-spend cockpit ({state.cycleDays || 30}d cycle)
            </p>
          </div>
        </div>

        {/* Center: Interactive Day Scrubber */}
        <div className="flex items-center gap-2 sm:gap-3 bg-[#0d111a]/90 border border-white/10 rounded-2xl px-3 py-1.5 shadow-inner">
          <button
            onClick={() => onDayChange(Math.max(1, currentDay - 1))}
            disabled={currentDay <= 1}
            aria-label="Previous day"
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="flex flex-col items-center min-w-[120px] sm:min-w-[140px]">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] sm:text-xs font-mono font-bold text-slate-400">DAY</span>
              <span className="text-base font-display font-extrabold text-white">
                {currentDay}
              </span>
              <span className="text-xs font-mono text-slate-500">/ {state.cycleDays || 30}</span>
            </div>
            
            {/* Interactive Top Slider Scrubber */}
            <input
              type="range"
              min="1"
              max={state.cycleDays || 30}
              value={currentDay}
              aria-label="Top Day Scrubber"
              onChange={(e) => onDayChange(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-emerald-400 focus:outline-none border border-white/5 mt-0.5"
            />
          </div>

          <button
            onClick={() => onDayChange(Math.min(state.cycleDays || 30, currentDay + 1))}
            disabled={currentDay >= (state.cycleDays || 30)}
            aria-label="Next day"
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Right Actions: Shock Button, Health Score Pill & Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Prominent Glowing Life Shock Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onTriggerShock}
            data-testid="life-shock-btn"
            className="flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/20 via-rose-500/20 to-purple-500/20 hover:from-amber-500/30 hover:to-rose-500/30 border border-amber-500/50 text-amber-200 font-bold text-xs font-sans shadow-[0_0_15px_-2px_rgba(255,184,0,0.35)] transition-all cursor-pointer"
            title="Roll for Chaos: Simulate an Unexpected Life Shock Event"
          >
            <span className="text-sm">🎲</span>
            <span className="hidden sm:inline">Roll for Chaos</span>
            <span className="sm:hidden">Chaos</span>
          </motion.button>

          {/* Health Score Pill */}
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={onOpenHealthModal}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all cursor-pointer ${healthStyle.bg} ${healthStyle.border}`}
            title="Click for Financial Health Diagnostic breakdown"
          >
            <span className={`w-2 h-2 rounded-full ${healthStyle.dot}`} />
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-mono font-bold text-slate-300 hidden md:inline">HEALTH</span>
              <span data-testid="metric-health-score" className={`text-sm font-display font-black ${healthStyle.text}`}>
                {financialHealthScore}
              </span>
              <span className="text-[10px] font-mono text-slate-500 hidden sm:inline">/1000</span>
              <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded font-mono ${healthStyle.text} bg-white/5`}>
                {healthStyle.label}
              </span>
            </div>
            <HealthIcon className={`w-3.5 h-3.5 ${healthStyle.text} ml-0.5 hidden xs:block`} />
          </motion.button>

          {/* Quick Add Expense */}
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={onOpenAddModal}
            data-testid="nav-log-spend"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-[#07090e] font-bold text-xs font-sans shadow-glow-emerald hover:brightness-110 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span>+ Log Spend</span>
          </motion.button>

          {/* Reset simulation / reconfigure */}
          <button
            onClick={onResetOnboarding || onReset}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 border border-white/5 transition-all cursor-pointer flex items-center gap-1"
            title="Reconfigure Setup / Reset to Onboarding Wizard"
          >
            <RotateCcw className="w-4 h-4" />
            <span className="hidden xl:inline text-[10px] font-mono">Reset</span>
          </button>
        </div>

      </div>
    </header>
  );
};
