import React from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import Animated, {
  FadeIn,
  FadeInLeft,
  FadeInRight,
  FadeInDown,
  FadeInUp,
  SlideInRight,
  SlideInLeft,
  ZoomIn,
} from 'react-native-reanimated';
import { getNavDirection } from '../utils/navDirection';

export type ScreenTransitionVariant = 'slide' | 'fade' | 'rise' | 'drop' | 'zoom';

type Props = {
  children: React.ReactNode;
  variant?: ScreenTransitionVariant;
  duration?: number;
  style?: StyleProp<ViewStyle>;
};

export function ScreenTransition({
  children,
  variant = 'slide',
  duration = 280,
  style,
}: Props) {
  const direction = getNavDirection();

  const entering =
    variant === 'slide'
      ? direction === 'right'
        ? FadeInRight.duration(duration).damping(20).stiffness(140)
        : FadeInLeft.duration(duration).damping(20).stiffness(140)
      : variant === 'fade'
      ? FadeIn.duration(duration)
      : variant === 'drop'
      ? FadeInDown.duration(duration).springify().damping(18)
      : variant === 'zoom'
      ? ZoomIn.duration(duration).springify().damping(18)
      : FadeInUp.duration(duration).springify().damping(18);

  return (
    <Animated.View entering={entering} style={[{ flex: 1 }, style]}>
      {children}
    </Animated.View>
  );
}
