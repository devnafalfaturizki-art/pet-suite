import { create } from 'zustand';
import type { UserRole } from '@/types';

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  isActive: boolean;
}

interface AuthState {
  user: AuthUser | null;
  role: UserRole | null;
  isInitializing: boolean;
  setUser: (user: AuthUser) => void;
  setInitializing: (isInitializing: boolean) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  role: null,
  isInitializing: true,
  setUser: (user) => set({ user, role: user.role }),
  setInitializing: (isInitializing) => set({ isInitializing }),
  clearAuth: () => set({ user: null, role: null })
}));