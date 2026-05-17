import React from 'react';
import { Pressable, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { COLORS } from '../constants/colors';
import { RADIUS, TOUCH_TARGET } from '../constants/theme';

const AnimatedPress = Animated.createAnimatedComponent(Pressable);

type IconName = React.ComponentProps<typeof Ionicons>['name'];
type Variant = 'subtle' | 'plain' | 'solid' | 'danger';

interface IconButtonProps {
  icon: IconName;
  onPress: () => void;
  variant?: Variant;
  size?: number;
  accessibilityLabel: string;
  style?: ViewStyle;
  disabled?: boolean;
}

const VARIANT: Record<Variant, { bg: string; fg: string; border?: string }> = {
  subtle: { bg: COLORS.cardAlt, fg: COLORS.textSecondary, border: COLORS.border },
  plain:  { bg: 'transparent',  fg: COLORS.textSecondary },
  solid:  { bg: COLORS.primary, fg: '#fff' },
  danger: { bg: COLORS.dangerSoft, fg: COLORS.danger, border: COLORS.danger },
};

export function IconButton({
  icon,
  onPress,
  variant = 'subtle',
  size = 20,
  accessibilityLabel,
  style,
  disabled,
}: IconButtonProps) {
  const v = VARIANT[variant];
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: disabled ? 0.38 : 1,
  }));

  return (
    <AnimatedPress
      onPress={onPress}
      onPressIn={() => {
        if (!disabled) scale.value = withSpring(0.82, { damping: 15, stiffness: 250 });
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 12, stiffness: 180 });
      }}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      hitSlop={8}
      style={[
        styles.btn,
        {
          backgroundColor: v.bg,
          borderColor: v.border ?? 'transparent',
          borderWidth: v.border ? 1 : 0,
        },
        animStyle,
        style,
      ]}
    >
      <Ionicons name={icon} size={size} color={v.fg} />
    </AnimatedPress>
  );
}

const styles = StyleSheet.create({
  btn: {
    minWidth: TOUCH_TARGET,
    minHeight: TOUCH_TARGET,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: RADIUS.md,
  },
});
