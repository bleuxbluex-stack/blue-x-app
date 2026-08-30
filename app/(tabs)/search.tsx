import { View, Text, StyleSheet, ScrollView, Pressable, TextInput, Image, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Search, SlidersHorizontal, ShieldCheck, X, Star, Heart, User } from 'lucide-react-native';
import { Card } from '@/components/ui';
import { supabase } from '@/services/supabase';
import { theme } from '@/constants/theme';
import { getValidProviderImage } from '@/services/cloudinary';

const filters = ['All', 'Verified', 'Top Rated'];

interface Category {
  id: string;
  name: string;
  slug: string | null;
}

interface ProviderDisplay {
  id: string; // user_id
  name: string;
  categoryName: string;
  categorySlug: string;
  verified: boolean;
  price: number;
  rating: string;
  reviews: string;
  image: string | null;
  experience_years: number;
}

const CATEGORY_SLUGS = [
  'electrician',
  'plumber',
  'cleaner',
  'cleaner',
  'gardener',
  'carpenter',
  'childcare',
  'movers'
];

export default function SearchScreen() {
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCategorySlug, setActiveCategorySlug] = useState<string | null>(null);
  const [providers, setProviders] = useState<ProviderDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [likedProviders, setLikedProviders] = useState<Record<string, boolean>>({});

  useEffect(() => {
    (async () => {
      try {
        const [{ data: cats, error: catsErr }, { data: profiles, error: profilesErr }, { data: userProfiles }, { data: providerServices }] = await Promise.all([
          supabase.from('service_categories').select('id, name, slug').order('name'),
          supabase.from('provider_profiles').select('user_id, company_name, hourly_rate, is_verified, experience_years, company_logo_url, selfie_url'),
          supabase.from('profiles').select('id, full_name, avatar_url'),
          supabase.from('provider_services').select('id, provider_id, category_id, name, price')
        ]);

        if (catsErr) console.log('Categories error:', catsErr.message);
        if (profilesErr) console.log('Profiles error:', profilesErr.message);

        const categoriesList = cats || [];
        setCategories(categoriesList);

        const profilesList = profiles || [];
        const userMap = new Map((userProfiles || []).map(u => [u.id, u]));

        // Group services by provider_id
        const servicesByProvider = new Map<string, any[]>();
        (providerServices || []).forEach((s) => {
          if (!servicesByProvider.has(s.provider_id)) {
            servicesByProvider.set(s.provider_id, []);
          }
          servicesByProvider.get(s.provider_id)!.push(s);
        });

        const mapped: ProviderDisplay[] = profilesList.map((p, i) => {
          const userProfile = userMap.get(p.user_id);
          const name = p.company_name || userProfile?.full_name || `Provider (${p.user_id.slice(0, 5)})`;
          
          const pSvcs = servicesByProvider.get(p.user_id) || [];
          const primaryCatId = pSvcs[0]?.category_id;
          
          let cat = categoriesList.find(c => c.id === primaryCatId);
          if (!cat) {
            const fallbackSlug = CATEGORY_SLUGS[i % CATEGORY_SLUGS.length];
            cat = categoriesList.find(c => c.slug === fallbackSlug);
          }

          const slug = cat?.slug || CATEGORY_SLUGS[i % CATEGORY_SLUGS.length];
          const rating = (4.5 + (i * 0.1) % 0.5).toFixed(1);
          const reviews = String(50 + (i * 24) % 150);

          const rawImageUrl = p.company_logo_url || p.selfie_url || userProfile?.avatar_url || null;
          const imageUrl = getValidProviderImage(rawImageUrl);

          return {
            id: p.user_id,
            name,
            categoryName: cat?.name || pSvcs[0]?.name || 'General Service',
            categorySlug: slug,
            verified: p.is_verified ?? true,
            price: p.hourly_rate || (pSvcs[0]?.price ? Number(pSvcs[0].price) : 90),
            rating,
            reviews,
            image: imageUrl,
            experience_years: p.experience_years ?? 0
          };
        });

        setProviders(mapped);
      } catch (err) {
        console.log('Error loading search providers:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const toggleLike = (id: string) => {
    setLikedProviders((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const initials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  const filtered = providers.filter((p) => {
    // Search query
    if (query) {
      const q = query.toLowerCase();
      if (!p.name.toLowerCase().includes(q) && !p.categoryName.toLowerCase().includes(q)) return false;
    }

    // Category slug filter
    if (activeCategorySlug && p.categorySlug !== activeCategorySlug) return false;

    // Tab filter
    if (activeFilter === 'Verified') return p.verified;
    if (activeFilter === 'Top Rated') return parseFloat(p.rating) >= 4.7;

    return true;
  });

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Providers</Text>
        <Pressable style={styles.filterBtnIcon}>
          <SlidersHorizontal size={20} color={theme.colors.accent} strokeWidth={2} />
        </Pressable>
      </View>

      {/* Search */}
      <View style={styles.searchRow}>
        <View style={styles.searchBar}>
          <Search size={18} color={theme.colors.textSecondary} strokeWidth={2} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search providers or services"
            placeholderTextColor={theme.colors.textSecondary}
            style={styles.input}
          />
          {query.length > 0 && (
            <Pressable onPress={() => setQuery('')} style={styles.clearBtn}>
              <X size={14} color={theme.colors.textPrimary} strokeWidth={2.5} />
            </Pressable>
          )}
        </View>
      </View>

      {/* Category filter pills */}
      <View style={styles.filterRowContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
          <Pressable
            onPress={() => setActiveCategorySlug(null)}
            style={[styles.filterChip, !activeCategorySlug && styles.filterChipActive]}
          >
            <Text style={[styles.filterText, !activeCategorySlug && styles.filterTextActive]}>All</Text>
          </Pressable>
          {categories.map((c) => (
            <Pressable
              key={c.id}
              onPress={() => setActiveCategorySlug(activeCategorySlug === c.slug ? null : c.slug)}
              style={[styles.filterChip, activeCategorySlug === c.slug && styles.filterChipActive]}
            >
              <Text style={[styles.filterText, activeCategorySlug === c.slug && styles.filterTextActive]}>{c.name}</Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {/* Secondary status filters */}
      <View style={styles.statusFilterRow}>
        {filters.filter(f => f !== 'All').map((f) => (
          <Pressable
            key={f}
            onPress={() => setActiveFilter(activeFilter === f ? 'All' : f)}
            style={[styles.statusChip, activeFilter === f && styles.statusChipActive]}
          >
            <Text style={[styles.statusChipText, activeFilter === f && styles.statusChipTextActive]}>{f}</Text>
          </Pressable>
        ))}
      </View>

      {/* Providers list */}
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {loading ? (
          <ActivityIndicator size="large" color={theme.colors.accent} style={styles.loader} />
        ) : filtered.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No providers found</Text>
            <Text style={styles.emptySub}>Try adjusting your filters or search terms.</Text>
          </View>
        ) : (
          <View style={styles.list}>
            {filtered.map((p) => {
              const isLiked = !!likedProviders[p.id];
              return (
                <Card key={p.id} style={styles.providerCard} onPress={() => router.push(`/provider/${p.id}`)}>
                  {p.image ? (
                    <Image source={{ uri: p.image }} style={styles.providerImg} />
                  ) : (
                    <View style={styles.avatarPlaceholder}>
                      <User size={36} color={theme.colors.accent} strokeWidth={1.8} />
                    </View>
                  )}
                  <View style={styles.providerInfo}>
                    <View style={styles.nameRow}>
                      <Text style={styles.providerName} numberOfLines={1}>{p.name}</Text>
                      <Pressable onPress={() => toggleLike(p.id)} style={styles.likeBtn}>
                        <Heart
                          size={16}
                          color={isLiked ? '#EF4444' : theme.colors.textSecondary}
                          fill={isLiked ? '#EF4444' : 'transparent'}
                          strokeWidth={2}
                        />
                      </Pressable>
                    </View>
                    
                    <Text style={styles.providerService}>{p.categoryName}</Text>
                    <Text style={styles.experienceText}>{p.experience_years} Years Experience</Text>

                    <View style={styles.bottomRow}>
                      <Text style={styles.price}>CHF {p.price} / hr</Text>
                      {p.verified && (
                        <View style={styles.verifiedBadge}>
                          <ShieldCheck size={12} color={theme.colors.accent} strokeWidth={2.5} />
                          <Text style={styles.verifiedText}>VERIFIED</Text>
                        </View>
                      )}
                    </View>
                  </View>
                </Card>
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
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 56, paddingBottom: 14 },
  title: { fontFamily: 'Inter-Bold', fontSize: 24, color: theme.colors.textPrimary, letterSpacing: -0.5 },
  filterBtnIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: theme.colors.card, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: theme.colors.border },
  searchRow: { paddingHorizontal: 20, marginBottom: 12 },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.card, borderRadius: 16, borderColor: theme.colors.border, borderWidth: 1, paddingHorizontal: 16, paddingVertical: 12, gap: 10 },
  input: { flex: 1, fontFamily: 'Inter-Regular', fontSize: 14, color: theme.colors.textPrimary, padding: 0 },
  clearBtn: { width: 20, height: 20, borderRadius: 10, backgroundColor: theme.colors.border, alignItems: 'center', justifyContent: 'center' },
  filterRowContainer: { height: 46, marginBottom: 4 },
  filterRow: { paddingHorizontal: 20, gap: 8 },
  filterChip: { paddingHorizontal: 16, height: 36, borderRadius: 18, backgroundColor: theme.colors.card, borderWidth: 1, borderColor: theme.colors.border, alignItems: 'center', justifyContent: 'center' },
  filterChipActive: { backgroundColor: theme.colors.accent, borderColor: theme.colors.accent },
  filterText: { fontFamily: 'Inter-Medium', fontSize: 13, color: theme.colors.textSecondary },
  filterTextActive: { color: theme.colors.white },
  statusFilterRow: { flexDirection: 'row', paddingHorizontal: 20, gap: 8, marginBottom: 10 },
  statusChip: { paddingHorizontal: 12, height: 30, borderRadius: 15, backgroundColor: theme.colors.accentLight, alignItems: 'center', justifyContent: 'center' },
  statusChipActive: { backgroundColor: theme.colors.mint },
  statusChipText: { fontFamily: 'Inter-Medium', fontSize: 12, color: theme.colors.accent },
  statusChipTextActive: { color: theme.colors.white },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 20, paddingBottom: 30 },
  list: { gap: 14 },
  providerCard: { flexDirection: 'row', padding: 12, gap: 12, backgroundColor: theme.colors.card, borderRadius: 20, borderWidth: 1, borderColor: theme.colors.border },
  providerImg: { width: 90, height: 110, borderRadius: 14, backgroundColor: theme.colors.background },
  providerInfo: { flex: 1, justifyContent: 'space-between' },
  nameRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  providerName: { fontFamily: 'Inter-Bold', fontSize: 16, color: theme.colors.textPrimary, flex: 1, marginRight: 8 },
  likeBtn: { padding: 4 },
  providerService: { fontFamily: 'Inter-Medium', fontSize: 13, color: theme.colors.mint, marginTop: 2 },
  experienceText: { fontFamily: 'Inter-Regular', fontSize: 12, color: theme.colors.textSecondary, marginTop: 2 },
  bottomRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  price: { fontFamily: 'Inter-Bold', fontSize: 14, color: theme.colors.textPrimary },
  verifiedBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: theme.colors.accentLight, paddingVertical: 4, paddingHorizontal: 8, borderRadius: 8 },
  verifiedText: { fontFamily: 'Inter-Bold', fontSize: 10, color: theme.colors.accent, letterSpacing: 0.5 },
  loader: { marginTop: 40 },
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60, backgroundColor: theme.colors.card, borderRadius: 20, borderWidth: 1, borderColor: theme.colors.border },
  emptyTitle: { fontFamily: 'Inter-Bold', fontSize: 16, color: theme.colors.textPrimary },
  emptySub: { fontFamily: 'Inter-Regular', fontSize: 13, color: theme.colors.textSecondary, marginTop: 4, textAlign: 'center' },
  avatarPlaceholder: { width: 90, height: 110, borderRadius: 14, backgroundColor: theme.colors.accentLight, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: theme.colors.border },
  avatarPlaceholderText: { fontFamily: 'Inter-Bold', fontSize: 24, color: theme.colors.accent },
});
