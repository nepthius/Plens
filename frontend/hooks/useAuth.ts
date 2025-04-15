import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  username: string | null;
  email: string | null;
  id: string | null;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isHydrated: boolean;
  setAuth: (user: User | null, token: string | null) => void;
  clearAuth: () => void;
  setHydrated: () => void;
}

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isHydrated: false,
      setAuth: (user, token) => set({ user, token, isHydrated: true }),
      clearAuth: () => set({ user: null, token: null, isHydrated: true }),
      setHydrated: () => set({ isHydrated: true }),
    }),
    {
      name: 'auth-storage',
      onRehydrateStorage: () => {
        return (state, error) => {
          if (error) {
            console.error('Failed to rehydrate auth state:', error);
          }
          if (state) {
            console.log('[DEBUG] Zustand auth state rehydrated:', state);
            state.setHydrated();
          }
        }
      },
      skipHydration: typeof window === 'undefined',
    }
  )
); 