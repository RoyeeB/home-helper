import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import { RADIUS, SPACING, TYPE } from '../constants/theme';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

interface EmptyStateProps {
  icon?: IconName;
  emoji?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
  style?: ViewStyle;
}

export function EmptyState({ icon, emoji, title, description, action, style }: EmptyStateProps) {
  return (
    <View style={[styles.container, style]}>
      {/* Icon with layered rings for depth */}
      <View style={styles.iconOuter}>
        <View style={styles.iconInner}>
          {emoji ? (
            <Text style={styles.emoji}>{emoji}</Text>
          ) : (
            <Ionicons name={icon ?? 'document-outline'} size={28} color={COLORS.primary} />
          )}
        </View>
      </View>
      <Text style={styles.title}>{title}</Text>
      {description && <Text style={styles.desc}>{description}</Text>}
      {action && <View style={styles.action}>{action}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: SPACING['4xl'],
    paddingHorizontal: SPACING.xl,
    gap: SPACING.md,
  },
  // Outer ring — very faint primary tint
  iconOuter: {
    width: 84,
    height: 84,
    borderRadius: RADIUS.pill,
    backgroundColor: COLORS.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xs,
  },
  // Inner circle — slightly stronger primary tint
  iconInner: {
    width: 60,
    height: 60,
    borderRadius: RADIUS.pill,
    backgroundColor: 'rgba(129, 140, 248, 0.20)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(129, 140, 248, 0.28)',
  },
  emoji: { fontSize: 30 },
  title: {
    ...TYPE.h3,
    textAlign: 'center',
    color: COLORS.text,
  },
  desc: {
    ...TYPE.caption,
    textAlign: 'center',
    color: COLORS.textMuted,
    maxWidth: 260,
    lineHeight: 19,
  },
  action: { marginTop: SPACING.md, alignSelf: 'stretch' },
});
