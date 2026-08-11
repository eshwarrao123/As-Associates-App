import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, UserRole } from '../types';

// ─── State Shape ──────────────────────────────────────────────────────────────

interface AuthState {
  user: User | null;
  token: string | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  isHydrated: boolean;
}

// ─── Actions ──────────────────────────────────────────────────────────────────

interface AuthActions {
  setUser: (user: User) => void;
  setToken: (token: string) => void;
  logout: () => Promise<void>;
  hydrate: () => Promise<void>;
}

// ─── Storage Keys ─────────────────────────────────────────────────────────────

const STORAGE_KEYS = {
  TOKEN: '@as_associates:token',
  USER: '@as_associates:user',
} as const;

// ─── Store ────────────────────────────────────────────────────────────────────

export const useAuthStore = create<AuthState & AuthActions>((set) => ({
  // Initial state
  user: null,
  token: null,
  role: null,
  isAuthenticated: false,
  isHydrated: false,

  // ─── setUser: update user + role in state ─────────────────────────────────
  setUser: (user: User) => {
    void AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    set({ user, role: user.role, isAuthenticated: true });
  },

  // ─── setToken: persist token to AsyncStorage ──────────────────────────────
  setToken: (token: string) => {
    void AsyncStorage.setItem(STORAGE_KEYS.TOKEN, token);
    set({ token });
  },

  // ─── logout: clear all auth state and AsyncStorage ────────────────────────
  logout: async () => {
    await Promise.all([
      AsyncStorage.removeItem(STORAGE_KEYS.TOKEN),
      AsyncStorage.removeItem(STORAGE_KEYS.USER),
    ]);
    set({
      user: null,
      token: null,
      role: null,
      isAuthenticated: false,
    });
  },

  // ─── hydrate: rehydrate from AsyncStorage on app start ────────────────────
  hydrate: async () => {
    try {
      const [storedToken, storedUser] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.TOKEN),
        AsyncStorage.getItem(STORAGE_KEYS.USER),
      ]);

      if (storedToken && storedUser) {
        const parsedUser = JSON.parse(storedUser) as User;
        set({
          token: storedToken,
          user: parsedUser,
          role: parsedUser.role,
          isAuthenticated: true,
        });
      }
    } catch {
      // If hydration fails, stay logged out
    } finally {
      set({ isHydrated: true });
    }
  },
}));
