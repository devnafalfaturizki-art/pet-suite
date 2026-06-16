import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useModuleStore } from '@/stores/module.store';
import type { ModuleKey } from '@/types';

interface ModuleGuardProps {
  children: ReactNode;
  moduleKey?: ModuleKey;
}

export function ModuleGuard({ children, moduleKey }: ModuleGuardProps) {
  const modules = useModuleStore((state) => state.modules);
  const isLoading = useModuleStore((state) => state.isLoading);
  const error = useModuleStore((state) => state.error);

  if (!moduleKey) {
    return <>{children}</>;
  }

  // If loading failed or module status unknown, default to showing content
  // This prevents blank pages when Supabase isn't configured
  if (error) {
    return <>{children}</>;
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
          <p className="text-sm text-slate-500 dark:text-slate-400">Loading module...</p>
        </div>
      </div>
    );
  }

  // If module is explicitly disabled, redirect
  if (modules[moduleKey] === false) {
    return <Navigate to="/403" replace />;
  }

  return <>{children}</>;
}