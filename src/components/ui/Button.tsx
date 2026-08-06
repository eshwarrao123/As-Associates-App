import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableOpacityProps,
  ViewStyle,
} from 'react-native';
import { Colors, FontFamily, FontSize, BorderRadius, ButtonHeight } from '../../constants/tokens';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ButtonProps extends TouchableOpacityProps {
  label: string;
  onPress: () => void;
  loading?: boolean;
  variant?: 'primary' | 'outline' | 'ghost';
  fullWidth?: boolean;
  style?: ViewStyle;
}

// ─── Component ────────────────────────────────────────────────────────────────

export const Button: React.FC<ButtonProps> = ({
  label,
  onPress,
  loading = false,
  variant = 'primary',
  fullWidth = true,
  disabled,
  style,
  ...rest
}) => {
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      disabled={isDisabled}
      style={[
        styles.base,
        fullWidth && styles.fullWidth,
        variant === 'primary' && styles.primary,
        variant === 'outline' && styles.outline,
        variant === 'ghost' && styles.ghost,
        isDisabled && styles.disabled,
        style,
      ]}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' ? Colors.surface : Colors.accent}
        />
      ) : (
        <Text
          style={[
            styles.label,
            variant === 'outline' && styles.labelOutline,
            variant === 'ghost' && styles.labelGhost,
          ]}
        >
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  base: {
    height: ButtonHeight,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius.btn,
    paddingHorizontal: 24,
  },
  fullWidth: {
    width: '100%',
  },
  primary: {
    backgroundColor: Colors.accent,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  disabled: {
    opacity: 0.5,
  },
  label: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
    lineHeight: 18,
    color: Colors.surface,
    letterSpacing: 0.14,
  },
  labelOutline: {
    color: Colors.primary,
  },
  labelGhost: {
    color: Colors.primary,
  },
});
