import React from 'react';
import { View, Pressable, StyleSheet, ViewStyle } from 'react-native';
import { COLORS } from '../constants/colors';
import { RADIUS, SHADOWS, SPACING } from '../constants/theme';

type Variant = 'default' | 'elevated' | 'flat' | 'outline' | 'inset';

interface CardProps {
  children: React.ReactNode;
  variant?: Variant;
  onPress?: () => void;
  onLongPress?: () => void;
  style?: ViewStyle;
  accessibilityLabel?: string;
  padding?: number;
}

export function Card({
  children,
  variant = 'default',
  onPress,
  onLongPress,
  style,
  accessibilityLabel,
  padding,
}: CardProps) {
  const content = (
    <View
      style={[
        styles.card,
        variant === 'elevated' && [styles.elevated, SHADOWS.md],
        variant === 'flat'     && styles.flat,
        variant === 'outline'  && styles.outline,
        variant === 'inset'    && styles.inset,
        padding != null && { padding },
        style,
      ]}
    >
      {children}
    </View>
  );

  if (onPress || onLongPress) {
    return (
      <Pressable
        onPress={onPress}
        onLongPress={onLongPress}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        style={({ pressed }) => ({
          opacity: pressed ? 0.82 : 1,
          transform: [{ scale: pressed ? 0.985 : 1 }],
        })}
      >
        {content}
      </Pressable>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  // Elevated: slightly lighter surface, deeper shadow for separation
  elevated: {
    backgroundColor: COLORS.card,
    borderColor: COLORS.borderStrong,
    borderWidth: 1,
  },
  // Flat: no border, darker inset feel
  flat: {
    backgroundColor: COLORS.cardAlt,
    borderWidth: 0,
  },
  // Outline: transparent with border (CTA cards, dashed hints)
  outline: {
    backgroundColor: 'transparent',
    borderColor: COLORS.borderStrong,
  },
  // Inset: deeply recessed — use inside cards for sub-sections
  inset: {
    backgroundColor: COLORS.cardAlt,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: RADIUS.md,
  },
});
