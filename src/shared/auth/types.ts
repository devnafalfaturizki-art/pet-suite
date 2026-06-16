/**
 * Auth provider interface and types.
 * 
 * This abstraction allows PetCare Suite to support multiple auth providers
 * (demo, Supabase, etc.) without changing any frontend page code.
 * 
 * To add a new provider:
 * 1. Implement AuthProvider interface
 * 2. Register it in auth-factory.ts
 * 3. Set VITE_AUTH_PROVIDER env var
 */

import type { UserRole } from '@/types';

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  isActive: boolean;
  avatar?: string | null;
}

export interface AuthSession {
  accessToken?: string;
  expiresAt?: number;
  provider: 'demo' | 'supabase';
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface DemoLoginCredentials {
  role: UserRole;
  name?: string;
}

export interface AuthProvider {
  /** Unique provider name */
  name: 'demo' | 'supabase';

  /** Initialize auth state (called once on app mount) */
  initialize(): Promise<{ user: AuthUser | null; session: AuthSession | null }>;

  /** Sign in with email/password */
  signIn(credentials: LoginCredentials): Promise<{ user: AuthUser; session: AuthSession }>;

  /** Sign in with demo role selector */
  demoSignIn?(credentials: DemoLoginCredentials): Promise<{ user: AuthUser; session: AuthSession }>;

  /** Sign out */
  signOut(): Promise<void>;

  /** Check if this provider supports demo login */
  supportsDemoLogin: boolean;
}