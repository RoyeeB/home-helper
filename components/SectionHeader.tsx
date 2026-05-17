import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { COLORS } from '../constants/colors';
import { SPACING, TYPE } from '../constants/theme';

interface SectionHeaderProps {
  title: string;
  hint?: string;
  action?: { label: string; onPress: () => void };
  style?: ViewStyle;
}

export function SectionHeader({ title, hint, action, style }: SectionHeaderProps) {
  return (
    <View style={[styles.row, style]}>
      <View style={styles.titleWrap}>
        <Text style={styles.title}>{title}</Text>
        {hint ? <Text style={styles.hint}>{hint}</Text> : null}
      </View>
      {action && (
        <TouchableOpacity
          onPress={action.onPress}
          accessibilityRole="button"
          accessibilityLabel={action.label}
          hitSlop={10}
          style={styles.actionWrap}
        >
          <Text style={styles.action}>{action.label}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: SPACING.sm,
  },
  titleWrap: { flex: 1 },
  title: {
    ...TYPE.h3,
    color: COLORS.text,
    fontWeight: '700',
  },
  hint: {
    ...TYPE.micro,
    color: COLORS.textMuted,
    marginTop: 3,
  },
  actionWrap: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    backgroundColor: COLORS.primarySoft,
    borderRadius: 999,
  },
  action: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
    letterSpacing: 0.1,
  },
});
