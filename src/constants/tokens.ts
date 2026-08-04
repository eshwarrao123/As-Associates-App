// Design System Tokens
// Aligned with Stitch design system ID: 7450523547241458564
// Use these in StyleSheet.create() for consistent styling

export const Colors = {
  // Primary
  primary: '#1A3C5E',
  primaryDark: '#002645',
  
  // Accent
  accent: '#F5A623',
  
  // Backgrounds & Surfaces
  background: '#FCF8FB',
  surface: '#FFFFFF',
  
  // Borders & Dividers
  border: '#E5E7EB',
  divider: '#E5E7EB',
  
  // Text
  textPrimary: '#1B1B1D',
  textSecondary: '#43474E',
  textMuted: '#73777F',
  textOnPrimary: '#FFFFFF',
  textOnAccent: '#FFFFFF',
  
  // Status Colors
  success: '#16A34A',
  warning: '#F59E0B',
  danger: '#BA1A1A',
  info: '#1A73E8',
  
  // Status Text Colors (for badges)
  successText: '#166534',
  warningText: '#92400E',
  
  // Subtle Backgrounds (15% opacity equivalents for badges)
  successSubtle: '#DCFCE7',
  warningSubtle: '#FEF9C3',
  dangerSubtle: '#FEE2E2',
  infoSubtle: '#E3F2FD',
  
  // UI Elements
  track: '#E4E2E4',
  disabled: '#9CA3AF',
  overlay: 'rgba(0, 0, 0, 0.4)',
  overlayStrong: 'rgba(0, 0, 0, 0.55)',
} as const;

export const FontFamily = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  bold: 'Inter_700Bold',
  extraBold: 'Inter_800ExtraBold',
} as const;

export const FontSize = {
  xs: 11,
  sm: 12,
  md: 14,
  base: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
} as const;

export const FontWeight = {
  regular: '400',
  medium: '500',
  bold: '700',
  extraBold: '800',
} as const;

export const LineHeight = {
  tight: 1.2,
  normal: 1.5,
  relaxed: 1.75,
} as const;

export const LetterSpacing = {
  tight: -0.5,
  normal: 0,
  wide: 0.5,
  wider: 1,
  widest: 1.5,
} as const;

// Semantic Text Styles
export const TextStyles = {
  h1: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize['2xl'],
    lineHeight: FontSize['2xl'] * LineHeight.tight,
    letterSpacing: LetterSpacing.normal,
  },
  h2: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.lg,
    lineHeight: FontSize.lg * LineHeight.normal,
    letterSpacing: LetterSpacing.normal,
  },
  h3: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.base,
    lineHeight: FontSize.base * LineHeight.normal,
    letterSpacing: LetterSpacing.normal,
  },
  body: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.base,
    lineHeight: FontSize.base * LineHeight.normal,
    letterSpacing: LetterSpacing.normal,
  },
  bodySmall: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.md,
    lineHeight: FontSize.md * LineHeight.normal,
    letterSpacing: LetterSpacing.normal,
  },
  caption: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    lineHeight: FontSize.sm * LineHeight.normal,
    letterSpacing: LetterSpacing.normal,
  },
  label: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.md,
    lineHeight: FontSize.md * LineHeight.tight,
    letterSpacing: LetterSpacing.normal,
  },
  overline: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xs,
    lineHeight: FontSize.xs * LineHeight.tight,
    letterSpacing: LetterSpacing.wider,
    textTransform: 'uppercase' as const,
  },
} as const;

export const Spacing = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  7: 28,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
  // Semantic aliases for common use cases
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  '2xl': 32,
  '3xl': 40,
  '4xl': 48,
} as const;

export const BorderRadius = {
  none: 0,
  sm: 4,
  md: 8,      // inputs and buttons (Stitch ROUND_EIGHT)
  btn: 8,     // alias for md
  lg: 12,     // cards
  card: 12,   // alias for lg
  xl: 16,
  full: 999,  // circular/pill
  badge: 999, // alias for full
} as const;

export const Shadow = {
  none: {
    elevation: 0,
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
  },
  sm: {
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  card: {
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  md: {
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },
  lg: {
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
  },
  modal: {
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
  },
} as const;

// Fixed Component Dimensions
export const InputHeight = 48;
export const ButtonHeight = 48;
export const BottomNavHeight = 64;
export const ProgressBarHeight = 6;

export const AvatarSize = {
  sm: 32,
  md: 44,
  lg: 60,
} as const;

// Helper function to apply alpha to hex colors
export const withAlpha = (hex: string, alpha: number): string => {
  // Remove # if present
  const cleanHex = hex.replace('#', '');
  // Ensure alpha is between 0 and 1
  const clampedAlpha = Math.max(0, Math.min(1, alpha));
  // Convert alpha to 2-digit hex
  const alphaHex = Math.round(clampedAlpha * 255)
    .toString(16)
    .padStart(2, '0');
  return `#${cleanHex}${alphaHex}`;
};
