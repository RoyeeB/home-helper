import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Share,
  Alert,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { useHouse } from '../context/HouseContext';
import { useLanguage } from '../context/LanguageContext';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { IconButton } from '../components/IconButton';
import {
  COLORS,
  CATEGORIES,
  CATEGORY_COLORS,
  CATEGORY_LABELS,
  CATEGORY_ICONS,
  Category,
} from '../constants/colors';
import { RADIUS, SHADOWS, SPACING, TYPE } from '../constants/theme';
import type { Language } from '../lib/i18n';

function formatAmount(n: number) {
  return `₪${n.toLocaleString('he-IL', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

const AVATAR_PALETTE = [
  COLORS.primary, '#34d399', '#a78bfa', '#f87171', '#fbbf24', '#22d3ee',
];

export default function SettingsScreen() {
  const router = useRouter();
  const { profile, user, logout } = useAuth();
  const { house, budgets, setBudget, removeBudget } = useHouse();
  const { t, lang, setLanguage } = useLanguage();

  const [budgetModalOpen, setBudgetModalOpen] = useState(false);
  const [editingCat, setEditingCat] = useState<Category>('food');
  const [budgetAmount, setBudgetAmount] = useState('');
  const [saving, setSaving] = useState(false);

  function handleLanguageChange(next: Language) {
    if (next === lang) return;
    setLanguage(next);
  }

  function openBudget(cat: Category) {
    setEditingCat(cat);
    setBudgetAmount(budgets[cat] ? String(budgets[cat]) : '');
    setBudgetModalOpen(true);
  }

  async function saveBudget() {
    const parsed = parseFloat(budgetAmount);
    if (isNaN(parsed) || parsed < 0) {
      Alert.alert(t('common.error'), t('settings.invalidAmount'));
      return;
    }
    setSaving(true);
    try {
      if (parsed === 0) {
        await removeBudget(editingCat);
      } else {
        await setBudget(editingCat, parsed);
      }
      setBudgetModalOpen(false);
    } finally {
      setSaving(false);
    }
  }

  async function shareCode() {
    if (!house?.code) return;
    try {
      await Share.share({
        message: t('settings.shareMessage', { name: house.name, code: house.code }),
      });
    } catch {}
  }

  function handleLogout() {
    Alert.alert(t('settings.logoutConfirmT'), t('settings.logoutConfirmM'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('settings.logoutBtn'),
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/');
        },
      },
    ]);
  }

  const firstName = profile?.displayName ?? '?';
  const avatarInitial = firstName.charAt(0).toUpperCase();

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <IconButton
          icon="chevron-forward"
          variant="plain"
          onPress={() => router.back()}
          accessibilityLabel={t('common.back')}
        />
        <Text style={styles.topTitle}>{t('settings.title')}</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* ── Profile hero ────────────────────────────────────────────────────── */}
        <Card variant="elevated" style={styles.profileCard}>
          {/* Large avatar with primary ring */}
          <View style={styles.avatarRing}>
            <View style={styles.avatarLg}>
              <Text style={styles.avatarLgText}>{avatarInitial}</Text>
            </View>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.profileName}>{profile?.displayName ?? '—'}</Text>
            <Text style={styles.profileEmail}>{user?.email}</Text>
          </View>
        </Card>

        {/* ── House ─────────────────────────────────────────────────────────── */}
        <Text style={styles.sectionLabel}>{t('settings.myHome')}</Text>
        <Card style={styles.groupCard}>
          <View style={styles.groupRow}>
            <View style={[styles.iconBox, styles.iconBoxPrimary]}>
              <Ionicons name="home" size={17} color={COLORS.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowLabel}>{t('settings.homeName')}</Text>
              <Text style={styles.rowValue}>{house?.name ?? '—'}</Text>
            </View>
          </View>
          <View style={styles.internalDivider} />
          <View style={styles.groupRow}>
            <View style={[styles.iconBox, styles.iconBoxPrimary]}>
              <Ionicons name="people" size={17} color={COLORS.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowLabel}>{t('settings.members')}</Text>
              <Text style={styles.rowValue}>{house?.members.length ?? 0}</Text>
            </View>
          </View>
          <View style={styles.internalDivider} />
          <TouchableOpacity
            style={styles.groupRow}
            onPress={shareCode}
            accessibilityRole="button"
            accessibilityLabel={t('settings.shareCodeA11y')}
            activeOpacity={0.75}
          >
            <View style={[styles.iconBox, styles.iconBoxPrimary]}>
              <Ionicons name="key" size={17} color={COLORS.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowLabel}>{t('settings.inviteCode')}</Text>
              <Text style={styles.codeText}>{house?.code}</Text>
            </View>
            <View style={styles.shareChip}>
              <Ionicons name="share-outline" size={14} color={COLORS.primary} />
              <Text style={styles.shareChipText}>{t('settings.share')}</Text>
            </View>
          </TouchableOpacity>
        </Card>

        {/* ── Language ──────────────────────────────────────────────────────── */}
        <Text style={styles.sectionLabel}>{t('settings.language')}</Text>
        <Card style={styles.groupCard}>
          <View style={styles.langRow}>
            <TouchableOpacity
              style={[styles.langBtn, lang === 'en' && styles.langBtnActive]}
              onPress={() => handleLanguageChange('en')}
              accessibilityRole="radio"
              accessibilityState={{ selected: lang === 'en' }}
            >
              <Text style={[styles.langBtnText, lang === 'en' && styles.langBtnTextActive]}>
                {t('settings.languageEnglish')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.langBtn, lang === 'he' && styles.langBtnActive]}
              onPress={() => handleLanguageChange('he')}
              accessibilityRole="radio"
              accessibilityState={{ selected: lang === 'he' }}
            >
              <Text style={[styles.langBtnText, lang === 'he' && styles.langBtnTextActive]}>
                {t('settings.languageHebrew')}
              </Text>
            </TouchableOpacity>
          </View>
        </Card>

        {/* ── Members ────────────────────────────────────────────────────────── */}
        {house && house.members.length > 0 && (
          <>
            <Text style={styles.sectionLabel}>{t('settings.houseMembers')}</Text>
            <Card style={styles.groupCard}>
              {house.members.map((m, i) => {
                const color = AVATAR_PALETTE[i % AVATAR_PALETTE.length];
                return (
                  <View key={m.uid} style={[styles.memberRow, i > 0 && styles.internalDivider]}>
                    <View style={[styles.avatarSm, { backgroundColor: color + '28' }]}>
                      <Text style={[styles.avatarSmText, { color }]}>
                        {m.name.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                    <Text style={styles.memberName}>{m.name}</Text>
                    {m.uid === profile?.uid && (
                      <View style={styles.youBadge}>
                        <Text style={styles.youBadgeText}>{t('common.you')}</Text>
                      </View>
                    )}
                  </View>
                );
              })}
            </Card>
          </>
        )}

        {/* ── Budgets ────────────────────────────────────────────────────────── */}
        <Text style={styles.sectionLabel}>{t('settings.monthlyBudget')}</Text>
        <Text style={styles.sectionHint}>
          {t('settings.budgetHint')}
        </Text>
        <Card style={styles.groupCard}>
          {CATEGORIES.map((cat, i) => {
            const amount = budgets[cat];
            const icon = (CATEGORY_ICONS[cat] ?? 'pricetag') as React.ComponentProps<typeof Ionicons>['name'];
            const catColor = CATEGORY_COLORS[cat];
            const catLabel = t(`categories.${cat}`);
            return (
              <TouchableOpacity
                key={cat}
                style={[styles.budgetRow, i > 0 && styles.internalDivider]}
                onPress={() => openBudget(cat)}
                accessibilityRole="button"
                accessibilityLabel={t('settings.editBudgetA11y', { cat: catLabel })}
                activeOpacity={0.75}
              >
                <View style={[styles.iconBox, { backgroundColor: catColor + '1e' }]}>
                  <Ionicons name={icon} size={15} color={catColor} />
                </View>
                <Text style={styles.budgetCatLabel}>{catLabel}</Text>
                <Text style={[styles.budgetAmount, !amount && styles.budgetAmountEmpty]}>
                  {amount ? formatAmount(amount as number) : t('settings.noBudget')}
                </Text>
                <Ionicons name="chevron-back" size={15} color={COLORS.textMuted} />
              </TouchableOpacity>
            );
          })}
        </Card>

        {/* ── Account ────────────────────────────────────────────────────────── */}
        <Text style={styles.sectionLabel}>{t('settings.account')}</Text>
        <Card style={styles.groupCard}>
          <TouchableOpacity
            style={styles.actionRow}
            onPress={handleLogout}
            activeOpacity={0.75}
          >
            <View style={[styles.iconBox, { backgroundColor: COLORS.dangerSoft }]}>
              <Ionicons name="log-out" size={17} color={COLORS.danger} />
            </View>
            <Text style={styles.dangerLabel}>{t('settings.logout')}</Text>
            <Ionicons name="chevron-back" size={15} color={COLORS.textMuted} />
          </TouchableOpacity>
        </Card>

        <Text style={styles.versionText}>Home Helper · v1.0</Text>
      </ScrollView>

      {/* ── Budget edit modal ─────────────────────────────────────────────────── */}
      <Modal visible={budgetModalOpen} animationType="slide" presentationStyle="pageSheet">
        <KeyboardAvoidingView
          style={{ flex: 1, backgroundColor: COLORS.bg }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <SafeAreaView edges={['top']} style={{ flex: 1 }}>
            <View style={styles.topBar}>
              <IconButton
                icon="close"
                variant="subtle"
                onPress={() => setBudgetModalOpen(false)}
                accessibilityLabel={t('common.close')}
              />
              <Text style={styles.topTitle}>{t('settings.budgetTitle', { cat: t(`categories.${editingCat}`) })}</Text>
              <View style={{ width: 44 }} />
            </View>
            <View style={{ padding: SPACING['2xl'], gap: SPACING.lg }}>
              <Input
                label={t('settings.monthlyAmount')}
                value={budgetAmount}
                onChangeText={setBudgetAmount}
                keyboardType="decimal-pad"
                placeholder="0"
                icon="wallet-outline"
                helperText={t('settings.removeBudgetHint')}
              />
              <Button label={t('common.save')} onPress={saveBudget} loading={saving} icon="checkmark" />
            </View>
          </SafeAreaView>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.border,
  },
  topTitle: { ...TYPE.h2 },
  scroll:   { padding: SPACING.xl, gap: SPACING.md, paddingBottom: 60 },

  // Profile
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    padding: SPACING.lg,
  },
  avatarRing: {
    width: 62,
    height: 62,
    borderRadius: 31,
    borderWidth: 2,
    borderColor: COLORS.primary + '55',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLg: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: COLORS.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLgText: {
    color: COLORS.primary,
    fontSize: 22,
    fontWeight: '800',
  },
  profileName:  { ...TYPE.h3 },
  profileEmail: { ...TYPE.caption, marginTop: 3 },

  // Section labels
  sectionLabel: {
    ...TYPE.overline,
    color: COLORS.textMuted,
    marginTop: SPACING.md,
    paddingHorizontal: SPACING.xs,
  },
  sectionHint: {
    ...TYPE.caption,
    color: COLORS.textMuted,
    marginTop: -SPACING.sm + 2,
    lineHeight: 18,
  },

  // Group card (list of rows with internal dividers)
  groupCard: { padding: 0, overflow: 'hidden' },
  groupRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  internalDivider: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: COLORS.border,
  },
  iconBox: {
    width: 34,
    height: 34,
    borderRadius: RADIUS.sm,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  iconBoxPrimary: { backgroundColor: COLORS.primarySoft },
  rowLabel: { ...TYPE.micro, color: COLORS.textMuted },
  rowValue: { ...TYPE.body, marginTop: 2 },
  codeText: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: 5,
    marginTop: 2,
  },
  shareChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: RADIUS.pill,
    backgroundColor: COLORS.primarySoft,
  },
  shareChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  },

  // Members
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  avatarSm: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarSmText: { fontSize: 15, fontWeight: '800' },
  memberName:   { ...TYPE.body, flex: 1 },
  youBadge: {
    backgroundColor: COLORS.primarySoft,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: RADIUS.pill,
  },
  youBadgeText: { color: COLORS.primary, fontSize: 11, fontWeight: '700' },

  // Budgets
  budgetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  budgetCatLabel:   { ...TYPE.body, flex: 1 },
  budgetAmount:     { ...TYPE.body, fontWeight: '700', color: COLORS.text },
  budgetAmountEmpty:{ color: COLORS.textMuted, fontWeight: '500' },

  // Actions
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  dangerLabel: { ...TYPE.body, fontWeight: '600', color: COLORS.danger, flex: 1 },

  versionText: {
    ...TYPE.micro,
    color: COLORS.textSubtle,
    textAlign: 'center',
    marginTop: SPACING.lg,
  },

  // Language toggle
  langRow: {
    flexDirection: 'row',
    padding: SPACING.sm,
    gap: SPACING.sm,
  },
  langBtn: {
    flex: 1,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.cardAlt,
    alignItems: 'center',
  },
  langBtnActive: {
    backgroundColor: COLORS.primarySoft,
    borderColor: COLORS.primary + '88',
  },
  langBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  langBtnTextActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
});
