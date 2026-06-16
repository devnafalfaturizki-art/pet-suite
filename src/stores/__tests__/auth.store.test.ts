import { describe, it, expect, beforeEach } from 'vitest';
import { useAuthStore } from '../auth.store';

describe('authStore', () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: null,
      role: null,
      isInitializing: true
    });
  });

  it('initializes with default state', () => {
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.role).toBeNull();
    expect(state.isInitializing).toBe(true);
  });

  it('setUser updates user and role', () => {
    const user = { id: 'u1', email: 'test@test.com', fullName: 'Test', role: 'owner' as const, isActive: true };
    useAuthStore.getState().setUser(user);
    const state = useAuthStore.getState();
    expect(state.user).toEqual(user);
    expect(state.role).toBe('owner');
  });

  it('setInitializing updates loading state', () => {
    useAuthStore.getState().setInitializing(false);
    const state = useAuthStore.getState();
    expect(state.isInitializing).toBe(false);
  });

  it('clearAuth resets user and role', () => {
    useAuthStore.setState({
      user: { id: 'u1', email: 'test@test.com', fullName: 'Test', role: 'owner', isActive: true },
      role: 'owner',
    });
    useAuthStore.getState().clearAuth();
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.role).toBeNull();
  });
});