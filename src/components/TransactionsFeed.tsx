import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Receipt, 
  Utensils, 
  Car, 
  PartyPopper, 
  Tv, 
  AlertCircle, 
  Plus, 
  Trash2, 
  DollarSign,
  Coffee,
  ShoppingBag,
  Lightbulb,
  HeartPulse
} from 'lucide-react';
import { Transaction, TransactionCategory } from '../types/finance';
import { formatINR } from '../utils/financeEngine';

interface TransactionsFeedProps {
  transactions: Transaction[];
  onDeleteTransaction: (id: string) => void;
  onOpenAddModal: () => void;
}

export const TransactionsFeed: React.FC<TransactionsFeedProps> = ({
  transactions,
  onDeleteTransaction,
  onOpenAddModal,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Category Icon & Color map
  const getCategoryMeta = (cat: TransactionCategory) => {
    switch (cat) {
      case 'Food':
        return {
          icon: Utensils,
          color: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
        };
      case 'Travel':
      case 'Transit':
        return {
          icon: Car,
          color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
        };
      case 'Hangout':
        return {
          icon: Coffee,
          color: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
        };
      case 'Shopping':
        return {
          icon: ShoppingBag,
          color: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
        };
      case 'Utility':
        return {
          icon: Lightbulb,
          color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
        };
      case 'Health':
        return {
          icon: HeartPulse,
          color: 'text-red-400 bg-red-500/10 border-red-500/20',
        };
      case 'Social':
        return {
          icon: PartyPopper,
          color: 'text-violet-400 bg-violet-500/10 border-violet-500/20',
        };
      case 'Subscriptions':
        return {
          icon: Tv,
          color: 'text-pink-400 bg-pink-500/10 border-pink-500/20',
        };
      case 'Emergency':
        return {
          icon: AlertCircle,
          color: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
        };
      case 'Income':
      default:
        return {
          icon: DollarSign,
          color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
        };
    }
  };

  // Filter transactions
  const filtered = selectedCategory === 'All'
    ? transactions
    : transactions.filter((t) => t.category === selectedCategory);

  // Compute category totals
  const categoryTotals: Record<string, number> = {};
  transactions.forEach((tx) => {
    categoryTotals[tx.category] = (categoryTotals[tx.category] || 0) + tx.amount;
  });

  const categoriesList: TransactionCategory[] = [
    'Food', 
    'Travel', 
    'Hangout', 
    'Shopping', 
    'Utility', 
    'Health', 
    'Emergency'
  ];

  return (
    <div className="relative overflow-hidden rounded-3xl p-6 sm:p-7 backdrop-blur-xl bg-[#0d121c]/80 border border-white/10 shadow-glass-card">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
            <Receipt className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-display font-extrabold text-white flex items-center gap-2">
              Transaction Feed &amp; Burn Trail
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-emerald-300 font-bold">
                {transactions.length} ENTRIES
              </span>
            </h2>
            <p className="text-xs text-slate-400 font-medium">
              Real-time audit log of your monthly cash flow
            </p>
          </div>
        </div>

        <button
          onClick={onOpenAddModal}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-slate-200 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4 text-emerald-400" />
          <span>New Expense</span>
        </button>
      </div>

      {/* Category Spend Pills Breakdown */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 mb-6">
        {categoriesList.map((cat) => {
          const total = categoryTotals[cat] || 0;
          const meta = getCategoryMeta(cat);
          const Icon = meta.icon;
          const isSelected = selectedCategory === cat;

          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(isSelected ? 'All' : cat)}
              className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                isSelected
                  ? 'bg-white/10 border-white/30 ring-1 ring-white/20'
                  : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.05]'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className={`p-1.5 rounded-lg border text-xs ${meta.color}`}>
                  <Icon className="w-3.5 h-3.5" />
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  {cat}
                </span>
              </div>
              <div className="text-sm font-display font-bold text-white">
                {formatINR(total)}
              </div>
            </button>
          );
        })}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-4 scrollbar-none">
        <button
          onClick={() => setSelectedCategory('All')}
          className={`px-3 py-1 rounded-xl text-xs font-mono font-medium transition-all ${
            selectedCategory === 'All'
              ? 'bg-white/15 text-white font-bold'
              : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
          }`}
        >
          All ({transactions.length})
        </button>

        {categoriesList.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1 rounded-xl text-xs font-mono font-medium transition-all whitespace-nowrap ${
              selectedCategory === cat
                ? 'bg-white/15 text-white font-bold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Transactions List */}
      <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
        <AnimatePresence initial={false}>
          {transactions.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="py-12 px-4 rounded-2xl bg-white/[0.02] border border-dashed border-white/10 text-center flex flex-col items-center justify-center gap-3"
            >
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Receipt className="w-6 h-6 stroke-[1.5]" />
              </div>
              <div className="max-w-xs">
                <h4 className="text-sm font-display font-bold text-white mb-1">
                  Clean Runway — Zero Spends Logged
                </h4>
                <p className="text-xs text-slate-400 font-medium leading-relaxed">
                  No expenses logged yet. Tap '+ Log Expense' to record your first spend!
                </p>
              </div>
              <button
                type="button"
                onClick={onOpenAddModal}
                className="mt-1 px-4 py-2 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-black font-bold text-xs font-sans transition-all flex items-center gap-1.5 shadow-glow-emerald cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
                <span>+ Log Expense</span>
              </button>
            </motion.div>
          ) : filtered.length === 0 ? (
            <div className="py-8 text-center text-slate-500 text-xs font-mono">
              No transactions found in this category.
            </div>
          ) : (
            filtered.map((tx) => {
              const meta = getCategoryMeta(tx.category);
              const Icon = meta.icon;

              return (
                <motion.div
                  key={tx.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl border ${meta.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-white">
                          {tx.title}
                        </span>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-white/5 border border-white/10 text-slate-400">
                          Day {tx.day}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                        <span className="text-[11px] font-mono text-slate-500">{tx.time}</span>
                        {tx.note && (
                          <>
                            <span className="text-slate-600">•</span>
                            <span className="text-[11px] text-slate-400 italic truncate max-w-[200px] sm:max-w-xs">{tx.note}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-sm font-display font-bold text-white font-mono">
                      -{formatINR(tx.amount)}
                    </span>

                    <button
                      onClick={() => onDeleteTransaction(tx.id)}
                      className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all cursor-pointer"
                      title="Delete & Refund Transaction"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>

    </div>
  );
};
