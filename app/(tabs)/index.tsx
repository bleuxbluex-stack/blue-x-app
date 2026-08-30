// BlueX App - Home Screen
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator, Image } from 'react-native';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import * as Location from 'expo-location';
import { Search, Star, ShieldCheck, MapPin, Zap, ChevronDown, Heart, Brush, Wrench, Sparkles, Paintbrush, ChevronRight, Droplet, Leaf, Hammer, Truck, PawPrint, User, Bell, Grid } from 'lucide-react-native';
import { Card } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/context/LanguageContext';
import { supabase } from '@/services/supabase';
import { theme } from '@/constants/theme';
import { useIsFocused } from '@react-navigation/native';
import { getValidProviderImage } from '@/services/cloudinary';

interface Category {
  id: string;
  name: string;
  slug: string | null;
  icon: string | null;
  description: string | null;
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

interface CategoryStyleConfig {
  bgColor: string;
  borderColor: string;
  titleColor: string;
  subtextColor: string;
  iconColor: string;
  tagline: string;
}

const CATEGORY_STYLE_MAP: Record<string, CategoryStyleConfig> = {
  electrician: {
    bgColor: '#FFFBEB', // Warm Yellow
    borderColor: '#FDE68A',
    titleColor: '#78350F',
    subtextColor: '#B45309',
    iconColor: '#D97706',
    tagline: 'Instant Power & Wiring Help',
  },
  plumber: {
    bgColor: '#EFF6FF', // Sky Blue
    borderColor: '#BFDBFE',
    titleColor: '#1E3A8A',
    subtextColor: '#1D4ED8',
    iconColor: '#2563EB',
    tagline: 'Leaks, Pipes & Fitting Experts',
  },
  cleaner: {
    bgColor: '#F0FDF4', // Mint Fresh
    borderColor: '#BBF7D0',
    titleColor: '#064E3B',
    subtextColor: '#047857',
    iconColor: '#059669',
    tagline: 'Home & Office Deep Clean',
  },
  painter: {
    bgColor: '#FDF2F8', // Soft Pink
    borderColor: '#FBCFE8',
    titleColor: '#500724',
    subtextColor: '#9D174D',
    iconColor: '#DB2777',
    tagline: 'Walls & finishes',
  },
  gardener: {
    bgColor: '#F0FDF4', // Emerald Green
    borderColor: '#BBF7D0',
    titleColor: '#14532D',
    subtextColor: '#15803D',
    iconColor: '#16A34A',
    tagline: 'Lawn & gardens',
  },
  carpenter: {
    bgColor: '#FFF7ED', // Warm Orange
    borderColor: '#FFEDD5',
    titleColor: '#7C2D12',
    subtextColor: '#C2410C',
    iconColor: '#EA580C',
    tagline: 'Woodwork & fixing',
  },
  movers: {
    bgColor: '#F5F3FF', // Soft Purple
    borderColor: '#DDD6FE',
    titleColor: '#4C1D95',
    subtextColor: '#6D28D9',
    iconColor: '#7C3AED',
    tagline: 'Packing & shifting',
  },
  childcare: {
    bgColor: '#FEF2F2', // Soft Red
    borderColor: '#FEE2E2',
    titleColor: '#7F1D1D',
    subtextColor: '#B91C1C',
    iconColor: '#DC2626',
    tagline: 'Nannies & sitting',
  },
  petcare: {
    bgColor: '#ECFEFF', // Soft Cyan
    borderColor: '#CFFAFE',
    titleColor: '#164E63',
    subtextColor: '#0E7490',
    iconColor: '#0891B2',
    tagline: 'Walks & boarding',
  },
};

const getCategoryStyleConfig = (slug: string | null): CategoryStyleConfig => {
  const defaultStyle: CategoryStyleConfig = {
    bgColor: '#F8FAFC',
    borderColor: '#E2E8F0',
    titleColor: '#0F172A',
    subtextColor: '#475569',
    iconColor: '#64748B',
    tagline: 'Professional care',
  };
  if (!slug) return defaultStyle;
  return CATEGORY_STYLE_MAP[slug] || defaultStyle;
};

const CATEGORY_IMAGE_MAP: Record<string, string> = {
  electrician: 'https://img.icons8.com/color/96/lightning-bolt.png',
  plumber: 'https://img.icons8.com/color/96/plumbing.png',
  cleaner: 'https://img.icons8.com/color/96/vacuum-cleaner.png',
  painter: 'https://img.icons8.com/color/96/paint-brush.png',
  gardener: 'https://img.icons8.com/color/96/sprout.png',
  carpenter: 'https://img.icons8.com/color/96/hammer.png',
  movers: 'https://img.icons8.com/color/96/truck.png',
  childcare: 'https://img.icons8.com/color/96/baby-bottle.png',
  petcare: 'https://img.icons8.com/color/96/dog.png',
};

const getCategoryImage = (slug: string | null): string => {
  const defaultImage = 'https://img.icons8.com/color/96/vacuum-cleaner.png';
  if (!slug) return defaultImage;
  return CATEGORY_IMAGE_MAP[slug] || defaultImage;
};

const CATEGORY_PERSON_IMAGE_MAP: Record<string, any> = {
  electrician: require('../../assets/images/categories/electrician.png'),
  plumber: require('../../assets/images/categories/plumber.png'),
  cleaner: require('../../assets/images/categories/cleaner.png'),
  painter: require('../../assets/images/categories/painter.png'),
  gardener: require('../../assets/images/categories/gardener.png'),
  carpenter: require('../../assets/images/categories/carpenter.png'),
  movers: require('../../assets/images/categories/movers.png'),
  childcare: require('../../assets/images/categories/childcare.png'),
  petcare: require('../../assets/images/categories/petcare.png'),
};

const getCategoryPersonImage = (slug: string | null): any => {
  if (!slug) return null;
  return CATEGORY_PERSON_IMAGE_MAP[slug] || null;
};

export default function HomeScreen() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const isFocused = useIsFocused();

