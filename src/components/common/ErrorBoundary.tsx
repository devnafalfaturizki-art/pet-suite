import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui';
import { Link } from 'react-router-dom';

type State = { hasError: boolean; error: Error | null };

export default class ErrorBoundary extends React.Component<{ children: React.ReactNode }, State> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center w-full max-w-2xl">
            <div className="flex items-center justify-center">
              <AlertTriangle className="h-12 w-12 text-amber-500" />
            </div>
            <h2 className="mt-4 text-lg font-semibold">Something went wrong</h2>
            {import.meta.env.DEV && this.state.error && (
              <pre className="mt-2 text-xs text-left overflow-auto rounded bg-slate-50 p-3"><code>{String(this.state.error.message)}</code></pre>
            )}
            <div className="mt-4 flex items-center justify-center gap-3">
              <Button onClick={() => this.setState({ hasError: false, error: null })}>Try Again</Button>
              <Link to="/dashboard" className="text-sm text-slate-600 hover:text-slate-900">Go to Dashboard</Link>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children as any;
  }
}
