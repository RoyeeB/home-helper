import { useState } from 'react';
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useHouse } from '../../context/HouseContext';
import { useLanguage } from '../../context/LanguageContext';
import { FixedCost } from '../../types';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { EmptyState } from '../../components/EmptyState';
import { IconButton } from '../../components/IconButton';
import { ScreenTransition } from '../../components/ScreenTransition';
import { AnimatedPressable } from '../../components/AnimatedPressable';
import { COLORS } from '../../constants/colors';
import { RADIUS, SHADOWS, SPACING, TYPE } from '../../constants/theme';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

// Type meta — labels are pulled via t('fixedTypes.<key>') at render time.
const FIXED_COST_TYPES: { key: string; icon: IconName; color: string }[] = [
  { key: 'rent',         icon: 'business',            color: '#818cf8' },
  { key: 'mortgage',     icon: 'cash',                color: '#60a5fa' },
  { key: 'electricity',  icon: 'flash',               color: '#fbbf24' },
  { key: 'water',        icon: 'water',               color: '#22d3ee' },
  { key: 'internet',     icon: 'wifi',                color: '#a78bfa' },
  { key: 'gas',          icon: 'flame',               color: '#fb923c' },
  { key: 'insurance',    icon: 'shield-checkmark',    color: '#34d399' },
  { key: 'subscription', icon: 'card',                color: '#f472b6' },
  { key: 'other',        icon: 'ellipsis-horizontal', color: '#9aa0bc' },
];

function getTypeInfo(type: string) {
  return (
    FIXED_COST_TYPES.find((t) => t.key === type) ?? {
      key: type,
      icon: 'ellipsis-horizontal' as IconName,
      color: COLORS.textSecondary,
    }
  );
}

