import { Component, type ReactNode, Suspense } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui';

interface SuspenseWithTimeoutProps {
  children: ReactNode;
  fallback: ReactNode;
  timeout?: number;
}

interface SuspenseWithTimeoutState {
  timedOut: boolean;
  retryKey: number;
}

/**
 * A Suspense wrapper that shows an error UI if the fallback
 * is displayed longer than the specified timeout.
 * 
 * Uses a retryKey to force React to re-mount the lazy component
 * when the user clicks "Try Again", since React caches rejected
 * lazy() promises.
 */
export default class SuspenseWithTimeout extends Component<
  SuspenseWithTimeoutProps,
  SuspenseWithTimeoutState
> {
  private timer: ReturnType<typeof setTimeout> | null = null;

  constructor(props: SuspenseWithTimeoutProps) {
    super(props);
    this.state = { timedOut: false, retryKey: 0 };
  }

  componentDidMount() {
    this.startTimer();
  }

  componentDidUpdate(prevProps: SuspenseWithTimeoutProps) {
    // If children changed (chunk loaded), clear the timer
    if (prevProps.children !== this.props.children) {
      this.clearTimer();
      if (this.state.timedOut) {
        this.setState({ timedOut: false });
      }
    }
  }

  componentWillUnmount() {
    this.clearTimer();
  }

  private startTimer() {
    this.clearTimer();
    const timeout = this.props.timeout ?? 15000;
    this.timer = setTimeout(() => {
      this.setState({ timedOut: true });
    }, timeout);
  }

  private clearTimer() {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }

  handleRetry = () => {
    // Increment retryKey to force React to re-mount the lazy component
    // This is necessary because React caches rejected lazy() promises
    this.setState((prev) => ({
      timedOut: false,
      retryKey: prev.retryKey + 1,
    }));
    this.startTimer();
  };

  render() {
    if (this.state.timedOut) {
      return (
        <div className="flex min-h-[50vh] items-center justify-center p-6">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
                <AlertTriangle className="h-6 w-6 text-amber-500" />
              </div>
            </div>
            <h2 className="mt-4 text-lg font-semibold text-slate-900 dark:text-slate-100">
              Page load timed out
            </h2>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              This page is taking too long to load. This may be due to a network issue or a missing chunk.
            </p>
            <div className="mt-6 flex items-center justify-center gap-3">
              <Button onClick={this.handleRetry} variant="default">
                <RefreshCw className="mr-1.5 h-4 w-4" />
                Try Again
              </Button>
              <a
                href="/dashboard"
                className="text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
              >
                Go to Dashboard
              </a>
            </div>
          </div>
        </div>
      );
    }

    return (
      <Suspense fallback={this.props.fallback} key={this.state.retryKey}>
        {this.props.children}
      </Suspense>
    );
  }
}