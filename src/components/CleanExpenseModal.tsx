import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, ArrowDownRight, Plus } from 'lucide-react';
import { TransactionCategory } from '../types/finance';
import { formatINR } from '../utils/financeEngine';

interface CleanExpenseModalProps {
  currentDay: number;
  isOpen: boolean;
  onClose: () => void;
  onAddExpense: (title: string, amount: number, category: TransactionCategory) => void;
}

const CATEGORIES: { label: string; value: TransactionCategory; emoji: string }[] = [
  { label: 'Food', value: 'Food', emoji: '🍔' },
  { label: 'Travel', value: 'Travel', emoji: '🚇' },
  { label: 'Hangout', value: 'Hangout', emoji: '☕' },
  { label: 'Shopping', value: 'Shopping', emoji: '🛒' },
  { label: 'Utility', value: 'Utility', emoji: '💡' },
  { label: 'Health', value: 'Health', emoji: '💊' },
];

export const CleanExpenseModal: React.FC<CleanExpenseModalProps> = ({
  currentDay,
  isOpen,
  onClose,
  onAddExpense,
}) => {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<TransactionCategory>('Food');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = Number(amount);
    if (!num || num <= 0) return;

    onAddExpense(title.trim() || 'Manual Spend', num, category);
    setTitle('');
    setAmount('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="relative w-full max-w-md rounded-3xl bg-[#0c101b] border border-white/10 shadow-2xl p-6 sm:p-8 overflow-hidden"
      >
        {/* Ambient Top Glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2.5">
            <span className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Plus className="w-5 h-5 stroke-[2.5]" />
            </span>
            <div>
              <h2 className="text-xl font-display font-extrabold text-white">
                Log an Expense
              </h2>
              <p className="text-xs text-slate-400">
                Instantly recalibrate your daily runway
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Title */}
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-2 font-bold">
              Expense Title
            </label>
            <input
              type="text"
              required
              autoFocus
              placeholder="e.g. Swiggy Pizza, Metro Card"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl bg-white/[0.03] border border-white/[0.08] text-white placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500/50"
            />
          </div>

          {/* Amount */}
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-2 font-bold">
              Amount (₹)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-mono text-base font-bold">
                ₹
              </span>
              <input
                type="number"
                min="1"
                step="1"
                required
                placeholder="450"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-9 pr-4 py-3 rounded-2xl bg-white/[0.03] border border-white/[0.08] text-white font-mono text-lg font-bold focus:outline-none focus:border-emerald-500/50"
              />
            </div>
          </div>

          {/* Category Picker */}
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-2 font-bold">
              Category
            </label>
            <div className="grid grid-cols-3 gap-2">
              {CATEGORIES.map((cat) => {
                const isSelected = category === cat.value;
                return (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => setCategory(cat.value)}
                    className={`flex items-center gap-1.5 justify-center py-2.5 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                      isSelected
                        ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300 shadow-sm'
                        : 'bg-white/[0.02] border-white/[0.06] text-slate-400 hover:text-slate-200 hover:bg-white/[0.05]'
                    }`}
                  >
                    <span>{cat.emoji}</span>
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Submit */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 text-black font-display font-extrabold text-sm shadow-lg shadow-emerald-500/20 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Record Spend</span>
              {amount && <span className="font-mono">(-₹{Number(amount).toLocaleString('en-IN')})</span>}
            </button>
          </div>
        </form>

      </motion.div>
    </div>
  );
};
