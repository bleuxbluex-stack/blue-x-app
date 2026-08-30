import { View, Text, StyleSheet, TextInput, Pressable, KeyboardAvoidingView, Platform } from 'react-native';
import { router } from 'expo-router';
import { useState } from 'react';
import { Mail, ChevronLeft, AlertCircle } from 'lucide-react-native';
import { Button } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';

export default function ForgotPasswordScreen() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleReset = async () => {
    if (!email) {
      setError('Please enter your email.');
      return;
    }
    setLoading(true);
    setError(null);
    const { error } = await resetPassword(email);
    setLoading(false);
    if (error) {
      setError(error);
    } else {
      setSent(true);
    }
  };

  if (sent) {
    return (
      <View style={styles.center}>
        <View style={styles.checkCircle}>
          <Text style={styles.checkEmoji}>✓</Text>
        </View>
        <Text style={styles.checkTitle}>Check your email</Text>
        <Text style={styles.checkSub}>We sent a reset link to{'\n'}{email}</Text>
        <Button label="Back to sign in" variant="outline" size="lg" onPress={() => router.replace('/(auth)/login')} style={styles.checkBtn} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <ChevronLeft size={22} color="#0A1729" strokeWidth={2.4} />
        </Pressable>
      </View>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Reset password</Text>
          <Text style={styles.subtitle}>Enter your email and we'll send you a reset link</Text>
        </View>

        {error && (
          <View style={styles.errorBanner}>
            <AlertCircle size={16} color="#E54848" strokeWidth={2} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <View style={styles.form}>
          <View style={styles.field}>
            <Text style={styles.label}>Email</Text>
            <View style={styles.inputWrap}>
              <Mail size={18} color="#94A3B8" strokeWidth={2} style={styles.inputIcon} />
              <TextInput value={email} onChangeText={setEmail} placeholder="you@example.com" placeholderTextColor="#B8C2D0" style={styles.input} keyboardType="email-address" autoCapitalize="none" autoCorrect={false} />
            </View>
          </View>
          <Button label={loading ? 'Sending...' : 'Send Reset Link'} size="lg" fullWidth onPress={handleReset} disabled={loading} style={styles.submit} />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#FFFFFF' },
  topBar: { paddingTop: 14, paddingHorizontal: 24, paddingBottom: 8 },
  backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#F4F6FB', alignItems: 'center', justifyContent: 'center' },
  content: { paddingHorizontal: 24, marginTop: 12 },
  header: { marginBottom: 28 },
  title: { fontFamily: 'Inter-Bold', fontSize: 28, color: '#0A1729', letterSpacing: -0.5 },
  subtitle: { fontFamily: 'Inter-Regular', fontSize: 15, color: '#64748B', marginTop: 6 },
  errorBanner: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#FEECEC', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, marginBottom: 20 },
  errorText: { flex: 1, fontFamily: 'Inter-Regular', fontSize: 13, color: '#C92020' },
  form: { gap: 18 },
  field: { gap: 8 },
  label: { fontFamily: 'Inter-SemiBold', fontSize: 13, color: '#334155', fontWeight: '600' },
  inputWrap: { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderColor: '#E2E8F0', borderRadius: 14, backgroundColor: '#F8FAFC', paddingHorizontal: 14 },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, paddingVertical: 15, fontFamily: 'Inter-Regular', fontSize: 15, color: '#0A1729' },
  submit: { marginTop: 4 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32, backgroundColor: '#FFFFFF' },
  checkCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#E8FBF3', alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  checkEmoji: { fontSize: 40, color: '#0A8F4C', fontWeight: '700' },
  checkTitle: { fontFamily: 'Inter-Bold', fontSize: 24, color: '#0A1729', marginBottom: 8 },
  checkSub: { fontFamily: 'Inter-Regular', fontSize: 15, color: '#64748B', textAlign: 'center', lineHeight: 22 },
  checkBtn: { marginTop: 32, minWidth: 200 },
});
