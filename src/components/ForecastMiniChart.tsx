import React, { useMemo } from 'react';
import { ShieldCheck, AlertTriangle, TrendingDown, Sparkles } from 'lucide-react';
import { formatINR } from '../utils/financeEngine';

interface ForecastMiniChartProps {
  currentDay: number;
  totalBudget: number;
  currentBalance: number;
  savingsGoal: number;
  depletionDay: number;
  isSafeToMonthEnd: boolean;
  dailyAllowance: number;
}

export const ForecastMiniChart: React.FC<ForecastMiniChartProps> = ({
  currentDay,
  totalBudget = 10000,
  currentBalance,
  savingsGoal = 1500,
  depletionDay = 30,
  isSafeToMonthEnd,
  dailyAllowance,
}) => {
  const clampedDay = Math.min(30, Math.max(1, currentDay));

  // Chart dimensions
  const svgWidth = 540;
  const svgHeight = 200;
  const padLeft = 55;
  const padRight = 20;
  const padTop = 20;
  const padBottom = 35;
  const plotW = svgWidth - padLeft - padRight;
  const plotH = svgHeight - padTop - padBottom;

  const getX = (day: number) => padLeft + ((day - 1) / 29) * plotW;
  const getY = (val: number) => {
    const clampedVal = Math.max(0, Math.min(totalBudget, val));
    return padTop + plotH - (clampedVal / totalBudget) * plotH;
  };

  // 1. Ideal Curve points (Day 1: totalBudget -> Day 30: savingsGoal)
  const idealPoints = useMemo(() => {
    const pts: { day: number; x: number; y: number; val: number }[] = [];
    for (let d = 1; d <= 30; d++) {
      const val = totalBudget - ((totalBudget - savingsGoal) / 29) * (d - 1);
      pts.push({ day: d, x: getX(d), y: getY(val), val });
    }
    return pts;
  }, [totalBudget, savingsGoal]);

  const idealPathD = useMemo(() => {
    return idealPoints.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
  }, [idealPoints]);

  // 2. Projected Curve points
  const projectedPoints = useMemo(() => {
    const pts: { day: number; x: number; y: number; val: number }[] = [];

    for (let d = 1; d <= 30; d++) {
      let val = currentBalance;
      if (d <= clampedDay) {
        // Interpolate past from totalBudget to currentBalance
        if (clampedDay === 1) {
          val = currentBalance;
        } else {
          val = totalBudget - ((totalBudget - currentBalance) / (clampedDay - 1)) * (d - 1);
        }
      } else {
        // Future projection
        if (isSafeToMonthEnd) {
          const daysLeft = Math.max(1, 30 - clampedDay);
          const endVal = Math.max(savingsGoal, currentBalance - (dailyAllowance * daysLeft));
          val = currentBalance - ((currentBalance - endVal) / daysLeft) * (d - clampedDay);
        } else {
          // Depletes early at depletionDay
          if (d >= depletionDay) {
            val = 0;
          } else {
            const daysToCrash = Math.max(1, depletionDay - clampedDay);
            val = currentBalance - (currentBalance / daysToCrash) * (d - clampedDay);
          }
        }
      }
      pts.push({ day: d, x: getX(d), y: getY(val), val });
    }
    return pts;
  }, [clampedDay, totalBudget, currentBalance, savingsGoal, depletionDay, isSafeToMonthEnd, dailyAllowance]);

  const projectedLineD = useMemo(() => {
    return projectedPoints.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
  }, [projectedPoints]);

  const projectedAreaD = useMemo(() => {
    if (projectedPoints.length === 0) return '';
    const first = projectedPoints[0];
    const last = projectedPoints[projectedPoints.length - 1];
    const baseY = (padTop + plotH).toFixed(1);
    return `${projectedLineD} L ${last.x.toFixed(1)} ${baseY} L ${first.x.toFixed(1)} ${baseY} Z`;
  }, [projectedLineD, projectedPoints, padTop, plotH]);

  const currentPt = projectedPoints[clampedDay - 1] || projectedPoints[0];
  const crashPt = !isSafeToMonthEnd && depletionDay <= 30 ? projectedPoints[depletionDay - 1] : null;

  return (
    <div className="rounded-2xl bg-slate-900/70 border border-slate-800/80 backdrop-blur-xl p-5 sm:p-6 shadow-xl space-y-4">
      {/* Header with Title and Forecast Badge */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded bg-cyan-500/15 border border-cyan-500/30 text-[10px] font-mono font-extrabold text-cyan-400 uppercase tracking-wider">
              [30-DAY FLIGHT TRAJECTORY]
            </span>
          </div>
          <h3 className="text-lg font-display font-extrabold text-white">
            30-Day Monthly Forecast Trajectory
          </h3>
        </div>

        {/* Dynamic Forecast Badge */}
        <div>
          {isSafeToMonthEnd ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold shadow-[0_0_15px_rgba(16,185,129,0.2)]">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Monthly Forecast: On Track for Month-End</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-400 text-xs font-mono font-bold shadow-[0_0_15px_rgba(244,63,94,0.2)] animate-pulse">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Monthly Forecast: Depletion on Day {depletionDay}</span>
            </span>
          )}
        </div>
      </div>

      {/* SVG Chart */}
      <div className="relative w-full overflow-hidden">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-auto overflow-visible select-none"
        >
          <defs>
            {/* Area Gradient */}
            <linearGradient id="projectedGrad" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="0%"
                stopColor={isSafeToMonthEnd ? '#10B981' : '#F43F5E'}
                stopOpacity="0.28"
              />
              <stop
                offset="100%"
                stopColor={isSafeToMonthEnd ? '#10B981' : '#F43F5E'}
                stopOpacity="0.0"
              />
            </linearGradient>

            {/* Ideal Glow Filter */}
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Grid lines */}
          {[10000, 5000, 1500, 0].map((level) => {
            const y = getY(level);
            return (
              <g key={level}>
                <line
                  x1={padLeft}
                  y1={y}
                  x2={svgWidth - padRight}
                  y2={y}
                  stroke="rgba(51, 65, 85, 0.4)"
                  strokeDasharray="2 3"
                />
                <text
                  x={padLeft - 8}
                  y={y + 3.5}
                  textAnchor="end"
                  className="text-[9px] font-mono fill-slate-400 font-medium"
                >
                  {level === 10000 ? '₹10k' : level === 5000 ? '₹5k' : level === 1500 ? '₹1.5k' : '₹0'}
                </text>
              </g>
            );
          })}

          {/* X Axis Ticks (Days 1, 8, 15, 22, 30) */}
          {[1, 8, 15, 22, 30].map((d) => {
            const x = getX(d);
            return (
              <g key={d}>
                <line
                  x1={x}
                  y1={padTop + plotH}
                  x2={x}
                  y2={padTop + plotH + 5}
                  stroke="rgba(51, 65, 85, 0.6)"
                />
                <text
                  x={x}
                  y={padTop + plotH + 18}
                  textAnchor="middle"
                  className="text-[9px] font-mono fill-slate-400 font-medium"
                >
                  Day {d}
                </text>
              </g>
            );
          })}

          {/* Projected Area */}
          <path d={projectedAreaD} fill="url(#projectedGrad)" />

          {/* Ideal Burn Trajectory Line (Dashed Cyan) */}
          <path
            d={idealPathD}
            fill="none"
            stroke="#06B6D4"
            strokeWidth="2"
            strokeDasharray="5 5"
            strokeOpacity="0.85"
          />

          {/* Projected Burn Runway Line (Solid Mint or Crimson) */}
          <path
            d={projectedLineD}
            fill="none"
            stroke={isSafeToMonthEnd ? '#10B981' : '#F43F5E'}
            strokeWidth="2.5"
            filter="url(#glow)"
          />

          {/* Current Day Vertical Indicator Line */}
          <line
            x1={currentPt.x}
            y1={padTop}
            x2={currentPt.x}
            y2={padTop + plotH}
            stroke="rgba(255, 255, 255, 0.3)"
            strokeDasharray="2 2"
          />

          {/* Current Day Point Marker with Pulse Ring */}
          <circle
            cx={currentPt.x}
            cy={currentPt.y}
            r="7"
            fill="none"
            stroke={isSafeToMonthEnd ? '#10B981' : '#F43F5E'}
            strokeWidth="1.5"
            className="animate-ping"
          />
          <circle
            cx={currentPt.x}
            cy={currentPt.y}
            r="4.5"
            fill="#FFFFFF"
            stroke={isSafeToMonthEnd ? '#10B981' : '#F43F5E'}
            strokeWidth="2.5"
          />

          {/* Early Crash Point Marker if applicable */}
          {crashPt && (
            <g>
              <circle
                cx={crashPt.x}
                cy={crashPt.y}
                r="6"
                fill="#F43F5E"
                stroke="#FFFFFF"
                strokeWidth="2"
              />
              <text
                x={crashPt.x}
                y={crashPt.y - 10}
                textAnchor="middle"
                className="text-[10px] font-mono font-bold fill-rose-400"
              >
                Depletion (Day {depletionDay})
              </text>
            </g>
          )}
        </svg>
      </div>

      {/* Legend & Summary Footer */}
      <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center justify-between text-xs font-mono text-slate-300 gap-3">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="w-4 h-0.5 border-t-2 border-dashed border-cyan-400 inline-block" />
            <span className="text-[11px] text-slate-300">
              Ideal Burn Trajectory <span className="text-slate-400">(₹10k → ₹1.5k)</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`w-4 h-0.5 inline-block ${
                isSafeToMonthEnd ? 'bg-emerald-400 shadow-[0_0_8px_#10B981]' : 'bg-rose-400 shadow-[0_0_8px_#F43F5E]'
              }`}
            />
            <span className="text-[11px] text-slate-300">
              Projected Burn Runway <span className="text-slate-400">({formatINR(currentBalance)} now)</span>
            </span>
          </div>
        </div>

        <div className="text-[11px] text-slate-400 font-mono">
          Live Point: <strong className="text-white">Day {clampedDay}</strong> • Balance:{' '}
          <strong className={isSafeToMonthEnd ? 'text-emerald-400' : 'text-rose-400'}>
            {formatINR(currentBalance)}
          </strong>
        </div>
      </div>
    </div>
  );
};
