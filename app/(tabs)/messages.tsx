import { View, Text, StyleSheet, ScrollView, Pressable, Image, TextInput, ActivityIndicator, Modal } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { useEffect, useState, useCallback } from 'react';
import { Search, ShieldCheck, Plus, X, User } from 'lucide-react-native';
import { supabase } from '@/services/supabase';
import { useAuth } from '@/hooks/useAuth';
import { theme } from '@/constants/theme';
import { getValidProviderImage } from '@/services/cloudinary';

interface Conversation {
  id: string;
  name: string;
  message: string;
  time: string;
  unread: number;
  image?: string;
  verified: boolean;
}

interface ProviderItem {
  user_id: string;
  name: string;
  categoryName: string;
  avatarUrl: string | null;
  isVerified: boolean;
}

export default function MessagesScreen() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // New Chat Modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [providerSearch, setProviderSearch] = useState('');
  const [providersList, setProvidersList] = useState<ProviderItem[]>([]);
  const [loadingProviders, setLoadingProviders] = useState(false);

  const fetchConversations = useCallback(async () => {
    if (!user) return;
    try {
      const { data: msgs } = await supabase
        .from('messages')
        .select('id, sender_id, receiver_id, content, is_read, created_at')
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order('created_at', { ascending: false })
        .limit(50);

      if (!msgs || msgs.length === 0) {
        setConversations([]);
        return;
      }

      const partnerIds = Array.from(new Set(msgs.map((m) => (m.sender_id === user.id ? m.receiver_id : m.sender_id))));
      const [{ data: profiles }, { data: providerProfiles }] = await Promise.all([
        supabase.from('profiles').select('id, full_name, avatar_url').in('id', partnerIds),
        supabase.from('provider_profiles').select('user_id, is_verified').in('user_id', partnerIds)
      ]);

      const profileMap = new Map((profiles || []).map(p => [p.id, p]));
      const verifiedSet = new Set((providerProfiles || []).filter((p) => p.is_verified).map((p) => p.user_id));

      const convMap = new Map<string, Conversation>();
      msgs.forEach((m) => {
        const partnerId = m.sender_id === user.id ? m.receiver_id : m.sender_id;
        if (!convMap.has(partnerId)) {
          const profile = profileMap.get(partnerId);
          const date = new Date(m.created_at);
          convMap.set(partnerId, {
            id: partnerId,
            name: profile?.full_name || 'User',
            message: m.content,
            time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            unread: m.sender_id !== user.id && !m.is_read ? 1 : 0,
            image: getValidProviderImage(profile?.avatar_url) || undefined,
            verified: verifiedSet.has(partnerId),
          });
        } else if (m.sender_id !== user.id && !m.is_read) {
          const existing = convMap.get(partnerId)!;
          existing.unread++;
        }
      });

      setConversations(Array.from(convMap.values()));
    } catch (err) {
      console.log('Error loading messages from Supabase:', err);
      setConversations([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  useFocusEffect(
    useCallback(() => {
      fetchConversations();
    }, [fetchConversations])
  );

  const openNewChatModal = async () => {
    setModalVisible(true);
    setLoadingProviders(true);
    try {
      const [{ data: profs }, { data: userProfs }, { data: svcs }, { data: cats }] = await Promise.all([
        supabase.from('provider_profiles').select('user_id, company_name, is_verified, company_logo_url, selfie_url'),
        supabase.from('profiles').select('id, full_name, avatar_url'),
        supabase.from('provider_services').select('provider_id, category_id, name'),
        supabase.from('service_categories').select('id, name')
      ]);

      const userMap = new Map((userProfs || []).map(u => [u.id, u]));
      const catMap = new Map((cats || []).map(c => [c.id, c.name]));
      const svcsByProvider = new Map<string, any[]>();
      (svcs || []).forEach(s => {
        if (!svcsByProvider.has(s.provider_id)) svcsByProvider.set(s.provider_id, []);
        svcsByProvider.get(s.provider_id)!.push(s);
      });

      const list: ProviderItem[] = (profs || [])
        .filter(p => p.user_id !== user?.id)
        .map(p => {
          const u = userMap.get(p.user_id);
          const name = p.company_name || u?.full_name || `Provider (${p.user_id.slice(0, 5)})`;
          const pSvcs = svcsByProvider.get(p.user_id) || [];
          const catName = pSvcs[0]?.category_id ? catMap.get(pSvcs[0].category_id) : (pSvcs[0]?.name || 'Service Provider');
          const rawImg = p.company_logo_url || p.selfie_url || u?.avatar_url || null;

          return {
            user_id: p.user_id,
            name,
            categoryName: catName || 'Service Provider',
            avatarUrl: getValidProviderImage(rawImg),
            isVerified: !!p.is_verified,
          };
        });

      setProvidersList(list);
    } catch (err) {
      console.log('Error fetching providers for new chat:', err);
    } finally {
      setLoadingProviders(false);
    }
  };

  const filtered = conversations.filter((c) =>
    !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.message.toLowerCase().includes(search.toLowerCase())
  );

  const filteredProviders = providersList.filter((p) =>
    !providerSearch ||
    p.name.toLowerCase().includes(providerSearch.toLowerCase()) ||
    p.categoryName.toLowerCase().includes(providerSearch.toLowerCase())
  );

  const initials = (name: string) => name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase();

  return (
    <View style={styles.container}>
      {/* Flat Teal Header Block */}
      <View style={styles.headerBlock}>
        <View style={styles.header}>
          <Text style={styles.title}>Messages</Text>
          <Pressable style={styles.plusIconBtn} onPress={openNewChatModal}>
            <Plus size={20} color={theme.colors.white} strokeWidth={2.2} />
          </Pressable>
        </View>

        {/* Search Input Bar */}
        <View style={styles.searchRow}>
          <View style={styles.searchBar}>
            <Search size={18} color={theme.colors.accent} strokeWidth={2} />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Search messages"
              placeholderTextColor="#64748B"
              style={styles.searchInput}
            />
          </View>
        </View>
      </View>

      {/* Chat List */}
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {loading ? (
          <ActivityIndicator size="large" color={theme.colors.accent} style={styles.loader} />
        ) : filtered.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No messages found</Text>
            <Text style={styles.emptySub}>Try searching for a different provider.</Text>
          </View>
        ) : (
          <View style={styles.list}>
            {filtered.map((c) => (
              <Pressable
                key={c.id}
                style={({ pressed }) => [styles.convItem, pressed && styles.convPressed]}
                onPress={() => router.push({ pathname: '/chat', params: { providerId: c.id } })}
              >
                {c.image ? (
                  <Image source={{ uri: c.image }} style={styles.avatar} />
                ) : (
                  <View style={styles.avatarFallback}>
                    <Text style={styles.avatarFallbackText}>{initials(c.name)}</Text>
                  </View>
                )}
                
                <View style={styles.convInfo}>
                  <View style={styles.convTop}>
                    <View style={styles.nameRow}>
                      <Text style={styles.convName} numberOfLines={1}>{c.name}</Text>
                      {!!c.verified && <ShieldCheck size={14} color={theme.colors.accent} strokeWidth={2.4} />}
                    </View>
                    <Text style={styles.convTime}>{c.time}</Text>
                  </View>
                  
                  <View style={styles.convBottom}>
                    <Text style={styles.convMsg} numberOfLines={1}>{c.message}</Text>
                    {c.unread > 0 && (
                      <View style={styles.unreadBadge}>
                        <Text style={styles.unreadText}>{c.unread}</Text>
                      </View>
                    )}
                  </View>
                </View>
              </Pressable>
            ))}
          </View>
        )}
      </ScrollView>

      {/* New Chat Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>New Message</Text>
            <Pressable style={styles.modalCloseBtn} onPress={() => setModalVisible(false)}>
              <X size={20} color={theme.colors.white} strokeWidth={2.2} />
            </Pressable>
          </View>

          <View style={styles.modalSearchRow}>
            <View style={styles.modalSearchBar}>
              <Search size={18} color={theme.colors.accent} strokeWidth={2} />
              <TextInput
                value={providerSearch}
                onChangeText={setProviderSearch}
                placeholder="Search provider or service..."
                placeholderTextColor="#64748B"
                style={styles.modalSearchInput}
              />
            </View>
          </View>

          <ScrollView style={styles.modalScroll} contentContainerStyle={styles.modalContent}>
            {loadingProviders ? (
              <ActivityIndicator size="large" color={theme.colors.accent} style={{ marginTop: 40 }} />
            ) : filteredProviders.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyTitle}>No providers found</Text>
                <Text style={styles.emptySub}>Try typing another name or service category.</Text>
              </View>
            ) : (
              filteredProviders.map((p) => (
                <Pressable
                  key={p.user_id}
                  style={({ pressed }) => [styles.providerItem, pressed && styles.convPressed]}
                  onPress={() => {
                    setModalVisible(false);
                    router.push({ pathname: '/chat', params: { providerId: p.user_id } });
                  }}
                >
                  {p.avatarUrl ? (
                    <Image source={{ uri: p.avatarUrl }} style={styles.avatar} />
                  ) : (
                    <View style={styles.avatarFallback}>
                      <User size={22} color={theme.colors.accent} strokeWidth={2} />
                    </View>
                  )}

                  <View style={styles.convInfo}>
                    <View style={styles.nameRow}>
                      <Text style={styles.convName} numberOfLines={1}>{p.name}</Text>
                      {p.isVerified && <ShieldCheck size={14} color={theme.colors.accent} strokeWidth={2.4} />}
                    </View>
                    <Text style={styles.providerCatText}>{p.categoryName}</Text>
                  </View>
                </Pressable>
              ))
            )}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  headerBlock: { backgroundColor: '#0F3A40', paddingBottom: 16, marginBottom: 12 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 56, paddingBottom: 14 },
  title: { fontFamily: 'Inter-Bold', fontSize: 24, color: theme.colors.white, letterSpacing: -0.5 },
  plusIconBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(255, 255, 255, 0.15)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.25)' },
  searchRow: { paddingHorizontal: 20 },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.3)', paddingHorizontal: 16, paddingVertical: 12, gap: 10 },
  searchInput: { flex: 1, fontFamily: 'Inter-Regular', fontSize: 14, color: theme.colors.textPrimary, padding: 0 },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 20, paddingBottom: 30 },
  list: { gap: 4 },
  convItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, gap: 14, borderBottomWidth: 1, borderBottomColor: theme.colors.border },
  convPressed: { opacity: 0.8 },
  avatar: { width: 52, height: 52, borderRadius: 26, backgroundColor: theme.colors.card },
  avatarFallback: { width: 52, height: 52, borderRadius: 26, backgroundColor: theme.colors.card, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: theme.colors.border },
  avatarFallbackText: { fontFamily: 'Inter-Bold', fontSize: 16, color: theme.colors.textPrimary },
  convInfo: { flex: 1, justifyContent: 'space-between', gap: 4 },
  convTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 5, flex: 1, marginRight: 16 },
  convName: { fontFamily: 'Inter-Bold', fontSize: 16, color: theme.colors.textPrimary },
  convTime: { fontFamily: 'Inter-Medium', fontSize: 12, color: theme.colors.textSecondary },
  convBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  convMsg: { fontFamily: 'Inter-Regular', fontSize: 14, color: theme.colors.textSecondary, flex: 1, marginRight: 16 },
  unreadBadge: { width: 20, height: 20, borderRadius: 10, backgroundColor: theme.colors.accent, alignItems: 'center', justifyContent: 'center' },
  unreadText: { fontFamily: 'Inter-Bold', fontSize: 11, color: theme.colors.white },
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 80, backgroundColor: theme.colors.card, borderRadius: 20, borderWidth: 1, borderColor: theme.colors.border },
  emptyTitle: { fontFamily: 'Inter-Bold', fontSize: 16, color: theme.colors.textPrimary },
  emptySub: { fontFamily: 'Inter-Regular', fontSize: 13, color: theme.colors.textSecondary, marginTop: 4, textAlign: 'center' },
  loader: { marginTop: 40 },

  // Modal styles
  modalContainer: { flex: 1, backgroundColor: theme.colors.background },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 56, paddingBottom: 16, backgroundColor: '#0F3A40' },
  modalTitle: { fontFamily: 'Inter-Bold', fontSize: 20, color: theme.colors.white },
  modalCloseBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255, 255, 255, 0.15)', alignItems: 'center', justifyContent: 'center' },
  modalSearchRow: { paddingHorizontal: 20, paddingVertical: 14, backgroundColor: '#0F3A40' },
  modalSearchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 16, paddingHorizontal: 16, paddingVertical: 12, gap: 10 },
  modalSearchInput: { flex: 1, fontFamily: 'Inter-Regular', fontSize: 14, color: theme.colors.textPrimary, padding: 0 },
  modalScroll: { flex: 1 },
  modalContent: { paddingHorizontal: 20, paddingVertical: 10 },
  providerItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, gap: 14, borderBottomWidth: 1, borderBottomColor: theme.colors.border },
  providerCatText: { fontFamily: 'Inter-Regular', fontSize: 13, color: theme.colors.textSecondary, marginTop: 2 },
});
