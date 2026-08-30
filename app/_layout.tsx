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

  useEffect(() => {
    if (loading) return;
    const timeout = setTimeout(() => {
      if (!session) {
        router.replace('/(auth)/welcome');
      } else {
        router.replace('/(tabs)');
      }
    }, 50);
    return () => clearTimeout(timeout);
  }, [session, loading]);

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

  const [fontsLoaded, fontError] = useFonts({
    'Inter-Regular': Inter_400Regular,
    'Inter-Medium': Inter_500Medium,
    'Inter-SemiBold': Inter_600SemiBold,
    'Inter-Bold': Inter_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
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
