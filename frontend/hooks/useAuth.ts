import { create } from 'zustand';
import { persist, StateStorage } from 'zustand/middleware';

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

const canUseLocalStorage = typeof window !== 'undefined' && window.localStorage;

const safeLocalStorage: StateStorage = {
  getItem: (name) => {
    if (!canUseLocalStorage) return null;
    try {
      return localStorage.getItem(name);
    } catch (e) {
      console.error(`Error reading localStorage key “${name}”:`, e);
      return null;
    }
  },
  setItem: (name, value) => {
    if (!canUseLocalStorage) return;
    try {
      localStorage.setItem(name, value);
    } catch (e) {
      console.error(`Error setting localStorage key “${name}”:`, e);
    }
  },
  removeItem: (name) => {
    if (!canUseLocalStorage) return;
    try {
      localStorage.removeItem(name);
    } catch (e) {
      console.error(`Error removing localStorage key “${name}”:`, e);
    }
  },
};

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isHydrated: false,
      setAuth: (user, token) => set({ user, token }),
      clearAuth: () => set({ user: null, token: null }),
      setHydrated: () => set({ isHydrated: true }),
    }),
    {
      name: 'auth-storage',
      storage: safeLocalStorage,
      onRehydrateStorage: () => {
        return (state, error) => {
          if (error) {
            console.error('Failed to rehydrate auth state:', error);
          }
          if (state) {
            console.log('[DEBUG] Zustand auth state rehydrated.');
            state.setHydrated();
          }
        }
      },
      skipHydration: typeof window === 'undefined',
    }
  )
); 