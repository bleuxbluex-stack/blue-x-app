import 'react-native-url-polyfill/auto';
import { useEffect } from 'react';
import { Stack, router, SplashScreen } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet, View, ActivityIndicator } from 'react-native';
import { useFonts } from 'expo-font';
import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { AuthProvider, useAuth } from '@/hooks/useAuth';
import { LanguageProvider } from '@/context/LanguageContext';

// Keep splash screen visible while fonts & auth state are initializing
SplashScreen.preventAutoHideAsync().catch(() => {});

function RootNavigator() {
  const { session, loading } = useAuth();

  useEffect(() => {
    if (loading) return;
    if (!session) {
      router.replace('/(auth)/welcome');
    } else {
      router.replace('/(tabs)');
    }
  }, [session, loading]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#14B8A6" />
      </View>
    );
  }

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
  loadingContainer: { flex: 1, backgroundColor: '#0F172A', alignItems: 'center', justifyContent: 'center' },
});

