/**
 * Auth provider factory.
 * 
 * Selects the active auth provider based on environment variable.
 * 
 * VITE_AUTH_PROVIDER=demo  → DemoAuthProvider (default, no backend needed)
 * VITE_AUTH_PROVIDER=supabase → SupabaseAuthProvider (production)
 * 
 * Architecture:
 * - All auth logic is behind the AuthProvider interface
 * - Frontend pages never import provider-specific code
 * - Switching providers requires zero page changes
 * - Demo provider stores sessions in localStorage
 */

import type { AuthProvider } from './types';
import { demoAuthProvider } from './demo-provider';

function getProviderName(): 'demo' | 'supabase' {
  const env = import.meta.env.VITE_AUTH_PROVIDER as string | undefined;
  if (env === 'supabase') return 'supabase';
  return 'demo'; // Default to demo
}

let cachedProvider: AuthProvider | null = null;

export function getAuthProvider(): AuthProvider {
  if (cachedProvider) return cachedProvider;

  const providerName = getProviderName();

  switch (providerName) {
    case 'demo':
      cachedProvider = demoAuthProvider;
      break;
    case 'supabase':
      // Lazy-load Supabase provider only when needed
      // This keeps the demo bundle small and Supabase-free
      throw new Error(
        'Supabase auth provider not yet implemented. ' +
        'Set VITE_AUTH_PROVIDER=demo to use the demo provider.'
      );
    default:
      cachedProvider = demoAuthProvider;
  }

  return cachedProvider;
}

export function isDemoMode(): boolean {
  return getProviderName() === 'demo';
}