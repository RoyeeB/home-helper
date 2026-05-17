import { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { format } from 'date-fns';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useAuth } from '../../context/AuthContext';
import { useHouse } from '../../context/HouseContext';
import { useLanguage } from '../../context/LanguageContext';
import { Card } from '../../components/Card';
import { EmptyState } from '../../components/EmptyState';
import { SectionHeader } from '../../components/SectionHeader';
import { IconButton } from '../../components/IconButton';
import { BudgetCard } from '../../components/BudgetCard';
import { ScreenTransition } from '../../components/ScreenTransition';
import {
  COLORS,
  CATEGORY_COLORS,
  CATEGORY_LABELS,
  CATEGORY_ICONS,
  CATEGORIES,
  Category,
} from '../../constants/colors';
import { RADIUS, SHADOWS, SPACING, TYPE } from '../../constants/theme';
import { getCurrentMonthKey, getMonthLabel } from '../../hooks/useMonthKey';

function formatAmount(n: number) {
  return `₪${n.toLocaleString('he-IL', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

function daysUntil(day: number): number {
  const today = new Date();
  const curDay = today.getDate();
  if (day >= curDay) return day - curDay;
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  return daysInMonth - curDay + day;
}

// ─── Stat Tile ────────────────────────────────────────────────────────────────
function StatTile({
  label,
  value,
  icon,
  tint,
}: {
  label: string;
  value: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  tint: string;
}) {
  return (
    <Card variant="elevated" style={styles.stat}>
      <View style={[styles.statIcon, { backgroundColor: tint + '1a' }]}>
        <Ionicons name={icon} size={15} color={tint} />
      </View>
      <Text style={styles.statValue} numberOfLines={1} adjustsFontSizeToFit>
        {value}
      </Text>
      <Text style={styles.statLabel} numberOfLines={1}>{label}</Text>
    </Card>
  );
}

// ─── Avatar ───────────────────────────────────────────────────────────────────
const AVATAR_PALETTE = [
  COLORS.primary, '#34d399', '#a78bfa', '#f87171', '#fbbf24', '#22d3ee',
];

export default function DashboardScreen() {
  const router = useRouter();
  const { profile } = useAuth();
  const { house, expenses, fixedCosts, budgets } = useHouse();
  const { t } = useLanguage();
  const [refreshing, setRefreshing] = useState(false);
  const monthKey = getCurrentMonthKey();

  const monthExpenses = useMemo(
    () => expenses.filter((e) => e.monthKey === monthKey),
    [expenses, monthKey]
  );
  const variableTotal = monthExpenses.reduce((s, e) => s + e.amount, 0);
  const fixedTotal    = fixedCosts.reduce((s, f) => s + f.amount, 0);
  const grandTotal    = variableTotal + fixedTotal;
  const memberCount   = house?.members.length ?? 0;

  const memberTotals = (house?.members ?? []).map((m) => {
    const paid = monthExpenses
      .filter((e) => e.userId === m.uid)
      .reduce((s, e) => s + e.amount, 0);
    return { ...m, paid };
  });

  const last5 = monthExpenses.slice(0, 5);

  const budgetItems = useMemo(() => {
    return CATEGORIES
      .filter((c) => budgets[c] != null && (budgets[c] as number) > 0)
      .map((c) => {
        const spent = monthExpenses
          .filter((e) => e.category === c)
          .reduce((s, e) => s + e.amount, 0);
        return { category: c as Category, spent, budget: budgets[c] as number };
      });
  }, [budgets, monthExpenses]);

  const upcoming = useMemo(() => {
    return fixedCosts
      .map((fc) => ({ ...fc, daysLeft: daysUntil(fc.dayOfMonth) }))
      .filter((fc) => fc.daysLeft <= 7)
      .sort((a, b) => a.daysLeft - b.daysLeft)
      .slice(0, 3);
  }, [fixedCosts]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 600);
  }, []);

  const firstName = profile?.displayName?.split(' ')[0] ?? '';

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenTransition>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primary}
            colors={[COLORS.primary]}
          />
        }
      >
        {/* ── Header ─────────────────────────────────────────────────────────── */}
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={styles.greetLabel}>{format(new Date(), "EEEE, d.M.yyyy")}</Text>
            <Text style={styles.greeting}>
              {t('dashboard.hello')}{firstName ? `, ${firstName}` : ''} 👋
            </Text>
            {house?.name ? (
              <View style={styles.houseTag}>
                <Ionicons name="home-outline" size={11} color={COLORS.primary} />
                <Text style={styles.houseTagText} numberOfLines={1}>{house.name}</Text>
              </View>
            ) : null}
          </View>
          <IconButton
            icon="settings-outline"
            variant="subtle"
            onPress={() => router.push('/settings' as any)}
            accessibilityLabel={t('dashboard.settingsA11y')}
          />
        </View>

        {/* ── Hero Month Card ─────────────────────────────────────────────────── */}
        <Animated.View entering={FadeInUp.duration(450).springify()} style={[styles.heroCard, SHADOWS.md]}>
          {/* top row: month label */}
          <View style={styles.heroTop}>
            <View style={styles.monthBadge}>
              <Text style={styles.monthBadgeText}>{getMonthLabel(monthKey)}</Text>
            </View>
          </View>

          {/* main total */}
          <Text style={styles.heroTotal}>{formatAmount(grandTotal)}</Text>
          <Text style={styles.heroSub}>{t('dashboard.monthTotal')}</Text>

          {/* divider */}
          <View style={styles.heroDivider} />

          {/* breakdown pills */}
          <View style={styles.heroBreakdown}>
            <View style={styles.breakdownPill}>
              <View style={[styles.breakdownDot, { backgroundColor: COLORS.primary }]} />
              <Text style={styles.breakdownLabel}>{t('dashboard.variable')}</Text>
              <Text style={styles.breakdownValue}>{formatAmount(variableTotal)}</Text>
            </View>
            <View style={styles.breakdownSep} />
            <View style={styles.breakdownPill}>
              <View style={[styles.breakdownDot, { backgroundColor: COLORS.warning }]} />
              <Text style={styles.breakdownLabel}>{t('dashboard.fixed')}</Text>
              <Text style={styles.breakdownValue}>{formatAmount(fixedTotal)}</Text>
            </View>
          </View>
        </Animated.View>

        {/* ── Stats grid ─────────────────────────────────────────────────────── */}
        <Animated.View
          entering={FadeInDown.delay(120).duration(400).springify()}
          style={styles.statsGrid}
        >
          <StatTile
            label={t('dashboard.avgPerExpense')}
            value={formatAmount(monthExpenses.length > 0 ? variableTotal / monthExpenses.length : 0)}
            icon="trending-up"
            tint={COLORS.info}
          />
          <StatTile
            label={t('dashboard.transactions')}
            value={String(monthExpenses.length)}
            icon="receipt"
            tint={COLORS.success}
          />
          <StatTile
            label={t('dashboard.members')}
            value={String(memberCount)}
            icon="people"
            tint={COLORS.primary}
          />
          <StatTile
            label={t('dashboard.fixedCount')}
            value={String(fixedCosts.length)}
            icon="repeat"
            tint={COLORS.warning}
          />
        </Animated.View>

        {/* ── Upcoming fixed costs ────────────────────────────────────────────── */}
        {upcoming.length > 0 && (
          <>
            <SectionHeader title={t('dashboard.upcoming')} hint={t('dashboard.upcomingHint')} />
            <Card style={styles.listCard}>
              {upcoming.map((fc, i) => (
                <View key={fc.id} style={[styles.listRow, i > 0 && styles.rowBorder]}>
                  <View style={styles.upcomingIconBox}>
                    <Ionicons name="time-outline" size={15} color={COLORS.warning} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.upcomingName}>{fc.name}</Text>
                    <Text style={styles.upcomingMeta}>
                      {fc.daysLeft === 0
                        ? t('dashboard.today')
                        : fc.daysLeft === 1
                        ? t('dashboard.tomorrow')
                        : t('dashboard.inDays', { days: fc.daysLeft })}
                      {'  ·  '}{t('dashboard.onDayOfMonth', { day: fc.dayOfMonth })}
                    </Text>
                  </View>
                  <View style={styles.upcomingAmountWrap}>
                    <Text style={styles.upcomingAmount}>{formatAmount(fc.amount)}</Text>
                  </View>
                </View>
              ))}
            </Card>
          </>
        )}

        {/* ── Budgets ──────────────────────────────────────────────────────────── */}
        {budgetItems.length > 0 && (
          <>
            <SectionHeader
              title={t('dashboard.monthlyBudget')}
              hint={t('dashboard.catsTracked', { count: budgetItems.length })}
              action={{ label: t('dashboard.edit'), onPress: () => router.push('/settings' as any) }}
            />
            <BudgetCard items={budgetItems} />
          </>
        )}

        {budgetItems.length === 0 && (
          <Pressable
            onPress={() => router.push('/settings' as any)}
            style={({ pressed }) => [
              styles.ctaCard,
              { opacity: pressed ? 0.8 : 1 },
            ]}
            accessibilityRole="button"
            accessibilityLabel={t('dashboard.openBudgetA11y')}
          >
            <View style={styles.ctaIconBox}>
              <Ionicons name="wallet-outline" size={20} color={COLORS.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.ctaTitle}>{t('dashboard.setBudget')}</Text>
              <Text style={styles.ctaDesc}>{t('dashboard.setBudgetDesc')}</Text>
            </View>
            <Ionicons name="chevron-back" size={18} color={COLORS.textMuted} />
          </Pressable>
        )}

        {/* ── Member breakdown ─────────────────────────────────────────────────── */}
        {memberTotals.length > 0 && (
          <>
            <SectionHeader title={t('dashboard.byMember')} hint={t('dashboard.variableExpenses')} />
            <Card style={styles.listCard}>
              {memberTotals.map((m, i) => {
                const pct = variableTotal > 0 ? (m.paid / variableTotal) * 100 : 0;
                const avatarColor = AVATAR_PALETTE[i % AVATAR_PALETTE.length];
                return (
                  <View key={m.uid} style={[styles.memberRow, i > 0 && styles.rowBorder]}>
                    <View style={[styles.avatar, { backgroundColor: avatarColor + '28' }]}>
                      <Text style={[styles.avatarText, { color: avatarColor }]}>
                        {m.name.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                    <View style={styles.memberInfo}>
                      <View style={styles.memberNameRow}>
                        <Text style={styles.memberName}>{m.name}</Text>
                        <Text style={styles.memberAmount}>{formatAmount(m.paid)}</Text>
                      </View>
                      <View style={styles.progressBar}>
                        <View
                          style={[
                            styles.progressFill,
                            { width: `${pct}%`, backgroundColor: avatarColor },
                          ]}
                        />
                      </View>
                      <Text style={styles.memberPct}>{t('dashboard.pctOfMonth', { pct: pct.toFixed(0) })}</Text>
                    </View>
                  </View>
                );
              })}
            </Card>
          </>
        )}

        {/* ── Last expenses ─────────────────────────────────────────────────────── */}
        <SectionHeader
          title={t('dashboard.recentExpenses')}
          action={
            last5.length > 0
              ? { label: t('dashboard.seeAll'), onPress: () => router.push('/(tabs)/expenses') }
              : undefined
          }
        />
        {last5.length > 0 ? (
          <Card style={styles.listCard}>
            {last5.map((e, i) => {
              const catIcon = (CATEGORY_ICONS[e.category] ?? 'pricetag') as React.ComponentProps<typeof Ionicons>['name'];
              const catColor = CATEGORY_COLORS[e.category];
              return (
                <View key={e.id} style={[styles.listRow, i > 0 && styles.rowBorder]}>
                  <View style={[styles.catIconBox, { backgroundColor: catColor + '1e' }]}>
                    <Ionicons name={catIcon} size={15} color={catColor} />
                  </View>
                  <View style={styles.expenseInfo}>
                    <Text style={styles.expenseDesc} numberOfLines={1}>{e.desc}</Text>
                    <Text style={styles.expenseMeta}>
                      {e.userName} · {t(`categories.${e.category}`)}
                    </Text>
                  </View>
                  <Text style={styles.expenseAmount}>{formatAmount(e.amount)}</Text>
                </View>
              );
            })}
          </Card>
        ) : (
          <EmptyState
            icon="cafe-outline"
            title={t('dashboard.emptyMonthTitle')}
            description={t('dashboard.emptyMonthHint')}
          />
        )}

        <View style={{ height: SPACING['3xl'] }} />
      </ScrollView>
      </ScreenTransition>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: COLORS.bg },
  scroll: { padding: SPACING.xl, gap: SPACING['2xl'], paddingBottom: SPACING['4xl'] },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: SPACING.md,
  },
  greetLabel: {
    ...TYPE.overline,
    color: COLORS.textMuted,
  },
  greeting: {
    ...TYPE.h1,
    marginTop: 4,
    letterSpacing: -0.5,
  },
  houseTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
    alignSelf: 'flex-start',
    backgroundColor: COLORS.primarySoft,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.pill,
  },
  houseTagText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.primary,
    letterSpacing: 0.1,
  },

  // Hero card — bold, no border, deep bg
  heroCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.xl,
    padding: SPACING['2xl'],
    borderWidth: 1,
    borderColor: COLORS.borderStrong,
  },
  heroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  monthBadge: {
    backgroundColor: COLORS.primarySoft,
    paddingHorizontal: SPACING.md,
    paddingVertical: 4,
    borderRadius: RADIUS.pill,
  },
  monthBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
    letterSpacing: 0.3,
  },
  heroTotal: {
    fontSize: 44,
    fontWeight: '800',
    color: COLORS.text,
    letterSpacing: -2,
    lineHeight: 50,
  },
  heroSub: {
    ...TYPE.micro,
    color: COLORS.textMuted,
    marginTop: 4,
  },
  heroDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: SPACING.lg,
  },
  heroBreakdown: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  breakdownPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  breakdownDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  breakdownLabel: {
    ...TYPE.micro,
    color: COLORS.textMuted,
    flex: 1,
  },
  breakdownValue: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  breakdownSep: {
    width: 1,
    height: 28,
    backgroundColor: COLORS.border,
    marginHorizontal: SPACING.lg,
  },

  // Stats grid
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  stat: {
    flex: 1,
    minWidth: '47%',
    gap: 6,
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
  },
  statIcon: {
    width: 30,
    height: 30,
    borderRadius: RADIUS.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.text,
    letterSpacing: -0.5,
  },
  statLabel: {
    ...TYPE.overline,
    color: COLORS.textMuted,
  },

  // Shared list card
  listCard: { padding: 0, overflow: 'hidden' },
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  rowBorder: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: COLORS.border,
  },

  // Upcoming fixed costs
  upcomingIconBox: {
    width: 34,
    height: 34,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.warningSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  upcomingName:   { ...TYPE.body, fontWeight: '600' },
  upcomingMeta:   { ...TYPE.micro, color: COLORS.textMuted, marginTop: 2 },
  upcomingAmountWrap: {
    alignItems: 'flex-end',
  },
  upcomingAmount: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.warning,
  },

  // Budget CTA card
  ctaCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    padding: SPACING.lg,
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.borderStrong,
    borderStyle: 'dashed',
  },
  ctaIconBox: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaTitle: { ...TYPE.body, fontWeight: '700', color: COLORS.text },
  ctaDesc:  { ...TYPE.micro, color: COLORS.textMuted, marginTop: 3 },

  // Member breakdown
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 15,
    fontWeight: '800',
  },
  memberInfo:    { flex: 1, gap: 5 },
  memberNameRow: { flexDirection: 'row', justifyContent: 'space-between' },
  memberName:    { ...TYPE.body, fontWeight: '600' },
  memberAmount:  { ...TYPE.bodyStrong },
  progressBar: {
    height: 4,
    backgroundColor: COLORS.cardAlt,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', borderRadius: 2 },
  memberPct: { ...TYPE.micro, color: COLORS.textMuted },

  // Last expenses
  catIconBox: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  expenseInfo:   { flex: 1 },
  expenseDesc:   { ...TYPE.bodyStrong, fontSize: 14 },
  expenseMeta:   { ...TYPE.micro, color: COLORS.textMuted, marginTop: 2 },
  expenseAmount: { fontSize: 15, fontWeight: '800', color: COLORS.text, letterSpacing: -0.3 },
});
