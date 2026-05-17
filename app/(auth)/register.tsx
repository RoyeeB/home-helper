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
import { SPACING, TYPE } from '../../constants/theme';

export default function RegisterScreen() {
  const { register } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleRegister() {
    if (!name || !email || !password) {
      setError(t('auth.fillAllFields'));
      return;
    }
    if (password.length < 6) {
      setError(t('auth.passwordTooShort'));
      return;
    }
    setLoading(true);
    setError('');
    try {
      await register(email.trim(), password, name.trim());
      router.replace('/(auth)/house-setup');
    } catch (e: any) {
      if (e.code === 'auth/email-already-in-use') {
        setError(t('auth.emailInUse'));
      } else {
        setError(t('auth.genericRegError'));
      }
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
        <View style={styles.header}>
          <Text style={styles.title}>{t('auth.registerTitle')}</Text>
          <Text style={styles.subtitle}>{t('auth.registerSubtitle')}</Text>
        </View>

        <View style={styles.form}>
          <Input
            label={t('auth.fullName')}
            value={name}
            onChangeText={setName}
            placeholder={t('auth.fullNameHint')}
            icon="person-outline"
          />
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
            placeholder={t('auth.passwordHint')}
            icon="lock-closed-outline"
            helperText={t('auth.passwordHelp')}
          />
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <Button label={t('auth.register')} onPress={handleRegister} loading={loading} size="lg" />
        </View>

        <TouchableOpacity onPress={() => router.back()} hitSlop={12}>
          <Text style={styles.link}>
            {t('auth.haveAccount')} <Text style={{ color: COLORS.primary, fontWeight: '700' }}>{t('auth.signInLink')}</Text>
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
  title: { ...TYPE.h1 },
  subtitle: { ...TYPE.caption, fontSize: 15 },
  form: { gap: SPACING.lg },
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
