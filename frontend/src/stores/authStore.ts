import { create } from 'zustand';
import { createClient } from '@/utils/supabase/client';
import type { User } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  loading: boolean;
  init: () => void;
  signOut: () => Promise<void>;
}

const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,
  init: () => {
    const supabase = createClient();
    // Get initial session
    supabase.auth.getUser().then(({ data: { user } }) => {
      set({ user, loading: false });
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        set({ user: session?.user ?? null, loading: false });
      }
    );

    // Cleanup subscription on store unmount (though zustand stores are long-lived)
    return () => subscription.unsubscribe();
  },
  signOut: async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    set({ user: null });
  },
}));

export default useAuthStore;
