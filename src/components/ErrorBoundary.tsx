import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Runway30 ErrorBoundary caught an unhandled error:', error, errorInfo);
  }

  private handleReset = () => {
    try {
      localStorage.removeItem('runway30_state_v1');
    } catch {
      // Ignore
    }
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#07090E] text-white flex items-center justify-center p-6">
          <div className="max-w-md w-full p-8 rounded-2xl bg-slate-900/80 border border-rose-500/30 backdrop-blur-xl shadow-2xl text-center space-y-5">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-display font-black text-white">
                Flight Telemetry Recovered
              </h2>
              <p className="text-xs text-slate-400 font-medium leading-relaxed">
                Runway30 encountered an unexpected state anomaly. The resilience engine has isolated the issue so your session remains safe.
              </p>
            </div>

            <button
              onClick={this.handleReset}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-black font-display font-black text-xs transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset State & Recover Runway</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
