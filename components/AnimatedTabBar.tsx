import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Platform,
  LayoutChangeEvent,
  Animated as RNAnimated,
} from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { COLORS } from '../constants/colors';
import { RADIUS } from '../constants/theme';
import { setNavDirection } from '../utils/navDirection';

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

const ICONS: Record<string, IoniconName> = {
  index:        'home',
  expenses:     'receipt',
  'fixed-costs':'repeat',
  shopping:     'cart',
  charts:       'bar-chart',
};

const INDICATOR_HEIGHT = 32;
const INDICATOR_WIDTH  = 40;

export function AnimatedTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const tabCount = state.routes.length;
  const [barWidth, setBarWidth] = useState(0);
  const tabWidth = barWidth > 0 ? barWidth / tabCount : 0;

  const target =
    tabWidth > 0
      ? tabWidth * state.index + (tabWidth - INDICATOR_WIDTH) / 2
      : 0;

  // Use RN's built-in Animated.Value driven on the native thread.
  const indicatorX = useRef(new RNAnimated.Value(0)).current;
  const initialized = useRef(false);

  useEffect(() => {
    if (tabWidth <= 0) return;
    if (!initialized.current) {
      indicatorX.setValue(target);
      initialized.current = true;
    } else {
      RNAnimated.spring(indicatorX, {
        toValue: target,
        useNativeDriver: true,
        speed: 16,
        bounciness: 4,
      }).start();
    }
  }, [target, tabWidth, indicatorX]);

  const onBarLayout = (e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width;
    if (w !== barWidth) setBarWidth(w);
  };

  return (
    <View style={styles.bar} onLayout={onBarLayout}>
      {tabWidth > 0 && (
        <RNAnimated.View
          pointerEvents="none"
          style={[
            styles.indicator,
            { transform: [{ translateX: indicatorX }] },
          ]}
        />
      )}

      {state.routes.map((route, idx) => {
        const focused = state.index === idx;
        const { options } = descriptors[route.key];
        const baseName = ICONS[route.name] ?? 'ellipse-outline';
        const iconName = (focused ? baseName : `${baseName}-outline`) as IoniconName;
        const label = (options.title ?? route.name) as string;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });
          if (!focused && !event.defaultPrevented) {
            setNavDirection(state.index, idx);
            (navigation.navigate as any)(route.name, route.params);
          }
        };

        return (
          <Pressable
            key={route.key}
            onPress={onPress}
            style={styles.tab}
            accessibilityRole="button"
            accessibilityState={{ selected: focused }}
            accessibilityLabel={label}
          >
            <TabIcon name={iconName} focused={focused} />
            <Text
              numberOfLines={1}
              style={[styles.label, { color: focused ? COLORS.primary : COLORS.textMuted }]}
            >
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

// Icon with subtle bounce on focus change
function TabIcon({ name, focused }: { name: IoniconName; focused: boolean }) {
  const scale = useSharedValue(focused ? 1 : 0.92);

  useEffect(() => {
    scale.value = withTiming(focused ? 1 : 0.92, {
      duration: 220,
      easing: Easing.out(Easing.cubic),
    });
  }, [focused, scale]);

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={[styles.iconWrap, iconStyle]}>
      <Ionicons
        name={name}
        size={22}
        color={focused ? COLORS.primary : COLORS.textMuted}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    backgroundColor: COLORS.bgElevated,
    borderTopColor: COLORS.border,
    borderTopWidth: 1,
    height: Platform.OS === 'ios' ? 88 : 68,
    paddingBottom: Platform.OS === 'ios' ? 24 : 10,
    paddingTop: 8,
  },
  indicator: {
    position: 'absolute',
    top: 8,
    left: 0,
    width: INDICATOR_WIDTH,
    height: INDICATOR_HEIGHT,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.primarySoft,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 2,
  },
  iconWrap: {
    width: INDICATOR_WIDTH,
    height: INDICATOR_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.2,
    marginTop: 2,
  },
});
