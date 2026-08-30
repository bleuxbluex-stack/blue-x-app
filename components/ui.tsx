import { View, Text, StyleSheet, Pressable, StyleProp, ViewStyle, TextStyle } from 'react-native';
import { ChevronLeft, Check, X, Bell } from 'lucide-react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '@/constants/theme';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps {
  label: string;
  onPress?: () => void;
  variant?: Variant;
  size?: Size;
  icon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  fullWidth?: boolean;
  disabled?: boolean;
}

export function Button({ label, onPress, variant = 'primary', size = 'md', icon, style, fullWidth, disabled }: ButtonProps) {
  const palette = {
    primary: { bg: theme.colors.accent, text: theme.colors.white, border: theme.colors.accent },
    secondary: { bg: theme.colors.accentLight, text: theme.colors.accent, border: theme.colors.accentLight },
    ghost: { bg: 'transparent', text: theme.colors.accent, border: 'transparent' },
    danger: { bg: '#E54848', text: theme.colors.white, border: '#E54848' },
    outline: { bg: 'transparent', text: theme.colors.accent, border: '#B0D0D3' },
  }[variant];

  const sizes = {
    sm: { paddingVertical: 8, paddingHorizontal: 14, fontSize: 13, radius: 10 },
    md: { paddingVertical: 14, paddingHorizontal: 20, fontSize: 15, radius: 14 },
    lg: { paddingVertical: 17, paddingHorizontal: 24, fontSize: 16, radius: 16 },
  }[size];

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: palette.bg, borderColor: palette.border, borderRadius: sizes.radius, paddingVertical: sizes.paddingVertical, paddingHorizontal: sizes.paddingHorizontal, opacity: disabled ? 0.5 : pressed ? 0.85 : 1 },
        fullWidth && styles.fullWidth,
        style,
      ]}
    >
      {icon}
      <Text style={[styles.label, { color: palette.text, fontSize: sizes.fontSize }]}>{label}</Text>
    </Pressable>
  );
}

interface HeaderProps {
  title: string;
  subtitle?: string;
  back?: boolean;
  action?: 'bell' | 'none';
  onAction?: () => void;
}

export function Header({ title, subtitle, back = true, action = 'none', onAction }: HeaderProps) {
  return (
    <View style={styles.headerWrap}>
      <View style={styles.headerRow}>
        {back ? (
          <Pressable onPress={() => router.back()} style={styles.iconBtn}>
            <ChevronLeft size={22} color={theme.colors.textPrimary} strokeWidth={2.4} />
          </Pressable>
        ) : (
          <View style={styles.iconBtnPlaceholder} />
        )}
        <View style={styles.headerTitleWrap}>
          <Text style={styles.headerTitle}>{title}</Text>
          {subtitle ? <Text style={styles.headerSubtitle}>{subtitle}</Text> : null}
        </View>
        {action === 'bell' ? (
          <Pressable onPress={onAction} style={styles.iconBtn}>
            <Bell size={20} color={theme.colors.textPrimary} strokeWidth={2.2} />
            <View style={styles.badge} />
          </Pressable>
        ) : (
          <View style={styles.iconBtnPlaceholder} />
        )}
      </View>
    </View>
  );
}

interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
}

export function Card({ children, style, onPress }: CardProps) {
  const inner = <View style={[styles.card, style]}>{children}</View>;
  return onPress ? (
    <Pressable onPress={onPress} style={({ pressed }) => (pressed ? styles.cardPressed : undefined)}>
      {inner}
    </Pressable>
  ) : inner;
}

