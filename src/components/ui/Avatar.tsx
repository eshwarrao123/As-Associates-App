import React from 'react';
import { Image, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { Colors, FontFamily, FontSize } from '../../constants/tokens';

// ─── Types ────────────────────────────────────────────────────────────────────

type AvatarSize = 'sm' | 'md' | 'lg';

interface AvatarProps {
  initials: string;
  size?: AvatarSize;
  style?: ViewStyle;
  bgColor?: string;
  photoUrl?: string | null;
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
  photoUrl,
}) => {
  const { container, fontSize } = SIZE_MAP[size];

  const containerStyle = [
    styles.base,
    {
      width: container,
      height: container,
      borderRadius: container / 2,
      backgroundColor: photoUrl ? Colors.border : bgColor,
    },
    style,
  ];

  // If photoUrl exists and is valid, render image
  if (photoUrl && photoUrl.trim() !== '') {
    return (
      <View style={containerStyle}>
        <Image
          source={{ uri: photoUrl }}
          style={styles.image}
          resizeMode="cover"
        />
      </View>
    );
  }

  // Fallback to initials
  return (
    <View style={containerStyle}>
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
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  initials: {
    fontFamily: FontFamily.bold,
    color: Colors.surface,
    letterSpacing: 0.5,
  },
});
