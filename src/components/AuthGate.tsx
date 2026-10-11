import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Lock, Sparkles, User, KeyRound, ShieldAlert, Check } from 'lucide-react';
import { UserSession } from '../types/finance';

interface AuthGateProps {
  onLogin: (session: UserSession, isDemo?: boolean) => void;
}

interface AvatarOption {
  emoji: string;
  name: string;
}

const AVATAR_OPTIONS: AvatarOption[] = [
  { emoji: '⚡', name: 'Maverick' },
  { emoji: '💎', name: 'Diamond' },
  { emoji: '👾', name: 'Cyber' },
  { emoji: '🦊', name: 'Swift' },
  { emoji: '🚀', name: 'Nomad' },
];

export const AuthGate: React.FC<AuthGateProps> = ({ onLogin }) => {
  // ZERO-DEFAULT: ALL INPUTS MUST START EMPTY
  const [handle, setHandle] = useState<string>('');
  const [pin, setPin] = useState<string>('');
  const [selectedAvatar, setSelectedAvatar] = useState<AvatarOption | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Validation: handle, 4-digit PIN, and selected avatar
  const isHandleValid = handle.trim().length > 0;
  const isPinValid = /^\d{4}$/.test(pin.trim());
  const isAvatarSelected = selectedAvatar !== null;
  const canSubmit = isHandleValid && isPinValid && isAvatarSelected;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!isHandleValid) {
      setErrorMsg('Please enter your Fintech Handle or Name.');
      return;
    }

    if (!isAvatarSelected) {
      setErrorMsg('Please choose your Vibe / Avatar.');
      return;
    }

    if (!isPinValid) {
      setErrorMsg('Security PIN must be exactly 4 digits.');
      return;
    }

    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#00F59B', '#00F0FF', '#8B5CF6'],
    });

    const cleanHandle = handle.trim().startsWith('@')
      ? handle.trim()
      : `@${handle.trim()}`;

    const session: UserSession = {
      handle: cleanHandle,
      avatar: selectedAvatar.emoji,
      avatarName: selectedAvatar.name,
      pin: pin.trim(),
      isLoggedIn: true,
    };

    onLogin(session);
  };

  // Quick Demo Shortcut for Evaluators
  const handleQuickDemo = () => {
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 },
      colors: ['#00F59B', '#00F0FF'],
    });

    const session: UserSession = {
      handle: '@alex_fintech',
      avatar: '⚡',
      avatarName: 'Maverick',
      pin: '1234',
      isLoggedIn: true,
    };

    onLogin(session, true);
  };

  return (
    <div className="min-h-screen bg-[#07090E] text-white flex items-center justify-center p-4 sm:p-6 lg:p-8 relative selection:bg-emerald-500/20 selection:text-emerald-300 overflow-hidden bg-obsidian-ambient">
      
      {/* Specular Radial Ambient Backdrops */}
      <div className="fixed top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[42rem] h-[42rem] bg-emerald-500/[0.04] rounded-full blur-[160px] pointer-events-none" />
      <div className="fixed bottom-10 right-1/4 w-[32rem] h-[32rem] bg-cyan-600/[0.03] rounded-full blur-[150px] pointer-events-none" />
      <div className="fixed top-2/3 left-10 w-[26rem] h-[26rem] bg-violet-600/[0.025] rounded-full blur-[150px] pointer-events-none" />

      {/* Fullscreen Glassmorphic Identity Creation Card */}
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-xl rounded-[2.5rem] bg-[#10121B]/80 border border-white/[0.07] backdrop-blur-2xl shadow-[0_30px_90px_rgba(0,0,0,0.85)] p-8 sm:p-12 overflow-hidden"
      >
        {/* Top Badges */}
        <div className="flex items-center justify-between gap-3 mb-8">
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-xs font-mono text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#00F59B] animate-pulse" />
            <span className="tracking-wider">IDENTITY GATE • STEP 0</span>
          </div>

          <button
            type="button"
            onClick={handleQuickDemo}
            className="text-xs font-mono text-slate-400 hover:text-emerald-300 hover:underline transition-all cursor-pointer flex items-center gap-1"
          >
            <span>⚡ Quick Demo Bypass</span>
          </button>
        </div>

        {/* Title & Subtitle */}
        <div className="space-y-2 mb-8">
          <h1 className="text-3xl sm:text-4xl font-display font-extrabold tracking-tight text-white">
            RUNWAY30 — Gen-Z Financial ID
          </h1>
          <p className="text-slate-400 text-sm sm:text-base font-medium leading-relaxed">
            Create your financial passport to unlock the ₹10,000 runway flight simulator.
          </p>
        </div>

        {/* Error Alert */}
        <AnimatePresence>
          {errorMsg && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 p-3.5 rounded-2xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs font-semibold flex items-center gap-2"
            >
              <ShieldAlert className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMsg}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Input 1: Fintech Handle / Name (Starts Completely Empty) */}
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-2 font-bold flex items-center justify-between">
              <span>Fintech Handle / Name <span className="text-rose-400">*</span></span>
              <span className="text-[11px] text-slate-500 font-normal">e.g. Alex, @racer_99</span>
            </label>
            <div className="relative group">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-mono text-base font-bold">
                @
              </span>
              <input
                type="text"
                required
                autoFocus
                value={handle}
                onChange={(e) => setHandle(e.target.value.replace(/^@/, ''))}
                placeholder="e.g. Alex, @racer_99"
                className="w-full pl-9 pr-4 py-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.08] text-white placeholder-slate-600 text-sm font-sans focus:outline-none focus:border-emerald-500/60 focus:ring-2 focus:ring-emerald-500/20 transition-all"
              />
            </div>
          </div>

          {/* Input 2: Choose Your Vibe / Avatar (None Preselected) */}
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-2.5 font-bold flex items-center justify-between">
              <span>Choose Your Vibe / Avatar <span className="text-rose-400">*</span></span>
              <span className="text-[11px] font-mono text-emerald-400">
                {selectedAvatar ? `${selectedAvatar.emoji} ${selectedAvatar.name}` : 'Select below'}
              </span>
            </label>
            
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
              {AVATAR_OPTIONS.map((av) => {
                const isSelected = selectedAvatar?.name === av.name;
                return (
                  <button
                    key={av.name}
                    type="button"
                    onClick={() => {
                      setSelectedAvatar(av);
                      setErrorMsg(null);
                    }}
                    className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-500/20 border-emerald-400/60 shadow-[0_0_20px_rgba(0,245,155,0.2)] ring-1 ring-emerald-400/30'
                        : 'bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.05] hover:border-white/10 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <span className="text-2xl mb-1">{av.emoji}</span>
                    <span className={`text-[11px] font-bold tracking-tight text-center truncate w-full ${
                      isSelected ? 'text-white' : 'text-slate-400'
                    }`}>
                      {av.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Input 3: Create 4-Digit Security PIN (Starts Completely Empty) */}
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-2 font-bold flex items-center justify-between">
              <span>Create 4-Digit Security PIN <span className="text-rose-400">*</span></span>
              <span className="text-[11px] text-slate-500 font-normal">4-digit code (e.g. 1234)</span>
            </label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type="password"
                maxLength={4}
                required
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                placeholder="••••"
                className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.08] text-white placeholder-slate-600 font-mono text-lg font-bold tracking-widest focus:outline-none focus:border-emerald-500/60 focus:ring-2 focus:ring-emerald-500/20 transition-all"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <motion.button
              whileHover={{ scale: canSubmit ? 1.02 : 1 }}
              whileTap={{ scale: canSubmit ? 0.98 : 1 }}
              type="submit"
              disabled={!canSubmit}
              data-testid="auth-submit-btn"
              className={`w-full py-4 rounded-2xl font-display font-black text-base transition-all flex items-center justify-center gap-2.5 ${
                canSubmit
                  ? 'bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 hover:from-emerald-300 hover:to-cyan-300 text-black shadow-[0_0_30px_rgba(0,245,155,0.35)] cursor-pointer'
                  : 'bg-white/5 border border-white/5 text-slate-500 cursor-not-allowed opacity-40'
              }`}
            >
              <span>Initialize Financial Passport 🚀</span>
            </motion.button>
          </div>

          {/* Helper feedback text */}
          <div className="text-center text-xs font-mono text-slate-500">
            {canSubmit ? (
              <span className="text-emerald-400 flex items-center justify-center gap-1.5">
                <Check className="w-3.5 h-3.5" /> Passport ready to initialize
              </span>
            ) : (
              <span>Fill handle, choose avatar vibe, and enter 4-digit PIN to proceed</span>
            )}
          </div>

        </form>

      </motion.div>

    </div>
  );
};
