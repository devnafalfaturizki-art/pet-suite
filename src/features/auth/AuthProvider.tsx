import { useEffect, useState, useRef } from 'react';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/stores/auth.store';
import { supabase } from '@/lib/supabase';
import { authService } from './auth.service';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const setUser = useAuthStore((state) => state.setUser);
  const setSession = useAuthStore((state) => state.setSession);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const setInitializing = useAuthStore((state) => state.setInitializing);
  const [isReady, setIsReady] = useState(false);
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    setInitializing(true);

    async function restoreAuth() {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error) {
        toast.error(error.message);
      }

      if (session?.user) {
        try {
          const user = await authService.fetchProfile(
            session.user.id,
            session.user.email ?? '',
          );
          setUser(user);
          setSession(session);
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);
          toast.error(message);
        }
      }

      setIsReady(true);
      setInitializing(false);
    }

    restoreAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      try {
        if (event === 'SIGNED_IN' && session?.user) {
          const user = await authService.fetchProfile(
            session.user.id,
            session.user.email ?? '',
          );
          setUser(user);
          setSession(session);
        }

        if (event === 'SIGNED_OUT') {
          clearAuth();
          setSession(null);
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        toast.error(message);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [setUser, setSession, clearAuth, setInitializing]);

  if (!isReady) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100" />
    );
  }

  return <>{children}</>;
}