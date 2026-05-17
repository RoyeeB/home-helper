import { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PieChart, BarChart } from 'react-native-gifted-charts';
import { Ionicons } from '@expo/vector-icons';
import { useHouse } from '../../context/HouseContext';
import { Card } from '../../components/Card';
import { EmptyState } from '../../components/EmptyState';
import { ScreenTransition } from '../../components/ScreenTransition';
import { COLORS, CATEGORY_COLORS, CATEGORY_LABELS, CATEGORIES } from '../../constants/colors';
import { RADIUS, SPACING, TYPE } from '../../constants/theme';
import { getCurrentMonthKey, getLast6Months, getLast12Months, getMonthLabel } from '../../hooks/useMonthKey';
import { useLanguage } from '../../context/LanguageContext';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';

function formatAmount(n: number) {
  if (n >= 1000) return `₪${(n / 1000).toFixed(1)}k`;
  return `₪${n.toFixed(0)}`;
}

function formatAmountFull(n: number) {
  return `₪${n.toLocaleString('he-IL', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

export default function ChartsScreen() {
  const { expenses, fixedCosts, house } = useHouse();
  const { t } = useLanguage();
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonthKey());
  const months12 = getLast12Months();
  const months6  = getLast6Months();

  const monthExpenses = expenses.filter((e) => e.monthKey === selectedMonth);
  const fixedTotal    = fixedCosts.reduce((s, f) => s + f.amount, 0);

  const catData = useMemo(
    () =>
      CATEGORIES.map((cat) => {
        const total = monthExpenses
          .filter((e) => e.category === cat)
          .reduce((s, e) => s + e.amount, 0);
        return { value: total, color: CATEGORY_COLORS[cat], label: t(`categories.${cat}`), category: cat };
      }).filter((d) => d.value > 0),
    [monthExpenses, t]
  );

  const catTotal = catData.reduce((s, d) => s + d.value, 0);

  const barMonthlyData = useMemo(
    () =>
      months6.map((mk) => {
        // Variable expenses only (fixed costs are shown separately and would
        // show identical totals across past months — confusing).
        const varTotal = expenses.filter((e) => e.monthKey === mk).reduce((s, e) => s + e.amount, 0);
        const [, month] = mk.split('-');
        const isActive  = mk === selectedMonth;
        return {
          value: varTotal,
          label: month,
          frontColor: isActive ? COLORS.primary : COLORS.surface,
          topLabelComponent: () => (
            <Text style={[styles.barTopLabel, isActive && { color: COLORS.primary }]}>
              {varTotal > 0 ? formatAmount(varTotal) : ''}
            </Text>
          ),
        };
      }),
    [expenses, months6, selectedMonth]
  );

  const memberColors = [COLORS.primary, '#34d399', '#a78bfa', '#f87171', '#fbbf24', '#22d3ee'];
  const memberData = useMemo(
    () =>
      (house?.members ?? [])
        .map((m, i) => {
          const paid = monthExpenses.filter((e) => e.userId === m.uid).reduce((s, e) => s + e.amount, 0);
          return {
            value: paid,
            label: m.name.split(' ')[0],
            frontColor: memberColors[i % memberColors.length],
            topLabelComponent: () => (
              <Text style={styles.barTopLabel}>{paid > 0 ? formatAmount(paid) : ''}</Text>
            ),
          };
        })
        .filter((d) => d.value > 0),
    [house?.members, monthExpenses]
  );

  // Stacked bar: per-member spend across 6 months.
  // Each stack on a bar = one member's contribution that month.
  const memberMonthlyStack = useMemo(() => {
    const members = house?.members ?? [];
    return months6.map((mk) => {
      const monthExp = expenses.filter((e) => e.monthKey === mk);
      const monthTotal = monthExp.reduce((s, e) => s + e.amount, 0);
      const stacks = members
        .map((m, i) => {
          const paid = monthExp.filter((e) => e.userId === m.uid).reduce((s, e) => s + e.amount, 0);
          return paid > 0
            ? { value: paid, color: memberColors[i % memberColors.length] }
            : null;
        })
        .filter(Boolean) as { value: number; color: string }[];
      const [, month] = mk.split('-');
      const isActive = mk === selectedMonth;
      return {
        stacks: stacks.length > 0 ? stacks : [{ value: 0, color: 'transparent' }],
        label: month,
        labelTextStyle: isActive ? { color: COLORS.primary, fontWeight: '700' as const } : styles.axisLabel,
        topLabelComponent: () => (
          <Text style={[styles.barTopLabel, isActive && { color: COLORS.primary }]}>
            {monthTotal > 0 ? formatAmount(monthTotal) : ''}
          </Text>
        ),
      };
    });
  }, [expenses, house?.members, months6, selectedMonth]);

  const activeMembers = (house?.members ?? []).filter((m) =>
    expenses.some((e) => e.userId === m.uid && months6.includes(e.monthKey))
  );

  const hasAnyData = monthExpenses.length > 0 || fixedCosts.length > 0;

  // Month-over-month delta
  const prevMonthIdx = months6.indexOf(selectedMonth) - 1;
  const prevMonth    = prevMonthIdx >= 0 ? months6[prevMonthIdx] : null;
  const prevVarTotal = prevMonth
    ? expenses.filter((e) => e.monthKey === prevMonth).reduce((s, e) => s + e.amount, 0)
    : 0;
  const delta    = prevMonth ? catTotal - prevVarTotal : 0;
  const deltaPct = prevVarTotal > 0 ? (delta / prevVarTotal) * 100 : 0;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenTransition>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* ── Page header ────────────────────────────────────────────────────── */}
        <View style={styles.header}>
          <View>
            <Text style={styles.overline}>{t('charts.overline')}</Text>
            <Text style={styles.pageTitle}>{t('charts.title')}</Text>
          </View>
          {catTotal > 0 && (
            <Animated.View
              key={`hero-${selectedMonth}`}
              entering={FadeInUp.duration(280).springify()}
              style={styles.heroPill}
            >
              <Text style={styles.heroPillLabel}>{t('charts.variableExpenses')}</Text>
              <Text style={styles.heroPillValue}>{formatAmountFull(catTotal)}</Text>
            </Animated.View>
          )}
        </View>

        {/* ── Month selector ─────────────────────────────────────────────────── */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.pillScroll}
          contentContainerStyle={styles.pillRow}
        >
          {months12.map((mk) => {
            const active = selectedMonth === mk;
            return (
              <TouchableOpacity
                key={mk}
                style={[styles.pill, active && styles.pillActive]}
                onPress={() => setSelectedMonth(mk)}
                accessibilityRole="button"
                accessibilityLabel={getMonthLabel(mk)}
              >
                <Text style={[styles.pillText, active && styles.pillTextActive]}>
                  {getMonthLabel(mk)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* ── Empty state ─────────────────────────────────────────────────────── */}
        {!hasAnyData && (
          <EmptyState
            icon="bar-chart-outline"
            title={t('charts.emptyTitle')}
            description={t('charts.emptyHint')}
          />
        )}

        {/* ── Donut — category breakdown ──────────────────────────────────────── */}
        {catData.length > 0 && (
          <Card variant="elevated">
            <View style={styles.chartHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.chartTitle}>{t('charts.byCategory')}</Text>
                <Text style={styles.chartSubtitle}>{getMonthLabel(selectedMonth)}</Text>
              </View>
              {prevMonth && prevVarTotal > 0 && (
                <View
                  style={[
                    styles.deltaChip,
                    { backgroundColor: delta > 0 ? COLORS.dangerSoft : COLORS.successSoft },
                  ]}
                >
                  <Ionicons
                    name={delta > 0 ? 'trending-up' : 'trending-down'}
                    size={12}
                    color={delta > 0 ? COLORS.danger : COLORS.success}
                  />
                  <Text style={[styles.deltaText, { color: delta > 0 ? COLORS.danger : COLORS.success }]}>
                    {t('charts.deltaFromPrev', { pct: Math.abs(deltaPct).toFixed(0) })}
                  </Text>
                </View>
              )}
            </View>

            {/* Donut chart + legend re-animate when the month changes */}
            <Animated.View key={`donut-${selectedMonth}`} entering={FadeIn.duration(320)}>
              <View style={styles.donutContainer}>
                <PieChart
                  data={catData}
                  donut
                  innerRadius={70}
                  radius={100}
                  backgroundColor={COLORS.card}
                  strokeColor={COLORS.card}
                  strokeWidth={2}
                  centerLabelComponent={() => (
                    <View style={{ alignItems: 'center' }}>
                      <Text style={styles.donutCenterValue}>{formatAmount(catTotal)}</Text>
                      <Text style={styles.donutCenterLabel}>{t('common.total')}</Text>
                    </View>
                  )}
                />
              </View>

              {/* Legend */}
              <View style={styles.legendGrid}>
                {catData.map((d, i) => {
                  const pct = catTotal > 0 ? ((d.value / catTotal) * 100).toFixed(0) : '0';
                  return (
                    <Animated.View
                      key={d.category}
                      entering={FadeInUp.delay(80 + i * 40).springify().damping(14)}
                      style={styles.legendItem}
                    >
                      <View style={[styles.legendDot, { backgroundColor: d.color }]} />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.legendLabel}>{d.label}</Text>
                        <Text style={styles.legendValue}>{formatAmountFull(d.value)}</Text>
                      </View>
                      <View style={[styles.legendPctBadge, { backgroundColor: d.color + '1e' }]}>
                        <Text style={[styles.legendPct, { color: d.color }]}>{pct}%</Text>
                      </View>
                    </Animated.View>
                  );
                })}
              </View>
            </Animated.View>
          </Card>
        )}

        {/* ── Bar — monthly trend ────────────────────────────────────────────── */}
        <Card variant="elevated">
          <Text style={styles.chartTitle}>{t('charts.monthlyTrend')}</Text>
          <Text style={styles.chartSubtitle}>{t('charts.variableSubtitle')} · {t('charts.tapHint')}</Text>

          {/* Tap-target row that mirrors the bars — bulletproof month switch
              even on chart libraries where per-bar onPress is flaky. */}
          <View style={styles.monthTapRow}>
            {months6.map((mk) => {
              const [, month] = mk.split('-');
              const active = mk === selectedMonth;
              return (
                <Pressable
                  key={mk}
                  onPress={() => setSelectedMonth(mk)}
                  style={[styles.monthTapBtn, active && styles.monthTapBtnActive]}
                  accessibilityRole="button"
                  accessibilityLabel={getMonthLabel(mk)}
                >
                  <Text style={[styles.monthTapText, active && styles.monthTapTextActive]}>{month}</Text>
                </Pressable>
              );
            })}
          </View>

          {barMonthlyData.every((d) => d.value === 0) ? (
            <View style={styles.noData}>
              <Text style={styles.noDataText}>{t('charts.emptyTitle')}</Text>
            </View>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: SPACING.md }}>
              <BarChart
                data={barMonthlyData}
                barWidth={40}
                barBorderRadius={6}
                spacing={18}
                hideRules
                xAxisColor={COLORS.border}
                yAxisColor={COLORS.border}
                xAxisLabelTextStyle={styles.axisLabel}
                yAxisTextStyle={styles.axisLabel}
                noOfSections={4}
                maxValue={Math.max(...barMonthlyData.map((d) => d.value)) * 1.25 || 1000}
                isAnimated
                onPress={(_item: any, index: number) => {
                  const mk = months6[index];
                  if (mk) setSelectedMonth(mk);
                }}
              />
            </ScrollView>
          )}
        </Card>

        {/* ── Bar — single-month per member ──────────────────────────────────── */}
        {memberData.length > 0 && (
          <Card variant="elevated">
            <Text style={styles.chartTitle}>{t('charts.byMember')}</Text>
            <Text style={styles.chartSubtitle}>{t('charts.variableMonth', { month: getMonthLabel(selectedMonth) })}</Text>
            <Animated.View key={`mem-${selectedMonth}`} entering={FadeIn.duration(320)}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: SPACING.lg }}>
                <BarChart
                  data={memberData}
                  barWidth={48}
                  barBorderRadius={6}
                  spacing={16}
                  hideRules
                  xAxisColor={COLORS.border}
                  yAxisColor={COLORS.border}
                  xAxisLabelTextStyle={styles.axisLabel}
                  yAxisTextStyle={styles.axisLabel}
                  noOfSections={4}
                  maxValue={Math.max(...memberData.map((d) => d.value)) * 1.25 || 1000}
                  isAnimated
                />
              </ScrollView>
            </Animated.View>
          </Card>
        )}

        {/* ── Stacked bar — members across months ────────────────────────────── */}
        {activeMembers.length > 0 && (
          <Card variant="elevated">
            <Text style={styles.chartTitle}>{t('charts.byMemberMonthly')}</Text>
            <Text style={styles.chartSubtitle}>{t('charts.byMemberMonthlyHint')}</Text>

            {/* Member legend */}
            <View style={styles.legendRow}>
              {activeMembers.map((m, i) => (
                <View key={m.uid} style={styles.legendChip}>
                  <View
                    style={[
                      styles.legendDot,
                      { backgroundColor: memberColors[(house?.members ?? []).findIndex((x) => x.uid === m.uid) % memberColors.length] },
                    ]}
                  />
                  <Text style={styles.legendChipText}>{m.name.split(' ')[0]}</Text>
                </View>
              ))}
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: SPACING.lg }}>
              <BarChart
                stackData={memberMonthlyStack}
                barWidth={42}
                barBorderRadius={6}
                spacing={20}
                hideRules
                xAxisColor={COLORS.border}
                yAxisColor={COLORS.border}
                xAxisLabelTextStyle={styles.axisLabel}
                yAxisTextStyle={styles.axisLabel}
                noOfSections={4}
                maxValue={
                  Math.max(
                    ...memberMonthlyStack.map((d) =>
                      d.stacks.reduce((s, st) => s + st.value, 0)
                    )
                  ) * 1.25 || 1000
                }
                isAnimated
                onPress={(_item: any, index: number) => {
                  const mk = months6[index];
                  if (mk) setSelectedMonth(mk);
                }}
              />
            </ScrollView>
          </Card>
        )}

        <View style={{ height: SPACING['3xl'] }} />
      </ScrollView>
      </ScreenTransition>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: COLORS.bg },
  scroll: { padding: SPACING.xl, gap: SPACING['2xl'] },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  overline:  { ...TYPE.overline, color: COLORS.textMuted },
  pageTitle: { ...TYPE.h1, marginTop: 2 },
  heroPill: {
    backgroundColor: COLORS.primarySoft,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    alignItems: 'flex-end',
    borderWidth: 1,
    borderColor: COLORS.primary + '33',
  },
  heroPillLabel: { ...TYPE.overline, color: COLORS.primary },
  heroPillValue: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: -0.5,
    marginTop: 2,
  },

  // Month pills
  pillScroll: { maxHeight: 40 },
  pillRow:    { gap: SPACING.xs, flexDirection: 'row', alignItems: 'center' },
  pill: {
    paddingHorizontal: 13,
    paddingVertical: 6,
    borderRadius: RADIUS.pill,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  pillActive:     { backgroundColor: COLORS.primarySoft, borderColor: COLORS.primary + '88' },
  pillText:       { color: COLORS.textSecondary, fontSize: 12, fontWeight: '600' },
  pillTextActive: { color: COLORS.primary, fontWeight: '700' },

  // Chart cards
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.lg,
    gap: SPACING.md,
  },
  chartTitle:    { ...TYPE.h3 },
  chartSubtitle: { ...TYPE.micro, color: COLORS.textMuted, marginTop: 4 },

  deltaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: RADIUS.pill,
  },
  deltaText: { fontSize: 11, fontWeight: '700' },

  // Donut
  donutContainer: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  donutCenterValue: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.text,
    letterSpacing: -0.5,
  },
  donutCenterLabel: {
    ...TYPE.micro,
    color: COLORS.textMuted,
    marginTop: 2,
  },

  // Legend grid — 2-column
  legendGrid: {
    gap: SPACING.sm,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingVertical: 6,
    paddingHorizontal: SPACING.sm,
    backgroundColor: COLORS.cardAlt,
    borderRadius: RADIUS.sm,
  },
  legendDot:   { width: 8, height: 8, borderRadius: 4, flexShrink: 0 },
  legendLabel: { fontSize: 13, fontWeight: '600', color: COLORS.text },
  legendValue: { ...TYPE.micro, color: COLORS.textMuted, marginTop: 1 },
  legendPctBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.pill,
  },
  legendPct: { fontSize: 11, fontWeight: '800' },

  // No data
  noData:     { alignItems: 'center', paddingVertical: SPACING['3xl'] },
  noDataText: { ...TYPE.caption, color: COLORS.textMuted },

  // Axis labels
  axisLabel:    { color: COLORS.textMuted, fontSize: 10, fontWeight: '500' },
  barTopLabel: { color: COLORS.textMuted, fontSize: 9, marginBottom: 4, fontWeight: '600' },

  // Tap-row to switch month directly under the trend chart
  monthTapRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: SPACING.md,
    flexWrap: 'wrap',
  },
  monthTapBtn: {
    flex: 1,
    minWidth: 44,
    paddingVertical: 6,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.cardAlt,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  monthTapBtnActive: {
    backgroundColor: COLORS.primarySoft,
    borderColor: COLORS.primary + 'aa',
  },
  monthTapText: { fontSize: 11, fontWeight: '600', color: COLORS.textSecondary },
  monthTapTextActive: { color: COLORS.primary, fontWeight: '700' },

  // Legend (members across months)
  legendRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
    marginTop: SPACING.md,
  },
  legendChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: RADIUS.pill,
    backgroundColor: COLORS.cardAlt,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  legendChipText: { fontSize: 11, fontWeight: '600', color: COLORS.textSecondary },
});
