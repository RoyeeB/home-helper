import { Tabs } from 'expo-router';
import { useLanguage } from '../../context/LanguageContext';
import { AnimatedTabBar } from '../../components/AnimatedTabBar';

export default function TabsLayout() {
  const { t } = useLanguage();
  return (
    <Tabs
      tabBar={(props) => <AnimatedTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        // Re-run entering animations every time a tab is focused
        // by remounting the screen — gives a fresh feel when switching tabs.
        unmountOnBlur: true,
      }}
    >
      <Tabs.Screen name="index"        options={{ title: t('tabs.dashboard') }} />
      <Tabs.Screen name="expenses"     options={{ title: t('tabs.expenses') }} />
      <Tabs.Screen name="fixed-costs"  options={{ title: t('tabs.fixed') }} />
      <Tabs.Screen name="shopping"     options={{ title: t('tabs.shopping') }} />
      <Tabs.Screen name="charts"       options={{ title: t('tabs.charts') }} />
    </Tabs>
  );
}
