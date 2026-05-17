import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInRight, FadeOutLeft, Layout } from 'react-native-reanimated';
import { useHouse } from '../../context/HouseContext';
import { useLanguage } from '../../context/LanguageContext';
import { EmptyState } from '../../components/EmptyState';
import { ScreenTransition } from '../../components/ScreenTransition';
import { AnimatedPressable } from '../../components/AnimatedPressable';
import { COLORS } from '../../constants/colors';
import { RADIUS, SHADOWS, SPACING, TYPE } from '../../constants/theme';

export default function ShoppingScreen() {
  const { shoppingItems, addShoppingItem, toggleShoppingItem, clearCheckedItems } = useHouse();
  const { t } = useLanguage();
  const [itemName, setItemName] = useState('');
  const [qty, setQty] = useState('');
  const [adding, setAdding] = useState(false);

  const unchecked = shoppingItems.filter((i) => !i.checked);
  const checked   = shoppingItems.filter((i) => i.checked);

  async function handleAdd() {
    const name = itemName.trim();
    if (!name) return;
    setAdding(true);
    try {
      await addShoppingItem(name, qty.trim());
      setItemName('');
      setQty('');
    } finally {
      setAdding(false);
    }
  }

  function handleClearChecked() {
    if (checked.length === 0) return;
    Alert.alert(t('shopping.clearTitle'), t('shopping.clearMsg', { count: checked.length }), [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('shopping.clearBtn'), style: 'destructive', onPress: clearCheckedItems },
    ]);
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenTransition>
      <View style={styles.container}>

        {/* ── Header ─────────────────────────────────────────────────────────── */}
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={styles.overline}>{t('shopping.overline')}</Text>
            <Text style={styles.title}>{t('shopping.title')}</Text>
            <View style={styles.countsRow}>
              <View style={styles.countBadge}>
                <Text style={styles.countBadgeText}>{t('shopping.pending', { count: unchecked.length })}</Text>
              </View>
              {checked.length > 0 && (
                <View style={[styles.countBadge, styles.countBadgeChecked]}>
                  <Text style={[styles.countBadgeText, { color: COLORS.success }]}>
                    {t('shopping.completed', { count: checked.length })}
                  </Text>
                </View>
              )}
            </View>
          </View>
          {checked.length > 0 && (
            <TouchableOpacity
              onPress={handleClearChecked}
              style={styles.clearBtn}
              accessibilityRole="button"
              accessibilityLabel={t('shopping.clearTitle')}
              activeOpacity={0.8}
            >
              <Ionicons name="trash-outline" size={13} color={COLORS.danger} />
              <Text style={styles.clearText}>{t('shopping.clearBtn')}</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* ── Add row ────────────────────────────────────────────────────────── */}
        <View style={styles.addCard}>
          <TextInput
            style={styles.nameInput}
            placeholder={t('shopping.addItem')}
            placeholderTextColor={COLORS.textSubtle}
            value={itemName}
            onChangeText={setItemName}
            returnKeyType="done"
            onSubmitEditing={handleAdd}
            accessibilityLabel={t('shopping.itemName')}
          />
          <TextInput
            style={styles.qtyInput}
            placeholder={t('shopping.qty')}
            placeholderTextColor={COLORS.textSubtle}
            value={qty}
            onChangeText={setQty}
            returnKeyType="done"
            onSubmitEditing={handleAdd}
            accessibilityLabel={t('shopping.qty')}
          />
          <AnimatedPressable
            style={[styles.addBtn, (!itemName.trim() || adding) && styles.addBtnDisabled, SHADOWS.glow]}
            onPress={handleAdd}
            disabled={!itemName.trim() || adding}
            accessibilityLabel={t('common.add')}
            scaleDown={0.85}
          >
            <Ionicons name="add" size={22} color="#fff" />
          </AnimatedPressable>
        </View>

        {/* ── List ───────────────────────────────────────────────────────────── */}
        <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
          {shoppingItems.length === 0 && (
            <EmptyState
              emoji="🛒"
              title={t('shopping.emptyTitle')}
              description={t('shopping.emptyHint')}
            />
          )}

          {/* Unchecked items */}
          {unchecked.map((item, idx) => (
            <Animated.View
              key={item.id}
              entering={FadeInRight.delay(Math.min(idx, 8) * 30).springify()}
              exiting={FadeOutLeft.duration(180)}
              layout={Layout.springify()}
            >
            <TouchableOpacity
              style={styles.itemRow}
              onPress={() => toggleShoppingItem(item.id, true)}
              activeOpacity={0.75}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: false }}
              accessibilityLabel={`${item.name}${item.qty ? `, ${item.qty}` : ''}`}
            >
              <View style={styles.radioOuter}>
                <View style={styles.radioInner} />
              </View>
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.name}</Text>
                {item.qty ? <Text style={styles.itemQty}>{item.qty}</Text> : null}
              </View>
              <Text style={styles.itemAddedBy}>{item.addedBy}</Text>
            </TouchableOpacity>
            </Animated.View>
          ))}

          {/* Checked / in-cart section */}
          {checked.length > 0 && (
            <>
              {unchecked.length > 0 && (
                <View style={styles.divider}>
                  <View style={styles.dividerLine} />
                  <View style={styles.dividerChip}>
                    <Ionicons name="cart" size={11} color={COLORS.success} />
                    <Text style={styles.dividerText}>{t('shopping.sectionDone')}</Text>
                  </View>
                  <View style={styles.dividerLine} />
                </View>
              )}
              {checked.map((item) => (
                <Animated.View
                  key={item.id}
                  entering={FadeInRight.springify()}
                  exiting={FadeOutLeft.duration(180)}
                  layout={Layout.springify()}
                >
                <TouchableOpacity
                  style={[styles.itemRow, styles.itemRowChecked]}
                  onPress={() => toggleShoppingItem(item.id, false)}
                  activeOpacity={0.75}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: true }}
                  accessibilityLabel={`${item.name}`}
                >
                  <View style={styles.checkIconWrap}>
                    <Ionicons name="checkmark-circle" size={22} color={COLORS.success} />
                  </View>
                  <View style={styles.itemInfo}>
                    <Text style={[styles.itemName, styles.itemNameChecked]}>{item.name}</Text>
                    {item.qty ? (
                      <Text style={[styles.itemQty, styles.itemQtyChecked]}>{item.qty}</Text>
                    ) : null}
                  </View>
                </TouchableOpacity>
                </Animated.View>
              ))}
            </>
          )}

          <View style={{ height: 40 }} />
        </ScrollView>
      </View>
      </ScreenTransition>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:      { flex: 1, backgroundColor: COLORS.bg },
  container: { flex: 1 },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: SPACING.xl,
    paddingBottom: SPACING.md,
  },
  overline: { ...TYPE.overline, color: COLORS.textMuted },
  title:    { ...TYPE.h1, marginTop: 2 },
  countsRow: {
    flexDirection: 'row',
    gap: SPACING.xs,
    marginTop: SPACING.sm,
  },
  countBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: RADIUS.pill,
    backgroundColor: COLORS.primarySoft,
  },
  countBadgeChecked: {
    backgroundColor: COLORS.successSoft,
  },
  countBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
  },
  clearBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: RADIUS.pill,
    backgroundColor: COLORS.dangerSoft,
    marginTop: SPACING['2xl'],
    borderWidth: 1,
    borderColor: COLORS.danger + '44',
  },
  clearText: { color: COLORS.danger, fontSize: 12, fontWeight: '700' },

  // Add row
  addCard: {
    flexDirection: 'row',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.xl,
    paddingBottom: SPACING.lg,
    alignItems: 'center',
  },
  nameInput: {
    flex: 1,
    backgroundColor: COLORS.cardAlt,
    borderRadius: RADIUS.md,
    paddingVertical: 12,
    paddingHorizontal: 14,
    color: COLORS.text,
    fontSize: 15,
    fontWeight: '500',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  qtyInput: {
    width: 72,
    backgroundColor: COLORS.cardAlt,
    borderRadius: RADIUS.md,
    paddingVertical: 12,
    paddingHorizontal: 10,
    color: COLORS.text,
    fontSize: 15,
    fontWeight: '500',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  addBtn: {
    width: 46,
    height: 46,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  addBtnDisabled: { opacity: 0.45 },

  // List items
  list: { paddingHorizontal: SPACING.xl, gap: SPACING.sm },

  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  itemRowChecked: { opacity: 0.5 },

  // Custom radio circle for unchecked items
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  radioInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primarySoft,
  },

  checkIconWrap: { width: 22, alignItems: 'center', flexShrink: 0 },

  itemInfo:       { flex: 1 },
  itemName:       { ...TYPE.body, fontWeight: '600' },
  itemNameChecked:{ textDecorationLine: 'line-through', color: COLORS.textMuted },
  itemQty:        { ...TYPE.micro, color: COLORS.textSecondary, marginTop: 2 },
  itemQtyChecked: { textDecorationLine: 'line-through', color: COLORS.textMuted },
  itemAddedBy:    { ...TYPE.micro, color: COLORS.textMuted },

  // Divider
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginVertical: SPACING.xs,
  },
  dividerLine: { flex: 1, height: StyleSheet.hairlineWidth, backgroundColor: COLORS.border },
  dividerChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.pill,
    backgroundColor: COLORS.successSoft,
  },
  dividerText: { ...TYPE.micro, color: COLORS.success, fontWeight: '700' },
});
