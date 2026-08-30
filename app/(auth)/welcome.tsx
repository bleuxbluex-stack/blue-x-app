import { View, Text, StyleSheet, Pressable, ImageBackground } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowRight, ShieldCheck } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function WelcomeScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.root}>
      <ImageBackground
        source={{ uri: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=compress&fit=crop&w=1000&q=80' }}
        style={styles.bg}
        resizeMode="cover"
      >
        <LinearGradient
          colors={['rgba(15, 23, 42, 0.4)', 'rgba(15, 23, 42, 0.85)', '#0F172A']}
          locations={[0, 0.45, 1]}
          style={[styles.overlay, { paddingTop: insets.top + 30, paddingBottom: insets.bottom + 20 }]}
        >
          <View style={styles.container}>
            {/* Top Brand Logo Section */}
            <View style={styles.brandHeader}>
              <View style={styles.logoMarkContainer}>
                <View style={styles.logoMarkIcon}>
                  <ShieldCheck size={30} color="#FFFFFF" strokeWidth={2.4} />
                </View>
                <View style={styles.brandTitleWrap}>
                  <Text style={styles.brandTitleText}>
                    Blue<Text style={styles.brandTitleAccent}>X</Text>
                  </Text>
                  <Text style={styles.brandSubtitle}>SWISS SERVICE NETWORK</Text>
                </View>
              </View>
            </View>

            {/* Bottom Content & Action Deck */}
            <View style={styles.bottomSection}>
              <Text style={styles.headline}>Swiss Quality Home & Repair Services.</Text>
              <Text style={styles.subline}>
                Book verified plumbers, electricians, cleaners & craftsmen in seconds.
              </Text>

              <View style={styles.ctaGroup}>
                <Pressable
                  style={({ pressed }) => [styles.getStartedBtn, pressed && styles.btnPressed]}
                  onPress={() => router.push('/(auth)/register')}
                >
                  <Text style={styles.getStartedText}>Get Started</Text>
                  <ArrowRight size={18} color="#FFFFFF" strokeWidth={2.2} />
                </Pressable>

                <Pressable
                  style={({ pressed }) => [styles.signInBtn, pressed && styles.btnPressed]}
                  onPress={() => router.push('/(auth)/login')}
                >
                  <Text style={styles.signInText}>
                    Already have an account? <Text style={styles.signInBold}>Sign In</Text>
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
        </LinearGradient>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0F172A' },
  bg: { flex: 1 },
  overlay: { flex: 1 },
  container: { flex: 1, paddingHorizontal: 24, justifyContent: 'space-between' },

  // Top Brand Section
  brandHeader: { alignItems: 'center', marginTop: 16 },
  logoMarkContainer: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  logoMarkIcon: { width: 52, height: 52, borderRadius: 16, backgroundColor: '#2563EB', alignItems: 'center', justifyContent: 'center', shadowColor: '#2563EB', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 10, elevation: 6 },
  brandTitleWrap: { justifyContent: 'center' },
  brandTitleText: { fontFamily: 'Inter-Bold', fontSize: 32, color: '#FFFFFF', letterSpacing: -0.8, lineHeight: 36 },
  brandTitleAccent: { color: '#38BDF8' },
  brandSubtitle: { fontFamily: 'Inter-Bold', fontSize: 10, color: 'rgba(255, 255, 255, 0.65)', letterSpacing: 1.8, marginTop: 2 },

  // Bottom Section
  bottomSection: { gap: 14, marginBottom: 12 },
  headline: { fontFamily: 'Inter-Bold', fontSize: 30, color: '#FFFFFF', lineHeight: 38, letterSpacing: -0.5 },
  subline: { fontFamily: 'Inter-Regular', fontSize: 15, color: '#94A3B8', lineHeight: 22 },

  // CTA Group
  ctaGroup: { gap: 12, marginTop: 12 },
  getStartedBtn: { height: 56, backgroundColor: '#2563EB', borderRadius: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, shadowColor: '#2563EB', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35, shadowRadius: 10, elevation: 5 },
  getStartedText: { fontFamily: 'Inter-Bold', fontSize: 16, color: '#FFFFFF' },
  btnPressed: { opacity: 0.9, transform: [{ scale: 0.99 }] },
  signInBtn: { height: 48, alignItems: 'center', justifyContent: 'center' },
  signInText: { fontFamily: 'Inter-Regular', fontSize: 14, color: '#94A3B8' },
  signInBold: { fontFamily: 'Inter-Bold', color: '#38BDF8' },
});
