import { View, Text, StyleSheet, ScrollView, Pressable, TextInput, ActivityIndicator, Alert, Image } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ChevronLeft, Calendar, Clock, MapPin, ShieldCheck, Check, Info, FileText, User } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Card } from '@/components/ui';
import { supabase } from '@/services/supabase';
import { theme } from '@/constants/theme';
import { useAuth } from '@/hooks/useAuth';
import { getValidProviderImage } from '@/services/cloudinary';

interface ProviderServiceItem {
  id: string;
  name: string;
  price: number;
  description: string | null;
}

export default function NewBookingScreen() {
  const { providerId, serviceId } = useLocalSearchParams<{ providerId: string; serviceId?: string }>();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  const [loadingProvider, setLoadingProvider] = useState(true);
  const [providerName, setProviderName] = useState('Service Provider');
  const [providerImage, setProviderImage] = useState<string | null>(null);
  const [hourlyRate, setHourlyRate] = useState(90);
  const [categoryName, setCategoryName] = useState('Service');
  const [services, setServices] = useState<ProviderServiceItem[]>([]);
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(serviceId || null);

  // Form State
  const [selectedDayOffset, setSelectedDayOffset] = useState(1); // 1 = Tomorrow
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('10:00 AM');
  const [durationHours, setDurationHours] = useState(2);
  const [locationAddress, setLocationAddress] = useState('Zurich, Switzerland');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const timeSlots = ['08:00 AM', '10:00 AM', '01:00 PM', '03:00 PM', '05:00 PM'];
  const durationOptions = [1, 2, 3, 4, 6];

  // Generate next 5 days
  const getDates = () => {
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 5; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      dates.push({
        offset: i,
        dayName: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : d.toLocaleDateString('en-US', { weekday: 'short' }),
        dayNumber: d.getDate(),
        monthName: d.toLocaleDateString('en-US', { month: 'short' }),
        fullDate: d,
      });
    }
    return dates;
  };

  const datesList = getDates();

  useEffect(() => {
    if (!providerId) {
      setLoadingProvider(false);
      return;
    }

    (async () => {
      try {
        const [{ data: prof }, { data: pUser }, { data: pSvcs }] = await Promise.all([
          supabase.from('provider_profiles').select('user_id, company_name, hourly_rate, company_logo_url, selfie_url').eq('user_id', providerId).maybeSingle(),
          supabase.from('profiles').select('full_name, avatar_url, city, country').eq('id', providerId).maybeSingle(),
          supabase.from('provider_services').select('id, name, price, description').eq('provider_id', providerId),
        ]);

        if (prof || pUser) {
          const resolvedName = prof?.company_name || pUser?.full_name || 'Service Provider';
          setProviderName(resolvedName);

          const rate = prof?.hourly_rate ? Number(prof.hourly_rate) : 90;
          setHourlyRate(rate);

          const img = prof?.company_logo_url || prof?.selfie_url || pUser?.avatar_url || null;
          setProviderImage(getValidProviderImage(img));

          if (pSvcs && pSvcs.length > 0) {
            const mapped = pSvcs.map(s => ({
              id: s.id,
              name: s.name,
              price: Number(s.price),
              description: s.description,
            }));
            setServices(mapped);
            if (!selectedServiceId) {
              setSelectedServiceId(mapped[0].id);
            }
          }
        }
      } catch (err) {
        console.log('Error fetching provider for booking:', err);
      } finally {
        setLoadingProvider(false);
      }
    })();
  }, [providerId]);

  // Selected Service object
  const activeService = services.find(s => s.id === selectedServiceId);
  const currentPriceRate = activeService ? activeService.price : hourlyRate;
  const totalPrice = currentPriceRate * durationHours;

  const handleConfirmBooking = async () => {
    if (!user) {
      Alert.alert(
        'Sign In Required',
        'Please sign in to confirm your booking.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Sign In', onPress: () => router.push('/(auth)/login') }
        ]
      );
      return;
    }

    if (!providerId) {
      Alert.alert('Error', 'Invalid provider specified.');
      return;
    }

    setSubmitting(true);
    try {
      const chosenDateObj = datesList.find(d => d.offset === selectedDayOffset)?.fullDate || new Date();
      
      // Parse time slot
      const [timeStr, period] = selectedTimeSlot.split(' ');
      let [hours, mins] = timeStr.split(':').map(Number);
      if (period === 'PM' && hours < 12) hours += 12;
      if (period === 'AM' && hours === 12) hours = 0;

      chosenDateObj.setHours(hours, mins, 0, 0);

      const bookingPayload = {
        client_id: user.id,
        provider_id: providerId,
        provider_service_id: selectedServiceId || null,
        status: 'pending' as const,
        scheduled_at: chosenDateObj.toISOString(),
        duration_hours: durationHours,
        total_price: totalPrice,
        notes: notes.trim() ? `${notes.trim()} (Location: ${locationAddress})` : `Location: ${locationAddress}`,
        quick_booking_enabled: false,
      };

      const { data, error } = await supabase
        .from('bookings')
        .insert(bookingPayload)
        .select('id')
        .single();

      if (error) {
        console.error('Booking insertion error:', error.message);
        Alert.alert('Booking Failed', error.message || 'Failed to place booking. Please try again.');
        return;
      }

      Alert.alert(
        'Booking Confirmed! 🎉',
        `Your request has been sent to ${providerName}.`,
        [
          {
            text: 'View Booking',
            onPress: () => router.replace(`/booking/${data.id}`),
          },
        ]
      );
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Something went wrong.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingProvider) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={theme.colors.accent} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Top Navigation Bar */}
      <View style={[styles.topBar, { paddingTop: Math.max(insets.top + 10, 44) }]}>
        <Pressable onPress={() => router.back()} style={styles.iconBtn}>
          <ChevronLeft size={22} color={theme.colors.textPrimary} strokeWidth={2.4} />
        </Pressable>
        <Text style={styles.topTitle}>New Booking</Text>
        <View style={styles.iconBtnPlaceholder} />
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Provider Summary Card */}
        <Card style={styles.providerCard}>
          {providerImage ? (
            <Image source={{ uri: providerImage }} style={styles.providerAvatar} />
          ) : (
            <View style={styles.providerAvatarFallback}>
              <User size={26} color={theme.colors.accent} strokeWidth={2} />
            </View>
          )}
          <View style={styles.providerInfo}>
            <View style={styles.verifiedRow}>
              <ShieldCheck size={14} color={theme.colors.accent} strokeWidth={2.5} />
              <Text style={styles.verifiedText}>VERIFIED PROVIDER</Text>
            </View>
            <Text style={styles.providerNameText}>{providerName}</Text>
            <Text style={styles.providerRateText}>CHF {hourlyRate} / hour</Text>
          </View>
        </Card>

        {/* 1. Services Selection (if provider has specific services) */}
        {services.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Select Service</Text>
            <View style={styles.servicesList}>
              {services.map(svc => {
                const isSelected = svc.id === selectedServiceId;
                return (
                  <Pressable
                    key={svc.id}
                    style={[styles.serviceCard, isSelected && styles.serviceCardSelected]}
                    onPress={() => setSelectedServiceId(svc.id)}
                  >
                    <View style={styles.serviceLeft}>
                      <View style={[styles.radioCircle, isSelected && styles.radioCircleSelected]}>
                        {isSelected && <View style={styles.radioInner} />}
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.serviceName, isSelected && styles.serviceNameSelected]}>{svc.name}</Text>
                        {svc.description && (
                          <Text style={styles.serviceDesc} numberOfLines={1}>{svc.description}</Text>
                        )}
                      </View>
                    </View>
                    <Text style={styles.servicePrice}>CHF {svc.price}</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        )}

        {/* 2. Select Date */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Date</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.datesRow}>
            {datesList.map(item => {
              const isSelected = item.offset === selectedDayOffset;
              return (
                <Pressable
                  key={item.offset}
                  style={[styles.dateCard, isSelected && styles.dateCardSelected]}
                  onPress={() => setSelectedDayOffset(item.offset)}
                >
                  <Text style={[styles.dateDayName, isSelected && styles.dateTextSelected]}>{item.dayName}</Text>
                  <Text style={[styles.dateDayNum, isSelected && styles.dateTextSelected]}>{item.dayNumber}</Text>
                  <Text style={[styles.dateMonthName, isSelected && styles.dateTextSelected]}>{item.monthName}</Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        {/* 3. Select Time */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Start Time</Text>
          <View style={styles.timeGrid}>
            {timeSlots.map(slot => {
              const isSelected = slot === selectedTimeSlot;
              return (
                <Pressable
                  key={slot}
                  style={[styles.timeChip, isSelected && styles.timeChipSelected]}
                  onPress={() => setSelectedTimeSlot(slot)}
                >
                  <Clock size={14} color={isSelected ? '#FFFFFF' : theme.colors.textSecondary} strokeWidth={2} />
                  <Text style={[styles.timeChipText, isSelected && styles.timeChipTextSelected]}>{slot}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* 4. Duration Selector */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Estimated Duration</Text>
          <View style={styles.durationRow}>
            {durationOptions.map(hrs => {
              const isSelected = hrs === durationHours;
              return (
                <Pressable
                  key={hrs}
                  style={[styles.durationChip, isSelected && styles.durationChipSelected]}
                  onPress={() => setDurationHours(hrs)}
                >
                  <Text style={[styles.durationChipText, isSelected && styles.durationChipTextSelected]}>
                    {hrs} {hrs === 1 ? 'Hour' : 'Hours'}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* 5. Address / Location */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Service Address</Text>
          <View style={styles.inputWrap}>
            <MapPin size={18} color={theme.colors.accent} strokeWidth={2} style={styles.inputIcon} />
            <TextInput
              style={styles.textInput}
              value={locationAddress}
              onChangeText={setLocationAddress}
              placeholder="Enter your address (e.g. Zurich)"
              placeholderTextColor={theme.colors.textSecondary}
            />
          </View>
        </View>

        {/* 6. Special Instructions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notes for Provider (Optional)</Text>
          <View style={[styles.inputWrap, { height: 90, alignItems: 'flex-start', paddingTop: 12 }]}>
            <FileText size={18} color={theme.colors.accent} strokeWidth={2} style={styles.inputIcon} />
            <TextInput
              style={[styles.textInput, { height: 66, textAlignVertical: 'top' }]}
              value={notes}
              onChangeText={setNotes}
              placeholder="Describe your job details, access instructions..."
              placeholderTextColor={theme.colors.textSecondary}
              multiline
            />
          </View>
        </View>

        {/* Price Summary Breakdown */}
        <Card style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Payment Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Rate</Text>
            <Text style={styles.summaryVal}>CHF {currentPriceRate} / hr</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Duration</Text>
            <Text style={styles.summaryVal}>{durationHours} hours</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.summaryRow}>
            <Text style={styles.totalLabel}>Total Price</Text>
            <Text style={styles.totalVal}>CHF {totalPrice}</Text>
          </View>
        </Card>
      </ScrollView>

      {/* Bottom Fixed CTA Button */}
      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom + 12, 18) }]}>
        <Button
          label={submitting ? 'Creating Booking...' : `Confirm Booking • CHF ${totalPrice}`}
          onPress={handleConfirmBooking}
          disabled={submitting}
          style={styles.confirmBtn}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    backgroundColor: theme.colors.card,
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
  topTitle: { fontFamily: 'Inter-Bold', fontSize: 18, color: theme.colors.textPrimary },

  scroll: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 110 },

  // Provider Card
  providerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    padding: 16,
    marginBottom: 20,
    borderRadius: 20,
  },
  providerAvatar: { width: 60, height: 60, borderRadius: 18, backgroundColor: theme.colors.accentLight },
  providerAvatarFallback: {
    width: 60,
    height: 60,
    borderRadius: 18,
    backgroundColor: theme.colors.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  providerInfo: { flex: 1, gap: 4 },
  verifiedRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  verifiedText: { fontFamily: 'Inter-Bold', fontSize: 10, color: theme.colors.accent, letterSpacing: 0.5 },
  providerNameText: { fontFamily: 'Inter-Bold', fontSize: 17, color: theme.colors.textPrimary },
  providerRateText: { fontFamily: 'Inter-Medium', fontSize: 13, color: theme.colors.textSecondary },

  section: { marginBottom: 22 },
  sectionTitle: { fontFamily: 'Inter-Bold', fontSize: 15, color: theme.colors.textPrimary, marginBottom: 10 },

  // Services Selection
  servicesList: { gap: 10 },
  serviceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 16,
    padding: 14,
  },
  serviceCardSelected: { borderColor: theme.colors.accent, backgroundColor: theme.colors.accentLight },
  serviceLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  radioCircle: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: theme.colors.textSecondary, alignItems: 'center', justifyContent: 'center' },
  radioCircleSelected: { borderColor: theme.colors.accent },
  radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: theme.colors.accent },
  serviceName: { fontFamily: 'Inter-SemiBold', fontSize: 14, color: theme.colors.textPrimary },
  serviceNameSelected: { color: theme.colors.accent },
  serviceDesc: { fontFamily: 'Inter-Regular', fontSize: 12, color: theme.colors.textSecondary, marginTop: 2 },
  servicePrice: { fontFamily: 'Inter-Bold', fontSize: 14, color: theme.colors.textPrimary },

  // Date selection
  datesRow: { gap: 10 },
  dateCard: {
    width: 76,
    height: 90,
    borderRadius: 18,
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  dateCardSelected: { backgroundColor: theme.colors.accent, borderColor: theme.colors.accent },
  dateDayName: { fontFamily: 'Inter-Medium', fontSize: 12, color: theme.colors.textSecondary },
  dateDayNum: { fontFamily: 'Inter-Bold', fontSize: 20, color: theme.colors.textPrimary },
  dateMonthName: { fontFamily: 'Inter-Medium', fontSize: 11, color: theme.colors.textSecondary },
  dateTextSelected: { color: '#FFFFFF' },

  // Time grid
  timeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  timeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  timeChipSelected: { backgroundColor: theme.colors.accent, borderColor: theme.colors.accent },
  timeChipText: { fontFamily: 'Inter-SemiBold', fontSize: 13, color: theme.colors.textPrimary },
  timeChipTextSelected: { color: '#FFFFFF' },

  // Duration
  durationRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  durationChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  durationChipSelected: { backgroundColor: theme.colors.accent, borderColor: theme.colors.accent },
  durationChipText: { fontFamily: 'Inter-SemiBold', fontSize: 13, color: theme.colors.textPrimary },
  durationChipTextSelected: { color: '#FFFFFF' },

  // Input
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 16,
    paddingHorizontal: 14,
    height: 52,
  },
  inputIcon: { marginRight: 10 },
  textInput: { flex: 1, fontFamily: 'Inter-Regular', fontSize: 14, color: theme.colors.textPrimary },

  // Summary
  summaryCard: { padding: 18, borderRadius: 20, gap: 10 },
  summaryTitle: { fontFamily: 'Inter-Bold', fontSize: 16, color: theme.colors.textPrimary, marginBottom: 4 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  summaryLabel: { fontFamily: 'Inter-Medium', fontSize: 14, color: theme.colors.textSecondary },
  summaryVal: { fontFamily: 'Inter-SemiBold', fontSize: 14, color: theme.colors.textPrimary },
  divider: { height: 1, backgroundColor: theme.colors.border, marginVertical: 6 },
  totalLabel: { fontFamily: 'Inter-Bold', fontSize: 16, color: theme.colors.textPrimary },
  totalVal: { fontFamily: 'Inter-Bold', fontSize: 18, color: theme.colors.accent },

  // Bottom Fixed CTA
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: theme.colors.card,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingHorizontal: 20,
    paddingTop: 14,
  },
  confirmBtn: { height: 54, borderRadius: 16 },

  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.background },
});
