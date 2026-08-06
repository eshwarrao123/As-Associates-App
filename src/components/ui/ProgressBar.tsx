import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { Colors, FontFamily, FontSize } from '../../constants/tokens';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ProgressBarProps {
  value: number; // 0–100
  showLabel?: boolean;
  style?: ViewStyle;
  trackColor?: string;
  fillColor?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  showLabel = true,
  style,
  trackColor = Colors.track,
  fillColor = Colors.primary,
}) => {
  const clamped = Math.min(100, Math.max(0, value));

  return (
    <View style={[styles.row, style]}>
      <View style={[styles.track, { backgroundColor: trackColor }]}>
        <View
          style={[
            styles.fill,
            { width: `${clamped}%` as `${number}%`, backgroundColor: fillColor },
          ]}
        />
      </View>
      {showLabel && (
        <Text style={styles.label}>{clamped}%</Text>
      )}
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  track: {
    flex: 1,
    height: 6,
    borderRadius: 999,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 999,
  },
  label: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    minWidth: 32,
    textAlign: 'right',
  },
});
