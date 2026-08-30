import { View, Text, StyleSheet, ScrollView, Pressable, Image, Dimensions, ActivityIndicator } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ShieldCheck, Clock, MessageSquare, ChevronLeft, Check, Star, Award, Heart, Share2 } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, GradientHeader } from '@/components/ui';
import { supabase } from '@/services/supabase';
import { theme } from '@/constants/theme';
import { getValidProviderImage } from '@/services/cloudinary';

const { width } = Dimensions.get('window');

interface ProviderProfile {
  user_id: string;
  bio: string | null;
  hourly_rate: number | null;
  is_verified: boolean | null;
  verification_status: string | null;
  provider_type: string | null;
  company_name: string | null;
  languages: string[];
  skills: string[];
  experience_years: number;
  company_logo_url: string | null;
  selfie_url: string | null;
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

export default function ProviderDetailScreen() {
  const { id } = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const [liked, setLiked] = useState(false);
  const [provider, setProvider] = useState<ProviderProfile | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [categoryName, setCategoryName] = useState('Service');
  const [categorySlug, setCategorySlug] = useState('');
  const [providerServicesList, setProviderServicesList] = useState<string[]>([]);
  const [providerImage, setProviderImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [{ data: prof, error: profErr }, { data: userProfile }, { data: pSvcs }] = await Promise.all([
          supabase
            .from('provider_profiles')
            .select('user_id, bio, hourly_rate, is_verified, verification_status, provider_type, company_name, languages, skills, experience_years, company_logo_url, selfie_url')
            .eq('user_id', id as string)
            .maybeSingle(),
          supabase
            .from('profiles')
            .select('full_name, avatar_url')
            .eq('id', id as string)
            .maybeSingle(),
          supabase
            .from('provider_services')
            .select('id, name, price, description, category_id')
            .eq('provider_id', id as string)
        ]);

        if (profErr) console.log('Profile detail error:', profErr.message);
        setProvider(prof);

        if (prof) {
          const resolvedName = prof.company_name || userProfile?.full_name || `Provider (${prof.user_id.slice(0, 5)})`;
          setDisplayName(resolvedName);

          const rawImageUrl = prof.company_logo_url || prof.selfie_url || userProfile?.avatar_url || null;
          setProviderImage(getValidProviderImage(rawImageUrl));

          const svcList = (pSvcs || []).map(s => s.name);
          setProviderServicesList(svcList);

          // Fetch primary category
          let primaryCatId = pSvcs && pSvcs.length > 0 ? pSvcs[0].category_id : null;
          if (primaryCatId) {
            const { data: cat } = await supabase
              .from('service_categories')
              .select('name, slug')
              .eq('id', primaryCatId)
              .maybeSingle();

            if (cat) {
              setCategoryName(cat.name);
              setCategorySlug(cat.slug || '');
            }
          } else {
            // Consistent fallback slug if no services exist
            const getHashIndex = (str: string) => {
              let hash = 0;
              for (let i = 0; i < str.length; i++) {
                hash = str.charCodeAt(i) + ((hash << 5) - hash);
              }
              return Math.abs(hash);
            };
            const hashIdx = getHashIndex(prof.user_id);
            const resolvedSlug = CATEGORY_SLUGS[hashIdx % CATEGORY_SLUGS.length];
            setCategorySlug(resolvedSlug);
            setCategoryName(resolvedSlug.charAt(0).toUpperCase() + resolvedSlug.slice(1));
          }
        }
      } catch (err) {
        console.log('Error loading provider details:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={theme.colors.accent} />
      </View>
    );
  }

  if (!provider) {
    return (
      <View style={styles.center}>
        <Text style={styles.notFound}>Provider not found</Text>
        <Button label="Go Back" onPress={() => router.back()} style={{ marginTop: 16 }} />
      </View>
    );
  }

  const isVerified = provider.is_verified ?? true;
  const bioText = provider.bio || `Professional ${categoryName} services. Quality work, customer satisfaction guaranteed.`;
  const experienceYears = provider.experience_years ?? 0;
  const hourlyRate = provider.hourly_rate || 90;

  const servicesList = providerServicesList.length > 0 ? providerServicesList : [
    `Standard ${categoryName} Work`,
    `Premium ${categoryName} Package`,
    `Inspection & Diagnostic Service`,
    `Emergency ${categoryName} Repair`,
  ];

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false} contentContainerStyle={[styles.content, { paddingBottom: 110 + insets.bottom }]}>
        {/* Banner header */}
        {providerImage ? (
          <View style={styles.hero}>
            <Image source={{ uri: providerImage }} style={styles.heroImage} />
            <View style={styles.heroOverlay} />
            <View style={styles.topBar}>
              <Pressable onPress={() => router.back()} style={styles.iconBtn}>
                <ChevronLeft size={22} color={theme.colors.white} strokeWidth={2.4} />
              </Pressable>
              <View style={styles.headerRightActions}>
                <Pressable onPress={() => setLiked(!liked)} style={styles.iconBtn}>
                  <Heart size={20} color={liked ? '#EC4899' : theme.colors.white} fill={liked ? '#EC4899' : 'transparent'} strokeWidth={2} />
                </Pressable>
                <Pressable style={styles.iconBtn}>
                  <Share2 size={20} color={theme.colors.white} strokeWidth={2} />
                </Pressable>
              </View>
            </View>
          </View>
        ) : (
          <GradientHeader style={styles.gradientHero}>
            <View style={styles.topBarNoAbsolute}>
              <Pressable onPress={() => router.back()} style={styles.iconBtnDark}>
                <ChevronLeft size={22} color={theme.colors.white} strokeWidth={2.4} />
              </Pressable>
              <View style={styles.headerRightActions}>
                <Pressable onPress={() => setLiked(!liked)} style={styles.iconBtnDark}>
                  <Heart size={20} color={liked ? '#EC4899' : theme.colors.white} fill={liked ? '#EC4899' : 'transparent'} strokeWidth={2} />
                </Pressable>
                <Pressable style={styles.iconBtnDark}>
                  <Share2 size={20} color={theme.colors.white} strokeWidth={2} />
                </Pressable>
              </View>
            </View>
          </GradientHeader>
        )}

