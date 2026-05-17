import { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import Animated, { FadeInDown, FadeInUp, Layout } from 'react-native-reanimated';
import { useHouse } from '../../context/HouseContext';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { EmptyState } from '../../components/EmptyState';
import { IconButton } from '../../components/IconButton';
import { ScreenTransition } from '../../components/ScreenTransition';
import { AnimatedPressable } from '../../components/AnimatedPressable';
import {
  COLORS,
  CATEGORY_COLORS,
  CATEGORY_LABELS,
  CATEGORY_ICONS,
  CATEGORIES,
  Category,
} from '../../constants/colors';
import { RADIUS, SHADOWS, SPACING, TYPE } from '../../constants/theme';
import { getCurrentMonthKey, getLast12Months, getMonthLabel } from '../../hooks/useMonthKey';
import { Expense } from '../../types';
import { useLanguage } from '../../context/LanguageContext';

function formatAmount(n: number) {
  return `₪${n.toLocaleString('he-IL', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

type FilterCategory = Category | 'all';

export default function ExpensesScreen() {
  const { expenses, addExpense, updateExpense, deleteExpense } = useHouse();
  const { t } = useLanguage();
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonthKey());
  const months = getLast12Months();
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState<FilterCategory>('all');

  const [editingId, setEditingId] = useState<string | null>(null);
  const [desc, setDesc] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<Category>('food');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return expenses
      .filter((e) => e.monthKey === selectedMonth)
      .filter((e) => filterCat === 'all' || e.category === filterCat)
      .filter(
        (e) =>
          !q ||
          e.desc.toLowerCase().includes(q) ||
          e.userName.toLowerCase().includes(q) ||
          (e.note ?? '').toLowerCase().includes(q)
      )
      .sort((a, b) => {
        const aTime = a.date?.toMillis?.() ?? 0;
        const bTime = b.date?.toMillis?.() ?? 0;
        return bTime - aTime;
      });
  }, [expenses, selectedMonth, search, filterCat]);

  const total = filtered.reduce((s, e) => s + e.amount, 0);

  function openAdd() {
    setEditingId(null);
    setDesc('');
    setAmount('');
    setCategory('food');
    setNote('');
    setFormError('');
    setShowModal(true);
  }

  function openEdit(e: Expense) {
    setEditingId(e.id);
    setDesc(e.desc);
    setAmount(String(e.amount));
    setCategory(e.category);
    setNote(e.note ?? '');
    setFormError('');
    setShowModal(true);
  }

  async function handleSave() {
    if (!desc.trim() || !amount) {
      setFormError(t('expenses.fillRequired'));
      return;
    }
    const parsed = parseFloat(amount);
    if (isNaN(parsed) || parsed <= 0) {
      setFormError(t('expenses.invalidAmount'));
      return;
    }
    setSaving(true);
    setFormError('');
    try {
      const payload = { desc: desc.trim(), amount: parsed, category, note: note.trim() };
      if (editingId) {
        await updateExpense(editingId, payload);
      } else {
        await addExpense(payload);
      }
      setShowModal(false);
    } catch {
      setFormError(t('expenses.saveError'));
    } finally {
      setSaving(false);
    }
  }

  function handleDelete(id: string, descText: string) {
    Alert.alert(t('expenses.deleteTitle'), t('expenses.deleteConfirm', { name: descText }), [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('common.delete'), style: 'destructive', onPress: () => deleteExpense(id) },
    ]);
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenTransition>
      <View style={styles.container}>

        {/* ── Header ─────────────────────────────────────────────────────────── */}
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={styles.overline}>{t('expenses.headerOverline')}</Text>
            <Text style={styles.title}>{t('expenses.title')}</Text>
          </View>
          <View style={styles.totalBox}>
            <Text style={styles.totalLabel}>{t('common.total')}</Text>
            <Text style={styles.total}>{formatAmount(total)}</Text>
          </View>
        </View>

        {/* ── Search bar ─────────────────────────────────────────────────────── */}
        <View style={styles.searchWrap}>
          <Ionicons name="search-outline" size={17} color={COLORS.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder={t('common.search')}
            placeholderTextColor={COLORS.textSubtle}
            value={search}
            onChangeText={setSearch}
            accessibilityLabel={t('common.search')}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')} hitSlop={8}>
              <Ionicons name="close-circle" size={17} color={COLORS.textMuted} />
            </TouchableOpacity>
          )}
        </View>

        {/* ── Month selector ─────────────────────────────────────────────────── */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.pillScroll}
          contentContainerStyle={styles.pillRow}
        >
          {months.map((mk) => {
            const active = selectedMonth === mk;
            return (
              <TouchableOpacity
                key={mk}
                style={[styles.pill, active && styles.pillActive]}
                onPress={() => setSelectedMonth(mk)}
                accessibilityRole="button"
                accessibilityLabel={`חודש ${getMonthLabel(mk)}`}
              >
                <Text style={[styles.pillText, active && styles.pillTextActive]}>
                  {getMonthLabel(mk)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* ── Category filter ────────────────────────────────────────────────── */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.pillScroll}
          contentContainerStyle={styles.pillRow}
        >
          <TouchableOpacity
            style={[styles.pill, filterCat === 'all' && styles.pillActive]}
            onPress={() => setFilterCat('all')}
          >
            <Text style={[styles.pillText, filterCat === 'all' && styles.pillTextActive]}>{t('expenses.all')}</Text>
          </TouchableOpacity>
          {CATEGORIES.map((c) => {
            const active = filterCat === c;
            return (
              <TouchableOpacity
                key={c}
                style={[
                  styles.pill,
                  active && {
                    backgroundColor: CATEGORY_COLORS[c] + '22',
                    borderColor: CATEGORY_COLORS[c] + '88',
                  },
                ]}
                onPress={() => setFilterCat(c)}
              >
                <View style={[styles.catDot, { backgroundColor: CATEGORY_COLORS[c] }]} />
                <Text style={[styles.pillText, active && { color: CATEGORY_COLORS[c], fontWeight: '700' }]}>
                  {t(`categories.${c}`)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* ── Expense list ───────────────────────────────────────────────────── */}
        <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
          {filtered.length === 0 && (
            <EmptyState
              icon="receipt-outline"
              title={search || filterCat !== 'all' ? t('expenses.notFoundTitle') : t('expenses.emptyTitle')}
              description={
                search || filterCat !== 'all'
                  ? t('expenses.notFoundHint')
                  : t('expenses.emptyHint')
              }
            />
          )}
          {filtered.map((e, idx) => {
            const catIcon = (CATEGORY_ICONS[e.category] ?? 'pricetag') as React.ComponentProps<typeof Ionicons>['name'];
            const catColor = CATEGORY_COLORS[e.category];
            return (
              <Animated.View
                key={e.id}
                entering={FadeInDown.delay(Math.min(idx, 8) * 40).springify().damping(14)}
                layout={Layout.springify()}
              >
              <Card
                style={styles.expenseCard}
                onPress={() => openEdit(e)}
                onLongPress={() => handleDelete(e.id, e.desc)}
                accessibilityLabel={`${e.desc}, ${formatAmount(e.amount)}, ${t(`categories.${e.category}`)}`}
              >
                <View style={[styles.catIconBox, { backgroundColor: catColor + '1e' }]}>
                  <Ionicons name={catIcon} size={17} color={catColor} />
                </View>
                <View style={styles.expenseMain}>
                  <View style={styles.expenseTopRow}>
                    <Text style={styles.expenseDesc} numberOfLines={1}>{e.desc}</Text>
                    <Text style={styles.expenseAmount}>{formatAmount(e.amount)}</Text>
                  </View>
                  <View style={styles.expenseBottomRow}>
                    <Text style={styles.expenseMeta}>
                      {e.userName}
                      {e.date?.toDate ? ` · ${format(e.date.toDate(), 'dd/MM')}` : ''}
                    </Text>
                    <View style={[styles.catBadge, { backgroundColor: catColor + '1e' }]}>
                      <Text style={[styles.catBadgeText, { color: catColor }]}>
                        {t(`categories.${e.category}`)}
                      </Text>
                    </View>
                  </View>
                  {e.note ? (
                    <Text style={styles.noteText} numberOfLines={1}>{e.note}</Text>
                  ) : null}
                </View>
              </Card>
              </Animated.View>
            );
          })}
          <View style={{ height: 110 }} />
        </ScrollView>

        {/* ── FAB ───────────────────────────────────────────────────────────── */}
        <AnimatedPressable
          style={[styles.fab, SHADOWS.glow]}
          onPress={openAdd}
          accessibilityLabel="הוספת הוצאה חדשה"
          scaleDown={0.85}
        >
          <Ionicons name="add" size={28} color="#fff" />
        </AnimatedPressable>
      </View>
      </ScreenTransition>

      {/* ── Add / Edit Modal ──────────────────────────────────────────────────── */}
      <Modal visible={showModal} animationType="slide" presentationStyle="pageSheet">
        <KeyboardAvoidingView
          style={{ flex: 1, backgroundColor: COLORS.bg }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView contentContainerStyle={styles.modal} keyboardShouldPersistTaps="handled">
            {/* Modal handle */}
            <View style={styles.handle} />

            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingId ? t('expenses.editTitle') : t('expenses.addTitle')}
              </Text>
              <IconButton
                icon="close"
                variant="subtle"
                onPress={() => setShowModal(false)}
                accessibilityLabel={t('common.close')}
              />
            </View>

            <Input
              label={t('expenses.description')}
              value={desc}
              onChangeText={setDesc}
              placeholder={t('expenses.descHint')}
              icon="reader-outline"
            />
            <Input
              label={t('expenses.amount')}
              value={amount}
              onChangeText={setAmount}
              keyboardType="decimal-pad"
              placeholder="0"
              icon="cash-outline"
            />

            {/* Category selector */}
            <View style={{ gap: SPACING.sm }}>
              <Text style={styles.catLabel}>{t('expenses.category')}</Text>
              <View style={styles.catGrid}>
                {CATEGORIES.map((c) => {
                  const active = category === c;
                  const catIcon = (CATEGORY_ICONS[c] ?? 'pricetag') as React.ComponentProps<typeof Ionicons>['name'];
                  const catColor = CATEGORY_COLORS[c];
                  const catLabel = t(`categories.${c}`);
                  return (
                    <TouchableOpacity
                      key={c}
                      style={[
                        styles.catBtn,
                        {
                          borderColor: active ? catColor + 'aa' : COLORS.border,
                          backgroundColor: active ? catColor + '1e' : COLORS.cardAlt,
                        },
                      ]}
                      onPress={() => setCategory(c)}
                      accessibilityRole="radio"
                      accessibilityState={{ selected: active }}
                      accessibilityLabel={catLabel}
                    >
                      <Ionicons
                        name={catIcon}
                        size={13}
                        color={active ? catColor : COLORS.textMuted}
                      />
                      <Text
                        style={[
                          styles.catBtnText,
                          active && { color: catColor, fontWeight: '700' },
                        ]}
                      >
                        {catLabel}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <Input
              label={t('expenses.note')}
              value={note}
              onChangeText={setNote}
              placeholder={t('expenses.noteHint')}
              multiline
              icon="create-outline"
            />

            {formError ? (
              <View style={styles.formErrorWrap}>
                <Ionicons name="alert-circle-outline" size={16} color={COLORS.danger} />
                <Text style={styles.formError}>{formError}</Text>
              </View>
            ) : null}

            <Button
              label={editingId ? t('common.update') : t('common.save')}
              onPress={handleSave}
              loading={saving}
              icon="checkmark"
            />
            {editingId && (
              <Button
                label={t('common.delete')}
                variant="danger"
                icon="trash-outline"
                onPress={() => {
                  setShowModal(false);
                  handleDelete(editingId, desc);
                }}
              />
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:      { flex: 1, backgroundColor: COLORS.bg },
  container: { flex: 1 },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    gap: SPACING.lg,
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  overline: { ...TYPE.overline, color: COLORS.textMuted },
  title:    { ...TYPE.h1, marginTop: 4 },
  totalBox: { alignItems: 'flex-end', flexShrink: 0 },
  totalLabel: { ...TYPE.overline, color: COLORS.textMuted },
  total: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: -0.5,
    marginTop: 2,
  },

  // Search
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginHorizontal: SPACING.xl,
    marginBottom: SPACING.sm,
    paddingHorizontal: SPACING.md,
    backgroundColor: COLORS.cardAlt,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    height: 44,
  },
  searchInput: {
    flex: 1,
    color: COLORS.text,
    fontSize: 15,
    fontWeight: '500',
  },

  // Pill filters (month + category)
  pillScroll: { maxHeight: 40 },
  pillRow:    { paddingHorizontal: SPACING.xl, gap: SPACING.xs, flexDirection: 'row', alignItems: 'center' },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 13,
    paddingVertical: 6,
    borderRadius: RADIUS.pill,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  pillActive: {
    backgroundColor: COLORS.primarySoft,
    borderColor: COLORS.primary + '88',
  },
  pillText:       { color: COLORS.textSecondary, fontSize: 12, fontWeight: '600' },
  pillTextActive: { color: COLORS.primary, fontWeight: '700' },
  catDot: { width: 7, height: 7, borderRadius: 3.5 },

  // List
  list: { padding: SPACING.xl, gap: SPACING.sm, paddingTop: SPACING.md },
  expenseCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.md,
    padding: SPACING.md,
  },
  catIconBox: {
    width: 42,
    height: 42,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  expenseMain:    { flex: 1, gap: 5 },
  expenseTopRow:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  expenseDesc:    { ...TYPE.bodyStrong, flex: 1, marginEnd: 8, fontSize: 14 },
  expenseAmount:  { fontSize: 16, fontWeight: '800', color: COLORS.text, letterSpacing: -0.3 },
  expenseBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  expenseMeta:   { ...TYPE.micro, color: COLORS.textMuted },
  catBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: RADIUS.pill,
  },
  catBadgeText: { fontSize: 10, fontWeight: '700' },
  noteText: {
    ...TYPE.micro,
    color: COLORS.textMuted,
    fontStyle: 'italic',
  },

  // FAB
  fab: {
    position: 'absolute',
    bottom: 28,
    right: SPACING.xl,
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Modal
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.borderStrong,
    alignSelf: 'center',
    marginBottom: SPACING.md,
  },
  modal: {
    padding: SPACING['2xl'],
    gap: SPACING.lg,
    paddingBottom: 60,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  modalTitle: { ...TYPE.h2 },
  catLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textSecondary,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  catGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  catBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 13,
    paddingVertical: 9,
    borderRadius: RADIUS.pill,
    borderWidth: 1.5,
  },
  catBtnText: { fontSize: 13, fontWeight: '500', color: COLORS.textSecondary },
  formErrorWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.dangerSoft,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.danger + '44',
  },
  formError: {
    color: COLORS.danger,
    fontSize: 14,
    fontWeight: '600',
  },
});
