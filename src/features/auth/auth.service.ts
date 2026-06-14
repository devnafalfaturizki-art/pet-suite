import { supabase } from '@/lib/supabase';
import { handleSupabaseError } from '@/lib/error';
import type { UserRole } from '@/types';

export interface AuthUserPayload {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  isActive: boolean;
}

interface ProfileRow {
  full_name: string;
  role: UserRole;
  is_active: boolean;
  email?: string;
}

interface ProfileUpdatePayload {
  full_name?: string;
  role?: UserRole;
  is_active?: boolean;
}

export const authService = {
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.user) {
      throw new Error(error?.message ?? 'Unable to sign in');
    }

    const user = await this.fetchProfile(data.user.id, data.user.email ?? email);
    return { user, session: data.session };
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) {
      handleSupabaseError(error);
    }
  },

  async sendPasswordResetEmail(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      handleSupabaseError(error);
    }
  },

  async getCurrentUser(): Promise<AuthUserPayload | null> {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error || !session?.user) {
      return null;
    }

    return this.fetchProfile(session.user.id, session.user.email ?? '');
  },

  async fetchProfile(userId: string, email: string): Promise<AuthUserPayload> {
    const { data, error } = await supabase
      .from('profiles')
      .select('full_name, role, is_active')
      .eq('id', userId)
      .single();

    if (error || !data) {
      throw new Error(error?.message ?? 'Unable to load user profile');
    }

    const profile = data as ProfileRow;

    return {
      id: userId,
      email,
      fullName: profile.full_name ?? 'Unknown User',
      role: profile.role,
      isActive: profile.is_active,
    };
  },

  async createProfile(
    userId: string,
    email: string,
    fullName: string,
    role: UserRole = 'customer',
  ): Promise<AuthUserPayload> {
    const { data, error } = await supabase
      .from('profiles')
      .insert({ id: userId, email, full_name: fullName, role, is_active: true })
      .select()
      .single();

    if (error) {
      handleSupabaseError(error);
    }

    const profile = data as ProfileRow;

    return {
      id: userId,
      email,
      fullName: profile.full_name ?? fullName,
      role: profile.role,
      isActive: profile.is_active,
    };
  },

  async updateProfile(
    userId: string,
    updates: { fullName?: string; role?: UserRole; isActive?: boolean },
  ): Promise<AuthUserPayload> {
    const payload: ProfileUpdatePayload = {};
    if (updates.fullName !== undefined) payload.full_name = updates.fullName;
    if (updates.role !== undefined) payload.role = updates.role;
    if (updates.isActive !== undefined) payload.is_active = updates.isActive;

    if (Object.keys(payload).length === 0) {
      throw new Error('No updates provided');
    }

    const { data, error } = await supabase
      .from('profiles')
      .update(payload)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      handleSupabaseError(error);
    }

    const profile = data as ProfileRow;

    return {
      id: userId,
      email: profile.email ?? '',
      fullName: profile.full_name ?? '',
      role: profile.role,
      isActive: profile.is_active,
    };
  },
};