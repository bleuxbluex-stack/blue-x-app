import { View, Text, StyleSheet, ScrollView, Pressable, Image, ActivityIndicator } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { MapPin, Calendar, Clock, ChevronLeft, Phone, MessageSquare, User } from 'lucide-react-native';
import { Card, StatusPill, Button } from '@/components/ui';
import { supabase } from '@/services/supabase';
import { theme } from '@/constants/theme';
import { useAuth } from '@/hooks/useAuth';
import { getValidProviderImage } from '@/services/cloudinary';

interface Booking {
  id: string;
  provider_id: string;
  client_id: string;
  provider_service_id: string | null;
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  scheduled_at: string;
  notes: string | null;
  total_price: number;
}

export default function BookingDetailScreen() {
  const { id } = useLocalSearchParams();
  const { user, role } = useAuth();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [providerName, setProviderName] = useState('Service Provider');
  const [serviceName, setServiceName] = useState('General Service');
  const [providerImage, setProviderImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const { data: bk } = await supabase
          .from('bookings')
          .select('id, provider_id, client_id, provider_service_id, status, scheduled_at, notes, total_price')
          .eq('id', id as string)
          .maybeSingle();

        if (bk) {
          setBooking(bk);

          if (role === 'provider') {
            // Resolve client details
            const { data: clientProfile } = await supabase
              .from('profiles')
              .select('full_name, avatar_url')
              .eq('id', bk.client_id)
              .maybeSingle();

            if (clientProfile) {
              setProviderName(clientProfile.full_name || 'Client');
              setProviderImage(getValidProviderImage(clientProfile.avatar_url));
              setServiceName('Incoming Booking');
            }
          } else {
            // Resolve provider details & service details
            const [{ data: pProf }, { data: pUser }] = await Promise.all([
              supabase.from('provider_profiles').select('company_name, company_logo_url, selfie_url').eq('user_id', bk.provider_id).maybeSingle(),
              supabase.from('profiles').select('full_name, avatar_url').eq('id', bk.provider_id).maybeSingle(),
            ]);

            const realImg = pProf?.company_logo_url || pProf?.selfie_url || pUser?.avatar_url || null;
            setProviderImage(getValidProviderImage(realImg));

            if (pProf?.company_name || pUser?.full_name) {
              setProviderName(pProf?.company_name || pUser?.full_name || 'Service Provider');
            }

            if (bk.provider_service_id) {
              const { data: svc } = await supabase
                .from('provider_services')
                .select('name, category_id')
                .eq('id', bk.provider_service_id)
                .maybeSingle();

              if (svc) {
                if (!pProf?.company_name && !pUser?.full_name) {
                  setProviderName(svc.name);
                }

                const { data: cat } = await supabase
                  .from('service_categories')
                  .select('name, slug')
                  .eq('id', svc.category_id as string)
                  .maybeSingle();

                if (cat) {
                  setServiceName(cat.name);
                }
              }
            }
          }
        } else {
          // No booking found — will show "Booking not found" UI
          setBooking(null);
        }
      } catch (err) {
        console.log('Error loading booking details:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, [id, user, role]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={theme.colors.accent} />
      </View>
    );
  }

  if (!booking) {
    return (
      <View style={styles.center}>
        <Text style={styles.notFound}>Booking not found</Text>
        <Button label="Go Back" onPress={() => router.back()} style={{ marginTop: 16 }} />
      </View>
    );
  }

  const formatDate = (d: string) => {
    try {
      if (d.includes('May') || d.includes('June')) return d; // mock dates
      return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
    } catch { return d; }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} style={styles.iconBtn}>
          <ChevronLeft size={22} color={theme.colors.textPrimary} strokeWidth={2.4} />
        </Pressable>
        <Text style={styles.topTitle}>Booking Details</Text>
        <View style={styles.iconBtnPlaceholder} />
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.body}>
          {/* Booking ID & Status Card */}
          <Card style={styles.statusCard}>
            <View style={styles.statusTop}>
              <View>
                <Text style={styles.bookingIdLabel}>Booking ID</Text>
                <Text style={styles.bookingIdText}>#{booking.id}</Text>
                <Text style={styles.bookingCreatedText}>Created on 20 May 2024</Text>
              </View>
              <StatusPill status={booking.status} />
            </View>
          </Card>

          {/* Provider Card */}
          <Card style={styles.providerCard}>
            {providerImage ? (
              <Image source={{ uri: providerImage }} style={styles.providerAvatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <User size={24} color={theme.colors.accent} strokeWidth={1.8} />
              </View>
            )}
            <View style={styles.providerInfo}>
              <Text style={styles.providerName}>{providerName}</Text>
              <Text style={styles.providerService}>{serviceName}</Text>
            </View>
            <View style={styles.providerActions}>
              <Pressable style={styles.actionIconBtn}>
                <Phone size={18} color={theme.colors.accent} strokeWidth={2} />
              </Pressable>
              <Pressable
                style={styles.actionIconBtn}
                onPress={() => {
                  const partnerId = role === 'provider' ? booking.client_id : booking.provider_id;
                  router.push({ pathname: '/chat', params: { providerId: partnerId } });
                }}
              >
                <MessageSquare size={18} color={theme.colors.accent} strokeWidth={2} />
              </Pressable>
            </View>
          </Card>

          {/* Detail Info list/rows */}
          <Card style={styles.detailsCard}>
            {[
              { icon: <Calendar size={18} color={theme.colors.accent} />, label: 'Date', value: formatDate(booking.scheduled_at) },
              { icon: <Clock size={18} color={theme.colors.accent} />, label: 'Time', value: new Date(booking.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
              { icon: <View style={{ width: 18 }} />, label: 'Service', value: serviceName },
              { icon: <View style={{ width: 18 }} />, label: 'Total Price', value: `CHF ${booking.total_price.toFixed(2)}`, isPrice: true },
            ].map((item, index) => (
              <View key={index} style={[styles.detailRow, index === 4 && styles.lastDetailRow]}>
                <View style={styles.detailLabelCell}>
                  {item.icon}
                  <Text style={styles.detailLabelText}>{item.label}</Text>
                </View>
                <Text style={[styles.detailValueText, item.isPrice && styles.priceValueText]}>
                  {item.value}
                </Text>
              </View>
            ))}
          </Card>
        </View>
      </ScrollView>

      {/* Booking CTAs */}
      <View style={styles.footer}>
        <Button
          label="Reschedule Booking"
          onPress={() => {}}
          variant="primary"
          style={styles.rescheduleBtn}
        />
        <Pressable style={styles.cancelBtn} onPress={() => {}}>
          <Text style={styles.cancelBtnText}>Cancel Booking</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 52, paddingBottom: 14 },
  iconBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: theme.colors.card, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: theme.colors.border },
  iconBtnPlaceholder: { width: 40 },
  topTitle: { fontFamily: 'Inter-Bold', fontSize: 17, color: theme.colors.textPrimary },
  scroll: { flex: 1 },
  content: { paddingBottom: 160 },
  body: { paddingHorizontal: 20, gap: 16 },
  statusCard: { padding: 16 },
  statusTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  bookingIdLabel: { fontFamily: 'Inter-Medium', fontSize: 12, color: theme.colors.textSecondary },
  bookingIdText: { fontFamily: 'Inter-Bold', fontSize: 18, color: theme.colors.textPrimary, marginTop: 2 },
  bookingCreatedText: { fontFamily: 'Inter-Regular', fontSize: 11, color: theme.colors.textSecondary, marginTop: 4 },
  providerCard: { flexDirection: 'row', padding: 14, alignItems: 'center', gap: 12 },
  providerAvatar: { width: 50, height: 50, borderRadius: 12, backgroundColor: theme.colors.background },
  avatarPlaceholder: { width: 50, height: 50, borderRadius: 12, backgroundColor: theme.colors.accentLight, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: theme.colors.border },
  providerInfo: { flex: 1, justifyContent: 'center' },
  providerName: { fontFamily: 'Inter-Bold', fontSize: 15, color: theme.colors.textPrimary },
  providerService: { fontFamily: 'Inter-Regular', fontSize: 12, color: theme.colors.textSecondary, marginTop: 2 },
  providerActions: { flexDirection: 'row', gap: 8 },
  actionIconBtn: { width: 36, height: 36, borderRadius: 18, borderWidth: 1.5, borderColor: theme.colors.accentLight, backgroundColor: 'rgba(10,95,255,0.03)', alignItems: 'center', justifyContent: 'center' },
  detailsCard: { paddingHorizontal: 16, paddingVertical: 8 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: theme.colors.border },
  lastDetailRow: { borderBottomWidth: 0 },
  detailLabelCell: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  detailLabelText: { fontFamily: 'Inter-Medium', fontSize: 14, color: theme.colors.textSecondary },
  detailValueText: { fontFamily: 'Inter-Medium', fontSize: 14, color: theme.colors.textPrimary, textAlign: 'right', flex: 1, marginLeft: 20 },
  priceValueText: { fontFamily: 'Inter-Bold', color: theme.colors.accent },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: theme.colors.card, paddingHorizontal: 20, paddingVertical: 18, borderTopWidth: 1, borderTopColor: theme.colors.border, gap: 12 },
  rescheduleBtn: { width: '100%' },
  cancelBtn: { width: '100%', alignItems: 'center', paddingVertical: 12 },
  cancelBtnText: { fontFamily: 'Inter-SemiBold', fontSize: 14, color: '#EF4444' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.background },
  notFound: { fontFamily: 'Inter-Bold', fontSize: 16, color: theme.colors.textPrimary },
});
