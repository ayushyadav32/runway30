import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, ChevronRight, AlertCircle, Info, Sparkles, CheckCircle2 } from 'lucide-react';
import { FinancialState, SimulationMetrics } from '../types/finance';
import { formatINR } from '../utils/financeEngine';

interface TimelineVisualizerProps {
  state: FinancialState;
  metrics: SimulationMetrics;
  onDaySelect: (day: number) => void;
}

export const TimelineVisualizer: React.FC<TimelineVisualizerProps> = ({
  state,
  metrics,
  onDaySelect,
}) => {
  const { currentDay, totalBudget, currentBalance, savingsGoal, fixedCommitments } = state;
  const { daysRemaining, dailySafeToSpend, riskLevel } = metrics;

  const totalDays = state.cycleDays || 30;

  // Milestone events during the timeline
  const milestones: Record<number, { title: string; amount: number; type: 'paid' | 'due' | 'goal' }> = {
    6: { title: 'Spotify', amount: 119, type: 'paid' },
    14: { title: 'WiFi Broadband', amount: 799, type: 'due' },
    18: { title: 'Gym Membership', amount: 1282, type: 'due' },
    [totalDays]: { title: 'Month Reset', amount: 0, type: 'goal' },
  };

  // Generate days array dynamically
  const daysArray = Array.from({ length: totalDays }, (_, i) => i + 1);

  return (
    <div className="relative overflow-hidden rounded-3xl p-6 sm:p-7 backdrop-blur-xl bg-[#0d121c]/80 border border-white/10 shadow-glass-card">
      
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-display font-extrabold text-white flex items-center gap-2">
              {totalDays}-Day Runway Trajectory
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-cyan-300 font-bold">
                TIMELINE SCRUBBER
              </span>
            </h2>
            <p className="text-xs text-slate-400 font-medium">
              Click any day or drag slider to simulate passage of time
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="text-slate-400">Current Velocity:</span>
          <span className="font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
            {formatINR(dailySafeToSpend)} / day safe
          </span>
        </div>
      </div>

      {/* Main Interactive Slider Bar */}
      <div className="mb-6 px-1">
        <div className="flex justify-between items-center text-xs font-mono text-slate-400 mb-2">
          <span>Day 1 (Start)</span>
          <span className="font-bold text-white text-sm">
            Selected: <span className="text-cyan-400 font-display font-bold">Day {currentDay}</span> of {totalDays} ({daysRemaining} days left)
          </span>
          <span>Day {totalDays} (Goal)</span>
        </div>

        <div className="relative flex items-center">
          <input
            type="range"
            data-testid="day-scrubber"
            aria-label={`${totalDays}-Day Timeline Scrubber`}
            min="1"
            max={totalDays}
            value={currentDay}
            onChange={(e) => onDaySelect(Number(e.target.value))}
            className="w-full h-3 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-cyan-400 focus:outline-none border border-white/10"
          />
        </div>
      </div>

      {/* Interactive 30-Day Grid with Milestones */}
      <div className="grid grid-cols-6 sm:grid-cols-10 lg:grid-cols-15 gap-1.5 sm:gap-2 mb-4">
        {daysArray.map((day) => {
          const isCurrent = day === currentDay;
          const isPast = day < currentDay;
          const isMilestone = milestones[day];

          return (
            <motion.button
              key={day}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onDaySelect(day)}
              className={`relative flex flex-col items-center justify-center p-2 rounded-xl text-xs font-mono transition-all cursor-pointer border ${
                isCurrent
                  ? 'bg-gradient-to-b from-cyan-500/30 to-emerald-500/20 border-cyan-400 text-white shadow-glow-cyan font-bold ring-2 ring-cyan-400/30 z-10'
                  : isPast
                  ? 'bg-white/[0.03] border-white/5 text-slate-400 hover:bg-white/10'
                  : 'bg-slate-900/60 border-white/[0.06] text-slate-300 hover:border-white/20'
              }`}
            >
              <span className={`text-[11px] ${isCurrent ? 'text-cyan-300 font-black' : ''}`}>
                D{day}
              </span>

              {/* Status Indicator Dot / Milestone Marker */}
              {isCurrent ? (
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#00F0FF] mt-1" />
              ) : isMilestone ? (
                <span className={`w-1.5 h-1.5 rounded-full mt-1 ${
                  isMilestone.type === 'paid' 
                    ? 'bg-emerald-400' 
                    : isMilestone.type === 'due' 
                    ? 'bg-amber-400 animate-pulse' 
                    : 'bg-violet-400'
                }`} />
              ) : (
                <span className="w-1 h-1 rounded-full bg-slate-700 mt-1" />
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Milestone Legend & Upcoming Autopays */}
      <div className="pt-4 border-t border-white/5 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
        <div className="flex items-center gap-4 flex-wrap text-slate-400">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Day 6 Spotify (₹119) Paid</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span>Day 14 WiFi (₹799) Due</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span>Day 18 Cult Gym (₹1,282) Due</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-violet-400" />
            <span>Day 30 Vault Shield (₹1,500)</span>
          </div>
        </div>

        <div className="text-slate-400">
          Runway status: <span className="text-white font-bold">{riskLevel} RISK</span>
        </div>
      </div>

    </div>
  );
};
