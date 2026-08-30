import { View, Text, StyleSheet, ScrollView, Pressable, Image, TextInput, KeyboardAvoidingView, Platform, ActivityIndicator, Keyboard, Alert, Modal } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState, useRef } from 'react';
import { ChevronLeft, Send, Phone, Video, ShieldCheck, Plus, Zap, Calendar, X, Clock, Check } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { supabase } from '@/services/supabase';
import { useAuth } from '@/hooks/useAuth';
import { theme } from '@/constants/theme';
import { getValidProviderImage } from '@/services/cloudinary';

interface Message {
  id: string;
  fromMe: boolean;
  text: string;
  time: string;
}

export default function ChatScreen() {
  const params = useLocalSearchParams();
  const providerId = (params.providerId || params.id) as string;
  const { user, role } = useAuth();
  const insets = useSafeAreaInsets();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [partnerName, setPartnerName] = useState('Service Provider');
  const [partnerImage, setPartnerImage] = useState<string | undefined>(undefined);
  const [isVerified, setIsVerified] = useState(false);
  const [currentUserAvatar, setCurrentUserAvatar] = useState<string | undefined>(undefined);
  const [currentUserName, setCurrentUserName] = useState('Me');

  // Booking Modal State
  const [bookingModalVisible, setBookingModalVisible] = useState(false);
  const [providerServices, setProviderServices] = useState<any[]>([]);
  const [selectedService, setSelectedService] = useState<any | null>(null);
  const [selectedDateIso, setSelectedDateIso] = useState<string>(
    new Date(Date.now() + 86400000).toISOString().split('T')[0]
  );
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('09:00 AM');
  const [bookingSubmitting, setBookingSubmitting] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(new Date());

  const timeSlots = ['09:00 AM', '11:00 AM', '02:00 PM', '04:30 PM', '06:00 PM'];

  const handlePrevMonth = () => {
    setCalendarMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCalendarMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const getCalendarMatrix = (monthDate: Date) => {
    const year = monthDate.getFullYear();
    const month = monthDate.getMonth();
    const firstDayIndex = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();

    const cells: ({ day: number; iso: string; isPast: boolean } | null)[] = [];
    for (let i = 0; i < firstDayIndex; i++) {
      cells.push(null);
    }

    const todayIso = new Date().toISOString().split('T')[0];

    for (let d = 1; d <= totalDays; d++) {
      const dStr = d < 10 ? `0${d}` : `${d}`;
      const mStr = month + 1 < 10 ? `0${month + 1}` : `${month + 1}`;
      const iso = `${year}-${mStr}-${dStr}`;
      const isPast = iso < todayIso;
      cells.push({ day: d, iso, isPast });
    }

    return cells;
  };

  const openBookingModal = async () => {
    if (!providerId) return;

    // Check if partner is registered as a provider profile or organization
    const [{ data: pProf }, { data: org }] = await Promise.all([
      supabase
        .from('provider_profiles')
        .select('user_id, hourly_rate')
        .eq('user_id', providerId)
        .maybeSingle(),
      supabase
        .from('organizations')
        .select('id')
        .eq('created_by', providerId)
        .maybeSingle(),
    ]);

    if (!pProf && !org) {
      Alert.alert(
        'Cannot Request Booking',
        `${partnerName} is not registered as a service provider and cannot receive appointment bookings.`
      );
      return;
    }

    setBookingModalVisible(true);
    const { data: svcs } = await supabase
      .from('provider_services')
      .select('id, name, price, price_type')
      .eq('provider_id', providerId);

    if (svcs && svcs.length > 0) {
      setProviderServices(svcs);
      setSelectedService(svcs[0]);
    } else {
      setProviderServices([]);
      setSelectedService(null);
    }
  };

  const handleConfirmBooking = async () => {
    if (!user || !providerId) return;
    setBookingSubmitting(true);
    try {
      const price = selectedService?.price ? Number(selectedService.price) : 90;
      const timeParts = selectedTimeSlot.includes('09:00') ? '09:00:00' : selectedTimeSlot.includes('11:00') ? '11:00:00' : selectedTimeSlot.includes('02:00') ? '14:00:00' : selectedTimeSlot.includes('04:30') ? '16:30:00' : '18:00:00';
      const scheduledTime = `${selectedDateIso}T${timeParts}.000Z`;

      // Resolve Organization ID for the provider to satisfy bookings_provider_id_fkey constraint
      const { data: orgData } = await supabase
        .from('organizations')
        .select('id')
        .eq('created_by', providerId)
        .maybeSingle();

      const targetProviderId = orgData?.id || providerId;

      // Build booking insert object cleanly
      const insertPayload: any = {
        provider_id: targetProviderId,
        client_id: user.id,
        scheduled_at: scheduledTime,
        duration_hours: 1,
        total_price: price,
        status: 'pending',
      };

      if (selectedService?.id) {
        insertPayload.provider_service_id = selectedService.id;
      }

      const { data: newBooking, error: bookingErr } = await supabase
        .from('bookings')
        .insert(insertPayload)
        .select('id')
        .single();

      if (bookingErr) {
        console.log('Error inserting booking:', bookingErr.message);
        Alert.alert('Booking Error', bookingErr.message);
        return;
      }

      const dateFormatted = new Date(selectedDateIso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
      const bookingMsg = `📅 APPOINTMENT REQUESTED\nService: ${selectedService?.name || 'General Service'}\nDate: ${dateFormatted} at ${selectedTimeSlot}\nTotal: CHF ${price}\nStatus: Pending Provider Approval`;

      await supabase.from('messages').insert({
        sender_id: user.id,
        receiver_id: providerId,
        content: bookingMsg,
        is_read: false,
      });

      setMessages((prev) => [...prev, {
        id: 'b_' + Date.now(),
        fromMe: true,
        text: bookingMsg,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }]);

      setBookingModalVisible(false);
      Alert.alert('Booking Requested!', `Your request has been sent to ${partnerName} for approval.`);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Could not create booking request');
    } finally {
      setBookingSubmitting(false);
    }
  };
  const scrollViewRef = useRef<ScrollView>(null);
  const inputRef = useRef<TextInput>(null);
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    if (role === 'client' && !loading) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [role, loading]);

  useEffect(() => {
    const showSubscription = Keyboard.addListener('keyboardDidShow', () => setKeyboardVisible(true));
    const hideSubscription = Keyboard.addListener('keyboardDidHide', () => setKeyboardVisible(false));
    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  useEffect(() => {
    if (!user || !providerId) return;

    // Load messages & profiles
    (async () => {
      try {
        const [{ data: msgs }, { data: profile }, { data: providerProfile }, { data: myProfile }] = await Promise.all([
          supabase
            .from('messages')
            .select('id, sender_id, receiver_id, content, created_at')
            .or(`and(sender_id.eq.${user.id},receiver_id.eq.${providerId}),and(sender_id.eq.${providerId},receiver_id.eq.${user.id})`)
            .order('created_at', { ascending: true }),
          supabase
            .from('profiles')
            .select('full_name, avatar_url')
            .eq('id', providerId as string)
            .maybeSingle(),
          supabase
            .from('provider_profiles')
            .select('is_verified')
            .eq('user_id', providerId as string)
            .maybeSingle(),
          supabase
            .from('profiles')
            .select('full_name, avatar_url')
            .eq('id', user.id)
            .maybeSingle()
        ]);

        if (profile) {
          setPartnerName(profile.full_name || 'Service Provider');
          setPartnerImage(getValidProviderImage(profile.avatar_url) || undefined);
        }
        if (myProfile) {
          setCurrentUserName(myProfile.full_name || 'Me');
          setCurrentUserAvatar(getValidProviderImage(myProfile.avatar_url) || undefined);
        }
        setIsVerified(!!providerProfile?.is_verified);

        if (msgs && msgs.length > 0) {
          setMessages(msgs.map(m => ({
            id: m.id,
            fromMe: m.sender_id === user.id,
            text: m.content,
            time: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          })));
        } else {
          // No messages yet — show empty chat
          setMessages([]);
        }

        // Mark all unread incoming messages from partner as read
        await supabase
          .from('messages')
          .update({ is_read: true })
          .eq('sender_id', providerId)
          .eq('receiver_id', user.id)
          .eq('is_read', false);
      } catch (err) {
        console.log('Error loading chat details:', err);
      } finally {
        setLoading(false);
      }
    })();

    // Subscribe to incoming messages (requires Realtime enabled on messages table in Supabase)
    const channel = supabase
      .channel(`chat_${user.id}_${providerId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `receiver_id=eq.${user.id}`,
      }, (payload) => {
        if (payload.new.sender_id === providerId) {
          // Mark as read immediately since user is actively viewing this chat
          supabase.from('messages').update({ is_read: true }).eq('id', payload.new.id);

          setMessages((prev) => {
            // Avoid duplicates
            if (prev.find(m => m.id === payload.new.id)) return prev;
            return [...prev, {
              id: payload.new.id,
              fromMe: false,
              text: payload.new.content,
              time: new Date(payload.new.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            }];
          });
        }
      })
      .subscribe((status) => {
        console.log('[Chat] Realtime subscription status:', status);
      });

    // Polling fallback — re-fetches every 4s to cover cases where Realtime is not enabled
    const pollInterval = setInterval(async () => {
      const { data: latest } = await supabase
        .from('messages')
        .select('id, sender_id, receiver_id, content, created_at')
        .or(`and(sender_id.eq.${user.id},receiver_id.eq.${providerId}),and(sender_id.eq.${providerId},receiver_id.eq.${user.id})`)
        .order('created_at', { ascending: true });

      if (latest && latest.length > 0) {
        setMessages(latest.map(m => ({
          id: m.id,
          fromMe: m.sender_id === user.id,
          text: m.content,
          time: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        })));
      }
    }, 4000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(pollInterval);
    };
  }, [user, providerId]);

  const send = async () => {
    if (!input.trim()) return;

    if (!user) {
      Alert.alert('Not logged in', 'Please log in again to send messages.');
      return;
    }
    if (!providerId) {
      Alert.alert('Chat error', 'No recipient found. Go back and re-open the chat.');
      return;
    }

    const messageText = input.trim();
    setInput('');

    try {
      // Ensure session is fresh
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        Alert.alert('Session expired', 'Your session has expired. Please log in again.');
        setInput(messageText);
        return;
      }

      console.log('[Chat] Sending:', {
        auth_uid: sessionData.session.user.id,
        sender_id: user.id,
        receiver_id: providerId,
        match: sessionData.session.user.id === user.id,
      });

      const { data, error } = await supabase
        .from('messages')
        .insert({
          sender_id: sessionData.session.user.id, // use live session UID, not stale state
          receiver_id: providerId,
          content: messageText,
          is_read: false,
        })
        .select('id, content, created_at, sender_id');

      if (error) {
        console.error('[Chat] Insert error:', JSON.stringify(error));
        Alert.alert(
          'Send failed',
          `Error: ${error.message}\nCode: ${error.code}\n\nThis is usually an RLS policy issue. Make sure the messages table allows INSERT for authenticated users.`
        );
        setInput(messageText);
        return;
      }

      const result = data?.[0];
      if (result) {
        console.log('[Chat] Message saved to Supabase:', result.id);
        setMessages((prev) => {
          if (prev.find(m => m.id === result.id)) return prev;
          return [...prev, {
            id: result.id,
            fromMe: true,
            text: result.content,
            time: new Date(result.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          }];
        });
      } else {
        // Empty data + no error = RLS silently blocked the insert (row not saved to Supabase)
        console.error('[Chat] RLS silent block: insert returned empty. Row NOT saved to Supabase.');
        Alert.alert(
          'Message not saved',
          'Your message could not be saved to the database.\n\nThis is an RLS policy issue in Supabase.\n\nPlease go to Supabase Dashboard → Authentication → Policies → messages table and make sure the INSERT policy exists:\n\nWITH CHECK: (auth.uid() = sender_id)'
        );
        setInput(messageText);
      }
    } catch (err: any) {
      console.error('[Chat] Unexpected error:', err);
      Alert.alert('Unexpected error', String(err?.message || err));
      setInput(messageText);
    }
  };

  const initials = (name: string) => name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase();

  const Container = KeyboardAvoidingView;
  const containerProps = {
    behavior: Platform.OS === 'ios' ? 'padding' as const : 'height' as const,
    keyboardVerticalOffset: Platform.OS === 'ios' ? 90 : 0,
  };

  return (
    <Container style={styles.flex} {...containerProps}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.iconBtn}>
          <ChevronLeft size={22} color={theme.colors.white} strokeWidth={2.4} />
        </Pressable>
        {partnerImage ? (
          <Image source={{ uri: partnerImage }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarWrap}>
            <Text style={styles.avatarText}>{initials(partnerName)}</Text>
          </View>
        )}
        <View style={styles.headerInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.name}>{partnerName}</Text>
            {isVerified && <ShieldCheck size={14} color="#14B8A6" strokeWidth={2.4} />}
          </View>
          <View style={styles.statusRow}>
            <View style={styles.statusDot} />
            <Text style={styles.status}>Online</Text>
          </View>
        </View>
      </View>

      <View style={styles.mainChatContainer}>
        {/* Message List */}
        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={theme.colors.accent} />
          </View>
        ) : (
          <ScrollView
            ref={scrollViewRef}
            style={styles.chat}
            contentContainerStyle={styles.chatContent}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
            onLayout={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
          >
            <View style={styles.datePill}><Text style={styles.dateText}>Today</Text></View>
            {messages.map((m) => (
              <View
                key={m.id}
                style={[
                  styles.msgRow,
                  m.fromMe ? styles.msgRowRight : styles.msgRowLeft,
                ]}
              >
                {/* Partner avatar on the left */}
                {!m.fromMe && (
                  partnerImage ? (
                    <Image source={{ uri: partnerImage }} style={styles.msgAvatar} />
                  ) : (
                    <View style={styles.msgAvatarWrap}>
                      <Text style={styles.msgAvatarText}>{initials(partnerName)}</Text>
                    </View>
                  )
                )}

                {/* Bubble */}
                <View style={[
                  styles.bubble,
                  m.fromMe ? styles.bubbleRight : styles.bubbleLeft,
                ]}>
                  <Text style={[
                    styles.bubbleText,
                    m.fromMe ? styles.bubbleTextRight : styles.bubbleTextLeft,
                  ]}>{m.text}</Text>
                  <Text style={[
                    styles.bubbleTime,
                    m.fromMe ? styles.bubbleTimeRight : styles.bubbleTimeLeft,
                  ]}>{m.time}</Text>
                </View>

                {/* My avatar on the right */}
                {m.fromMe && (
                  currentUserAvatar ? (
                    <Image source={{ uri: currentUserAvatar }} style={styles.msgAvatar} />
                  ) : (
                    <View style={styles.msgAvatarWrap}>
                      <Text style={styles.msgAvatarText}>{initials(currentUserName)}</Text>
                    </View>
                  )
                )}
              </View>
            ))}
          </ScrollView>
        )}

        {/* Input Bar */}
        <View style={[styles.inputBar, { paddingBottom: (insets.bottom > 0 && !keyboardVisible) ? insets.bottom : 12 }]}>
          <Pressable style={styles.bookActionBtn} onPress={openBookingModal}>
            <Calendar size={18} color={theme.colors.accent} strokeWidth={2.2} />
          </Pressable>
          <TextInput
            ref={inputRef}
            value={input}
            onChangeText={setInput}
            placeholder="Type a message..."
            placeholderTextColor={theme.colors.textSecondary}
            style={styles.input}
            multiline
          />
          <Pressable onPress={send} style={({ pressed }) => [styles.sendBtn, pressed && styles.sendBtnPressed]}>
            <Send size={16} color={theme.colors.white} strokeWidth={2.2} />
          </Pressable>
        </View>

        {/* Quick Booking Modal */}
        <Modal
          visible={bookingModalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setBookingModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <View style={styles.modalCardHeader}>
                <Text style={styles.modalCardTitle}>Request Appointment</Text>
                <Pressable style={styles.modalCardCloseBtn} onPress={() => setBookingModalVisible(false)}>
                  <X size={18} color={theme.colors.textPrimary} strokeWidth={2} />
                </Pressable>
              </View>

              <Text style={styles.modalSubtitle}>Send booking request to {partnerName}</Text>

              {/* Service Selection */}
              {providerServices.length > 0 && (
                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionLabel}>Select Service</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.servicePillRow}>
                    {providerServices.map((s) => {
                      const isSel = selectedService?.id === s.id;
                      return (
                        <Pressable
                          key={s.id}
                          style={[styles.servicePill, isSel && styles.servicePillActive]}
                          onPress={() => setSelectedService(s)}
                        >
                          <Text style={[styles.servicePillText, isSel && styles.servicePillTextActive]}>
                            {s.name} (CHF {s.price})
                          </Text>
                        </Pressable>
                      );
                    })}
                  </ScrollView>
                </View>
              )}

              {/* Calendar Grid Date Selection */}
              <View style={styles.modalSection}>
                <View style={styles.calendarHeaderRow}>
                  <Text style={styles.modalSectionLabel}>Select Date</Text>
                  <View style={styles.calendarMonthNav}>
                    <Pressable onPress={handlePrevMonth} style={styles.monthNavBtn}>
                      <ChevronLeft size={16} color={theme.colors.textPrimary} strokeWidth={2} />
                    </Pressable>
                    <Text style={styles.monthTitleText}>
                      {calendarMonth.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                    </Text>
                    <Pressable onPress={handleNextMonth} style={styles.monthNavBtn}>
                      <ChevronLeft size={16} color={theme.colors.textPrimary} strokeWidth={2} style={{ transform: [{ rotate: '180deg' }] }} />
                    </Pressable>
                  </View>
                </View>

                {/* Calendar Grid */}
                <View style={styles.calendarBox}>
                  {/* Weekday labels */}
                  <View style={styles.weekdayRow}>
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((w, idx) => (
                      <Text key={idx} style={styles.weekdayText}>{w}</Text>
                    ))}
                  </View>

                  {/* Days Matrix */}
                  <View style={styles.daysGrid}>
                    {getCalendarMatrix(calendarMonth).map((cell, idx) => {
                      if (!cell) {
                        return <View key={'empty_' + idx} style={styles.calendarCell} />;
                      }
                      const isSelected = selectedDateIso === cell.iso;
                      return (
                        <Pressable
                          key={cell.iso}
                          disabled={cell.isPast}
                          onPress={() => setSelectedDateIso(cell.iso)}
                          style={[
                            styles.calendarCell,
                            cell.isPast && styles.calendarCellDisabled,
                          ]}
                        >
                          <View style={[styles.dayBadge, isSelected && styles.dayBadgeActive]}>
                            <Text style={[
                              styles.dayBadgeText,
                              isSelected && styles.dayBadgeTextActive,
                              cell.isPast && styles.dayBadgeTextDisabled,
                            ]}>
                              {cell.day}
                            </Text>
                          </View>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>
              </View>

              {/* Time Slot Selection */}
              <View style={styles.modalSection}>
                <Text style={styles.modalSectionLabel}>Select Time</Text>
                <View style={styles.timeGrid}>
                  {timeSlots.map((t) => {
                    const isSel = selectedTimeSlot === t;
                    return (
                      <Pressable
                        key={t}
                        style={[styles.timeChip, isSel && styles.timeChipActive]}
                        onPress={() => setSelectedTimeSlot(t)}
                      >
                        <Clock size={14} color={isSel ? theme.colors.white : theme.colors.textSecondary} strokeWidth={2} />
                        <Text style={[styles.timeChipText, isSel && styles.timeChipTextActive]}>{t}</Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              {/* Price Summary & Submit */}
              <View style={styles.modalFooterRow}>
                <View>
                  <Text style={styles.totalPriceLabel}>Estimated Price</Text>
                  <Text style={styles.totalPriceValue}>CHF {selectedService?.price || 90}</Text>
                </View>
                <Pressable
                  style={styles.confirmBookingBtn}
                  onPress={handleConfirmBooking}
                  disabled={bookingSubmitting}
                >
                  {bookingSubmitting ? (
                    <ActivityIndicator size="small" color={theme.colors.white} />
                  ) : (
                    <Text style={styles.confirmBookingBtnText}>Request Booking</Text>
                  )}
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </Container>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: theme.colors.background },
  mainChatContainer: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingTop: 52, paddingBottom: 14, backgroundColor: '#0F3A40', gap: 10 },
  iconBtn: { width: 38, height: 38, borderRadius: 12, backgroundColor: 'rgba(255, 255, 255, 0.15)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.25)' },
  avatar: { width: 42, height: 42, borderRadius: 21, backgroundColor: 'rgba(255, 255, 255, 0.2)' },
  avatarWrap: { width: 42, height: 42, borderRadius: 21, backgroundColor: 'rgba(255, 255, 255, 0.15)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.25)' },
  avatarText: { fontFamily: 'Inter-Bold', fontSize: 16, color: theme.colors.white },
  headerInfo: { flex: 1 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  name: { fontFamily: 'Inter-Bold', fontSize: 16, color: theme.colors.white },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 2 },
  statusDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#14B8A6' },
  status: { fontFamily: 'Inter-Medium', fontSize: 12, color: '#14B8A6' },
  chat: { flex: 1 },
  chatContent: { paddingHorizontal: 12, paddingVertical: 16, gap: 10 },
  datePill: { alignSelf: 'center', backgroundColor: theme.colors.card, paddingVertical: 6, paddingHorizontal: 16, borderRadius: 999, borderWidth: 1, borderColor: theme.colors.border, marginBottom: 4 },
  dateText: { fontFamily: 'Inter-SemiBold', fontSize: 11, color: theme.colors.textSecondary, fontWeight: '600' },
  // Message row — direction flips per sender
  msgRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, maxWidth: '100%' },
  msgRowLeft: { justifyContent: 'flex-start' },
  msgRowRight: { justifyContent: 'flex-end' },
  msgAvatar: { width: 30, height: 30, borderRadius: 15, backgroundColor: theme.colors.background },
  msgAvatarWrap: { width: 30, height: 30, borderRadius: 15, backgroundColor: theme.colors.accentLight, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: theme.colors.border },
  msgAvatarText: { fontFamily: 'Inter-Bold', fontSize: 11, color: theme.colors.accent },
  // Bubble styles
  bubble: { maxWidth: '72%', paddingHorizontal: 14, paddingTop: 9, paddingBottom: 6, borderRadius: 18 },
  bubbleLeft: { backgroundColor: theme.colors.card, borderTopLeftRadius: 4, borderWidth: 1, borderColor: theme.colors.border },
  bubbleRight: { backgroundColor: theme.colors.accent, borderTopRightRadius: 4 },
  bubbleText: { fontFamily: 'Inter-Regular', fontSize: 14.5, lineHeight: 21 },
  bubbleTextLeft: { color: theme.colors.textPrimary },
  bubbleTextRight: { color: '#FFFFFF' },
  bubbleTime: { fontFamily: 'Inter-Regular', fontSize: 10, marginTop: 4 },
  bubbleTimeLeft: { color: theme.colors.textSecondary, textAlign: 'left' },
  bubbleTimeRight: { color: 'rgba(255,255,255,0.7)', textAlign: 'right' },
  inputBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 12, backgroundColor: theme.colors.card, borderTopWidth: 1, borderTopColor: theme.colors.border, gap: 10 },
  bookActionBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: theme.colors.accentLight, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(15, 58, 64, 0.15)' },
  input: { flex: 1, fontFamily: 'Inter-Regular', fontSize: 14, color: theme.colors.textPrimary, backgroundColor: theme.colors.background, borderRadius: 20, borderWidth: 1, borderColor: theme.colors.border, paddingHorizontal: 16, paddingVertical: 8, maxHeight: 100 },
  sendBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: theme.colors.accent, alignItems: 'center', justifyContent: 'center', shadowColor: theme.colors.accent, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 3, elevation: 2 },
  sendBtnPressed: { opacity: 0.8 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.background },

  // Quick Booking Modal & Calendar Grid styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(15, 30, 36, 0.6)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: theme.colors.card, borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 20, paddingBottom: 30, gap: 14 },
  modalCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  modalCardTitle: { fontFamily: 'Inter-Bold', fontSize: 20, color: theme.colors.textPrimary },
  modalCardCloseBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: theme.colors.background, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: theme.colors.border },
  modalSubtitle: { fontFamily: 'Inter-Medium', fontSize: 13, color: theme.colors.textSecondary, marginTop: -8 },
  modalSection: { gap: 8 },
  modalSectionLabel: { fontFamily: 'Inter-Bold', fontSize: 13, color: theme.colors.textPrimary },
  servicePillRow: { gap: 8, paddingVertical: 2 },
  servicePill: { paddingHorizontal: 14, height: 34, borderRadius: 17, backgroundColor: theme.colors.background, borderWidth: 1, borderColor: theme.colors.border, alignItems: 'center', justifyContent: 'center' },
  servicePillActive: { backgroundColor: theme.colors.accent, borderColor: theme.colors.accent },
  servicePillText: { fontFamily: 'Inter-Medium', fontSize: 12, color: theme.colors.textSecondary },
  servicePillTextActive: { color: theme.colors.white, fontFamily: 'Inter-Bold' },

  // Calendar Grid UI Styles
  calendarHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  calendarMonthNav: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  monthNavBtn: { width: 28, height: 28, borderRadius: 14, backgroundColor: theme.colors.background, borderWidth: 1, borderColor: theme.colors.border, alignItems: 'center', justifyContent: 'center' },
  monthTitleText: { fontFamily: 'Inter-Bold', fontSize: 13, color: theme.colors.textPrimary, width: 85, textAlign: 'center' },
  calendarBox: { backgroundColor: theme.colors.background, borderRadius: 16, borderWidth: 1, borderColor: theme.colors.border, padding: 10, gap: 6 },
  weekdayRow: { flexDirection: 'row', justifyContent: 'space-around', borderBottomWidth: 1, borderBottomColor: theme.colors.border, paddingBottom: 6 },
  weekdayText: { fontFamily: 'Inter-Bold', fontSize: 11, color: theme.colors.textSecondary, width: 28, textAlign: 'center' },
  daysGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  calendarCell: { width: '14.28%', height: 32, alignItems: 'center', justifyContent: 'center' },
  calendarCellDisabled: { opacity: 0.35 },
  dayBadge: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  dayBadgeActive: { backgroundColor: theme.colors.accent },
  dayBadgeText: { fontFamily: 'Inter-Medium', fontSize: 12, color: theme.colors.textPrimary },
  dayBadgeTextActive: { color: theme.colors.white, fontFamily: 'Inter-Bold' },
  dayBadgeTextDisabled: { color: theme.colors.textSecondary },

  timeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  timeChip: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, height: 34, borderRadius: 12, backgroundColor: theme.colors.background, borderWidth: 1, borderColor: theme.colors.border },
  timeChipActive: { backgroundColor: theme.colors.accent, borderColor: theme.colors.accent },
  timeChipText: { fontFamily: 'Inter-Medium', fontSize: 12, color: theme.colors.textSecondary },
  timeChipTextActive: { color: theme.colors.white, fontFamily: 'Inter-Bold' },
  modalFooterRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4, paddingTop: 12, borderTopWidth: 1, borderTopColor: theme.colors.border },
  totalPriceLabel: { fontFamily: 'Inter-Medium', fontSize: 11, color: theme.colors.textSecondary },
  totalPriceValue: { fontFamily: 'Inter-Bold', fontSize: 18, color: theme.colors.accent },
  confirmBookingBtn: { backgroundColor: theme.colors.accent, paddingHorizontal: 22, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  confirmBookingBtnText: { fontFamily: 'Inter-Bold', fontSize: 14, color: theme.colors.white },
});

