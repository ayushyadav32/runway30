import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, ArrowDownCircle, ArrowUpCircle, Calendar } from 'lucide-react';
import { TransactionCategory } from '../types/finance';

interface AddTransactionModalProps {
  currentDay: number;
  maxDays?: number;
  onAddTransaction: (
    title: string, 
    amount: number, 
    category: TransactionCategory, 
    day: number, 
    note?: string
  ) => void;
  onTopupBalance: (amount: number, note?: string) => void;
  onClose: () => void;
  initialMode?: 'expense' | 'topup';
}

const CATEGORIES: { label: string; value: TransactionCategory; emoji: string }[] = [
  { label: 'Food', value: 'Food', emoji: '🍔' },
  { label: 'Travel', value: 'Travel', emoji: '🚇' },
  { label: 'Hangout', value: 'Hangout', emoji: '☕' },
  { label: 'Shopping', value: 'Shopping', emoji: '🛒' },
  { label: 'Utility', value: 'Utility', emoji: '💡' },
  { label: 'Health', value: 'Health', emoji: '💊' },
  { label: 'Emergency', value: 'Emergency', emoji: '🚨' },
  { label: 'Subscriptions', value: 'Subscriptions', emoji: '📱' },
];

export const AddTransactionModal: React.FC<AddTransactionModalProps> = ({
  currentDay,
  maxDays = 30,
  onAddTransaction,
  onTopupBalance,
  onClose,
  initialMode = 'expense',
}) => {
  const [mode, setMode] = useState<'expense' | 'topup'>(initialMode);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<TransactionCategory>('Food');
  const [selectedDay, setSelectedDay] = useState<number>(currentDay);
  const [note, setNote] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = Number(amount);
    if (!numAmount || numAmount <= 0) return;

    if (mode === 'expense') {
      onAddTransaction(
        title || 'Manual Spend', 
        numAmount, 
        category, 
        selectedDay, 
        note
      );
    } else {
      onTopupBalance(numAmount, note || 'Allowance Top-Up');
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-lg rounded-3xl p-6 sm:p-7 bg-[#0d121c] border border-white/10 shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
      >
        {/* Glow Background */}
        <div className={`absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl pointer-events-none ${
          mode === 'expense' ? 'bg-rose-600/10' : 'bg-emerald-600/10'
        }`} />

        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-xl border ${
              mode === 'expense' 
                ? 'bg-rose-500/15 border-rose-500/30 text-rose-400' 
                : 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
            }`}>
              {mode === 'expense' ? <ArrowDownCircle className="w-5 h-5" /> : <ArrowUpCircle className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-lg font-display font-extrabold text-white">
                {mode === 'expense' ? 'Log New Spend' : 'Deposit / Top-up'}
              </h2>
              <p className="text-xs text-slate-400">
                {mode === 'expense' ? 'Record expenditure to recalculate runway' : 'Add liquid funds to monthly balance'}
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

        {/* Mode Switcher */}
        <div className="flex p-1 bg-black/40 rounded-xl border border-white/5 mb-5">
          <button
            type="button"
            onClick={() => setMode('expense')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              mode === 'expense'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Expense Spend
          </button>
          <button
            type="button"
            onClick={() => setMode('topup')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              mode === 'topup'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Top-up Balance
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title input */}
          <div>
            <label className="block text-[11px] font-mono font-bold text-slate-300 mb-1 uppercase">
              {mode === 'expense' ? 'Expense Title' : 'Deposit Source'}
            </label>
            <input
              type="text"
              required
              autoFocus
              placeholder={mode === 'expense' ? 'e.g., Swiggy Pizza, Metro Card Recharge' : 'e.g., Freelance Payout, Gift Cash'}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-rose-500/50"
            />
          </div>

          {/* Amount & Day Selector Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-mono font-bold text-slate-300 mb-1 uppercase">
                Amount (₹)
              </label>
              <input
                type="number"
                min="1"
                step="1"
                required
                placeholder="450"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white font-mono text-sm focus:outline-none focus:border-rose-500/50"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono font-bold text-slate-300 mb-1 uppercase flex items-center justify-between">
                <span>Timeline Day</span>
                <span className="text-slate-500 font-normal">Day {selectedDay}</span>
              </label>
              <div className="relative flex items-center">
                <select
                  value={selectedDay}
                  onChange={(e) => setSelectedDay(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-sm focus:outline-none focus:border-rose-500/50 font-mono cursor-pointer"
                >
                  {Array.from({ length: maxDays }, (_, i) => i + 1).map((d) => (
                    <option key={d} value={d}>
                      Day {d} {d === currentDay ? '(Current)' : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Category Picker Chips */}
          {mode === 'expense' && (
            <div>
              <label className="block text-[11px] font-mono font-bold text-slate-300 mb-2 uppercase">
                Select Category:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {CATEGORIES.map((cat) => {
                  const isSelected = category === cat.value;
                  return (
                    <button
                      key={cat.value}
                      type="button"
                      onClick={() => setCategory(cat.value)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-rose-500/20 border-rose-500/60 text-white shadow-glow-rose ring-1 ring-rose-400/30'
                          : 'bg-slate-900/60 border-white/5 text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                      }`}
                    >
                      <span className="text-base">{cat.emoji}</span>
                      <span>{cat.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Optional Note */}
          <div>
            <label className="block text-[11px] font-mono font-bold text-slate-300 mb-1 uppercase">
              Note (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g., Split with Kabir"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-white/30"
            />
          </div>

          {/* Action buttons */}
          <div className="pt-3 flex justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white text-xs font-bold transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`px-5 py-2.5 rounded-xl font-bold text-xs transition-all shadow-md cursor-pointer ${
                mode === 'expense'
                  ? 'bg-rose-500 hover:bg-rose-400 text-white shadow-glow-rose'
                  : 'bg-emerald-400 hover:bg-emerald-300 text-black shadow-glow-emerald'
              }`}
            >
              {mode === 'expense' 
                ? `Record Spend ${amount ? `(-₹${Number(amount).toLocaleString('en-IN')})` : ''}` 
                : `Deposit Funds ${amount ? `(+₹${Number(amount).toLocaleString('en-IN')})` : ''}`}
            </button>
          </div>
        </form>

      </motion.div>
    </div>
  );
};
