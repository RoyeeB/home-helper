import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { translate, Language, TKey } from '../lib/i18n';

const STORAGE_KEY = 'app.language';
const DEFAULT_LANG: Language = 'en';

interface LanguageContextType {
  lang: Language;
  ready: boolean;
  isRTL: boolean;
  setLanguage: (l: Language) => Promise<void>;
  t: (key: TKey | string, vars?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  lang: DEFAULT_LANG,
  ready: false,
  isRTL: false,
  setLanguage: async () => {},
  t: (k) => String(k),
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Language>(DEFAULT_LANG);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        const initial = (saved === 'he' || saved === 'en') ? saved as Language : DEFAULT_LANG;
        setLang(initial);
      } catch {
        // ignore — fall back to defaults
      } finally {
        setReady(true);
      }
    })();
  }, []);

  // Note: we deliberately do NOT call I18nManager.forceRTL — that requires
  // an app restart. Instead, the layout stays LTR while Hebrew text renders
  // RTL inside its own elements via Unicode bidi (automatic).
  const setLanguage = useCallback(async (l: Language) => {
    await AsyncStorage.setItem(STORAGE_KEY, l);
    setLang(l);
  }, []);

  const t = useCallback(
    (key: TKey | string, vars?: Record<string, string | number>) =>
      translate(key as string, lang, vars),
    [lang]
  );

  return (
    <LanguageContext.Provider value={{ lang, ready, isRTL: lang === 'he', setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);
