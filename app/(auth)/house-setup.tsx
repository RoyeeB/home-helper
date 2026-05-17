import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  Share,
} from 'react-native';
import {
  collection,
  doc,
  setDoc,
  updateDoc,
  query,
  where,
  getDocs,
  arrayUnion,
  serverTimestamp,
} from 'firebase/firestore';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { db } from '../../lib/firebase';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { COLORS } from '../../constants/colors';
import { RADIUS, SPACING, TYPE } from '../../constants/theme';

type Mode = 'pick' | 'create' | 'join';

export default function HouseSetupScreen() {
  const { profile, refreshProfile, logout } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();
  const [mode, setMode] = useState<Mode>('pick');
  const [houseName, setHouseName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [createdCode, setCreatedCode] = useState('');

  async function handleCreate() {
    if (!houseName.trim()) {
      setError(t('house.nameRequired'));
      return;
    }
    if (!profile) return;
    setLoading(true);
    setError('');
    try {
      const code = String(Math.floor(100000 + Math.random() * 900000));
      const houseRef = doc(collection(db, 'houses'));
      await setDoc(houseRef, {
        name: houseName.trim(),
        code,
        memberIds: [profile.uid],
        members: [{ uid: profile.uid, name: profile.displayName }],
        createdAt: serverTimestamp(),
      });
      await updateDoc(doc(db, 'users', profile.uid), { houseId: houseRef.id });
      setCreatedCode(code);
      await refreshProfile();
      setTimeout(() => router.replace('/(tabs)'), 2500);
    } catch {
      setError(t('house.createError'));
    } finally {
      setLoading(false);
    }
  }

  async function handleJoin() {
    const code = joinCode.trim();
    if (code.length !== 6) {
      setError(t('house.invalidCode'));
      return;
    }
    if (!profile) return;
    setLoading(true);
    setError('');
    try {
      const q = query(collection(db, 'houses'), where('code', '==', code));
      const snap = await getDocs(q);
      if (snap.empty) {
        setError(t('house.notFound'));
        setLoading(false);
        return;
      }
      const houseDoc = snap.docs[0];
      await updateDoc(houseDoc.ref, {
        memberIds: arrayUnion(profile.uid),
        members: arrayUnion({ uid: profile.uid, name: profile.displayName }),
      });
      await updateDoc(doc(db, 'users', profile.uid), { houseId: houseDoc.id });
      await refreshProfile();
      router.replace('/(tabs)');
    } catch {
      setError(t('house.joinError'));
    } finally {
      setLoading(false);
    }
  }

  async function shareCreatedCode() {
    try {
      await Share.share({
        message: t('settings.shareMessage', { name: houseName, code: createdCode }),
      });
    } catch {}
  }

  if (createdCode) {
    return (
      <View style={styles.centered}>
        <View style={styles.successBadge}>
          <Text style={styles.successEmoji}>🎉</Text>
        </View>
        <Text style={styles.title}>{t('house.successTitle')}</Text>
        <Text style={styles.subtitle}>{t('house.successHint')}</Text>
        <View style={styles.codeBox}>
          <Text style={styles.codeText}>{createdCode}</Text>
        </View>
        <Button
          label={t('house.shareInvite')}
          icon="share-outline"
          variant="secondary"
          onPress={shareCreatedCode}
          fullWidth={false}
        />
        <Text style={styles.hint}>{t('house.redirecting')}</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: COLORS.bg }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.title}>{t('house.setupTitle')}</Text>
          <Text style={styles.subtitle}>{t('house.setupSubtitle')}</Text>
        </View>

        {mode === 'pick' && (
          <View style={styles.options}>
            <Card
              variant="elevated"
              style={styles.optionCard}
              onPress={() => setMode('create')}
              accessibilityLabel={t('house.create')}
            >
              <View style={[styles.optionIcon, { backgroundColor: COLORS.primarySoft }]}>
                <Ionicons name="home" size={28} color={COLORS.primary} />
              </View>
              <Text style={styles.optionTitle}>{t('house.create')}</Text>
              <Text style={styles.optionDesc}>{t('house.createDesc')}</Text>
            </Card>
            <Card
              variant="elevated"
              style={styles.optionCard}
              onPress={() => setMode('join')}
              accessibilityLabel={t('house.join')}
            >
              <View style={[styles.optionIcon, { backgroundColor: COLORS.successSoft }]}>
                <Ionicons name="key" size={26} color={COLORS.success} />
              </View>
              <Text style={styles.optionTitle}>{t('house.join')}</Text>
              <Text style={styles.optionDesc}>{t('house.joinDesc')}</Text>
            </Card>
          </View>
        )}

        {mode === 'create' && (
          <View style={styles.form}>
            <Input
              label={t('house.homeName')}
              value={houseName}
              onChangeText={setHouseName}
              placeholder={t('house.homeNameHint')}
              icon="home-outline"
            />
            {error ? <Text style={styles.error}>{error}</Text> : null}
            <Button label={t('house.createBtn')} onPress={handleCreate} loading={loading} icon="add" />
            <Button label={t('common.back')} onPress={() => setMode('pick')} variant="ghost" />
          </View>
        )}

        {mode === 'join' && (
          <View style={styles.form}>
            <Input
              label={t('house.inviteCode')}
              value={joinCode}
              onChangeText={setJoinCode}
              keyboardType="number-pad"
              placeholder="123456"
              maxLength={6}
              icon="key-outline"
              style={{ textAlign: 'center', letterSpacing: 6, fontSize: 20, fontWeight: '700' }}
            />
            {error ? <Text style={styles.error}>{error}</Text> : null}
            <Button label={t('house.joinBtn')} onPress={handleJoin} loading={loading} icon="enter" />
            <Button label={t('common.back')} onPress={() => setMode('pick')} variant="ghost" />
          </View>
        )}

        <TouchableOpacity onPress={logout} hitSlop={12}>
          <Text style={styles.logoutLink}>{t('settings.logout')}</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: SPACING['2xl'],
    justifyContent: 'center',
    gap: SPACING['3xl'],
  },
  centered: {
    flex: 1,
    backgroundColor: COLORS.bg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.md,
    padding: SPACING['2xl'],
  },
  header: { alignItems: 'center', gap: SPACING.sm },
  title: { ...TYPE.h1, fontSize: 28 },
  subtitle: { ...TYPE.caption, fontSize: 15, textAlign: 'center' },
  options: { gap: SPACING.md },
  optionCard: {
    alignItems: 'center',
    gap: SPACING.sm,
    padding: SPACING['2xl'],
  },
  optionIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xs,
  },
  optionTitle: { ...TYPE.h3, fontSize: 18 },
  optionDesc: { ...TYPE.caption, textAlign: 'center' },
  form: { gap: SPACING.lg },
  error: { color: COLORS.danger, textAlign: 'center', fontSize: 14, fontWeight: '600' },
  logoutLink: { textAlign: 'center', color: COLORS.textMuted, fontSize: 14 },
  successBadge: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.successSoft,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.success,
  },
  successEmoji: { fontSize: 48 },
  codeBox: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING.xl,
    paddingHorizontal: SPACING['4xl'],
    borderWidth: 2,
    borderColor: COLORS.primary,
    marginTop: SPACING.sm,
  },
  codeText: {
    fontSize: 40,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: 8,
  },
  hint: { color: COLORS.textMuted, fontSize: 13, marginTop: SPACING.md },
});
