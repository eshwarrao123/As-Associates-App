import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, UserRole } from '../types';
import * as authService from '../services/auth/authService';
import * as tokenStore from '../services/api/tokenStore';
import { queryClient } from '../services/api/queryClient';

// ─── State Shape ──────────────────────────────────────────────────────────────

interface AuthState {
  user: User | null;
  token: string | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  isHydrated: boolean;
  isLoading: boolean;
  error: string | null;
}

// ─── Actions ──────────────────────────────────────────────────────────────────

interface AuthActions {
  setUser: (user: User) => void;
  setToken: (token: string) => void;
  logout: () => Promise<void>;
  hydrate: () => Promise<void>;
  loginAction: (employeeCode: string, password: string) => Promise<void>;
  logoutAction: () => Promise<void>;
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
  isLoading: false,
  error: null,

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

  // ─── loginAction: authenticate user via API ────────────────────────────────
  loginAction: async (employeeCode: string, password: string) => {
    set({ isLoading: true, error: null });

    try {
      // Clear any previously persisted data before login
      await Promise.all([
        AsyncStorage.removeItem(STORAGE_KEYS.TOKEN),
        AsyncStorage.removeItem(STORAGE_KEYS.USER),
        tokenStore.clearTokens(),
      ]);

      // Clear query cache before starting new session
      queryClient.clear();

      const response = await authService.login(employeeCode, password);

      // Store tokens in secure storage
      await Promise.all([
        tokenStore.setAccessToken(response.accessToken),
        tokenStore.setRefreshToken(response.refreshToken),
      ]);

      // Map API user shape to local User type
      const user: User = {
        id: response.user.id,
        name: `${response.user.firstName} ${response.user.lastName}`,
        email: response.user.email,
        role: response.user.role as UserRole,
        department: response.user.department,
        avatarInitials: `${response.user.firstName[0]}${response.user.lastName[0]}`.toUpperCase(),
        mustChangePassword: response.user.mustChangePassword ?? false,
      };

      // Persist user to AsyncStorage for hydration
      await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));

      set({
        user,
        token: response.accessToken,
        role: user.role,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'An error occurred';

      set({
        isLoading: false,
        error: errorMessage,
      });

      throw error;
    }
  },

  // ─── logoutAction: logout user and clear all state ─────────────────────────
  logoutAction: async () => {
    // Get refresh token for server-side revocation
    const refreshToken = await tokenStore.getRefreshToken();

    // Fire-and-forget logout request (don't block on failure)
    if (refreshToken) {
      void authService.logout(refreshToken);
    }

    // Clear ALL TanStack Query cache
    queryClient.clear();

    // Clear tokens from secure storage
    await tokenStore.clearTokens();

    // Clear ALL persisted data from AsyncStorage
    await Promise.all([
      AsyncStorage.removeItem(STORAGE_KEYS.TOKEN),
      AsyncStorage.removeItem(STORAGE_KEYS.USER),
    ]);

    // Reset ALL store fields to initial state
    set({
      user: null,
      token: null,
      role: null,
      isAuthenticated: false,
      isHydrated: true, // Keep hydrated true (logout happened after hydration)
      isLoading: false,
      error: null,
    });
  },
}));
