import 'react-native-url-polyfill/auto';
import { useEffect, useState } from 'react';
import { Stack, router, SplashScreen } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native';
import { useFonts } from 'expo-font';
import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { AuthProvider, useAuth } from '@/hooks/useAuth';
import { LanguageProvider } from '@/context/LanguageContext';

try {
  SplashScreen.preventAutoHideAsync();
} catch (e) {
  // Ignore splash screen errors on native APK startup
}

function RootNavigator() {
  const { session, loading } = useAuth();
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAuthChecked(true);
    }, 1000);

    if (!loading) {
      setAuthChecked(true);
    }

    return () => clearTimeout(timer);
  }, [loading]);

  useEffect(() => {
    if (!authChecked) return;

    if (!session) {
      router.replace('/(auth)/welcome');
    } else {
      router.replace('/(tabs)');
    }
  }, [session, authChecked]);

  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#F7F9FC' } }}>
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="chat" />
      <Stack.Screen name="provider/[id]" />
      <Stack.Screen name="booking/[id]" />
      <Stack.Screen name="notifications" />
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}

export default function RootLayout() {
  useFrameworkReady();
  const [isAppReady, setIsAppReady] = useState(false);

  const [fontsLoaded, fontError] = useFonts({
    'Inter-Regular': Inter_400Regular,
    'Inter-Medium': Inter_500Medium,
    'Inter-SemiBold': Inter_600SemiBold,
    'Inter-Bold': Inter_700Bold,
  });

  useEffect(() => {
    const safetyTimer = setTimeout(() => {
      setIsAppReady(true);
      SplashScreen.hideAsync().catch(() => {});
    }, 800);

    if (fontsLoaded || fontError) {
      setIsAppReady(true);
      SplashScreen.hideAsync().catch(() => {});
      clearTimeout(safetyTimer);
    }

    return () => clearTimeout(safetyTimer);
  }, [fontsLoaded, fontError]);

  if (!isAppReady) {
    return null;
  }

  return (
    <GestureHandlerRootView style={styles.root}>
      <LanguageProvider>
        <AuthProvider>
          <RootNavigator />
        </AuthProvider>
      </LanguageProvider>
      <StatusBar style="dark" />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F7F9FC' },
});
