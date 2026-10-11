import React from 'react';
import { motion } from 'framer-motion';
import { Sliders, Sparkles, AlertOctagon, CheckCircle2, ShieldCheck, Flame } from 'lucide-react';
import { ScenarioPreset, TEST_SCENARIOS } from '../data/scenarios';

interface ScenarioBarProps {
  activeScenarioId: string;
  onSelectScenario: (scenario: ScenarioPreset) => void;
}

export const ScenarioBar: React.FC<ScenarioBarProps> = ({
  activeScenarioId,
  onSelectScenario,
}) => {
  const getScenarioIcon = (id: string) => {
    switch (id) {
      case 'scenario-1':
        return <Sparkles className="w-3.5 h-3.5 text-cyan-400" />;
      case 'scenario-2':
        return <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />;
      case 'scenario-3':
        return <Flame className="w-3.5 h-3.5 text-rose-400" />;
      case 'scenario-4':
        return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />;
      default:
        return <Sliders className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  return (
    <div 
      data-testid="scenario-bar"
      className="w-full bg-[#0d121c]/90 border border-white/10 rounded-2xl p-2.5 sm:p-3 backdrop-blur-xl shadow-glass-card"
    >
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2.5">
        
        {/* Left Label */}
        <div className="flex items-center gap-2 px-1">
          <div className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-slate-300">
            <Sliders className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-display font-bold text-white tracking-wide">
                FAIE TEST SCENARIOS
              </span>
              <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-emerald-500/15 border border-emerald-500/30 text-emerald-300">
                1-CLICK EVAL
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-mono hidden sm:block">
              Simulate lifecycle states to verify dynamic math across all risk levels
            </p>
          </div>
        </div>

        {/* 4 Scenario Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {TEST_SCENARIOS.map((scenario, index) => {
            const isSelected = activeScenarioId === scenario.id;
            const testId = `scenario-btn-${index + 1}`;

            return (
              <motion.button
                key={scenario.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onSelectScenario(scenario)}
                data-testid={testId}
                className={`flex flex-col items-start p-2 sm:px-3 sm:py-2 rounded-xl text-left border transition-all cursor-pointer relative ${
                  isSelected
                    ? 'bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 border-emerald-400/60 text-white shadow-glow-emerald ring-1 ring-emerald-400/40'
                    : 'bg-white/[0.02] border-white/5 text-slate-300 hover:bg-white/[0.06] hover:border-white/15'
                }`}
                title={scenario.description}
              >
                <div className="flex items-center gap-1.5 w-full">
                  {getScenarioIcon(scenario.id)}
                  <span className="text-[11px] font-mono font-bold truncate">
                    {scenario.name.split(':')[1]?.trim() || scenario.name}
                  </span>
                </div>
                <span className="text-[10px] font-mono text-slate-400 mt-0.5 truncate w-full">
                  {scenario.badge}
                </span>

                {isSelected && (
                  <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                )}
              </motion.button>
            );
          })}
        </div>

      </div>
    </div>
  );
};
