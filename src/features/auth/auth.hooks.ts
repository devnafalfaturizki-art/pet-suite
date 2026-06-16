import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth.store';
import { authService } from './auth.service';

/**
 * @deprecated Use useAuth() from '@/shared/auth/use-auth' instead.
 * This file is kept for backward compatibility during migration.
 */
export function useAuthActions() {
  const setUser = useAuthStore((state) => state.setUser);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const navigate = useNavigate();

  const signIn = useCallback(
    async (email: string, password: string, redirectTo = '/dashboard') => {
      const { user } = await authService.signIn(email, password);
      setUser(user);
      navigate(redirectTo, { replace: true });
    },
    [navigate, setUser]
  );

  const signOut = useCallback(async () => {
    await authService.signOut();
    clearAuth();
    navigate('/login');
  }, [clearAuth, navigate]);

  const sendPasswordReset = useCallback(async (email: string) => {
    await authService.sendPasswordResetEmail(email);
  }, []);

  return {
    signIn,
    signOut,
    sendPasswordReset
  };
}
