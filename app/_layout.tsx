import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Slot, useRouter, useSegments } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_700Bold,
  Inter_800ExtraBold,
} from '@expo-google-fonts/inter';
import { useAuthStore } from '../src/store/auth.store';
import { Colors, FontFamily, FontSize } from '../src/constants/tokens';
import { getAccessToken } from '../src/services/api/tokenStore';
import { getMe } from '../src/services/auth/authService';
import { clearTokens } from '../src/services/api/tokenStore';

// ─── TanStack Query client ────────────────────────────────────────────────────

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
      retryDelay: 1000,
    },
  },
});

// ─── Error Boundary ───────────────────────────────────────────────────────────

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class AppErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  handleReset = () => this.setState({ hasError: false, error: null });

  render() {
    if (this.state.hasError) {
      return (
        <View style={eb.container}>
          <Text style={eb.title}>Something went wrong</Text>
          <Text style={eb.message}>{this.state.error?.message ?? 'Unknown error'}</Text>
          <TouchableOpacity style={eb.btn} onPress={this.handleReset}>
            <Text style={eb.btnText}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return this.props.children;
  }
}

const eb = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, backgroundColor: Colors.background },
  title: { fontFamily: 'Inter_700Bold', fontSize: 18, color: Colors.textPrimary, marginBottom: 8 },
  message: { fontFamily: 'Inter_400Regular', fontSize: 13, color: Colors.danger, textAlign: 'center', marginBottom: 24, lineHeight: 20 },
  btn: { backgroundColor: Colors.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 },
  btnText: { fontFamily: 'Inter_700Bold', fontSize: 14, color: '#fff' },
});

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
  const { isAuthenticated, role, isHydrated, hydrate, setUser } = useAuthStore();

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
            role: userData.role.toLowerCase() as 'admin' | 'employee',
            department: userData.department,
            avatarInitials: `${userData.firstName[0]}${userData.lastName[0]}`.toUpperCase(),
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
    if (segmentsRef.current.length === 0) return;

    const inAuthGroup = segmentsRef.current[0] === '(auth)';

    if (!isAuthenticated && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (isAuthenticated && inAuthGroup) {
      router.replace(role === 'admin' ? '/(admin)' : '/(employee)');
    }
  }, [isAuthenticated, isHydrated, role, router]);

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
    <AppErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <SafeAreaProvider>
          <AuthGuard />
        </SafeAreaProvider>
      </QueryClientProvider>
    </AppErrorBoundary>
  );
}
