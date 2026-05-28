import React from 'react';
import { AlertOctagon, RotateCcw, Home } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Unhandled runtime exception caught by boundary:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#0B0F19] px-4 py-12 transition-colors duration-300 text-left">
          <div className="w-full max-w-lg bg-white dark:bg-[#161B26] border border-slate-100 dark:border-slate-805/60 rounded-[2rem] p-8 shadow-xl space-y-6">
            
            {/* Visual Header */}
            <div className="flex items-center gap-4">
              <div className="p-3.5 bg-rose-500/10 rounded-2xl text-rose-500 shrink-0">
                <AlertOctagon className="w-8 h-8" />
              </div>
              <div>
                <span className="text-xs font-semibold text-rose-500 tracking-wider uppercase">
                  Runtime Exception Occurred
                </span>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white mt-0.5">
                  Something went wrong
                </h1>
              </div>
            </div>

            {/* Error Message Details */}
            <div className="p-4 bg-slate-50 dark:bg-[#0B0F19]/60 border border-slate-200/60 dark:border-transparent rounded-2xl text-xs space-y-2">
              <p className="text-slate-650 dark:text-slate-350 leading-relaxed">
                The application encountered an unexpected runtime rendering error. Our engineering systems have logged the diagnostics.
              </p>
              {this.state.error && (
                <div className="font-mono bg-slate-100 dark:bg-slate-950/40 p-3 rounded-xl text-[10px] text-rose-600 dark:text-rose-400 overflow-x-auto max-h-32 border border-rose-500/10">
                  {this.state.error.toString()}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={this.handleReset}
                className="flex-grow flex items-center justify-center gap-2 px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer border-none"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reload Application</span>
              </button>
              <button
                onClick={() => window.location.href = '/'}
                className="flex-grow flex items-center justify-center gap-2 px-5 py-3 border border-slate-200 dark:border-slate-800/60 bg-transparent rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-all cursor-pointer"
              >
                <Home className="w-4 h-4" />
                <span>Go to Home Page</span>
              </button>
            </div>

          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
