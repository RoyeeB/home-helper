import React from 'react';
import {
  Pressable,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import { RADIUS, SHADOWS, SPACING, TOUCH_TARGET } from '../constants/theme';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';
type IconName = React.ComponentProps<typeof Ionicons>['name'];

interface ButtonProps {
  onPress: () => void;
  label: string;
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  disabled?: boolean;
  icon?: IconName;
  iconPosition?: 'leading' | 'trailing';
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  accessibilityLabel?: string;
}

const VARIANT_STYLES: Record<Variant, { bg: string; fg: string; border?: string; glow?: boolean }> = {
  primary:   { bg: COLORS.primary,   fg: '#fff', glow: true },
  secondary: { bg: COLORS.cardAlt,   fg: COLORS.text,    border: COLORS.borderStrong },
  ghost:     { bg: 'transparent',    fg: COLORS.primary },
  danger:    { bg: COLORS.dangerSoft, fg: COLORS.danger,  border: COLORS.danger },
};

const SIZE_STYLES: Record<Size, { padV: number; padH: number; font: number; height: number; iconSize: number }> = {
  sm: { padV: 9,  padH: 16, font: 13, height: TOUCH_TARGET - 6,  iconSize: 15 },
  md: { padV: 13, padH: 22, font: 15, height: TOUCH_TARGET + 2,  iconSize: 18 },
  lg: { padV: 17, padH: 28, font: 16, height: TOUCH_TARGET + 10, iconSize: 20 },
};

export function Button({
  onPress,
  label,
  variant = 'primary',
  size = 'md',
  loading,
  disabled,
  icon,
  iconPosition = 'leading',
  fullWidth = true,
  style,
  textStyle,
  accessibilityLabel,
}: ButtonProps) {
  const v = VARIANT_STYLES[variant];
  const s = SIZE_STYLES[size];
  const isDisabled = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      style={({ pressed }) => [
        styles.btn,
        v.glow && !isDisabled ? SHADOWS.glow : undefined,
        {
          backgroundColor: v.bg,
          paddingVertical: s.padV,
          paddingHorizontal: s.padH,
          minHeight: s.height,
          borderWidth: v.border ? 1.5 : 0,
          borderColor: v.border,
          opacity: isDisabled ? 0.45 : pressed ? 0.88 : 1,
          transform: [{ scale: pressed && !isDisabled ? 0.975 : 1 }],
          alignSelf: fullWidth ? 'stretch' : 'flex-start',
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={v.fg} size="small" />
      ) : (
        <View style={styles.content}>
          {icon && iconPosition === 'leading' && (
            <Ionicons name={icon} size={s.iconSize} color={v.fg} />
          )}
          <Text
            style={[
              styles.label,
              { color: v.fg, fontSize: s.font },
              textStyle,
            ]}
          >
            {label}
          </Text>
          {icon && iconPosition === 'trailing' && (
            <Ionicons name={icon} size={s.iconSize} color={v.fg} />
          )}
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  label: {
    fontWeight: '700',
    letterSpacing: 0.1,
  },
});
