import { View, Text, StyleSheet, Pressable, ImageBackground, Image } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowRight, CheckCircle2, Star, Zap, ShieldCheck } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

export default function WelcomeScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <ImageBackground
        source={{ uri: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=compress&fit=crop&w=1200&q=80' }}
        style={styles.bg}
        resizeMode="cover"
      >
        <LinearGradient
          colors={['rgba(15, 23, 42, 0.50)', 'rgba(15, 23, 42, 0.85)', '#0F172A']}
          locations={[0, 0.40, 0.95]}
          style={[
            styles.overlay,
            { paddingTop: Math.max(insets.top + 20, 48), paddingBottom: Math.max(insets.bottom + 16, 28) }
          ]}
        >
          {/* Ambient Glow Orbs */}
          <View style={styles.ambientGlowTop} pointerEvents="none" />
          <View style={styles.ambientGlowBottom} pointerEvents="none" />

          <View style={styles.container}>
            {/* Top Brand Header with Official Transparent Dark Theme Logo */}
            <View style={styles.brandHeader}>
              <View style={styles.swissBadge}>
                <ShieldCheck size={14} color="#38BDF8" strokeWidth={2.2} />
                <Text style={styles.swissBadgeText}>VERIFIED SERVICE NETWORK</Text>
              </View>
              <Image 
                source={require('../../assets/images/logo_dark_theme.png')} 
                style={styles.brandLogoImage} 
                resizeMode="contain" 
              />
            </View>

            {/* Feature Highlights Section */}
            <View style={styles.featuresSection}>
              <View style={styles.featureCard}>
                <View style={styles.featureIconWrap}>
                  <Zap size={18} color="#38BDF8" strokeWidth={2.4} />
                </View>
                <View style={styles.featureContent}>
                  <Text style={styles.featureTitle}>Instant Booking</Text>
                  <Text style={styles.featureDesc}>Certified pros at your door in seconds</Text>
                </View>
              </View>

              <View style={styles.featureCard}>
                <View style={styles.featureIconWrap}>
                  <CheckCircle2 size={18} color="#34D399" strokeWidth={2.4} />
                </View>
                <View style={styles.featureContent}>
                  <Text style={styles.featureTitle}>100% Verified Craftsmen</Text>
                  <Text style={styles.featureDesc}>Insured, background checked & rated</Text>
                </View>
              </View>

              <View style={styles.featureCard}>
                <View style={styles.featureIconWrap}>
                  <Star size={18} color="#FBBF24" strokeWidth={2.4} />
                </View>
                <View style={styles.featureContent}>
                  <Text style={styles.featureTitle}>4.9/5 Quality Standard</Text>
                  <Text style={styles.featureDesc}>Trusted across Zürich, Geneva & Bern</Text>
                </View>
              </View>
            </View>

            {/* Bottom Content & Action Deck */}
            <View style={styles.bottomSection}>
              <View style={styles.headlineWrap}>
                <Text style={styles.headline}>Premium Home & Repair Services.</Text>
                <Text style={styles.subline}>
                  Book top plumbers, electricians, cleaners & handymen with transparent pricing and guaranteed satisfaction.
                </Text>
              </View>

              <View style={styles.ctaGroup}>
                <Pressable
                  style={({ pressed }) => [styles.getStartedBtn, pressed && styles.btnPressed]}
                  onPress={() => router.push('/(auth)/register')}
                >
                  <LinearGradient
                    colors={['#2563EB', '#1E40AF']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.gradientBtn}
                  >
                    <Text style={styles.getStartedText}>Get Started</Text>
                    <ArrowRight size={19} color="#FFFFFF" strokeWidth={2.4} />
                  </LinearGradient>
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
  overlay: { flex: 1, position: 'relative' },
  container: { flex: 1, paddingHorizontal: 24, justifyContent: 'space-between' },

  ambientGlowTop: {
    position: 'absolute',
    top: -50,
    left: -40,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: '#2563EB',
    opacity: 0.18,
  },
  ambientGlowBottom: {
    position: 'absolute',
    bottom: 80,
    right: -40,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#38BDF8',
    opacity: 0.12,
  },

  // Top Brand Section
  brandHeader: { alignItems: 'center', marginTop: 8 },
  brandLogoImage: {
    width: 300,
    height: 160,
  },
  swissBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    backgroundColor: 'rgba(37, 99, 235, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.25)',
    marginBottom: 4,
  },
  swissBadgeText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 10,
    color: '#38BDF8',
    letterSpacing: 1.2,
  },

  // Feature Highlights
  featuresSection: { gap: 10, marginVertical: 12 },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  featureIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: 'rgba(37, 99, 235, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureContent: { flex: 1 },
  featureTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: '#F8FAFC',
  },
  featureDesc: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
  },

  // Bottom Section
  bottomSection: { gap: 16, marginBottom: 8 },
  headlineWrap: { gap: 8 },
  headline: {
    fontFamily: 'Inter-Bold',
    fontSize: 28,
    color: '#FFFFFF',
    lineHeight: 36,
    letterSpacing: -0.6,
  },
  subline: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#94A3B8',
    lineHeight: 21,
  },

  // CTA Buttons
  ctaGroup: { gap: 12, marginTop: 6 },
  getStartedBtn: {
    height: 54,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
  gradientBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingHorizontal: 24,
  },
  getStartedText: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  btnPressed: { opacity: 0.9, transform: [{ scale: 0.985 }] },
  signInBtn: {
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.16)',
  },
  signInText: { fontFamily: 'Inter-Medium', fontSize: 14, color: '#94A3B8' },
  signInBold: { fontFamily: 'Inter-Bold', color: '#38BDF8' },
});
