import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { BadgeVariant } from '../../types';
import {
  Colors,
  FontFamily,
  FontSize,
  BorderRadius,
  Spacing,
  LineHeight,
  LetterSpacing,
  withAlpha,
} from '../../constants/tokens';

// ─── Types ────────────────────────────────────────────────────────────────────

interface BadgeProps {
  variant: BadgeVariant;
  label?: string;
  style?: ViewStyle;
}

// ─── Variant config ───────────────────────────────────────────────────────────
// Stitch spec: pill shape, 15% opacity backgrounds, proper text colors, ALL CAPS

const VARIANT_CONFIG: Record<BadgeVariant, { bg: string; text: string; defaultLabel: string }> = {
  ongoing: {
    bg: Colors.successSubtle,
    text: Colors.success,
    defaultLabel: 'Ongoing',
  },
  completed: {
    bg: Colors.successSubtle,
    text: Colors.successText,
    defaultLabel: 'Completed',
  },
  onhold: {
    bg: Colors.warningSubtle,
    text: Colors.warningText,
    defaultLabel: 'On Hold',
  },
  pending: {
    bg: Colors.warningSubtle,
    text: Colors.warningText,
    defaultLabel: 'Pending',
  },
  approved: {
    bg: Colors.successSubtle,
    text: Colors.successText,
    defaultLabel: 'Approved',
  },
  rejected: {
    bg: Colors.dangerSubtle,
    text: Colors.danger,
    defaultLabel: 'Rejected',
  },
};

// ─── Component ────────────────────────────────────────────────────────────────

export const Badge: React.FC<BadgeProps> = ({ variant, label, style }) => {
  const config = VARIANT_CONFIG[variant];

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: config.bg },
        style,
      ]}
    >
      <Text style={[styles.label, { color: config.text }]}>
        {label ?? config.defaultLabel}
      </Text>
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  badge: {
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    alignSelf: 'flex-start',
  },
  label: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    lineHeight: FontSize.xs * LineHeight.normal,
    letterSpacing: LetterSpacing.wider,
    textTransform: 'uppercase',
  },
});
