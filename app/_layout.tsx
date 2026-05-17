import { useEffect } from 'react';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AuthProvider } from '../context/AuthContext';
import { HouseProvider } from '../context/HouseContext';
import { LanguageProvider, useLanguage } from '../context/LanguageContext';
import { COLORS } from '../constants/colors';

SplashScreen.preventAutoHideAsync();

function AppShell() {
  const { ready } = useLanguage();

  useEffect(() => {
    if (ready) SplashScreen.hideAsync();
  }, [ready]);

  if (!ready) return null;

  return (
    <AuthProvider>
      <HouseProvider>
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: COLORS.bg },
            animation: 'fade',
            animationDuration: 220,
          }}
        >
          <Stack.Screen name="settings" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
        </Stack>
      </HouseProvider>
    </AuthProvider>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <LanguageProvider>
        <AppShell />
      </LanguageProvider>
    </GestureHandlerRootView>
  );
}
