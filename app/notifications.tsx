import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { ChevronLeft, Bell, Calendar, MessageSquare, ShieldCheck, CheckCircle2, Trash2, ChevronRight, Check } from 'lucide-react-native';
import { router } from 'expo-router';
import { useState } from 'react';
import { theme } from '@/constants/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLanguage } from '@/context/LanguageContext';

interface NotificationItem {
  id: string;
  type: 'booking' | 'message' | 'system';
  title: string;
  description: string;
  time: string;
  unread: boolean;
  actionText?: string;
  targetPath?: string;
}

export default function NotificationsScreen() {
  const insets = useSafeAreaInsets();
  const { t } = useLanguage();
  const [activeFilter, setActiveFilter] = useState<'all' | 'unread' | 'booking' | 'message' | 'system'>('all');

  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: '1',
      type: 'booking',
      title: 'Booking Confirmed',
      description: 'Your Plumber service booking with Swiss Tech Solutions has been confirmed for tomorrow at 10:00 AM.',
      time: '2 hours ago',
      unread: true,
      actionText: 'View Booking Details',
      targetPath: '/(tabs)/bookings',
    },
    {
      id: '2',
      type: 'message',
      title: 'New Message from Manoj',
      description: 'Manoj sent you a message: "I am looking for a provider who can work for my plumbing job."',
      time: '4 hours ago',
      unread: true,
      actionText: 'Reply in Chat',
      targetPath: '/(tabs)/messages',
    },
    {
      id: '3',
      type: 'system',
      title: 'Identity Verification Approved',
      description: 'Your BlueX profile verification has been approved. You are now a verified service partner.',
      time: '1 day ago',
      unread: false,
      actionText: 'View Profile Status',
      targetPath: '/(tabs)/profile',
    },
    {
      id: '4',
      type: 'booking',
      title: 'Appointment Requested',
      description: 'You sent an appointment request to Outlaws for Wire Man (Electrician) service on Sep 5.',
      time: '2 days ago',
      unread: false,
      actionText: 'Check Request Status',
      targetPath: '/(tabs)/bookings',
    },
    {
      id: '5',
      type: 'system',
      title: 'Welcome to BlueX',
      description: 'Explore verified local service providers or list your skills to get hired on-demand in Switzerland.',
      time: '3 days ago',
      unread: false,
    },
  ]);

  const unreadCount = notifications.filter(n => n.unread).length;

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const markItemRead = (id: string, targetPath?: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, unread: false } : n));
    if (targetPath) {
      router.push(targetPath as any);
    }
  };

  const filteredNotifications = notifications.filter((n) => {
    if (activeFilter === 'unread') return n.unread;
    if (activeFilter === 'booking') return n.type === 'booking';
    if (activeFilter === 'message') return n.type === 'message';
    if (activeFilter === 'system') return n.type === 'system';
    return true;
  });

  const getCategoryConfig = (type: NotificationItem['type']) => {
    switch (type) {
      case 'booking':
        return {
          bgColor: '#E6FFFA',
          iconColor: '#0D9488',
          badgeText: 'BOOKING',
          badgeBg: 'rgba(20, 184, 166, 0.12)',
          icon: <Calendar size={20} color="#0D9488" strokeWidth={2.2} />,
        };
      case 'message':
        return {
          bgColor: '#EFF6FF',
          iconColor: '#2563EB',
          badgeText: 'MESSAGE',
          badgeBg: 'rgba(37, 99, 235, 0.12)',
          icon: <MessageSquare size={20} color="#2563EB" strokeWidth={2.2} />,
        };
      case 'system':
        return {
          bgColor: '#F3E8FF',
          iconColor: '#7C3AED',
          badgeText: 'SYSTEM',
          badgeBg: 'rgba(124, 58, 237, 0.12)',
          icon: <ShieldCheck size={20} color="#7C3AED" strokeWidth={2.2} />,
        };
      default:
        return {
          bgColor: '#F1F5F9',
          iconColor: '#0F3A40',
          badgeText: 'NOTICE',
          badgeBg: 'rgba(15, 58, 64, 0.12)',
          icon: <Bell size={20} color="#0F3A40" strokeWidth={2.2} />,
        };
    }
  };

  return (
    <View style={styles.container}>
      {/* Header Container */}
      <View style={[styles.headerBlock, { paddingTop: insets.top + 12 }]}>
        <View style={styles.headerTopRow}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <ChevronLeft size={22} color="#FFFFFF" strokeWidth={2.4} />
          </Pressable>

          <Text style={styles.headerTitle}>Notifications</Text>

          {unreadCount > 0 ? (
            <Pressable onPress={markAllRead} style={styles.markAllBtn}>
              <CheckCircle2 size={15} color="#14B8A6" strokeWidth={2.2} />
              <Text style={styles.markAllText}>Read all</Text>
            </Pressable>
          ) : (
            <View style={styles.rightPlaceholder} />
          )}
        </View>

        {/* Filter Chips Bar */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterChipRow}>
          {[
            { id: 'all', label: 'All' },
            { id: 'unread', label: `Unread (${unreadCount})` },
            { id: 'booking', label: 'Bookings' },
            { id: 'message', label: 'Messages' },
            { id: 'system', label: 'System' },
          ].map((f) => {
            const isSel = activeFilter === f.id;
            return (
              <Pressable
                key={f.id}
                style={[styles.filterChip, isSel && styles.filterChipActive]}
                onPress={() => setActiveFilter(f.id as any)}
              >
                <Text style={[styles.filterChipText, isSel && styles.filterChipTextActive]}>{f.label}</Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* Notifications List */}
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {filteredNotifications.length === 0 ? (
          <View style={styles.emptyCard}>
            <View style={styles.emptyIconCircle}>
              <Bell size={36} color="#94A3B8" strokeWidth={1.8} />
            </View>
            <Text style={styles.emptyTitle}>No Notifications</Text>
            <Text style={styles.emptySub}>You have no notifications under the "{activeFilter}" tab.</Text>
          </View>
        ) : (
          <View style={styles.list}>
            {filteredNotifications.map((n) => {
              const cfg = getCategoryConfig(n.type);

              return (
                <View
                  key={n.id}
                  style={[
                    styles.notificationCard,
                    n.unread && styles.unreadNotificationCard,
                  ]}
                >
                  {/* Left Accent Bar for Unread */}
                  {n.unread && <View style={styles.unreadAccentBar} />}

                  <Pressable
                    style={styles.cardTouchable}
                    onPress={() => markItemRead(n.id, n.targetPath)}
                  >
                    {/* Icon Box */}
                    <View style={[styles.iconBox, { backgroundColor: cfg.bgColor }]}>
                      {cfg.icon}
                    </View>

                    {/* Main Content */}
                    <View style={styles.cardMain}>
                      <View style={styles.cardTopRow}>
                        <View style={[styles.badgePill, { backgroundColor: cfg.badgeBg }]}>
                          <Text style={[styles.typeBadgeText, { color: cfg.iconColor }]}>{cfg.badgeText}</Text>
                        </View>

                        <View style={styles.rightMetaRow}>
                          <Text style={styles.timeText}>{n.time}</Text>
                          <Pressable
                            style={styles.deleteBtn}
                            onPress={() => deleteNotification(n.id)}
                          >
                            <Trash2 size={15} color="#94A3B8" strokeWidth={1.8} />
                          </Pressable>
                        </View>
                      </View>

                      <Text style={[styles.itemTitle, n.unread && styles.unreadItemTitle]}>{n.title}</Text>
                      <Text style={styles.itemDesc}>{n.description}</Text>

                      {n.actionText && (
                        <View style={styles.actionFooter}>
                          <Text style={[styles.actionFooterText, { color: cfg.iconColor }]}>{n.actionText}</Text>
                          <ChevronRight size={14} color={cfg.iconColor} strokeWidth={2.2} />
                        </View>
                      )}
                    </View>
                  </Pressable>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  headerBlock: { backgroundColor: '#0F3A40', paddingHorizontal: 16, paddingBottom: 16, gap: 14 },
  headerTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255, 255, 255, 0.15)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.25)' },
  headerTitleWrap: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerTitle: { fontFamily: 'Inter-Bold', fontSize: 18, color: '#FFFFFF' },
  unreadBadge: { backgroundColor: 'rgba(20, 184, 166, 0.25)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10, borderWidth: 1, borderColor: '#14B8A6' },
  unreadBadgeText: { fontFamily: 'Inter-Bold', fontSize: 11, color: '#14B8A6' },
  markAllBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(255, 255, 255, 0.12)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12 },
  markAllText: { fontFamily: 'Inter-SemiBold', fontSize: 12, color: '#14B8A6' },
  rightPlaceholder: { width: 40 },
  filterChipRow: { gap: 8 },
  filterChip: { paddingHorizontal: 14, height: 32, borderRadius: 16, backgroundColor: 'rgba(255, 255, 255, 0.12)', alignItems: 'center', justifyContent: 'center' },
  filterChipActive: { backgroundColor: '#FFFFFF' },
  filterChipText: { fontFamily: 'Inter-Medium', fontSize: 12, color: 'rgba(255, 255, 255, 0.85)' },
  filterChipTextActive: { fontFamily: 'Inter-Bold', color: '#0F3A40' },
  scroll: { flex: 1 },
  content: { padding: 16, paddingBottom: 40 },
  list: { gap: 12 },

  // Notification Card
  notificationCard: { backgroundColor: '#FFFFFF', borderRadius: 16, borderWidth: 1, borderColor: '#E2E8F0', shadowColor: '#000000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 6, elevation: 2, overflow: 'hidden', position: 'relative' },
  unreadNotificationCard: { borderColor: '#14B8A6', backgroundColor: '#FAFDFD' },
  unreadAccentBar: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, backgroundColor: '#14B8A6' },
  cardTouchable: { flexDirection: 'row', padding: 14, gap: 12 },
  iconBox: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  cardMain: { flex: 1, gap: 5 },
  cardTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  badgePill: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  typeBadgeText: { fontFamily: 'Inter-Bold', fontSize: 10, letterSpacing: 0.5 },
  rightMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  timeText: { fontFamily: 'Inter-Regular', fontSize: 11, color: '#94A3B8' },
  deleteBtn: { padding: 2 },
  itemTitle: { fontFamily: 'Inter-Bold', fontSize: 15, color: '#0F172A', marginTop: 2 },
  unreadItemTitle: { color: '#0F3A40' },
  itemDesc: { fontFamily: 'Inter-Regular', fontSize: 13, color: '#475569', lineHeight: 19 },
  actionFooter: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  actionFooterText: { fontFamily: 'Inter-Bold', fontSize: 12 },

  // Empty State
  emptyCard: { alignItems: 'center', justifyContent: 'center', paddingVertical: 70, backgroundColor: '#FFFFFF', borderRadius: 20, borderWidth: 1, borderColor: '#E2E8F0', gap: 8 },
  emptyIconCircle: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  emptyTitle: { fontFamily: 'Inter-Bold', fontSize: 16, color: '#0F172A' },
  emptySub: { fontFamily: 'Inter-Regular', fontSize: 13, color: '#64748B', textAlign: 'center', paddingHorizontal: 20 },
});