        {/* Profile Card Overlay */}
        <View style={[styles.profileCard, !providerImage && styles.profileCardNoImage]}>
          {isVerified && (
            <View style={styles.verifiedBadge}>
              <ShieldCheck size={14} color={theme.colors.accent} strokeWidth={2.5} />
              <Text style={styles.verifiedText}>VERIFIED PROVIDER</Text>
            </View>
          )}

          <Text style={styles.providerName}>{displayName}</Text>
          <Text style={styles.providerService}>{categoryName}</Text>

          <View style={styles.ratingRow}>
            <Star size={16} color={theme.colors.mint} fill={theme.colors.mint} strokeWidth={0} />
            <Text style={styles.ratingText}>4.8 (128 reviews)</Text>
          </View>
        </View>

        <View style={styles.body}>
          {/* Stats Cards Row */}
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Clock size={20} color={theme.colors.accent} strokeWidth={2} />
              <Text style={styles.statTitle}>Experience</Text>
              <Text style={styles.statValue}>{experienceYears}+ Years</Text>
            </View>
            <View style={styles.statCard}>
              <Award size={20} color={theme.colors.accent} strokeWidth={2} />
              <Text style={styles.statTitle}>Hourly Rate</Text>
              <Text style={styles.statValue}>CHF {hourlyRate}</Text>
            </View>
            <View style={styles.statCard}>
              <MessageSquare size={20} color={theme.colors.accent} strokeWidth={2} />
              <Text style={styles.statTitle}>Response</Text>
              <Text style={styles.statValue}>1h avg</Text>
            </View>
          </View>