  const [categories, setCategories] = useState<Category[]>([]);
  const [providers, setProviders] = useState<ProviderDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [likedProviders, setLikedProviders] = useState<Record<string, boolean>>({});
  const [locationText, setLocationText] = useState('Zurich, Switzerland');
  const [locating, setLocating] = useState(false);
  const [currentUserName, setCurrentUserName] = useState<string | null>(null);
  const [currentUserAvatar, setCurrentUserAvatar] = useState<string | null>(null);

  const handleGetLocation = async () => {
    setLocating(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        alert('Permission to access location was denied');
        setLocating(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const { latitude, longitude } = location.coords;
      const reverseGeocode = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      if (reverseGeocode && reverseGeocode.length > 0) {
        const place = reverseGeocode[0];
        const city = place.city || place.subregion || place.region || 'Unknown City';
        const country = place.country || 'Switzerland';
        const newLocationStr = `${city}, ${country}`;
        setLocationText(newLocationStr);

        if (user) {
          await supabase
            .from('profiles')
            .update({ city, country })
            .eq('id', user.id);
        }
      } else {
        const latLongStr = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
        setLocationText(latLongStr);
        if (user) {
          await supabase
            .from('profiles')
            .update({ city: latLongStr, country: null })
            .eq('id', user.id);
        }
      }
    } catch (err) {
      console.log('Error getting location:', err);
      alert('Unable to fetch your location. Please check location permissions.');
    } finally {
      setLocating(false);
    }
  };

  useEffect(() => {
    if (!user || !isFocused) return;
    (async () => {
      try {
        const { data } = await supabase
          .from('profiles')
          .select('full_name, avatar_url, city, country')
          .eq('id', user.id)
          .maybeSingle();
        if (data) {
          if (data.full_name) {
            setCurrentUserName(data.full_name);
          }
          if (data.avatar_url) {
            setCurrentUserAvatar(data.avatar_url);
          }
          if (data.city) {
            const locStr = data.country ? `${data.city}, ${data.country}` : data.city;
            setLocationText(locStr);
          }
        }
      } catch (err) {
        console.log('Error updating profile details on focus:', err);
      }
    })();
  }, [user, isFocused]);

  useEffect(() => {
    (async () => {
      try {
        // 1. Fetch service categories, provider profiles, and user profiles
        const [{ data: cats }, { data: pProfs }, { data: userProfiles }, { data: providerServices }] = await Promise.all([
          supabase.from('service_categories').select('id, name, slug, icon, description').order('name'),
          supabase.from('provider_profiles').select('user_id, company_name, hourly_rate, is_verified, experience_years, company_logo_url, selfie_url'),
          supabase.from('profiles').select('id, full_name, avatar_url, city, country'),
          supabase.from('provider_services').select('id, provider_id, category_id, name, price')
        ]);

        const categoriesList = cats || [];
        setCategories(categoriesList);

        const profilesList = pProfs || [];
        const userMap = new Map((userProfiles || []).map(u => [u.id, u]));

        // Group services by provider_id
        const servicesByProvider = new Map<string, any[]>();
        (providerServices || []).forEach((s) => {
          if (!servicesByProvider.has(s.provider_id)) {
            servicesByProvider.set(s.provider_id, []);
          }
          servicesByProvider.get(s.provider_id)!.push(s);
        });

        const currentProf = (userProfiles || []).find(u => u.id === user?.id);
        if (currentProf?.avatar_url) {
          setCurrentUserAvatar(currentProf.avatar_url);
        }
        if (currentProf?.city) {
          const locStr = currentProf.country ? `${currentProf.city}, ${currentProf.country}` : currentProf.city;
          setLocationText(locStr);
        }

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
        console.log('Error loading index data:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const toggleLike = (id: string) => {
    setLikedProviders((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const getCategoryStyles = (slug: string | null) => {
    switch (slug) {
      case 'cleaner':
        return { color: '#0EA5E9' }; // Clean Sky Blue
      case 'plumber':
        return { color: '#3B82F6' }; // Royal Blue
      case 'electrician':
        return { color: '#F59E0B' }; // Electric Amber
      case 'painter':
        return { color: '#EC4899' }; // Vivid Rose
      case 'gardener':
        return { color: '#10B981' }; // Emerald Green
      case 'carpenter':
        return { color: '#F97316' }; // Warm Orange
      case 'movers':
        return { color: '#8B5CF6' }; // Deep Violet
      case 'childcare':
        return { color: '#EF4444' }; // Soft Red
      case 'petcare':
        return { color: '#06B6D4' }; // Bright Cyan
      default:
        return { color: '#6B7280' };
    }
  };

  const getCategoryIcon = (slug: string | null, size: number = 16, customColor?: string) => {
    const styles = getCategoryStyles(slug);
    const color = customColor || styles.color;
    const props = { size, color, strokeWidth: 1.8 };
    switch (slug) {
      case 'cleaner': return <Sparkles {...props} />;
      case 'plumber': return <Droplet {...props} />;
      case 'electrician': return <Zap {...props} />;
      case 'painter': return <Paintbrush {...props} />;
      case 'gardener': return <Leaf {...props} />;
      case 'carpenter': return <Hammer {...props} />;
      case 'movers': return <Truck {...props} />;
      case 'childcare': return <Heart {...props} />;
      case 'petcare': return <PawPrint {...props} />;
      default: return <Brush {...props} />;
    }
  };

  const displayName = currentUserName || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
  const firstName = displayName.split(' ')[0];

  return (
    <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Pressable onPress={() => router.push('/profile')}>
            <Image
              source={{ uri: currentUserAvatar || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=compress&cs=tinysrgb&h=150&w=150' }}
              style={styles.avatar}
            />
          </Pressable>
          <View style={styles.greetingContainer}>
            <Text style={styles.greetingText}>{t('hello')}, {firstName} 👋</Text>
            <Text style={styles.subGreetingText}>What service do you need today?</Text>
          </View>
          <Pressable onPress={() => router.push('/notifications')} style={styles.bellBtn}>
            <Bell size={22} color={theme.colors.white} strokeWidth={2} />
            <View style={styles.bellBadge} />
          </Pressable>
        </View>

        {/* Search */}
        <Pressable style={styles.searchBar} onPress={() => router.push('/search')}>
          <Search size={18} color={theme.colors.accent} strokeWidth={2} />
          <Text style={styles.searchPlaceholder}>{t('search_placeholder')}</Text>
        </Pressable>
      </View>

      <View style={styles.body}>
        {/* Popular Categories */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{t('popular_categories')}</Text>
          <Pressable onPress={() => router.push('/search')}>
            <Text style={styles.seeAll}>{t('see_all')}</Text>
          </Pressable>
        </View>

        {loading ? (
          <ActivityIndicator size="small" color={theme.colors.accent} />
        ) : (
          <View style={styles.categoriesGrid}>
            {categories.slice(0, 6).map((c) => {
              const config = getCategoryStyleConfig(c.slug);
              const personImg = getCategoryPersonImage(c.slug);
              return (
                <Pressable
                  key={c.id}
                  style={styles.newCategoryCard}
                  onPress={() => router.push('/search')}
                >
                  <View style={styles.newCategoryTextContainer}>
                    <Text style={styles.newCategoryTitle}>
                      {c.name}
                    </Text>
                    <Text style={styles.newCategorySubtext} numberOfLines={2}>
                      {config.tagline}
                    </Text>
                  </View>
                  {personImg ? (
                    <Image source={personImg} style={styles.newCategoryPersonImage} />
                  ) : (
                    <View style={styles.newCategoryIconContainer}>
                      {getCategoryIcon(c.slug, 18, theme.colors.accent)}
                    </View>
                  )}
                </Pressable>
              );
            })}
          </View>
        )}

        {/* Recommended providers */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{t('top_providers')}</Text>
          <Pressable onPress={() => router.push('/search')}>
            <Text style={styles.seeAll}>{t('see_all')}</Text>
          </Pressable>
        </View>

        {loading ? (
          <ActivityIndicator size="small" color={theme.colors.accent} />
        ) : providers.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyBoxText}>No providers available yet.</Text>
          </View>
        ) : (
          <View style={styles.recommendedList}>
            {providers.slice(0, 2).map((p) => {
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
                          color={isLiked ? '#EC4899' : theme.colors.textSecondary}
                          fill={isLiked ? '#EC4899' : 'transparent'}
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
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: theme.colors.background },
  content: { paddingBottom: 40 },
  header: {
    backgroundColor: '#0F3A40',
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 22,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    shadowColor: '#0F3A40',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
  },
  headerTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  greetingContainer: { flex: 1 },
  greetingText: { fontFamily: 'Inter-Bold', fontSize: 24, color: theme.colors.white, letterSpacing: -0.5 },
  subGreetingText: { fontFamily: 'Inter-Regular', fontSize: 14, color: 'rgba(255, 255, 255, 0.8)', marginTop: 4 },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255, 255, 255, 0.2)', borderWidth: 1.5, borderColor: 'rgba(255, 255, 255, 0.4)' },
  bellBtn: { width: 42, height: 42, borderRadius: 12, backgroundColor: 'rgba(255, 255, 255, 0.15)', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.25)', alignItems: 'center', justifyContent: 'center', position: 'relative' },
  bellBadge: { position: 'absolute', top: 10, right: 11, width: 8, height: 8, borderRadius: 4, backgroundColor: '#EF4444' },
  locationSelector: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 16, alignSelf: 'flex-start' },
  locationText: { fontFamily: 'Inter-Medium', fontSize: 13, color: theme.colors.textPrimary },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.3)', paddingHorizontal: 16, paddingVertical: 14, gap: 10, marginTop: 18, shadowColor: '#0A1729', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2 },
  searchPlaceholder: { fontFamily: 'Inter-Regular', fontSize: 14, color: '#64748B' },
  body: { paddingHorizontal: 20, marginTop: 10 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 24, marginBottom: 14 },
  sectionTitle: { fontFamily: 'Inter-Bold', fontSize: 18, color: theme.colors.textPrimary, letterSpacing: -0.3 },
  seeAll: { fontFamily: 'Inter-SemiBold', fontSize: 13, color: theme.colors.mint, fontWeight: '600' },
  categoriesScroll: { gap: 10, paddingRight: 20, paddingVertical: 6 },
  categoryChip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, height: 40, borderRadius: 20, backgroundColor: theme.colors.card, borderWidth: 1, borderColor: theme.colors.border, gap: 8, shadowColor: '#0A1729', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.02, shadowRadius: 4, elevation: 1 },
  categoryChipActive: { backgroundColor: theme.colors.accentLight, borderColor: theme.colors.accent },
  categoryChipText: { fontFamily: 'Inter-SemiBold', fontSize: 13, color: theme.colors.textPrimary, fontWeight: '600' },
  categoryChipTextActive: { color: theme.colors.accent },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 12,
    columnGap: 8,
    paddingVertical: 6,
  },
  newCategoryCard: {
    width: '48.5%',
    height: 80,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#0A1729',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 2,
    elevation: 1,
    overflow: 'hidden',
  },
  newCategoryTextContainer: {
    flex: 1,
    paddingRight: 48,
    justifyContent: 'center',
  },
  newCategoryTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 14.5,
    color: theme.colors.textPrimary,
  },
  newCategorySubtext: {
    fontFamily: 'Inter-Regular',
    fontSize: 11,
    lineHeight: 14,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  newCategoryIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.accentLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  newCategoryPersonImage: {
    position: 'absolute',
    right: 4,
    bottom: 0,
    width: 55,
    height: 75,
    resizeMode: 'contain',
  },
  recommendedList: { gap: 12 },
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
  emptyBox: { paddingVertical: 30, alignItems: 'center', backgroundColor: theme.colors.card, borderRadius: 16, borderWidth: 1, borderColor: theme.colors.border },
  emptyBoxText: { fontFamily: 'Inter-Regular', fontSize: 14, color: theme.colors.textSecondary },
  avatarPlaceholder: { width: 90, height: 110, borderRadius: 14, backgroundColor: theme.colors.accentLight, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: theme.colors.border },
});
