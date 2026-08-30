import { View, Text, StyleSheet, TextInput, Pressable, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { router } from 'expo-router';
import { useState } from 'react';
import { User, Mail, Lock, ChevronLeft, Check, AlertCircle } from 'lucide-react-native';
import { Button } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import { UserRole } from '@/types/database';

export default function RegisterScreen() {
  const { signUp } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('client');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRegister = async () => {
    if (!name || !email || !password) {
      setError('Please fill in all fields.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    setError(null);
    const { error } = await signUp(email, password, name, role);
    if (error) {
      setError(error);
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.topBar}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <ChevronLeft size={22} color="#0A1729" strokeWidth={2.4} />
          </Pressable>
        </View>

        <View style={styles.header}>
          <Text style={styles.title}>Create account</Text>
          <Text style={styles.subtitle}>Join BlueX in under a minute</Text>
        </View>

        {error && (
          <View style={styles.errorBanner}>
            <AlertCircle size={16} color="#E54848" strokeWidth={2} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <View style={styles.form}>
          <View style={styles.field}>
            <Text style={styles.label}>Full name</Text>
            <View style={styles.inputWrap}>
              <User size={18} color="#94A3B8" strokeWidth={2} style={styles.inputIcon} />
              <TextInput value={name} onChangeText={setName} placeholder="Your name" placeholderTextColor="#B8C2D0" style={styles.input} />
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Email</Text>
            <View style={styles.inputWrap}>
              <Mail size={18} color="#94A3B8" strokeWidth={2} style={styles.inputIcon} />
              <TextInput value={email} onChangeText={setEmail} placeholder="you@example.com" placeholderTextColor="#B8C2D0" style={styles.input} keyboardType="email-address" autoCapitalize="none" autoCorrect={false} />
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.inputWrap}>
              <Lock size={18} color="#94A3B8" strokeWidth={2} style={styles.inputIcon} />
              <TextInput value={password} onChangeText={setPassword} placeholder="Create a password" placeholderTextColor="#B8C2D0" style={styles.input} secureTextEntry />
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>I want to</Text>
            <View style={styles.roleRow}>
              {(['client', 'provider'] as const).map((r) => (
                <Pressable key={r} onPress={() => setRole(r)} style={[styles.roleCard, role === r && styles.roleCardActive]}>
                  <View style={styles.roleTop}>
                    <View style={[styles.radio, role === r && styles.radioActive]}>
                      {role === r && <Check size={14} color="#FFFFFF" strokeWidth={3} />}
                    </View>
                  </View>
                  <Text style={[styles.roleTitle, role === r && styles.roleTitleActive]}>{r === 'client' ? 'Find services' : 'Offer services'}</Text>
                  <Text style={[styles.roleSub, role === r && styles.roleSubActive]}>{r === 'client' ? 'Book trusted pros' : 'Grow your business'}</Text>
                </Pressable>
              ))}
            </View>
          </View>

          <Button
            label={loading ? 'Creating account...' : 'Create Account'}
            size="lg"
            fullWidth
            onPress={handleRegister}
            disabled={loading}
            style={styles.submit}
          />

          <Pressable onPress={() => router.push('/(auth)/login')} style={styles.loginLink}>
            <Text style={styles.loginText}>Already have an account? <Text style={styles.loginBold}>Sign in</Text></Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#FFFFFF' },
  scroll: { flexGrow: 1, paddingHorizontal: 24 },
  topBar: { paddingTop: 14, paddingBottom: 8 },
  backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#F4F6FB', alignItems: 'center', justifyContent: 'center' },
  header: { marginTop: 12, marginBottom: 24 },
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
  roleRow: { flexDirection: 'row', gap: 12 },
  roleCard: { flex: 1, padding: 16, borderRadius: 16, borderWidth: 1.5, borderColor: '#E2E8F0', backgroundColor: '#F8FAFC' },
  roleCardActive: { borderColor: '#0A5FFF', backgroundColor: '#EEF4FF' },
  roleTop: { marginBottom: 10 },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: '#CBD5E1', alignItems: 'center', justifyContent: 'center' },
  radioActive: { backgroundColor: '#0A5FFF', borderColor: '#0A5FFF' },
  roleTitle: { fontFamily: 'Inter-SemiBold', fontSize: 15, color: '#0A1729', fontWeight: '600' },
  roleTitleActive: { color: '#0A5FFF' },
  roleSub: { fontFamily: 'Inter-Regular', fontSize: 12, color: '#94A3B8', marginTop: 2 },
  roleSubActive: { color: '#0A5FFF' },
  submit: { marginTop: 4 },
  loginLink: { alignItems: 'center', paddingVertical: 16 },
  loginText: { fontFamily: 'Inter-Regular', fontSize: 14, color: '#64748B' },
  loginBold: { fontFamily: 'Inter-SemiBold', color: '#0A5FFF', fontWeight: '600' },
});
