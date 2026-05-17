import React, { useState } from 'react';
import {
  TextInput,
  Text,
  View,
  StyleSheet,
  TextInputProps,
  ViewStyle,
  I18nManager,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import { RADIUS, SPACING } from '../constants/theme';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: IconName;
  containerStyle?: ViewStyle;
}

export function Input({
  label,
  error,
  helperText,
  icon,
  containerStyle,
  onFocus,
  onBlur,
  multiline,
  style,
  ...props
}: InputProps) {
  const [focused, setFocused] = useState(false);

  const borderColor = error
    ? COLORS.danger
    : focused
    ? COLORS.primary
    : COLORS.border;

  const bgColor = focused ? COLORS.surface : COLORS.cardAlt;

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View
        style={[
          styles.inputWrap,
          {
            borderColor,
            backgroundColor: bgColor,
            // Subtle glow on focus — simulated via border colour intensity
            shadowColor: focused ? COLORS.primary : 'transparent',
            shadowOpacity: focused ? 0.3 : 0,
            shadowRadius: 6,
            shadowOffset: { width: 0, height: 0 },
          },
          multiline && styles.multilineWrap,
        ]}
      >
        {icon && (
          <Ionicons
            name={icon}
            size={17}
            color={focused ? COLORS.primary : COLORS.textMuted}
            style={styles.icon}
          />
        )}
        <TextInput
          placeholderTextColor={COLORS.textSubtle}
          style={[styles.input, multiline && styles.multiline, style]}
          multiline={multiline}
          textAlign={I18nManager.isRTL ? 'right' : 'left'}
          accessibilityLabel={label}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          {...props}
        />
      </View>
      {error ? (
        <View style={styles.feedbackRow}>
          <Ionicons name="alert-circle" size={12} color={COLORS.danger} />
          <Text style={styles.error}>{error}</Text>
        </View>
      ) : helperText ? (
        <Text style={styles.helper}>{helperText}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: SPACING.xs },
  label: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: RADIUS.md,
    borderWidth: 1.5,
    paddingHorizontal: SPACING.md,
    minHeight: 50,
  },
  multilineWrap: {
    minHeight: 88,
    alignItems: 'flex-start',
    paddingVertical: SPACING.md,
  },
  icon: {
    marginEnd: SPACING.sm,
  },
  input: {
    flex: 1,
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '500',
    paddingVertical: 14,
  },
  multiline: {
    paddingVertical: 0,
    minHeight: 64,
    textAlignVertical: 'top',
  },
  feedbackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  error: {
    color: COLORS.danger,
    fontSize: 12,
    fontWeight: '500',
  },
  helper: {
    color: COLORS.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
});
