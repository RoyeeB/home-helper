import { TextStyle, ViewStyle, Platform } from 'react-native';
import { COLORS } from './colors';

// ─── Spacing — 4-pt grid ──────────────────────────────────────────────────────
export const SPACING = {
  xs:   4,
  sm:   8,
  md:   12,
  lg:   16,
  xl:   20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 48,
};

// ─── Border Radius ────────────────────────────────────────────────────────────
// Larger, more modern radii — cards feel softer, components feel premium.
export const RADIUS = {
  xs:   6,
  sm:   10,
  md:   14,
  lg:   20,
  xl:   28,
  '2xl': 36,
  pill: 999,
};

// ─── Typography scale ─────────────────────────────────────────────────────────
// Clear 6-step hierarchy. Tighter letter-spacing on large sizes (editorial).
// Body text uses a fractionally larger base (15→16) for readability on OLED.
export const TYPE: Record<string, TextStyle> = {
  // Hero — dashboard total spend
  hero: {
    fontSize: 44,
    fontWeight: '800',
    color: COLORS.text,
    letterSpacing: -1.5,
  },
  // Display — section hero numbers
  display: {
    fontSize: 34,
    fontWeight: '800',
    color: COLORS.text,
    letterSpacing: -1,
  },
  // H1 — page titles
  h1: {
    fontSize: 26,
    fontWeight: '700',
    color: COLORS.text,
    letterSpacing: -0.5,
  },
  // H2 — modal titles, section majors
  h2: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
    letterSpacing: -0.3,
  },
  // H3 — section headers, card titles
  h3: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    letterSpacing: -0.1,
  },
  // Body
  body: {
    fontSize: 15,
    fontWeight: '500',
    color: COLORS.text,
  },
  bodyStrong: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
  },
  // Caption — meta, secondary labels
  caption: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  // Micro — timestamps, hints, overlines
  micro: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textMuted,
    letterSpacing: 0.4,
  },
  // Overline — all-caps labels above values
  overline: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textMuted,
    letterSpacing: 1.2,
    textTransform: 'uppercase' as const,
  },
};

// ─── Shadow / Elevation system ────────────────────────────────────────────────
// iOS: coloured shadows using primaryDark tint for depth on dark bg.
// Android: standard elevation.
export const SHADOWS: Record<'xs' | 'sm' | 'md' | 'lg' | 'glow', ViewStyle> = {
  xs: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOpacity: 0.2,
      shadowRadius: 4,
      shadowOffset: { width: 0, height: 1 },
    },
    default: { elevation: 1 },
  })!,
  sm: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOpacity: 0.28,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 3 },
    },
    default: { elevation: 3 },
  })!,
  md: Platform.select({
    ios: {
      shadowColor: '#0a0d1a',
      shadowOpacity: 0.5,
      shadowRadius: 16,
      shadowOffset: { width: 0, height: 6 },
    },
    default: { elevation: 6 },
  })!,
  lg: Platform.select({
    ios: {
      shadowColor: '#0a0d1a',
      shadowOpacity: 0.6,
      shadowRadius: 28,
      shadowOffset: { width: 0, height: 12 },
    },
    default: { elevation: 12 },
  })!,
  // Accent glow — used on FAB and primary CTAs
  glow: Platform.select({
    ios: {
      shadowColor: '#818cf8',
      shadowOpacity: 0.55,
      shadowRadius: 18,
      shadowOffset: { width: 0, height: 6 },
    },
    default: { elevation: 10 },
  })!,
};

// Minimum iOS Human Interface touch target
export const TOUCH_TARGET = 44;
