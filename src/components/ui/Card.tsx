import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { Colors, BorderRadius, Shadow } from '../../constants/tokens';

// ─── Types ────────────────────────────────────────────────────────────────────

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  noPadding?: boolean;
}

// ─── Component ────────────────────────────────────────────────────────────────

export const Card: React.FC<CardProps> = ({ children, style, noPadding = false }) => {
  return (
    <View style={[styles.card, !noPadding && styles.padding, style]}>
      {children}
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.card,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadow.card,
  },
  padding: {
    padding: 16,
  },
});
