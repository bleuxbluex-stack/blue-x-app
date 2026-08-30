import { View, Text, StyleSheet, TextInput, Pressable, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, ChevronLeft, AlertCircle } from 'lucide-react-native';
import { Button } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import { theme } from '@/constants/theme';

export default function LoginScreen() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please enter your email and password.');
      return;
    }
    setLoading(true);
    setError(null);
    const { error } = await signIn(email, password);
    if (error) {
      setError(error);
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.flex} behavior="padding" keyboardVerticalOffset={0}>
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <ChevronLeft size={22} color={theme.colors.accent} strokeWidth={2.4} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        {/* Top spacer to center content when keyboard is closed */}
        <View style={styles.spacer} />

        <View style={styles.mainContent}>
          <View style={styles.header}>
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Sign in to your BlueX account</Text>
          </View>

          {error && (
            <View style={styles.errorBanner}>
              <AlertCircle size={16} color="#E54848" strokeWidth={2} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <View style={styles.cardContainer}>
            <View style={styles.field}>
              <Text style={styles.label}>Email</Text>
              <View style={styles.inputWrap}>
                <Mail size={18} color={theme.colors.textSecondary} strokeWidth={2} style={styles.inputIcon} />
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder="you@example.com"
                  placeholderTextColor={theme.colors.textSecondary}
                  style={styles.input}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            </View>

            <View style={styles.field}>
              <View style={styles.labelRow}>
                <Text style={styles.label}>Password</Text>
                <Pressable onPress={() => router.push('/(auth)/forgot')}>
                  <Text style={styles.forgotText}>Forgot?</Text>
                </Pressable>
              </View>
              <View style={styles.inputWrap}>
                <Lock size={18} color={theme.colors.textSecondary} strokeWidth={2} style={styles.inputIcon} />
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="••••••••"
                  placeholderTextColor={theme.colors.textSecondary}
                  style={styles.input}
                  secureTextEntry={!showPwd}
                />
                <Pressable onPress={() => setShowPwd(!showPwd)} style={styles.eyeBtn}>
                  {showPwd ? <EyeOff size={18} color={theme.colors.textSecondary} /> : <Eye size={18} color={theme.colors.textSecondary} />}
                </Pressable>
              </View>
            </View>

            <Button
              label={loading ? 'Signing in...' : 'Sign In'}
              size="lg"
              fullWidth
              onPress={handleLogin}
              disabled={loading}
              style={styles.submit}
            />
          </View>
        </View>

        {/* Bottom spacer to center content when keyboard is closed */}
        <View style={styles.spacer} />

        <Pressable onPress={() => router.push('/(auth)/register')} style={styles.signupLink}>
          <Text style={styles.signupText}>
            Don't have an account? <Text style={styles.signupBold}>Sign up</Text>
          </Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: theme.colors.background },
  scroll: { flexGrow: 1, paddingHorizontal: 20, paddingTop: 80, paddingBottom: 24 },
  spacer: { flex: 1 },
  topBar: { position: 'absolute', top: 52, left: 20, zIndex: 10 },
  backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: theme.colors.accentLight, alignItems: 'center', justifyContent: 'center' },
  mainContent: { width: '100%' },
  header: { marginTop: 12, marginBottom: 28, paddingHorizontal: 4 },
  title: { fontFamily: 'Inter-Bold', fontSize: 28, color: theme.colors.accent, letterSpacing: -0.5 },
  subtitle: { fontFamily: 'Inter-Regular', fontSize: 15, color: theme.colors.textSecondary, marginTop: 6 },
  errorBanner: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#FEECEC', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, marginBottom: 20 },
  errorText: { flex: 1, fontFamily: 'Inter-Regular', fontSize: 13, color: '#C92020' },
  cardContainer: {
    backgroundColor: theme.colors.card,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 20,
    gap: 20,
    shadowColor: '#0A1729',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 6,
  },
  field: { gap: 8 },
  label: { fontFamily: 'Inter-SemiBold', fontSize: 13, color: theme.colors.textPrimary, fontWeight: '600' },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  forgotText: { fontFamily: 'Inter-SemiBold', fontSize: 13, color: theme.colors.mint, fontWeight: '600' },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    borderRadius: 14,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 14,
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, paddingVertical: 15, fontFamily: 'Inter-Regular', fontSize: 15, color: theme.colors.textPrimary },
  eyeBtn: { padding: 4 },
  submit: { marginTop: 4 },
  signupLink: { alignItems: 'center', paddingTop: 24 },
  signupText: { fontFamily: 'Inter-Regular', fontSize: 14, color: theme.colors.textSecondary },
  signupBold: { fontFamily: 'Inter-SemiBold', color: theme.colors.mint, fontWeight: '600' },
});
