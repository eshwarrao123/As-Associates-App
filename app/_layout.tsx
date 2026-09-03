import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { Slot, useRouter, useSegments } from 'expo-router';
import { QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_700Bold,
  Inter_800ExtraBold,
} from '@expo-google-fonts/inter';
import { useAuthStore } from '../src/store/auth.store';
import { Colors } from '../src/constants/tokens';
import { getAccessToken } from '../src/services/api/tokenStore';
import { getMe } from '../src/services/auth/authService';
import { clearTokens } from '../src/services/api/tokenStore';
import ErrorBoundary from '../src/components/ErrorBoundary';
import { queryClient } from '../src/services/api/queryClient';
import type { UserRole } from '../src/types';

// ─── Loading screen ───────────────────────────────────────────────────────────

function LoadingScreen(): React.ReactElement {
  return (
    <View style={ls.container}>
      <ActivityIndicator size="large" color={Colors.primary} />
    </View>
  );
}

const ls = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.background },
});

// ─── Auth Guard ───────────────────────────────────────────────────────────────
//
// Rules:
//  • Do NOT redirect until BOTH fonts and hydration are complete.
//  • Do NOT redirect on the very first render when segments[] is empty
//    (navigator not mounted yet — calling router.replace here throws).
//  • Use a mounted ref so the effect never fires synchronously on mount.

function AuthGuard(): React.ReactElement | null {
  const router = useRouter();
  const segments = useSegments();
  const { isAuthenticated, role, isHydrated, hydrate, setUser, user } = useAuthStore();

  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const didHydrate = useRef(false);
  const didCheckAuth = useRef(false);
  const segmentsRef = useRef(segments);
  segmentsRef.current = segments;

  // Kick off AsyncStorage hydration once
  useEffect(() => {
    if (!didHydrate.current) {
      didHydrate.current = true;
      void hydrate();
    }
  }, [hydrate]);

  // Startup auth check — verify token is still valid
  useEffect(() => {
    if (!isHydrated || didCheckAuth.current) return;

    didCheckAuth.current = true;

    async function checkAuth() {
      try {
        const accessToken = await getAccessToken();

        if (accessToken) {
          // Token exists — verify it's still valid
          const userData = await getMe();

          // Map API user shape to local User type
          const user = {
            id: userData.id,
            name: `${userData.firstName} ${userData.lastName}`,
            email: userData.email,
            role: userData.role as UserRole,
            department: userData.department,
            avatarInitials: `${userData.firstName[0]}${userData.lastName[0]}`.toUpperCase(),
            mustChangePassword: userData.mustChangePassword,
          };

          setUser(user);
        }
      } catch {
        // Token invalid or expired — clear it
        await clearTokens();
      } finally {
        setIsCheckingAuth(false);
      }
    }

    void checkAuth();
  }, [isHydrated, setUser]);

  // Redirect when auth state changes — read segments from ref to avoid loop
  useEffect(() => {
    if (!isHydrated) return;
    if (isCheckingAuth) return;
    if (!segmentsRef.current[0]) return;

    const inAuthGroup = segmentsRef.current[0] === '(auth)';

    if (!isAuthenticated && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (isAuthenticated && inAuthGroup) {
      // Check if password change is required BEFORE role-based routing
      if (user?.mustChangePassword === true) {
        router.replace('/(auth)/change-password');
        return;
      }

      router.replace(role === 'ADMIN' ? '/(admin)' : '/(employee)');
    }
  }, [isAuthenticated, isHydrated, isCheckingAuth, role, router, user?.mustChangePassword]);

  // Show spinner until hydration and auth check complete
  if (!isHydrated || isCheckingAuth) {
    return <LoadingScreen />;
  }

  return <Slot />;
}

// ─── Root Layout ──────────────────────────────────────────────────────────────

export default function RootLayout(): React.ReactElement | null {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_700Bold,
    Inter_800ExtraBold,
  });

  // Font load failure — show error instead of silent white screen
  if (fontError) {
    return (
      <View style={ls.container}>
        <Text style={{ color: Colors.danger, fontFamily: 'System', fontSize: 14, textAlign: 'center', padding: 24 }}>
          Font load failed: {fontError.message}
        </Text>
      </View>
    );
  }

  if (!fontsLoaded) {
    return <LoadingScreen />;
  }

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <SafeAreaProvider>
          <AuthGuard />
        </SafeAreaProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
