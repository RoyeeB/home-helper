import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { COLORS } from '../../constants/colors';
import { RADIUS, SHADOWS, SPACING, TYPE } from '../../constants/theme';

export default function LoginScreen() {
  const { login } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleLogin() {
    if (!email || !password) {
      setError(t('auth.fillAllFields'));
      return;
    }
    setLoading(true);
    setError('');
    try {
      await login(email.trim(), password);
      router.replace('/');
    } catch {
      setError(t('auth.invalidCreds'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: COLORS.bg }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">

        {/* Brand mark */}
        <View style={styles.header}>
          <View style={styles.logoOuter}>
            <View style={[styles.logoBadge, SHADOWS.glow]}>
              <Text style={styles.logoEmoji}>🏠</Text>
            </View>
          </View>
          <Text style={styles.title}>Home Helper</Text>
          <Text style={styles.subtitle}>{t('auth.loginSubtitle')}</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <Input
            label={t('auth.email')}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholder="you@example.com"
            icon="mail-outline"
          />
          <Input
            label={t('auth.password')}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder="••••••••"
            icon="lock-closed-outline"
          />
          {error ? (
            <View style={styles.errorWrap}>
              <Text style={styles.error}>{error}</Text>
            </View>
          ) : null}
          <Button label={t('auth.login')} onPress={handleLogin} loading={loading} size="lg" />
        </View>

        <TouchableOpacity onPress={() => router.push('/(auth)/register')} hitSlop={12}>
          <Text style={styles.link}>
            {t('auth.noAccount')}{'  '}
            <Text style={{ color: COLORS.primary, fontWeight: '700' }}>{t('auth.signUpLink')}</Text>
          </Text>
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
  header: { alignItems: 'center', gap: SPACING.sm },
  // Outer ring — very faint
  logoOuter: {
    width: 88,
    height: 88,
    borderRadius: RADIUS.pill,
    borderWidth: 1,
    borderColor: COLORS.primary + '30',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xs,
  },
  logoBadge: {
    width: 70,
    height: 70,
    borderRadius: RADIUS.xl,
    backgroundColor: COLORS.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.primary + '55',
  },
  logoEmoji: { fontSize: 34 },
  title:     { ...TYPE.display },
  subtitle:  { ...TYPE.caption, fontSize: 15, color: COLORS.textMuted },
  form:      { gap: SPACING.lg },
  errorWrap: {
    backgroundColor: COLORS.dangerSoft,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.danger + '44',
  },
  error: {
    color: COLORS.danger,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
  },
  link: {
    textAlign: 'center',
    color: COLORS.textSecondary,
    fontSize: 15,
  },
});
