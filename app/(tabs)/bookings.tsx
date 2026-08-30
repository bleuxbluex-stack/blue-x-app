import { View, Text, StyleSheet, ScrollView, Pressable, Image, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Calendar as CalendarIcon, Clock, ChevronRight, User, ChevronLeft, ListFilter, CalendarDays } from 'lucide-react-native';
import { Card, StatusPill } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/services/supabase';
import { theme } from '@/constants/theme';
import { getValidProviderImage } from '@/services/cloudinary';

const statusFilters = ['Upcoming', 'In Progress', 'Completed', 'Cancelled'] as const;
const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

interface Booking {
  id: string;
  provider_id: string;
  client_id: string;
  provider_service_id: string | null;
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  scheduled_at: string;
  total_price: number;
  provider_name: string;
  service_name: string;
  image: string | null;
}

export default function BookingsScreen() {
  const { user, role } = useAuth();
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('calendar');
  const [activeFilter, setActiveFilter] = useState<typeof statusFilters[number]>('Upcoming');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  // Calendar View States
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date(2026, 8, 1)); // Sep 2026 default
  const [selectedDateIso, setSelectedDateIso] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const query = supabase
          .from('bookings')
          .select('id, provider_id, client_id, provider_service_id, status, scheduled_at, total_price');
        
        if (role === 'provider') {
          query.eq('provider_id', user.id);
        } else {
          query.eq('client_id', user.id);
        }

        const { data: bks } = await query.order('created_at', { ascending: false });

        if (!bks || bks.length === 0) {
          setBookings([]);
          return;
        }

        const isProvider = role === 'provider';
        const mapped: Booking[] = [];

        if (isProvider) {
          const clientIds = bks.map(b => b.client_id);
          const { data: profiles } = await supabase
            .from('profiles')
            .select('id, full_name, avatar_url')
            .in('id', clientIds);

          const profileMap = new Map((profiles || []).map(p => [p.id, p]));

          bks.forEach((b) => {
            const profile = profileMap.get(b.client_id);
            mapped.push({
              id: b.id,
              provider_id: b.provider_id,
              client_id: b.client_id,
              provider_service_id: b.provider_service_id,
              status: b.status,
              scheduled_at: b.scheduled_at,
              total_price: b.total_price,
              provider_name: profile?.full_name || 'Client',
              service_name: 'Incoming Request',
              image: getValidProviderImage(profile?.avatar_url),
            });
          });
        } else {
          const providerIds = bks.map(b => b.provider_id);
          const svcIds = bks.map(b => b.provider_service_id).filter(Boolean) as string[];

          const [{ data: svcs }, { data: cats }, { data: providerProfs }, { data: providerUserProfs }] = await Promise.all([
            supabase.from('provider_services').select('id, name, category_id').in('id', svcIds.length > 0 ? svcIds : ['__none__']),
            supabase.from('service_categories').select('id, slug, name'),
            supabase.from('provider_profiles').select('user_id, company_name, company_logo_url, selfie_url').in('user_id', providerIds),
            supabase.from('profiles').select('id, full_name, avatar_url').in('id', providerIds),
          ]);

          const svcMap = new Map((svcs || []).map(s => [s.id, s]));
          const catMap = new Map((cats || []).map(c => [c.id, c]));
          const pProfMap = new Map((providerProfs || []).map(p => [p.user_id, p]));
          const pUserMap = new Map((providerUserProfs || []).map(u => [u.id, u]));

          bks.forEach((b) => {
            const svc = b.provider_service_id ? svcMap.get(b.provider_service_id) : null;
            const cat = svc?.category_id ? catMap.get(svc.category_id) : null;
            const pProf = pProfMap.get(b.provider_id);
            const pUser = pUserMap.get(b.provider_id);

            const rawImg = pProf?.company_logo_url || pProf?.selfie_url || pUser?.avatar_url || null;
            const validImg = getValidProviderImage(rawImg);

            mapped.push({
              id: b.id,
              provider_id: b.provider_id,
              client_id: b.client_id,
              provider_service_id: b.provider_service_id,
              status: b.status,
              scheduled_at: b.scheduled_at,
              total_price: b.total_price,
              provider_name: pProf?.company_name || pUser?.full_name || svc?.name || 'Service Provider',
              service_name: cat?.name || 'General Service',
              image: validImg,
            });
          });
        }

        setBookings(mapped);
      } catch (err) {
        console.log('Error fetching user bookings:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, [user, role]);

  // Calendar Matrix Generator
  const generateMonthDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    const firstDayIndex = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const days: Array<{ dateNum: number; fullIso: string; isCurrentMonth: boolean }> = [];
    
    // Prev month padding
    const prevMonthDays = new Date(year, month, 0).getDate();
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const prevDate = new Date(year, month - 1, prevMonthDays - i);
      days.push({
        dateNum: prevMonthDays - i,
        fullIso: prevDate.toISOString().split('T')[0],
        isCurrentMonth: false,
      });
    }

    // Current month days
    for (let d = 1; d <= daysInMonth; d++) {
      const dateObj = new Date(year, month, d);
      const isoStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      days.push({
        dateNum: d,
        fullIso: isoStr,
        isCurrentMonth: true,
      });
    }

    // Next month padding to fill grid
    const totalCells = days.length > 35 ? 42 : 35;
    const remaining = totalCells - days.length;
    for (let d = 1; d <= remaining; d++) {
      const nextDate = new Date(year, month + 1, d);
      days.push({
        dateNum: d,
        fullIso: nextDate.toISOString().split('T')[0],
        isCurrentMonth: false,
      });
    }

    return days;
  };

  const changeMonth = (offset: number) => {
    const newMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + offset, 1);
    setCurrentMonth(newMonth);
  };

  const bookingDatesSet = new Set(
    bookings.map((b) => {
      try {
        return new Date(b.scheduled_at).toISOString().split('T')[0];
      } catch { return ''; }
    })
  );

  const filteredBookings = bookings.filter((b) => {
    if (viewMode === 'calendar' && selectedDateIso) {
      try {
        const bDate = new Date(b.scheduled_at).toISOString().split('T')[0];
        return bDate === selectedDateIso;
      } catch { return false; }
    }

    const status = b.status.toLowerCase();
    if (activeFilter === 'Upcoming') return status === 'confirmed' || status === 'pending';
    if (activeFilter === 'In Progress') return status === 'in_progress';
    if (activeFilter === 'Completed') return status === 'completed';
    if (activeFilter === 'Cancelled') return status === 'cancelled';
    return true;
  });

  const formatDate = (d: string) => {
    try {
      return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch { return d; }
  };

  const monthYearLabel = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <View style={styles.container}>
      {/* Header Block */}
      <View style={styles.headerBlock}>
        <View style={styles.headerTopRow}>
          <Text style={styles.title}>My Bookings</Text>

          {/* View Mode Toggle */}
          <View style={styles.toggleWrap}>
            <Pressable
              style={[styles.toggleBtn, viewMode === 'calendar' && styles.toggleBtnActive]}
              onPress={() => setViewMode('calendar')}
            >
              <CalendarDays size={16} color={viewMode === 'calendar' ? '#0F3A40' : '#FFFFFF'} strokeWidth={2.2} />
              <Text style={[styles.toggleText, viewMode === 'calendar' && styles.toggleTextActive]}>Calendar</Text>
            </Pressable>

            <Pressable
              style={[styles.toggleBtn, viewMode === 'list' && styles.toggleBtnActive]}
              onPress={() => setViewMode('list')}
            >
              <ListFilter size={16} color={viewMode === 'list' ? '#0F3A40' : '#FFFFFF'} strokeWidth={2.2} />
              <Text style={[styles.toggleText, viewMode === 'list' && styles.toggleTextActive]}>List</Text>
            </Pressable>
          </View>
        </View>

        {viewMode === 'list' ? (
          /* List Status Pills */
          <View style={styles.filterRowContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
              {statusFilters.map((f) => {
                const isSelected = activeFilter === f;
                return (
                  <Pressable
                    key={f}
                    onPress={() => setActiveFilter(f)}
                    style={[styles.filterChip, isSelected && styles.filterChipActive]}
                  >
                    <Text style={[styles.filterText, isSelected && styles.filterTextActive]}>{f}</Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        ) : null}
      </View>

      {/* Main Content Area */}
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {viewMode === 'calendar' && (
          <View style={styles.calendarCard}>
            {/* Month Header Nav */}
            <View style={styles.monthHeader}>
              <Pressable style={styles.monthNavBtn} onPress={() => changeMonth(-1)}>
                <ChevronLeft size={20} color={theme.colors.textPrimary} strokeWidth={2.2} />
              </Pressable>

              <Text style={styles.monthTitle}>{monthYearLabel}</Text>

              <Pressable style={styles.monthNavBtn} onPress={() => changeMonth(1)}>
                <ChevronRight size={20} color={theme.colors.textPrimary} strokeWidth={2.2} />
              </Pressable>
            </View>

            {/* Weekdays Row */}
            <View style={styles.weekdaysRow}>
              {WEEKDAYS.map((w, idx) => (
                <Text key={idx} style={styles.weekdayText}>{w}</Text>
              ))}
            </View>

            {/* Month Grid */}
            <View style={styles.monthGrid}>
              {generateMonthDays().map((item, idx) => {
                const isSelected = selectedDateIso === item.fullIso;
                const hasBooking = bookingDatesSet.has(item.fullIso);

                return (
                  <Pressable
                    key={idx}
                    style={[
                      styles.dayCell,
                      !item.isCurrentMonth && styles.dayCellDisabled,
                      isSelected && styles.dayCellSelected,
                    ]}
                    onPress={() => {
                      if (isSelected) {
                        setSelectedDateIso(null); // toggle unselect
                      } else {
                        setSelectedDateIso(item.fullIso);
                      }
                    }}
                  >
                    <Text
                      style={[
                        styles.dayText,
                        !item.isCurrentMonth && styles.dayTextDisabled,
                        isSelected && styles.dayTextSelected,
                      ]}
                    >
                      {item.dateNum}
                    </Text>

                    {hasBooking && (
                      <View style={[styles.bookingDot, isSelected && styles.bookingDotSelected]} />
                    )}
                  </Pressable>
                );
              })}
            </View>

            {/* Selected Date Indicator Banner */}
            {selectedDateIso ? (
              <View style={styles.dateFilterBanner}>
                <Text style={styles.dateFilterText}>
                  Showing bookings for <Text style={styles.dateFilterBold}>{selectedDateIso}</Text>
                </Text>
                <Pressable onPress={() => setSelectedDateIso(null)}>
                  <Text style={styles.clearDateText}>Show All</Text>
                </Pressable>
              </View>
            ) : (
              <Text style={styles.calendarHint}>Tap any date with a dot to view scheduled appointments</Text>
            )}
          </View>
        )}

        {/* Bookings Section */}
        {loading ? (
          <ActivityIndicator size="large" color={theme.colors.accent} style={styles.loader} />
        ) : filteredBookings.length === 0 ? (
          <View style={styles.emptyState}>
            <CalendarIcon size={36} color={theme.colors.textSecondary} strokeWidth={1.5} />
            <Text style={styles.emptyTitle}>No bookings found</Text>
            <Text style={styles.emptySub}>
              {selectedDateIso
                ? `No appointment scheduled on ${selectedDateIso}.`
                : `You have no bookings under the "${activeFilter}" filter.`}
            </Text>
          </View>
        ) : (
          <View style={styles.list}>
            {filteredBookings.map((b) => (
              <Card key={b.id} style={styles.bookingCard} onPress={() => router.push(`/booking/${b.id}`)}>
                {b.image ? (
                  <Image source={{ uri: b.image }} style={styles.providerImg} />
                ) : (
                  <View style={styles.avatarPlaceholder}>
                    <User size={28} color={theme.colors.accent} strokeWidth={1.8} />
                  </View>
                )}
                <View style={styles.bookingInfo}>
                  <View style={styles.bookingHeader}>
                    <Text style={styles.providerName} numberOfLines={1}>{b.provider_name}</Text>
                    <StatusPill status={b.status} />
                  </View>
                  
                  <Text style={styles.serviceName}>{b.service_name}</Text>

                  <View style={styles.metaRow}>
                    <View style={styles.metaItem}>
                      <CalendarIcon size={13} color={theme.colors.accent} strokeWidth={2} />
                      <Text style={styles.metaText}>{formatDate(b.scheduled_at)}</Text>
                    </View>
                    <View style={styles.metaItem}>
                      <Clock size={13} color={theme.colors.accent} strokeWidth={2} />
                      <Text style={styles.metaText}>
                        {new Date(b.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </Text>
                    </View>
                  </View>
                </View>
                <View style={styles.chevronWrap}>
                  <ChevronRight size={18} color={theme.colors.textSecondary} strokeWidth={2.2} />
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
  headerTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 56, paddingBottom: 12 },
  title: { fontFamily: 'Inter-Bold', fontSize: 22, color: theme.colors.white, letterSpacing: -0.5 },
  toggleWrap: { flexDirection: 'row', backgroundColor: 'rgba(255, 255, 255, 0.15)', borderRadius: 18, padding: 3, gap: 2 },
  toggleBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 15 },
  toggleBtnActive: { backgroundColor: '#FFFFFF' },
  toggleText: { fontFamily: 'Inter-Medium', fontSize: 12, color: 'rgba(255, 255, 255, 0.85)' },
  toggleTextActive: { fontFamily: 'Inter-Bold', color: '#0F3A40' },
  filterRowContainer: { height: 38 },
  filterRow: { paddingHorizontal: 20, gap: 8 },
  filterChip: { paddingHorizontal: 16, height: 34, borderRadius: 17, backgroundColor: 'rgba(255, 255, 255, 0.15)', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.25)', alignItems: 'center', justifyContent: 'center' },
  filterChipActive: { backgroundColor: '#FFFFFF', borderColor: '#FFFFFF' },
  filterText: { fontFamily: 'Inter-Medium', fontSize: 13, color: 'rgba(255, 255, 255, 0.85)' },
  filterTextActive: { color: '#0F3A40', fontFamily: 'Inter-Bold' },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 16, paddingBottom: 30, gap: 14 },
  
  // Calendar Card
  calendarCard: { backgroundColor: theme.colors.card, borderRadius: 20, borderWidth: 1, borderColor: theme.colors.border, padding: 16, gap: 12 },
  monthHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  monthNavBtn: { width: 34, height: 34, borderRadius: 10, backgroundColor: theme.colors.background, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: theme.colors.border },
  monthTitle: { fontFamily: 'Inter-Bold', fontSize: 16, color: theme.colors.textPrimary },
  weekdaysRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 4 },
  weekdayText: { flex: 1, textAlign: 'center', fontFamily: 'Inter-Bold', fontSize: 12, color: theme.colors.textSecondary },
  monthGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  dayCell: { width: '14.28%', height: 42, alignItems: 'center', justifyContent: 'center', borderRadius: 12, position: 'relative' },
  dayCellDisabled: { opacity: 0.3 },
  dayCellSelected: { backgroundColor: '#0F3A40' },
  dayText: { fontFamily: 'Inter-Medium', fontSize: 14, color: theme.colors.textPrimary },
  dayTextDisabled: { color: theme.colors.textSecondary },
  dayTextSelected: { fontFamily: 'Inter-Bold', color: '#FFFFFF' },
  bookingDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: '#14B8A6', position: 'absolute', bottom: 4 },
  bookingDotSelected: { backgroundColor: '#FFFFFF' },
  dateFilterBanner: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: theme.colors.accentLight, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8, marginTop: 4 },
  dateFilterText: { fontFamily: 'Inter-Medium', fontSize: 13, color: theme.colors.textPrimary },
  dateFilterBold: { fontFamily: 'Inter-Bold', color: theme.colors.accent },
  clearDateText: { fontFamily: 'Inter-Bold', fontSize: 12, color: theme.colors.accent },
  calendarHint: { fontFamily: 'Inter-Regular', fontSize: 12, color: theme.colors.textSecondary, textAlign: 'center', marginTop: 2 },

  list: { gap: 12 },
  bookingCard: { flexDirection: 'row', padding: 12, gap: 12, backgroundColor: theme.colors.card, borderRadius: 20, borderWidth: 1, borderColor: theme.colors.border, alignItems: 'center' },
  providerImg: { width: 68, height: 68, borderRadius: 14, backgroundColor: theme.colors.background },
  avatarPlaceholder: { width: 68, height: 68, borderRadius: 14, backgroundColor: theme.colors.accentLight, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: theme.colors.border },
  bookingInfo: { flex: 1, justifyContent: 'space-between', gap: 4 },
  bookingHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  providerName: { fontFamily: 'Inter-Bold', fontSize: 15, color: theme.colors.textPrimary, flex: 1, marginRight: 8 },
  serviceName: { fontFamily: 'Inter-Regular', fontSize: 13, color: theme.colors.textSecondary },
  metaRow: { flexDirection: 'row', gap: 12, marginTop: 4 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontFamily: 'Inter-Medium', fontSize: 12, color: theme.colors.textSecondary },
  chevronWrap: { width: 28, height: 28, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.03)', alignItems: 'center', justifyContent: 'center' },
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60, backgroundColor: theme.colors.card, borderRadius: 20, borderWidth: 1, borderColor: theme.colors.border },
  emptyTitle: { fontFamily: 'Inter-Bold', fontSize: 16, color: theme.colors.textPrimary, marginTop: 12 },
  emptySub: { fontFamily: 'Inter-Regular', fontSize: 13, color: theme.colors.textSecondary, marginTop: 4, textAlign: 'center', paddingHorizontal: 20 },
  loader: { marginTop: 40 },
});
