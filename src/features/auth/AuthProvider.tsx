import { useEffect, useRef } from 'react';
import { useAuth } from '@/shared/auth/use-auth';
import { isSupabaseConfigured } from '@/lib/supabase';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { initialize, isInitializing } = useAuth();
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    initialize();
  }, [initialize]);

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-slate-50 px-6 py-16 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
        <div className="mx-auto flex max-w-xl flex-col items-center rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-4 rounded-full bg-indigo-100 p-3 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-300">
            <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M12 3l7 4v5c0 4.2-2.8 7.8-7 9-4.2-1.2-7-4.8-7-9V7l7-4z" />
              <path d="M9.5 12.5l1.8 1.8 3.2-3.6" />
            </svg>
          </div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Loading PetCare Suite</h1>
          <p className="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-400">
            Preparing your workspace...
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}