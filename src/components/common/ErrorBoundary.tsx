import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui';
import { Link } from 'react-router-dom';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  retryCount: number;
}

export default class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  private maxRetries = 3;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null, retryCount: 0 };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error, retryCount: 0 };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[ErrorBoundary] Caught error:', error.message, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, retryCount: 0 });
  };

  handleRetry = () => {
    const nextCount = this.state.retryCount + 1;
    if (nextCount >= this.maxRetries) {
      // After max retries, show the fallback UI
      this.setState({ hasError: true, error: this.state.error, retryCount: nextCount });
    } else {
      this.setState({ hasError: false, error: null, retryCount: nextCount });
    }
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex min-h-[50vh] items-center justify-center p-6">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
                <AlertTriangle className="h-6 w-6 text-amber-500" />
              </div>
            </div>
            <h2 className="mt-4 text-lg font-semibold text-slate-900 dark:text-slate-100">
              Something went wrong
            </h2>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              An unexpected error occurred while loading this page.
            </p>
            {import.meta.env.DEV && this.state.error && (
              <pre className="mt-4 max-h-24 overflow-auto rounded-lg bg-slate-50 p-3 text-left text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                <code>{this.state.error.message}</code>
              </pre>
            )}
            <div className="mt-6 flex items-center justify-center gap-3">
              <Button onClick={this.handleRetry} variant="default">
                <RefreshCw className="mr-1.5 h-4 w-4" />
                Try Again
              </Button>
              <Link
                to="/dashboard"
                className="text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
                onClick={this.handleReset}
              >
                Go to Dashboard
              </Link>
            </div>
          </div>
        </div>
      );
    }

    return <>{this.props.children}</>;
  }
}