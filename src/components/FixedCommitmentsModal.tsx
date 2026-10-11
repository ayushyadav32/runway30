import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CalendarCheck, Plus, Check, Power, Music, Wifi, Dumbbell, ShieldCheck, ArrowRight } from 'lucide-react';
import { SubscriptionItem } from '../types/finance';
import { formatINR } from '../utils/financeEngine';

interface FixedCommitmentsModalProps {
  subscriptions: SubscriptionItem[];
  daysRemaining: number;
  onToggleSubscription: (id: string) => void;
  onAddSubscription: (name: string, amount: number, dueDay: number, category: string) => void;
  onClose: () => void;
}

export const FixedCommitmentsModal: React.FC<FixedCommitmentsModalProps> = ({
  subscriptions,
  daysRemaining,
  onToggleSubscription,
  onAddSubscription,
  onClose,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [newDueDay, setNewDueDay] = useState('15');
  const [newCategory, setNewCategory] = useState('Streaming');

  const totalFixed = subscriptions
    .filter((s) => s.active)
    .reduce((sum, s) => sum + s.amount, 0);

  const getSubIcon = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes('spotify') || lower.includes('music') || lower.includes('audio')) {
      return <Music className="w-4 h-4 text-emerald-400" />;
    }
    if (lower.includes('wifi') || lower.includes('internet') || lower.includes('broadband')) {
      return <Wifi className="w-4 h-4 text-cyan-400" />;
    }
    if (lower.includes('gym') || lower.includes('fitness') || lower.includes('cult')) {
      return <Dumbbell className="w-4 h-4 text-violet-400" />;
    }
    return <CalendarCheck className="w-4 h-4 text-pink-400" />;
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newAmount) return;
    onAddSubscription(newName, Number(newAmount), Number(newDueDay) || 15, newCategory);
    setNewName('');
    setNewAmount('');
    setShowAddForm(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-lg rounded-3xl p-6 sm:p-7 bg-[#0d121c] border border-white/10 shadow-2xl overflow-hidden"
      >
        {/* Glow */}
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-cyan-600/10 blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400">
              <CalendarCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-display font-extrabold text-white">
                Fixed Commitments &amp; Autopays
              </h2>
              <p className="text-xs text-slate-400">
                Monthly recurring bills locked from your balance
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

        {/* Total Summary Banner */}
        <div className="p-4 rounded-2xl bg-cyan-950/20 border border-cyan-500/30 flex items-center justify-between mb-5">
          <div>
            <div className="text-[10px] font-mono uppercase text-cyan-300 font-bold">
              Total Active Fixed Commitments
            </div>
            <div className="text-2xl font-display font-extrabold text-white mt-0.5">
              {formatINR(totalFixed)}
            </div>
          </div>
          <div className="text-right">
            <div className="text-[10px] font-mono text-slate-400">
              Daily impact:
            </div>
            <div className="text-xs font-mono font-bold text-cyan-300">
              -{formatINR(totalFixed / Math.max(1, daysRemaining))}/day
            </div>
          </div>
        </div>

        {/* Subscriptions List with Toggles */}
        <div className="space-y-3 mb-5 max-h-60 overflow-y-auto pr-1">
          {subscriptions.map((sub) => {
            const dailyImpact = sub.amount / Math.max(1, daysRemaining);

            return (
              <div
                key={sub.id}
                className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between ${
                  sub.active
                    ? 'bg-white/[0.03] border-white/10'
                    : 'bg-white/[0.01] border-white/5 opacity-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-white/5 border border-white/10">
                    {getSubIcon(sub.name)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-white">
                        {sub.name}
                      </span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-white/5 text-slate-400">
                        Due Day {sub.dueDay}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5 font-mono">
                      {sub.category} • {formatINR(sub.amount)} / month
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => onToggleSubscription(sub.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                      sub.active
                        ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 hover:bg-rose-500/15 hover:border-rose-500/30 hover:text-rose-300'
                        : 'bg-white/5 border border-white/10 text-slate-400 hover:bg-emerald-500/15 hover:text-emerald-300'
                    }`}
                    title={sub.active ? 'Click to Pause this commitment' : 'Click to Reactivate'}
                  >
                    <Power className="w-3 h-3" />
                    <span>{sub.active ? 'Active' : 'Paused'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Add subscription toggle */}
        {!showAddForm ? (
          <button
            onClick={() => setShowAddForm(true)}
            className="w-full py-2.5 rounded-xl border border-dashed border-white/20 text-xs font-bold text-slate-300 hover:border-cyan-400 hover:text-cyan-400 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Custom Subscription</span>
          </button>
        ) : (
          <form onSubmit={handleAddSubmit} className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="Name (e.g. Netflix)"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                required
                className="px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-white placeholder-slate-500"
              />
              <input
                type="number"
                placeholder="Amount (₹)"
                value={newAmount}
                onChange={(e) => setNewAmount(e.target.value)}
                required
                className="px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-white placeholder-slate-500 font-mono"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 py-2 rounded-xl bg-cyan-500 text-black font-bold text-xs"
              >
                Save Subscription
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-3 py-2 rounded-xl bg-white/5 text-slate-400 text-xs"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        <div className="mt-5 pt-4 border-t border-white/5 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>

      </motion.div>
    </div>
  );
};
