/**
 * Demo authentication provider.
 * 
 * Features:
 * - No Supabase dependency
 * - localStorage session persistence
 * - Role-based login with 5 roles
 * - Instant login/logout
 * - Production-safe architecture
 * 
 * Session data is stored in localStorage under 'petcare-demo-session'.
 * This allows the app to be fully functional without any backend.
 */

import type { AuthProvider, AuthUser, AuthSession, DemoLoginCredentials } from './types';
import type { UserRole } from '@/types';

const STORAGE_KEY = 'petcare-demo-session';

interface StoredSession {
  user: AuthUser;
  session: AuthSession;
  expiresAt: number;
}

const DEMO_USERS: Record<UserRole, { name: string; email: string }> = {
  owner: { name: 'Alex Johnson', email: 'owner@petsuite.com' },
  doctor: { name: 'Dr. Sarah Chen', email: 'doctor@petsuite.com' },
  staff: { name: 'Mike Rodriguez', email: 'staff@petsuite.com' },
  customer: { name: 'Emily Davis', email: 'customer@petsuite.com' },
};

function generateId(): string {
  return `demo-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function createUser(role: UserRole, name?: string): AuthUser {
  const profile = DEMO_USERS[role] ?? DEMO_USERS.customer;
  return {
    id: generateId(),
    email: profile.email,
    fullName: name ?? profile.name,
    role,
    isActive: true,
  };
}

function createSession(): AuthSession {
  return {
    provider: 'demo',
    expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
  };
}

function persistSession(user: AuthUser, session: AuthSession): void {
  const data: StoredSession = {
    user,
    session,
    expiresAt: session.expiresAt ?? Date.now() + 24 * 60 * 60 * 1000,
  };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // localStorage may be unavailable in some environments
    console.warn('[DemoAuth] Failed to persist session');
  }
}

function clearStoredSession(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

function getStoredSession(): StoredSession | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as StoredSession;
    if (data.expiresAt < Date.now()) {
      clearStoredSession();
      return null;
    }
    return data;
  } catch {
    clearStoredSession();
    return null;
  }
}

export const demoAuthProvider: AuthProvider = {
  name: 'demo',
  supportsDemoLogin: true,

  async initialize() {
    const stored = getStoredSession();
    if (stored) {
      return { user: stored.user, session: stored.session };
    }
    return { user: null, session: null };
  },

  async signIn(credentials) {
    // Demo provider doesn't validate email/password
    // It always returns a customer user for email/password login
    const user = createUser('customer', credentials.email.split('@')[0]);
    const session = createSession();
    persistSession(user, session);
    return { user, session };
  },

  async demoSignIn(credentials: DemoLoginCredentials) {
    const user = createUser(credentials.role, credentials.name);
    const session = createSession();
    persistSession(user, session);
    return { user, session };
  },

  async signOut() {
    clearStoredSession();
  },
};