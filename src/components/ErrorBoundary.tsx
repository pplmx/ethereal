import { Component, type ErrorInfo, type ReactNode } from 'react';
import { logger } from '../lib/logger';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logger.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="w-screen h-screen flex flex-col items-center justify-center bg-indigo-950/80 backdrop-blur-md text-white p-6 text-center select-none">
          <div className="w-20 h-20 bg-rose-500/20 rounded-full flex items-center justify-center mb-4 border border-rose-500/30">
            <span className="text-4xl">👻</span>
          </div>
          <h1 className="text-xl font-bold mb-2">Spirit Connection Lost</h1>
          <p className="text-sm text-white/60 mb-6">
            Something went wrong in the code dimension. The spirit is currently unstable.
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-indigo-500 hover:bg-indigo-600 transition-colors rounded-lg text-sm font-medium shadow-lg shadow-indigo-500/20"
          >
            Re-materialize
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
