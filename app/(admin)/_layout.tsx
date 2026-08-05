import React from 'react';
import { Stack } from 'expo-router';
import { Colors } from '../../src/constants/tokens';

export default function AdminLayout(): React.ReactElement {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: Colors.primary },
        headerTintColor: Colors.surface,
        headerTitleStyle: {
          fontFamily: 'Inter_700Bold',
          fontSize: 18,
        },
        headerShadowVisible: false,
        contentStyle: { backgroundColor: Colors.background },
      }}
    />
  );
}
