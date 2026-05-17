import React from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import { Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';

const AnimatedPress = Animated.createAnimatedComponent(Pressable);

type Props = {
  children: React.ReactNode;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
  scaleDown?: number;
  disabled?: boolean;
  accessibilityRole?: 'button' | 'link';
  accessibilityLabel?: string;
};

export function AnimatedPressable({
  children,
  onPress,
  style,
  scaleDown = 0.92,
  disabled,
  accessibilityRole = 'button',
  accessibilityLabel,
}: Props) {
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPress
      onPress={onPress}
      onPressIn={() => {
        scale.value = withSpring(scaleDown, { damping: 15, stiffness: 200 });
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 12, stiffness: 180 });
      }}
      disabled={disabled}
      accessibilityRole={accessibilityRole}
      accessibilityLabel={accessibilityLabel}
      style={[animStyle, style]}
    >
      {children}
    </AnimatedPress>
  );
}
