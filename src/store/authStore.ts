import { create } from 'zustand';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../utils/supabase/client';

interface AuthState {
  user: User | null;
  loading: boolean;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  initialize: () => void;
  signOut: () => Promise<void>;
}

// Create a stable initialize function outside the store
const createInitializeFn = (set: (state: Partial<AuthState>) => void) => {
  return () => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      set({ user: session?.user ?? null, loading: false });
    }).catch(() => {
      // Resolve cleanly even if the connection fails due to invalid keys
      set({ user: null, loading: false });
    });

    supabase.auth.onAuthStateChange((_event: string, session: Session | null) => {
      set({ user: session?.user ?? null, loading: false });
    });
  };
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,
  setUser: (user) => set({ user }),
  setLoading: (loading) => set({ loading }),
  initialize: createInitializeFn(set),
  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null });
  },
}));