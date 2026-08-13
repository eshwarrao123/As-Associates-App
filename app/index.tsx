import React, { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../src/store/auth.store';
import SplashScreen from './splash';

export default function RootIndex(): React.ReactElement {
  const router = useRouter();
  const { isAuthenticated, role, isHydrated } = useAuthStore();
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    // Show splash for 2 seconds, then check auth and redirect
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Only redirect after splash is done and auth is hydrated
    if (!showSplash && isHydrated) {
      if (!isAuthenticated) {
        router.replace('/(auth)/login');
      } else {
        router.replace(role === 'admin' ? '/(admin)' : '/(employee)');
      }
    }
  }, [showSplash, isHydrated, isAuthenticated, role, router]);

  // Show splash for first 2 seconds
  if (showSplash) {
    return <SplashScreen />;
  }

  // After splash, the auth guard in _layout.tsx will handle routing
  return <SplashScreen />;
}
