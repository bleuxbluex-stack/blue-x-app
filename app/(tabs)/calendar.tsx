import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, MapPin } from 'lucide-react-native';
import { router } from 'expo-router';
import { Card, StatusPill } from '@/components/ui';
import { supabase } from '@/services/supabase';
import { useAuth } from '@/hooks/useAuth';
import { theme } from '@/constants/theme';

interface CalendarBooking {
  id: string;
  providerName: string;
  serviceName: string;
  status: string;
  scheduled_at: string;
}

export default function CalendarScreen() {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [bookings, setBookings] = useState<CalendarBooking[]>([]);
  const [loading, setLoading] = useState(true);

  // Generate next 10 days
  const days = Array.from({ length: 10 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return {
      day: d.toLocaleDateString('en-US', { weekday: 'short' }),
      num: String(d.getDate()),
      iso: d.toISOString().split('T')[0],
    };
  });

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    (async () => {
      setLoading(true);
      try {
        const { data: bks, error } = await supabase
          .from('bookings')
          .select('id, provider_id, provider_service_id, status, scheduled_at')
          .eq('client_id', user.id)
          .order('scheduled_at', { ascending: true });

        if (error) console.log('Calendar bookings error:', error.message);

        if (!bks || bks.length === 0) {
          setBookings([]);
          return;
        }

        // Resolve service names
        const svcIds = bks.map(b => b.provider_service_id).filter(Boolean) as string[];
        const { data: svcs } = await supabase
          .from('provider_services')
          .select('id, name, category_id')
          .in('id', svcIds.length > 0 ? svcIds : ['__none__']);

        const { data: cats } = await supabase
          .from('service_categories')
          .select('id, name');

        const svcMap = new Map((svcs || []).map(s => [s.id, s]));
        const catMap = new Map((cats || []).map(c => [c.id, c]));

        setBookings(bks.map(b => {
          const svc = b.provider_service_id ? svcMap.get(b.provider_service_id) : null;
          const cat = svc?.category_id ? catMap.get(svc.category_id) : null;
          return {
            id: b.id,
            providerName: svc?.name || 'Service Provider',
            serviceName: cat?.name || 'General Service',
            status: b.status,
            scheduled_at: b.scheduled_at,
          };
        }));
      } catch (err) {
        console.log('Calendar fetch error:', err);
        setBookings([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  const activeBookings = bookings.filter(b => b.scheduled_at.startsWith(selectedDate));

  const formatDateLabel = (iso: string) => {
    try {
      return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
    } catch { return iso; }
  };

  return (
    <View style={styles.container}>
      {/* Flat Teal Header Block */}
      <View style={styles.headerBlock}>
        <View style={styles.header}>
          <Text style={styles.title}>Schedule</Text>
          <Text style={styles.subtitle}>Manage your appointments timeline</Text>
        </View>

        {/* Horizontal Days Selector */}
        <View style={styles.daysContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.daysScroll}>
            {days.map((d) => {
              const isSelected = d.iso === selectedDate;
              return (
                <Pressable
                  key={d.iso}
                  onPress={() => setSelectedDate(d.iso)}
                  style={[styles.dayCard, isSelected && styles.dayCardActive]}
                >
                  <Text style={[styles.dayText, isSelected && styles.dayTextActive]}>{d.day}</Text>
                  <Text style={[styles.numText, isSelected && styles.numTextActive]}>{d.num}</Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Bookings on {formatDateLabel(selectedDate)}</Text>
          <Text style={styles.countText}>{activeBookings.length} scheduled</Text>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color={theme.colors.accent} style={{ marginTop: 40 }} />
        ) : activeBookings.length === 0 ? (
          <View style={styles.emptyState}>
            <CalendarIcon size={32} color={theme.colors.textSecondary} strokeWidth={1.5} style={{ marginBottom: 12 }} />
            <Text style={styles.emptyTitle}>No bookings on this day</Text>
            <Text style={styles.emptySub}>Select another date or book a new service.</Text>
          </View>
        ) : (
          <View style={styles.list}>
            {activeBookings.map((b) => (
              <Card key={b.id} style={styles.bookingCard} onPress={() => router.push(`/booking/${b.id}`)}>
                <View style={styles.cardHeader}>
                  <View>
                    <Text style={styles.providerName}>{b.providerName}</Text>
                    <Text style={styles.serviceName}>{b.serviceName}</Text>
                  </View>
                  <StatusPill status={b.status} />
                </View>

                <View style={styles.divider} />

                <View style={styles.metaRow}>
                    <View style={styles.metaItem}>
                      <Clock size={14} color={theme.colors.accent} strokeWidth={2} />
                      <Text style={styles.metaText}>{new Date(b.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                    </View>
                  </View>
              </Card>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  headerBlock: { backgroundColor: '#0F3A40', paddingBottom: 16, marginBottom: 12 },
  header: { paddingHorizontal: 20, paddingTop: 56, paddingBottom: 10 },
  title: { fontFamily: 'Inter-Bold', fontSize: 24, color: theme.colors.white, letterSpacing: -0.5 },
  subtitle: { fontFamily: 'Inter-Regular', fontSize: 14, color: 'rgba(255, 255, 255, 0.8)', marginTop: 4 },
  daysContainer: { marginTop: 10, height: 76 },
  daysScroll: { paddingHorizontal: 20, gap: 10 },
  dayCard: { width: 62, height: 74, borderRadius: 16, backgroundColor: 'rgba(255, 255, 255, 0.15)', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.25)', alignItems: 'center', justifyContent: 'center', gap: 4 },
  dayCardActive: { backgroundColor: '#FFFFFF', borderColor: '#FFFFFF' },
  dayText: { fontFamily: 'Inter-Medium', fontSize: 12, color: 'rgba(255, 255, 255, 0.8)' },
  dayTextActive: { color: '#0F3A40', fontFamily: 'Inter-Bold' },
  numText: { fontFamily: 'Inter-Bold', fontSize: 18, color: theme.colors.white },
  numTextActive: { color: '#0F3A40' },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 20, paddingBottom: 30 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 18 },
  sectionTitle: { fontFamily: 'Inter-Bold', fontSize: 16, color: theme.colors.textPrimary },
  countText: { fontFamily: 'Inter-Medium', fontSize: 13, color: theme.colors.accent },
  list: { gap: 12 },
  bookingCard: { padding: 16 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  providerName: { fontFamily: 'Inter-Bold', fontSize: 16, color: theme.colors.textPrimary },
  serviceName: { fontFamily: 'Inter-Regular', fontSize: 13, color: theme.colors.textSecondary, marginTop: 2 },
  divider: { height: 1, backgroundColor: theme.colors.border, marginVertical: 12 },
  metaRow: { flexDirection: 'row', gap: 16 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaText: { fontFamily: 'Inter-Medium', fontSize: 13, color: theme.colors.textSecondary },
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60, backgroundColor: theme.colors.card, borderRadius: 20, borderWidth: 1, borderColor: theme.colors.border },
  emptyTitle: { fontFamily: 'Inter-Bold', fontSize: 16, color: theme.colors.textPrimary },
  emptySub: { fontFamily: 'Inter-Regular', fontSize: 13, color: theme.colors.textSecondary, marginTop: 4, textAlign: 'center', paddingHorizontal: 20 },
});
