import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from './Card';
import { COLORS, CATEGORY_COLORS, CATEGORY_LABELS, CATEGORY_ICONS, Category } from '../constants/colors';
import { RADIUS, SPACING, TYPE } from '../constants/theme';

interface BudgetItem {
  category: Category;
  spent: number;
  budget: number;
}

interface BudgetCardProps {
  items: BudgetItem[];
}

function formatAmount(n: number) {
  return `₪${n.toLocaleString('he-IL', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

export function BudgetCard({ items }: BudgetCardProps) {
  return (
    <Card variant="elevated" style={styles.card}>
      {items.map((item, i) => {
        const pct = item.budget > 0 ? Math.min(100, (item.spent / item.budget) * 100) : 0;
        const isOver = item.spent > item.budget;
        const nearLimit = pct >= 80 && !isOver;
        const color = isOver
          ? COLORS.danger
          : nearLimit
          ? COLORS.warning
          : CATEGORY_COLORS[item.category];
        const catIcon = (CATEGORY_ICONS[item.category] ?? 'pricetag') as React.ComponentProps<typeof Ionicons>['name'];

        return (
          <View key={item.category} style={[styles.row, i > 0 && styles.rowBorder]}>
            <View style={styles.topRow}>
              <View style={styles.labelGroup}>
                <View style={[styles.iconBox, { backgroundColor: color + '20' }]}>
                  <Ionicons name={catIcon} size={13} color={color} />
                </View>
                <Text style={styles.label}>{CATEGORY_LABELS[item.category]}</Text>
                {nearLimit && !isOver && (
                  <View style={styles.warnDot} />
                )}
              </View>
              <View style={styles.amountGroup}>
                <Text style={[styles.spentAmount, { color: isOver ? COLORS.danger : COLORS.text }]}>
                  {formatAmount(item.spent)}
                </Text>
                <Text style={styles.muted}> / {formatAmount(item.budget)}</Text>
              </View>
            </View>

            {/* Progress track */}
            <View style={styles.track}>
              <View
                style={[
                  styles.fill,
                  {
                    width: `${pct}%`,
                    backgroundColor: color,
                    borderRadius: RADIUS.xs,
                  },
                ]}
              />
            </View>

            <View style={styles.bottomRow}>
              {isOver ? (
                <View style={styles.overTag}>
                  <Ionicons name="warning" size={10} color={COLORS.danger} />
                  <Text style={styles.overText}>חריגה של {formatAmount(item.spent - item.budget)}</Text>
                </View>
              ) : (
                <Text style={styles.remainText}>
                  נותר {formatAmount(item.budget - item.spent)}
                </Text>
              )}
              <Text style={[styles.pctText, { color }]}>
                {pct.toFixed(0)}%
              </Text>
            </View>
          </View>
        );
      })}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { padding: 0 },
  row: {
    padding: SPACING.lg,
    gap: SPACING.sm,
  },
  rowBorder: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  labelGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  iconBox: {
    width: 28,
    height: 28,
    borderRadius: RADIUS.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    ...TYPE.body,
    color: COLORS.text,
    fontWeight: '600',
  },
  warnDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.warning,
  },
  amountGroup: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  spentAmount: {
    fontSize: 14,
    fontWeight: '700',
  },
  muted: {
    ...TYPE.micro,
    color: COLORS.textMuted,
  },
  track: {
    height: 5,
    backgroundColor: COLORS.cardAlt,
    borderRadius: RADIUS.xs,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  remainText: {
    ...TYPE.micro,
    color: COLORS.textMuted,
  },
  pctText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  overTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  overText: {
    ...TYPE.micro,
    color: COLORS.danger,
    fontWeight: '700',
  },
});