function formatAmount(n: number) {
  return `₪${n.toLocaleString('he-IL', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

export default function FixedCostsScreen() {
  const { fixedCosts, addFixedCost, updateFixedCost, deleteFixedCost } = useHouse();
  const { t } = useLanguage();
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<FixedCost | null>(null);

  const [type, setType] = useState('rent');
  const [amount, setAmount] = useState('');
  const [dayOfMonth, setDayOfMonth] = useState('1');
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const total  = fixedCosts.reduce((s, f) => s + f.amount, 0);
  const yearly = total * 12;

  function openAdd() {
    setEditing(null);
    setType('rent');
    setAmount('');
    setDayOfMonth('1');
    setFormError('');
    setShowModal(true);
  }

  function openEdit(fc: FixedCost) {
    setEditing(fc);
    setType(fc.type);
    setAmount(String(fc.amount));
    setDayOfMonth(String(fc.dayOfMonth));
    setFormError('');
    setShowModal(true);
  }

  async function handleSave() {
    const parsed = parseFloat(amount);
    const day    = parseInt(dayOfMonth);
    if (isNaN(parsed) || parsed <= 0) {
      setFormError(t('fixed.invalidAmount'));
      return;
    }
    if (isNaN(day) || day < 1 || day > 31) {
      setFormError(t('fixed.invalidDay'));
      return;
    }
    setSaving(true);
    setFormError('');
    try {
      const typeName = t(`fixedTypes.${type}`);
      if (editing) {
        await updateFixedCost(editing.id, { name: typeName, amount: parsed, type, dayOfMonth: day });
      } else {
        await addFixedCost({ name: typeName, amount: parsed, type, dayOfMonth: day });
      }
      setShowModal(false);
    } catch {
      setFormError(t('expenses.saveError'));
    } finally {
      setSaving(false);
    }
  }

  function handleDelete(fc: FixedCost) {
    Alert.alert(t('fixed.deleteTitle'), t('fixed.deleteConfirm', { name: fc.name }), [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('common.delete'), style: 'destructive', onPress: () => deleteFixedCost(fc.id) },
    ]);
  }

  const sorted = [...fixedCosts].sort((a, b) => a.dayOfMonth - b.dayOfMonth);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenTransition>
      <View style={styles.container}>

        {/* ── Header ─────────────────────────────────────────────────────────── */}
        <View style={styles.header}>
          <Text style={styles.overline}>{t('fixed.overline')}</Text>
          <Text style={styles.title}>{t('fixed.title')}</Text>
        </View>

        {/* ── Summary card ───────────────────────────────────────────────────── */}
        <Card variant="elevated" style={styles.summary}>
          <View style={styles.summaryRow}>
            <View style={styles.summaryCell}>
              <Text style={styles.summaryLabel}>{t('fixed.monthlyTotal')}</Text>
              <Text style={styles.summaryTotal}>{formatAmount(total)}</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryCell}>
              <Text style={styles.summaryLabel}>{t('fixed.yearlyTotal')}</Text>
              <Text style={styles.summaryValue}>{formatAmount(yearly)}</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryCell}>
              <Text style={styles.summaryLabel}>{t('dashboard.transactions')}</Text>
              <Text style={styles.summaryValue}>{fixedCosts.length}</Text>
            </View>
          </View>
        </Card>

        {/* ── List ───────────────────────────────────────────────────────────── */}
        <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
          {sorted.length === 0 && (
            <EmptyState
              icon="repeat"
              title={t('fixed.emptyTitle')}
              description={t('fixed.emptyHint')}
            />
          )}
          {sorted.map((fc) => {
            const info = getTypeInfo(fc.type);
            const typeName = t(`fixedTypes.${fc.type}`);
            return (
              <Card key={fc.id} style={styles.fcCard}>
                <View style={[styles.fcIconBox, { backgroundColor: info.color + '1e' }]}>
                  <Ionicons name={info.icon} size={19} color={info.color} />
                </View>
                <View style={styles.fcInfo}>
                  <Text style={styles.fcName}>{typeName}</Text>
                  <View style={styles.fcDayRow}>
                    <Ionicons name="calendar-outline" size={11} color={COLORS.textMuted} />
                    <Text style={styles.fcDay}>{t('fixed.dayLabel', { day: fc.dayOfMonth })}</Text>
                  </View>
                </View>
                <Text style={[styles.fcAmount, { color: info.color }]}>{formatAmount(fc.amount)}</Text>
                <IconButton
                  icon="pencil"
                  variant="plain"
                  size={17}
                  onPress={() => openEdit(fc)}
                  accessibilityLabel={`${t('common.edit')} ${typeName}`}
                />
                <IconButton
                  icon="trash-outline"
                  variant="plain"
                  size={17}
                  onPress={() => handleDelete(fc)}
                  accessibilityLabel={`${t('common.delete')} ${typeName}`}
                  style={{ marginEnd: -SPACING.xs }}
                />
              </Card>
            );
          })}
          <View style={{ height: 110 }} />
        </ScrollView>

        {/* ── FAB ───────────────────────────────────────────────────────────── */}
        <AnimatedPressable
          style={[styles.fab, SHADOWS.glow]}
          onPress={openAdd}
          accessibilityLabel={t('fixed.addTitle')}
          scaleDown={0.85}
        >
          <Ionicons name="add" size={28} color="#fff" />
        </AnimatedPressable>
      </View>
      </ScreenTransition>

      {/* ── Modal ─────────────────────────────────────────────────────────────── */}
      <Modal visible={showModal} animationType="slide" presentationStyle="pageSheet">
        <KeyboardAvoidingView
          style={{ flex: 1, backgroundColor: COLORS.bg }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView contentContainerStyle={styles.modal} keyboardShouldPersistTaps="handled">
            <View style={styles.handle} />
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editing ? t('fixed.editTitle') : t('fixed.addTitle')}
              </Text>
              <IconButton
                icon="close"
                variant="subtle"
                onPress={() => setShowModal(false)}
                accessibilityLabel={t('common.close')}
              />
            </View>

            <Text style={styles.typeLabel}>{t('fixed.type')}</Text>
            <View style={styles.typeGrid}>
              {FIXED_COST_TYPES.map((ft) => {
                const active = type === ft.key;
                const ftLabel = t(`fixedTypes.${ft.key}`);
                return (
                  <TouchableOpacity
                    key={ft.key}
                    style={[
                      styles.typeBtn,
                      active && { backgroundColor: ft.color + '1e', borderColor: ft.color + 'aa' },
                    ]}
                    onPress={() => setType(ft.key)}
                    accessibilityRole="radio"
                    accessibilityState={{ selected: active }}
                    accessibilityLabel={ftLabel}
                  >
                    <Ionicons name={ft.icon} size={14} color={active ? ft.color : COLORS.textMuted} />
                    <Text style={[styles.typeBtnLabel, active && { color: ft.color, fontWeight: '700' }]}>
                      {ftLabel}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Input
              label={t('settings.monthlyAmount')}
              value={amount}
              onChangeText={setAmount}
              keyboardType="decimal-pad"
              placeholder="0"
              icon="cash-outline"
            />
            <Input
              label={t('fixed.dayOfMonth')}
              value={dayOfMonth}
              onChangeText={setDayOfMonth}
              keyboardType="number-pad"
              placeholder="1"
              icon="calendar-outline"
              helperText="1-31"
            />

            {formError ? (
              <View style={styles.formErrorWrap}>
                <Ionicons name="alert-circle-outline" size={16} color={COLORS.danger} />
                <Text style={styles.formError}>{formError}</Text>
              </View>
            ) : null}
            <Button label={t('common.save')} onPress={handleSave} loading={saving} icon="checkmark" />
            {editing && (
              <Button
                label={t('common.delete')}
                variant="danger"
                icon="trash-outline"
                onPress={() => {
                  setShowModal(false);
                  handleDelete(editing);
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

  header: {
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  overline: { ...TYPE.overline, color: COLORS.textMuted },
  title:    { ...TYPE.h1, marginTop: 2 },

  summary: {
    marginHorizontal: SPACING.xl,
    marginBottom: SPACING.lg,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  summaryCell:      { flex: 1, alignItems: 'center' },
  summaryDivider:   { width: 1, height: 40, backgroundColor: COLORS.border },
  summaryLabel:     { ...TYPE.overline, color: COLORS.textMuted },
  summaryTotal: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.primary,
    marginTop: 5,
    letterSpacing: -0.5,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: 5,
  },

  list: { paddingHorizontal: SPACING.xl, gap: SPACING.sm, paddingTop: 0 },
  fcCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    padding: SPACING.md,
  },
  fcIconBox: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  fcInfo:    { flex: 1 },
  fcName:    { ...TYPE.body, fontWeight: '700' },
  fcDayRow:  { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 3 },
  fcDay:     { ...TYPE.micro, color: COLORS.textMuted },
  fcAmount:  { fontSize: 16, fontWeight: '800', letterSpacing: -0.3 },

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

  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.borderStrong,
    alignSelf: 'center',
    marginBottom: SPACING.md,
  },
  modal: { padding: SPACING['2xl'], gap: SPACING.lg, paddingBottom: 60 },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  modalTitle: { ...TYPE.h2 },
  typeLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textSecondary,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  typeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 13,
    paddingVertical: 9,
    borderRadius: RADIUS.pill,
    backgroundColor: COLORS.cardAlt,
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  typeBtnLabel: { color: COLORS.textSecondary, fontSize: 13, fontWeight: '500' },
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
  formError: { color: COLORS.danger, fontSize: 14, fontWeight: '600' },
});