export function StatusPill({ status }: { status: string }) {
  const map: Record<string, { bg: string; text: string; dot: string }> = {
    Confirmed: { bg: theme.colors.status.confirmed.bg, text: theme.colors.status.confirmed.text, dot: theme.colors.status.confirmed.text },
    Pending: { bg: theme.colors.status.pending.bg, text: theme.colors.status.pending.text, dot: theme.colors.status.pending.text },
    Completed: { bg: theme.colors.status.completed.bg, text: theme.colors.status.completed.text, dot: theme.colors.status.completed.text },
    Cancelled: { bg: theme.colors.status.cancelled.bg, text: theme.colors.status.cancelled.text, dot: theme.colors.status.cancelled.text },
    'In Progress': { bg: theme.colors.status.inProgress.bg, text: theme.colors.status.inProgress.text, dot: theme.colors.status.inProgress.text },
    confirmed: { bg: theme.colors.status.confirmed.bg, text: theme.colors.status.confirmed.text, dot: theme.colors.status.confirmed.text },
    pending: { bg: theme.colors.status.pending.bg, text: theme.colors.status.pending.text, dot: theme.colors.status.pending.text },
    completed: { bg: theme.colors.status.completed.bg, text: theme.colors.status.completed.text, dot: theme.colors.status.completed.text },
    cancelled: { bg: theme.colors.status.cancelled.bg, text: theme.colors.status.cancelled.text, dot: theme.colors.status.cancelled.text },
    in_progress: { bg: theme.colors.status.inProgress.bg, text: theme.colors.status.inProgress.text, dot: theme.colors.status.inProgress.text },
  };
  const s = map[status] || map.Pending;
  const displayStatus = status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ');
  return (
    <View style={[styles.pill, { backgroundColor: s.bg }]}>
      <View style={[styles.pillDot, { backgroundColor: s.dot }]} />
      <Text style={[styles.pillText, { color: s.text }]}>{displayStatus}</Text>
    </View>
  );
}

export function GradientHeader({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  return (
    <LinearGradient colors={['#0F3A40', '#0B2A2F']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.gradientHeader, style]}>
      {children}
    </LinearGradient>
  );
}

export function SectionTitle({ title, action }: { title: string; action?: string }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitleText}>{title}</Text>
      {action && <Text style={styles.sectionAction}>{action}</Text>}
    </View>
  );
}

export function EmptyState({ icon, title, subtitle }: { icon: React.ReactNode; title: string; subtitle: string }) {
  return (
    <View style={styles.emptyState}>
      <View style={styles.emptyIcon}>{icon}</View>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptySub}>{subtitle}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
  },
  label: {
    fontFamily: 'Inter-SemiBold',
    fontWeight: '600',
    letterSpacing: 0.1,
  },
  fullWidth: { alignSelf: 'stretch' },
  headerWrap: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 8,
    backgroundColor: theme.colors.card,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: theme.colors.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBtnPlaceholder: { width: 40 },
  headerTitleWrap: { flex: 1, alignItems: 'center' },
  headerTitle: { fontFamily: 'Inter-Bold', fontSize: 17, color: theme.colors.textPrimary, textAlign: 'center' },
  headerSubtitle: { fontFamily: 'Inter-Regular', fontSize: 13, color: theme.colors.textSecondary, marginTop: 2, textAlign: 'center' },
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
    shadowColor: '#0A1729',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  cardPressed: { opacity: 0.92 },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 999,
    gap: 5,
    alignSelf: 'flex-start',
  },
  pillDot: { width: 6, height: 6, borderRadius: 3 },
  pillText: { fontFamily: 'Inter-SemiBold', fontSize: 11, fontWeight: '600' },
  gradientHeader: {
    paddingTop: 56,
    paddingHorizontal: 20,
    paddingBottom: 24,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  badge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E54848',
    borderWidth: 1.5,
    borderColor: theme.colors.card,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 14,
  },
  sectionTitleText: { fontFamily: 'Inter-Bold', fontSize: 18, color: theme.colors.textPrimary, letterSpacing: -0.3 },
  sectionAction: { fontFamily: 'Inter-SemiBold', fontSize: 13, color: theme.colors.mint, fontWeight: '600' },
  emptyState: { alignItems: 'center', paddingVertical: 60, paddingHorizontal: 40 },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: theme.colors.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: { fontFamily: 'Inter-Bold', fontSize: 16, color: theme.colors.textPrimary },
  emptySub: { fontFamily: 'Inter-Regular', fontSize: 14, color: theme.colors.textSecondary, marginTop: 4, textAlign: 'center' },
});
