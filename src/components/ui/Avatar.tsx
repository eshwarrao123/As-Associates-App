import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { Colors, FontFamily, FontSize } from '../../constants/tokens';

// ─── Types ────────────────────────────────────────────────────────────────────

type AvatarSize = 'sm' | 'md' | 'lg';

interface AvatarProps {
  initials: string;
  size?: AvatarSize;
  style?: ViewStyle;
  bgColor?: string;
}

// ─── Size map ─────────────────────────────────────────────────────────────────

const SIZE_MAP: Record<AvatarSize, { container: number; fontSize: number }> = {
  sm: { container: 32, fontSize: 12 },
  md: { container: 44, fontSize: 16 },
  lg: { container: 60, fontSize: 22 },
};

// ─── Component ────────────────────────────────────────────────────────────────

export const Avatar: React.FC<AvatarProps> = ({
  initials,
  size = 'md',
  style,
  bgColor = Colors.primary,
}) => {
  const { container, fontSize } = SIZE_MAP[size];

  return (
    <View
      style={[
        styles.base,
        {
          width: container,
          height: container,
          borderRadius: container / 2,
          backgroundColor: bgColor,
        },
        style,
      ]}
    >
      <Text style={[styles.initials, { fontSize }]}>
        {initials.slice(0, 2).toUpperCase()}
      </Text>
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    fontFamily: FontFamily.bold,
    color: Colors.surface,
    letterSpacing: 0.5,
  },
});