          {/* About section */}
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.aboutText}>{bioText}</Text>

          {/* Services list */}
          <Text style={styles.sectionTitle}>Services Offered</Text>
          <View style={styles.servicesGrid}>
            {servicesList.map((serviceNameText, i) => (
              <View key={i} style={styles.serviceItem}>
                <Check size={16} color={theme.colors.mint} strokeWidth={3} />
                <Text style={styles.serviceItemText}>{serviceNameText}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Chat & Book Now Footer Buttons */}
      <View style={[styles.footer, { paddingBottom: 18 + insets.bottom }]}>
        <Pressable
          style={styles.chatBtn}
          onPress={() => router.push(`/chat?id=${provider.user_id}`)}
        >
          <MessageSquare size={22} color={theme.colors.accent} strokeWidth={2} />
        </Pressable>
        <Button
          label="Book Now"
          onPress={() => router.push(`/booking/new?providerId=${provider.user_id}`)}
          variant="primary"
          style={styles.bookBtn}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  scroll: { flex: 1 },
  content: { paddingBottom: 110 },
  hero: { width: width, height: 260, position: 'relative' },
  heroImage: { width: '100%', height: '100%' },
  heroOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(15, 58, 64, 0.2)' },
  topBar: { position: 'absolute', top: 52, left: 0, right: 0, flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20 },
  topBarNoAbsolute: { flexDirection: 'row', justifyContent: 'space-between', width: '100%' },
  iconBtn: { width: 42, height: 42, borderRadius: 12, backgroundColor: 'rgba(15, 58, 64, 0.4)', alignItems: 'center', justifyContent: 'center' },
  iconBtnDark: { width: 42, height: 42, borderRadius: 12, backgroundColor: 'rgba(255, 255, 255, 0.1)', alignItems: 'center', justifyContent: 'center' },
  headerRightActions: { flexDirection: 'row', gap: 10 },
  gradientHero: { height: 160, justifyContent: 'flex-start', paddingTop: 52, paddingHorizontal: 20, borderBottomLeftRadius: 0, borderBottomRightRadius: 0 },
  profileCard: { marginHorizontal: 20, marginTop: -40, backgroundColor: theme.colors.card, borderRadius: 24, borderWidth: 1, borderColor: theme.colors.border, padding: 20, alignItems: 'center', shadowColor: '#0A1729', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.05, shadowRadius: 15, elevation: 6 },
  profileCardNoImage: { marginTop: -20 },
  verifiedBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: theme.colors.accentLight, paddingVertical: 6, paddingHorizontal: 12, borderRadius: 10, marginBottom: 12 },
  verifiedText: { fontFamily: 'Inter-Bold', fontSize: 10, color: theme.colors.accent, letterSpacing: 0.5 },
  providerName: { fontFamily: 'Inter-Bold', fontSize: 22, color: theme.colors.textPrimary },
  providerService: { fontFamily: 'Inter-Medium', fontSize: 14, color: theme.colors.textSecondary, marginTop: 4 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10 },
  ratingText: { fontFamily: 'Inter-SemiBold', fontSize: 13, color: theme.colors.textSecondary },
  body: { paddingHorizontal: 20, marginTop: 24 },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  statCard: { flex: 1, backgroundColor: theme.colors.card, borderWidth: 1, borderColor: theme.colors.border, borderRadius: 18, padding: 14, alignItems: 'center', gap: 6 },
  statTitle: { fontFamily: 'Inter-Medium', fontSize: 12, color: theme.colors.textSecondary },
  statValue: { fontFamily: 'Inter-Bold', fontSize: 14, color: theme.colors.textPrimary, textAlign: 'center' },
  sectionTitle: { fontFamily: 'Inter-Bold', fontSize: 16, color: theme.colors.textPrimary, marginBottom: 10, marginTop: 12 },
  aboutText: { fontFamily: 'Inter-Regular', fontSize: 14, color: theme.colors.textSecondary, lineHeight: 22 },
  servicesGrid: { marginTop: 4, gap: 12 },
  serviceItem: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  serviceItemText: { fontFamily: 'Inter-Medium', fontSize: 14, color: theme.colors.textPrimary },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: theme.colors.card, paddingHorizontal: 20, paddingVertical: 18, borderTopWidth: 1, borderTopColor: theme.colors.border, flexDirection: 'row', gap: 12 },
  chatBtn: { width: 50, height: 50, borderRadius: 14, backgroundColor: theme.colors.accentLight, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: theme.colors.border },
  bookBtn: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.background },
  notFound: { fontFamily: 'Inter-Bold', fontSize: 16, color: theme.colors.textPrimary },
});
