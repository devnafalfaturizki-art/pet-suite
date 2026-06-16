/**
 * Auth hooks that use the provider factory.
 * 
 * Frontend pages use these hooks exclusively.
 * They never import provider-specific code.
 * Switching providers requires zero page changes.
 */

import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth.store';
import { getAuthProvider, isDemoMode } from './auth-factory';
import type { DemoLoginCredentials } from './types';
import type { UserRole } from '@/types';

export function useAuth() {
  const user = useAuthStore((state) => state.user);
  const role = useAuthStore((state) => state.role);
  const isInitializing = useAuthStore((state) => state.isInitializing);
  const setUser = useAuthStore((state) => state.setUser);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const setInitializing = useAuthStore((state) => state.setInitializing);
  const navigate = useNavigate();

  const signIn = useCallback(
    async (email: string, password: string, redirectTo = '/dashboard') => {
      const provider = getAuthProvider();
      const { user, session } = await provider.signIn({ email, password });
      setUser(user);
      navigate(redirectTo, { replace: true });
    },
    [navigate, setUser]
  );

  const demoSignIn = useCallback(
    async (credentials: DemoLoginCredentials, redirectTo = '/dashboard') => {
      const provider = getAuthProvider();
      if (!provider.demoSignIn) {
        throw new Error('This auth provider does not support demo login');
      }
      const { user } = await provider.demoSignIn(credentials);
      setUser(user);
      navigate(redirectTo, { replace: true });
    },
    [navigate, setUser]
  );

  const signOut = useCallback(async () => {
    const provider = getAuthProvider();
    await provider.signOut();
    clearAuth();
    navigate('/login');
  }, [clearAuth, navigate]);

  const initialize = useCallback(async () => {
    setInitializing(true);
    try {
      const provider = getAuthProvider();
      const { user } = await provider.initialize();
      if (user) {
        setUser(user);
      }
    } catch (err) {
      console.warn('[Auth] Initialization error:', err);
    } finally {
      setInitializing(false);
    }
  }, [setInitializing, setUser]);

  return {
    user,
    role,
    isInitializing,
    isDemoMode: isDemoMode(),
    signIn,
    demoSignIn,
    signOut,
    initialize,
    isAuthenticated: !!user,
  };
}