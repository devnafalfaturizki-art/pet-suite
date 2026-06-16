import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? '';

function createFallbackSupabaseClient() {
  const createError = (): { code: string; message: string } => ({
    code: 'CONFIG_ERROR',
    message: 'Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in Vercel.',
  });

  const createQueryBuilder = (): any => {
    const builder: any = {
      select: () => createQueryBuilder(),
      insert: () => createQueryBuilder(),
      update: () => createQueryBuilder(),
      delete: () => createQueryBuilder(),
      eq: () => createQueryBuilder(),
      gte: () => createQueryBuilder(),
      lte: () => createQueryBuilder(),
      gt: () => createQueryBuilder(),
      lt: () => createQueryBuilder(),
      neq: () => createQueryBuilder(),
      order: () => createQueryBuilder(),
      in: () => createQueryBuilder(),
      limit: () => createQueryBuilder(),
      range: () => createQueryBuilder(),
      or: () => createQueryBuilder(),
      ilike: () => createQueryBuilder(),
      textSearch: () => createQueryBuilder(),
      single: async () => ({ data: null, error: createError() }),
      maybeSingle: async () => ({ data: null, error: createError() }),
    };
    return builder;
  };

  return {
    auth: {
      getSession: async () => ({ data: { session: null }, error: null }),
      getUser: async () => ({ data: { user: null }, error: null }),
      signInWithPassword: async () => ({ data: { session: null, user: null }, error: createError() }),
      signOut: async () => ({ error: null }),
      resetPasswordForEmail: async () => ({ data: null, error: null }),
      updateUser: async () => ({ data: { user: null }, error: createError() }),
      onAuthStateChange: () => ({
        data: {
          subscription: {
            unsubscribe: () => undefined,
          },
        },
        error: null,
      }),
    },
    from: () => createQueryBuilder(),
    rpc: () => createQueryBuilder(),
    storage: {
      from: () => ({
        upload: async () => ({ data: null, error: createError() }),
        createSignedUrl: async () => ({ data: null, error: createError() }),
        remove: async () => ({ data: null, error: createError() }),
      }),
    },
    channel: () => ({
      on: () => ({ subscribe: () => ({ unsubscribe: () => undefined }) }),
      subscribe: () => ({ unsubscribe: () => undefined }),
    }),
    removeChannel: () => undefined,
    functions: {
      invoke: async () => ({ data: null, error: createError() }),
    },
  };
}

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase: any = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createFallbackSupabaseClient();