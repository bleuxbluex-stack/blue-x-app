import { View, Text, StyleSheet, ScrollView, Pressable, Switch, ActivityIndicator, Image, Modal, TextInput, Alert } from 'react-native';
import { useEffect, useState } from 'react';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { ChevronRight, Shield, Bell, Globe, Moon, Lock, HelpCircle, LogOut, CreditCard, Star, MapPin, Mail, Phone, Calendar, Camera, Pencil, X, Save, Award, DollarSign, Heart, MessageSquare, Check } from 'lucide-react-native';
import { GradientHeader } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/context/LanguageContext';
import { LanguageCode } from '@/constants/translations';
import { supabase } from '@/services/supabase';
import { uploadToCloudinary, getValidProviderImage } from '@/services/cloudinary';
import { theme as defaultTheme } from '@/constants/theme';

interface ProfileData {
  full_name: string | null;
  phone: string | null;
  date_of_birth: string | null;
  city: string | null;
  canton: string | null;
  avatar_url: string | null;
  role: string | null;
}

interface ProviderProfileData {
  company_name: string | null;
  hourly_rate: number | null;
  experience_years: number | null;
  bio: string | null;
}

interface SavedProviderItem {
  id: string;
  user_id: string;
  name: string;
  category: string;
  rating: number;
  hourly_rate: number;
  avatar_url: string | null;
}

const LANGUAGES = [
  { name: 'Deutsch', code: 'DE' },
  { name: 'Français', code: 'FR' },
  { name: 'Italiano', code: 'IT' },
  { name: 'English', code: 'EN' },
  { name: 'Português', code: 'PT' },
  { name: 'Español', code: 'ES' },
  { name: 'Shqip', code: 'SQ' },
  { name: 'Srpski', code: 'SR' },
];

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState(
    LANGUAGES.find(l => l.code === language) || { name: 'English', code: 'EN' }
  );

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [providerProfile, setProviderProfile] = useState<ProviderProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  // Edit Profile Modal State
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [saving, setSaving] = useState(false);

  // Language Modal State
  const [languageModalVisible, setLanguageModalVisible] = useState(false);

  // Saved Providers Modal State
  const [savedModalVisible, setSavedModalVisible] = useState(false);
  const [savedProviders, setSavedProviders] = useState<SavedProviderItem[]>([
    {
      id: 'sp1',
      user_id: 'e9df7d84-73df-468d-8bee-c93235a5f102',
      name: 'Manoj',
      category: 'Plumber',
      rating: 4.9,
      hourly_rate: 90,
      avatar_url: null,
    },
    {
      id: 'sp2',
      user_id: '59c1e434-4a8a-4eed-9f0c-5dd4b50277fc',
      name: 'Outlaws',
      category: 'Wire Man (Electrician)',
      rating: 4.8,
      hourly_rate: 85,
      avatar_url: null,
    },
    {
      id: 'sp3',
      user_id: '6fdb0df2-e804-4029-8c66-e61a35d65dcc',
      name: 'TestCompany Clean Ag',
      category: 'Cleaner',
      rating: 5.0,
      hourly_rate: 75,
      avatar_url: null,
    },
  ]);

  // Form Fields
  const [formFullName, setFormFullName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formCity, setFormCity] = useState('');
  const [formCanton, setFormCanton] = useState('');
  const [formDob, setFormDob] = useState('');
  const [formCompanyName, setFormCompanyName] = useState('');
  const [formHourlyRate, setFormHourlyRate] = useState('');
  const [formExperience, setFormExperience] = useState('');
  const [formBio, setFormBio] = useState('');

  // Dark Mode Theme Computation
  const activeTheme = darkMode ? {
    colors: {
      background: '#0F172A',
      card: '#1E293B',
      border: '#334155',
      textPrimary: '#F8FAFC',
      textSecondary: '#94A3B8',
      accent: '#20B2AA',
      accentLight: 'rgba(32, 178, 170, 0.15)',
      mint: '#14B8A6',
      white: '#FFFFFF',
    }
  } : defaultTheme;

  const openEditModal = () => {
    setFormFullName(profile?.full_name || '');
    setFormPhone(profile?.phone || '');
    setFormCity(profile?.city || '');
    setFormCanton(profile?.canton || '');
    setFormDob(profile?.date_of_birth || '');
    setFormCompanyName(providerProfile?.company_name || '');
    setFormHourlyRate(providerProfile?.hourly_rate ? String(providerProfile.hourly_rate) : '');
    setFormExperience(providerProfile?.experience_years ? String(providerProfile.experience_years) : '');
    setFormBio(providerProfile?.bio || '');
    setEditModalVisible(true);
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const { error: profileErr } = await supabase
        .from('profiles')
        .update({
          full_name: formFullName.trim() || null,
          phone: formPhone.trim() || null,
          city: formCity.trim() || null,
          canton: formCanton.trim() || null,
          date_of_birth: formDob.trim() || null,
        })
        .eq('id', user.id);

      if (profileErr) throw profileErr;

      if (profile?.role === 'provider') {
        const rateNum = formHourlyRate ? parseFloat(formHourlyRate) : null;
        const expNum = formExperience ? parseInt(formExperience, 10) : 0;

        const { error: provErr } = await supabase
          .from('provider_profiles')
          .update({
            company_name: formCompanyName.trim() || null,
            hourly_rate: isNaN(rateNum as number) ? null : rateNum,
            experience_years: isNaN(expNum) ? 0 : expNum,
            bio: formBio.trim() || null,
          })
          .eq('user_id', user.id);

        if (!provErr) {
          setProviderProfile({
            company_name: formCompanyName.trim() || null,
            hourly_rate: isNaN(rateNum as number) ? null : rateNum,
            experience_years: isNaN(expNum) ? 0 : expNum,
            bio: formBio.trim() || null,
          });
        }
      }

      setProfile((prev) => (prev ? {
        ...prev,
        full_name: formFullName.trim() || null,
        phone: formPhone.trim() || null,
        city: formCity.trim() || null,
        canton: formCanton.trim() || null,
        date_of_birth: formDob.trim() || null,
      } : null));

      setEditModalVisible(false);
      Alert.alert('Success', 'Profile details updated successfully!');
    } catch (err: any) {
      console.error('Profile update error:', err);
      Alert.alert('Update Failed', err.message || 'Could not update profile details.');
    } finally {
      setSaving(false);
    }
  };

  const toggleSaveProvider = (id: string) => {
    setSavedProviders(prev => prev.filter(p => p.id !== id));
    Alert.alert('Removed', 'Provider removed from saved list.');
  };

  const handleSelectAndUploadImage = async () => {
    if (!user) return;
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert('Permission to access photos is required to upload a profile picture.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (result.canceled || !result.assets || result.assets.length === 0) return;

    const localUri = result.assets[0].uri;
    setUploading(true);
    try {
      const uploadResult = await uploadToCloudinary(localUri, 'image');
      const secureUrl = uploadResult.secure_url;

      const { error } = await supabase
        .from('profiles')
        .update({ avatar_url: secureUrl })
        .eq('id', user.id);

      if (error) throw error;
      setProfile((prev) => (prev ? { ...prev, avatar_url: secureUrl } : null));
      alert('Profile picture updated successfully!');
    } catch (err: any) {
      alert('Failed to upload profile picture: ' + (err.message || err));
    } finally {
      setUploading(false);
    }
  };

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const [{ data: prof }, { data: pProf }] = await Promise.all([
          supabase.from('profiles').select('full_name, phone, date_of_birth, city, canton, avatar_url, role').eq('id', user.id).maybeSingle(),
          supabase.from('provider_profiles').select('company_name, hourly_rate, experience_years, bio').eq('user_id', user.id).maybeSingle()
        ]);
        setProfile(prof);
        setProviderProfile(pProf);
      } catch (err) {
        console.log('Error loading profile:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: activeTheme.colors.background }]}>
        <ActivityIndicator size="large" color={activeTheme.colors.accent} />
      </View>
    );
  }

  const displayName = profile?.full_name || providerProfile?.company_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
  const initials = displayName.split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase();
  const email = user?.email || '';
  const userRole = profile?.role || user?.user_metadata?.role || 'client';
  const phone = profile?.phone || 'Not set';
  const city = profile?.city || 'Zurich';
  const dob = profile?.date_of_birth || 'Not set';

  return (
    <ScrollView style={[styles.scroll, { backgroundColor: activeTheme.colors.background }]} showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
      <GradientHeader style={styles.header}>
        <Pressable onPress={handleSelectAndUploadImage} disabled={uploading} style={styles.avatarContainer}>
          <View style={styles.avatarWrap}>
            {uploading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : profile?.avatar_url ? (
              <Image source={{ uri: profile.avatar_url }} style={styles.avatarImage} />
            ) : (
              <Text style={styles.avatarText}>{initials}</Text>
            )}
            <View style={styles.editIconBadge}>
              <Camera size={12} color="#FFFFFF" strokeWidth={2.5} />
            </View>
          </View>
        </Pressable>
        <Text style={styles.userName}>{displayName}</Text>
        <Text style={styles.userEmail}>{email}</Text>
        <View style={[styles.rolePill, { backgroundColor: activeTheme.colors.accentLight }]}>
          <Text style={[styles.roleText, { color: activeTheme.colors.accent }]}>{userRole.toUpperCase()}</Text>
        </View>
      </GradientHeader>

      <View style={styles.body}>
        {/* Stats */}
        <View style={[styles.statsRow, { backgroundColor: activeTheme.colors.card, borderColor: activeTheme.colors.border }]}>
          <View style={styles.statItem}><Text style={[styles.statNum, { color: activeTheme.colors.textPrimary }]}>12</Text><Text style={[styles.statLabel, { color: activeTheme.colors.textSecondary }]}>Bookings</Text></View>
          <View style={[styles.statDivider, { backgroundColor: activeTheme.colors.border }]} />
          <View style={styles.statItem}><Text style={[styles.statNum, { color: activeTheme.colors.textPrimary }]}>8</Text><Text style={[styles.statLabel, { color: activeTheme.colors.textSecondary }]}>Reviews</Text></View>
          <View style={[styles.statDivider, { backgroundColor: activeTheme.colors.border }]} />
          <View style={styles.statItem}><Text style={[styles.statNum, { color: activeTheme.colors.textPrimary }]}>{savedProviders.length}</Text><Text style={[styles.statLabel, { color: activeTheme.colors.textSecondary }]}>Saved</Text></View>
        </View>

        {/* Personal info */}
        <View style={styles.sectionHeaderRow}>
          <Text style={[styles.sectionTitle, { color: activeTheme.colors.textPrimary }]}>Personal Information</Text>
          <Pressable style={[styles.editDetailsBtn, { backgroundColor: activeTheme.colors.accentLight, borderColor: activeTheme.colors.border }]} onPress={openEditModal}>
            <Pencil size={13} color={activeTheme.colors.accent} strokeWidth={2.2} />
            <Text style={[styles.editDetailsBtnText, { color: activeTheme.colors.accent }]}>Edit Details</Text>
          </Pressable>
        </View>

        <View style={[styles.infoCard, { backgroundColor: activeTheme.colors.card, borderColor: activeTheme.colors.border }]}>
          <View style={styles.infoRow}>
            <View style={[styles.infoIcon, { backgroundColor: activeTheme.colors.accentLight }]}><Mail size={16} color={activeTheme.colors.accent} strokeWidth={2.2} /></View>
            <Text style={[styles.infoLabel, { color: activeTheme.colors.textSecondary }]}>Email</Text>
            <Text style={[styles.infoValue, { color: activeTheme.colors.textPrimary }]} numberOfLines={1}>{email}</Text>
          </View>
          <View style={[styles.infoDivider, { backgroundColor: activeTheme.colors.border }]} />
          <View style={styles.infoRow}>
            <View style={[styles.infoIcon, { backgroundColor: activeTheme.colors.accentLight }]}><Phone size={16} color={activeTheme.colors.accent} strokeWidth={2.2} /></View>
            <Text style={[styles.infoLabel, { color: activeTheme.colors.textSecondary }]}>Phone</Text>
            <Text style={[styles.infoValue, { color: activeTheme.colors.textPrimary }]}>{phone}</Text>
          </View>
          <View style={[styles.infoDivider, { backgroundColor: activeTheme.colors.border }]} />
          <View style={styles.infoRow}>
            <View style={[styles.infoIcon, { backgroundColor: activeTheme.colors.accentLight }]}><Calendar size={16} color={activeTheme.colors.accent} strokeWidth={2.2} /></View>
            <Text style={[styles.infoLabel, { color: activeTheme.colors.textSecondary }]}>Birthday</Text>
            <Text style={[styles.infoValue, { color: activeTheme.colors.textPrimary }]}>{dob}</Text>
          </View>
          <View style={[styles.infoDivider, { backgroundColor: activeTheme.colors.border }]} />
          <View style={styles.infoRow}>
            <View style={[styles.infoIcon, { backgroundColor: activeTheme.colors.accentLight }]}><MapPin size={16} color={activeTheme.colors.accent} strokeWidth={2.2} /></View>
            <Text style={[styles.infoLabel, { color: activeTheme.colors.textSecondary }]}>City</Text>
            <Text style={[styles.infoValue, { color: activeTheme.colors.textPrimary }]}>{city}</Text>
          </View>

          {userRole === 'provider' && providerProfile && (
            <>
              <View style={[styles.infoDivider, { backgroundColor: activeTheme.colors.border }]} />
              <View style={styles.infoRow}>
                <View style={[styles.infoIcon, { backgroundColor: activeTheme.colors.accentLight }]}><DollarSign size={16} color={activeTheme.colors.accent} strokeWidth={2.2} /></View>
                <Text style={[styles.infoLabel, { color: activeTheme.colors.textSecondary }]}>Hourly Rate</Text>
                <Text style={[styles.infoValue, { color: activeTheme.colors.textPrimary }]}>CHF {providerProfile.hourly_rate || 90}/hr</Text>
              </View>
              <View style={[styles.infoDivider, { backgroundColor: activeTheme.colors.border }]} />
              <View style={styles.infoRow}>
                <View style={[styles.infoIcon, { backgroundColor: activeTheme.colors.accentLight }]}><Award size={16} color={activeTheme.colors.accent} strokeWidth={2.2} /></View>
                <Text style={[styles.infoLabel, { color: activeTheme.colors.textSecondary }]}>Experience</Text>
                <Text style={[styles.infoValue, { color: activeTheme.colors.textPrimary }]}>{providerProfile.experience_years || 1}+ Years</Text>
              </View>
            </>
          )}
        </View>

        {/* Account */}
        <Text style={[styles.sectionTitle, { color: activeTheme.colors.textPrimary }]}>Account</Text>
        <View style={[styles.menuCard, { backgroundColor: activeTheme.colors.card, borderColor: activeTheme.colors.border }]}>
          <Pressable style={({ pressed }) => [styles.menuItem, styles.menuItemBorder, { borderBottomColor: activeTheme.colors.border }, pressed && styles.menuPressed]}>
            <View style={[styles.menuIcon, { backgroundColor: activeTheme.colors.accentLight }]}><CreditCard size={18} color={activeTheme.colors.accent} strokeWidth={2} /></View>
            <Text style={[styles.menuLabel, { color: activeTheme.colors.textPrimary }]}>Payment Methods</Text>
            <ChevronRight size={18} color={activeTheme.colors.textSecondary} strokeWidth={2} />
          </Pressable>

          <Pressable onPress={() => setSavedModalVisible(true)} style={({ pressed }) => [styles.menuItem, styles.menuItemBorder, { borderBottomColor: activeTheme.colors.border }, pressed && styles.menuPressed]}>
            <View style={[styles.menuIcon, { backgroundColor: activeTheme.colors.accentLight }]}><Star size={18} color={activeTheme.colors.accent} strokeWidth={2} /></View>
            <Text style={[styles.menuLabel, { color: activeTheme.colors.textPrimary }]}>Saved Providers</Text>
            <Text style={[styles.menuValue, { color: activeTheme.colors.textSecondary }]}>{savedProviders.length}</Text>
            <ChevronRight size={18} color={activeTheme.colors.textSecondary} strokeWidth={2} />
          </Pressable>

          <Pressable style={({ pressed }) => [styles.menuItem, pressed && styles.menuPressed]}>
            <View style={[styles.menuIcon, { backgroundColor: activeTheme.colors.accentLight }]}><Shield size={18} color={activeTheme.colors.accent} strokeWidth={2} /></View>
            <Text style={[styles.menuLabel, { color: activeTheme.colors.textPrimary }]}>Security</Text>
            <ChevronRight size={18} color={activeTheme.colors.textSecondary} strokeWidth={2} />
          </Pressable>
        </View>

        {/* Preferences */}
        <Text style={[styles.sectionTitle, { color: activeTheme.colors.textPrimary }]}>Preferences</Text>
        <View style={[styles.menuCard, { backgroundColor: activeTheme.colors.card, borderColor: activeTheme.colors.border }]}>
          <View style={[styles.menuItem, styles.menuItemBorder, { borderBottomColor: activeTheme.colors.border }]}>
            <View style={[styles.menuIcon, { backgroundColor: activeTheme.colors.accentLight }]}><Moon size={18} color={activeTheme.colors.accent} strokeWidth={2} /></View>
            <Text style={[styles.menuLabel, { color: activeTheme.colors.textPrimary }]}>Dark Mode</Text>
            <Switch
              value={darkMode}
              onValueChange={(val) => {
                setDarkMode(val);
                Alert.alert('Theme Changed', val ? 'Dark Mode enabled' : 'Light Mode enabled');
              }}
              trackColor={{ false: '#E2E8F0', true: activeTheme.colors.mint }}
            />
          </View>

          <View style={[styles.menuItem, styles.menuItemBorder, { borderBottomColor: activeTheme.colors.border }]}>
            <View style={[styles.menuIcon, { backgroundColor: activeTheme.colors.accentLight }]}><Bell size={18} color={activeTheme.colors.accent} strokeWidth={2} /></View>
            <Text style={[styles.menuLabel, { color: activeTheme.colors.textPrimary }]}>Notifications</Text>
            <Switch value={notifications} onValueChange={setNotifications} trackColor={{ false: '#E2E8F0', true: activeTheme.colors.mint }} />
          </View>

          <Pressable onPress={() => setLanguageModalVisible(true)} style={({ pressed }) => [styles.menuItem, pressed && styles.menuPressed]}>
            <View style={[styles.menuIcon, { backgroundColor: activeTheme.colors.accentLight }]}><Globe size={18} color={activeTheme.colors.accent} strokeWidth={2} /></View>
            <Text style={[styles.menuLabel, { color: activeTheme.colors.textPrimary }]}>Language</Text>
            <Text style={[styles.menuValue, { color: activeTheme.colors.textSecondary }]}>{selectedLanguage.name}</Text>
            <ChevronRight size={18} color={activeTheme.colors.textSecondary} strokeWidth={2} />
          </Pressable>
        </View>

        {/* Support */}
        <Text style={[styles.sectionTitle, { color: activeTheme.colors.textPrimary }]}>Support</Text>
        <View style={[styles.menuCard, { backgroundColor: activeTheme.colors.card, borderColor: activeTheme.colors.border }]}>
          <Pressable style={({ pressed }) => [styles.menuItem, styles.menuItemBorder, { borderBottomColor: activeTheme.colors.border }, pressed && styles.menuPressed]}>
            <View style={[styles.menuIcon, { backgroundColor: activeTheme.colors.accentLight }]}><HelpCircle size={18} color={activeTheme.colors.accent} strokeWidth={2} /></View>
            <Text style={[styles.menuLabel, { color: activeTheme.colors.textPrimary }]}>Help Center</Text>
            <ChevronRight size={18} color={activeTheme.colors.textSecondary} strokeWidth={2} />
          </Pressable>

          <Pressable style={({ pressed }) => [styles.menuItem, styles.menuItemBorder, { borderBottomColor: activeTheme.colors.border }, pressed && styles.menuPressed]}>
            <View style={[styles.menuIcon, { backgroundColor: activeTheme.colors.accentLight }]}><Lock size={18} color={activeTheme.colors.accent} strokeWidth={2} /></View>
            <Text style={[styles.menuLabel, { color: activeTheme.colors.textPrimary }]}>Privacy Policy</Text>
            <ChevronRight size={18} color={activeTheme.colors.textSecondary} strokeWidth={2} />
          </Pressable>

          <Pressable onPress={signOut} style={({ pressed }) => [styles.menuItem, pressed && styles.menuPressed]}>
            <View style={[styles.menuIcon, { backgroundColor: 'rgba(239, 68, 68, 0.15)' }]}><LogOut size={18} color="#EF4444" strokeWidth={2} /></View>
            <Text style={[styles.menuLabel, { color: '#EF4444' }]}>Log Out</Text>
            <ChevronRight size={18} color={activeTheme.colors.textSecondary} strokeWidth={2} />
          </Pressable>
        </View>
      </View>

      {/* 1. Language Selection Modal (Exact match to screenshot) */}
      <Modal
        visible={languageModalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setLanguageModalVisible(false)}
      >
        <View style={styles.langModalOverlay}>
          <View style={styles.langModalCard}>
            <View style={styles.langModalHeader}>
              <Text style={styles.langModalTitle}>Select Language</Text>
              <Pressable onPress={() => setLanguageModalVisible(false)} style={styles.langCloseBtn}>
                <X size={18} color="#64748B" strokeWidth={2} />
              </Pressable>
            </View>

            <View style={styles.langList}>
              {LANGUAGES.map((lang) => {
                const isSelected = selectedLanguage.code === lang.code;
                return (
                  <Pressable
                    key={lang.code}
                    style={[styles.langItem, isSelected && styles.langItemSelected]}
                    onPress={() => {
                      setLanguage(lang.code as LanguageCode);
                      setSelectedLanguage(lang);
                      setLanguageModalVisible(false);
                      Alert.alert('Language Updated', `App language set to ${lang.name} (${lang.code})`);
                    }}
                  >
                    <Text style={[styles.langName, isSelected && styles.langNameSelected]}>{lang.name}</Text>
                    <Text style={[styles.langCode, isSelected && styles.langCodeSelected]}>{lang.code}</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        </View>
      </Modal>

      {/* 2. Saved Providers Modal */}
      <Modal
        visible={savedModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setSavedModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: activeTheme.colors.card }]}>
            <View style={styles.modalCardHeader}>
              <Text style={[styles.modalCardTitle, { color: activeTheme.colors.textPrimary }]}>Saved Providers ({savedProviders.length})</Text>
              <Pressable style={styles.modalCardCloseBtn} onPress={() => setSavedModalVisible(false)}>
                <X size={18} color={activeTheme.colors.textPrimary} strokeWidth={2} />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.formScroll}>
              {savedProviders.length === 0 ? (
                <View style={styles.emptySaved}>
                  <Star size={36} color={activeTheme.colors.textSecondary} strokeWidth={1.5} />
                  <Text style={[styles.emptySavedTitle, { color: activeTheme.colors.textPrimary }]}>No Saved Providers</Text>
                  <Text style={[styles.emptySavedSub, { color: activeTheme.colors.textSecondary }]}>Save your favorite service experts to quickly chat or book appointments.</Text>
                </View>
              ) : (
                savedProviders.map((sp) => (
                  <View key={sp.id} style={[styles.savedCard, { borderColor: activeTheme.colors.border }]}>
                    <View style={styles.savedLeft}>
                      <Image source={{ uri: getValidProviderImage(sp.avatar_url) || 'https://images.unsplash.com/photo-1540555700478-4be289fbecef' }} style={styles.savedAvatar} />
                      <View style={styles.savedDetails}>
                        <Text style={[styles.savedName, { color: activeTheme.colors.textPrimary }]}>{sp.name}</Text>
                        <Text style={[styles.savedCategory, { color: activeTheme.colors.textSecondary }]}>{sp.category}</Text>
                        <View style={styles.savedMetaRow}>
                          <Star size={12} color="#F59E0B" fill="#F59E0B" />
                          <Text style={styles.savedRatingText}>{sp.rating}</Text>
                          <Text style={[styles.savedRateText, { color: activeTheme.colors.accent }]}>• CHF {sp.hourly_rate}/hr</Text>
                        </View>
                      </View>
                    </View>

                    <View style={styles.savedRightActions}>
                      <Pressable
                        style={styles.savedHeartBtn}
                        onPress={() => toggleSaveProvider(sp.id)}
                      >
                        <Heart size={16} color="#EF4444" fill="#EF4444" />
                      </Pressable>
                      <Pressable
                        style={[styles.savedChatBtn, { backgroundColor: activeTheme.colors.accent }]}
                        onPress={() => {
                          setSavedModalVisible(false);
                          router.push(`/chat?providerId=${sp.user_id}` as any);
                        }}
                      >
                        <MessageSquare size={14} color="#FFFFFF" strokeWidth={2.2} />
                        <Text style={styles.savedChatText}>Chat</Text>
                      </Pressable>
                    </View>
                  </View>
                ))
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* 3. Edit Profile Details Modal */}
      <Modal
        visible={editModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: activeTheme.colors.card }]}>
            <View style={styles.modalCardHeader}>
              <Text style={[styles.modalCardTitle, { color: activeTheme.colors.textPrimary }]}>Edit Profile Details</Text>
              <Pressable style={styles.modalCardCloseBtn} onPress={() => setEditModalVisible(false)}>
                <X size={18} color={activeTheme.colors.textPrimary} strokeWidth={2} />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.formScroll}>
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: activeTheme.colors.textSecondary }]}>Full Name</Text>
                <TextInput
                  value={formFullName}
                  onChangeText={setFormFullName}
                  placeholder="Enter full name"
                  placeholderTextColor={activeTheme.colors.textSecondary}
                  style={[styles.textInput, { backgroundColor: activeTheme.colors.background, borderColor: activeTheme.colors.border, color: activeTheme.colors.textPrimary }]}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: activeTheme.colors.textSecondary }]}>Phone Number</Text>
                <TextInput
                  value={formPhone}
                  onChangeText={setFormPhone}
                  placeholder="+41 79 123 4567"
                  placeholderTextColor={activeTheme.colors.textSecondary}
                  style={[styles.textInput, { backgroundColor: activeTheme.colors.background, borderColor: activeTheme.colors.border, color: activeTheme.colors.textPrimary }]}
                  keyboardType="phone-pad"
                />
              </View>

              <View style={styles.rowInputs}>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={[styles.inputLabel, { color: activeTheme.colors.textSecondary }]}>City</Text>
                  <TextInput
                    value={formCity}
                    onChangeText={setFormCity}
                    placeholder="Zurich"
                    placeholderTextColor={activeTheme.colors.textSecondary}
                    style={[styles.textInput, { backgroundColor: activeTheme.colors.background, borderColor: activeTheme.colors.border, color: activeTheme.colors.textPrimary }]}
                  />
                </View>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={[styles.inputLabel, { color: activeTheme.colors.textSecondary }]}>Canton</Text>
                  <TextInput
                    value={formCanton}
                    onChangeText={setFormCanton}
                    placeholder="ZH"
                    placeholderTextColor={activeTheme.colors.textSecondary}
                    style={[styles.textInput, { backgroundColor: activeTheme.colors.background, borderColor: activeTheme.colors.border, color: activeTheme.colors.textPrimary }]}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: activeTheme.colors.textSecondary }]}>Birthday (YYYY-MM-DD)</Text>
                <TextInput
                  value={formDob}
                  onChangeText={setFormDob}
                  placeholder="1995-06-15"
                  placeholderTextColor={activeTheme.colors.textSecondary}
                  style={[styles.textInput, { backgroundColor: activeTheme.colors.background, borderColor: activeTheme.colors.border, color: activeTheme.colors.textPrimary }]}
                />
              </View>

              {userRole === 'provider' && (
                <>
                  <View style={styles.inputGroup}>
                    <Text style={[styles.inputLabel, { color: activeTheme.colors.textSecondary }]}>Company Name</Text>
                    <TextInput
                      value={formCompanyName}
                      onChangeText={setFormCompanyName}
                      placeholder="Your Company or Business Name"
                      placeholderTextColor={activeTheme.colors.textSecondary}
                      style={[styles.textInput, { backgroundColor: activeTheme.colors.background, borderColor: activeTheme.colors.border, color: activeTheme.colors.textPrimary }]}
                    />
                  </View>

                  <View style={styles.rowInputs}>
                    <View style={[styles.inputGroup, { flex: 1 }]}>
                      <Text style={[styles.inputLabel, { color: activeTheme.colors.textSecondary }]}>Hourly Rate (CHF)</Text>
                      <TextInput
                        value={formHourlyRate}
                        onChangeText={setFormHourlyRate}
                        placeholder="90"
                        placeholderTextColor={activeTheme.colors.textSecondary}
                        keyboardType="numeric"
                        style={[styles.textInput, { backgroundColor: activeTheme.colors.background, borderColor: activeTheme.colors.border, color: activeTheme.colors.textPrimary }]}
                      />
                    </View>
                    <View style={[styles.inputGroup, { flex: 1 }]}>
                      <Text style={[styles.inputLabel, { color: activeTheme.colors.textSecondary }]}>Experience (Years)</Text>
                      <TextInput
                        value={formExperience}
                        onChangeText={setFormExperience}
                        placeholder="5"
                        placeholderTextColor={activeTheme.colors.textSecondary}
                        keyboardType="numeric"
                        style={[styles.textInput, { backgroundColor: activeTheme.colors.background, borderColor: activeTheme.colors.border, color: activeTheme.colors.textPrimary }]}
                      />
                    </View>
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={[styles.inputLabel, { color: activeTheme.colors.textSecondary }]}>Bio / Description</Text>
                    <TextInput
                      value={formBio}
                      onChangeText={setFormBio}
                      placeholder="Briefly describe your services and experience..."
                      placeholderTextColor={activeTheme.colors.textSecondary}
                      multiline
                      numberOfLines={3}
                      style={[styles.textInput, styles.multilineInput, { backgroundColor: activeTheme.colors.background, borderColor: activeTheme.colors.border, color: activeTheme.colors.textPrimary }]}
                    />
                  </View>
                </>
              )}
            </ScrollView>

            <View style={[styles.modalFooterRow, { borderTopColor: activeTheme.colors.border }]}>
              <Pressable style={styles.cancelBtn} onPress={() => setEditModalVisible(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </Pressable>
              <Pressable style={[styles.saveBtn, { backgroundColor: activeTheme.colors.accent }]} onPress={handleSaveProfile} disabled={saving}>
                {saving ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <Save size={16} color="#FFFFFF" strokeWidth={2.2} />
                    <Text style={styles.saveBtnText}>Save Changes</Text>
                  </>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { paddingBottom: 40 },
  header: { alignItems: 'center', paddingTop: 64, paddingBottom: 28 },
  avatarContainer: { position: 'relative' },
  avatarWrap: { width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: 'rgba(255,255,255,0.25)', position: 'relative' },
  avatarImage: { width: 76, height: 76, borderRadius: 38 },
  editIconBadge: { position: 'absolute', bottom: -2, right: -2, backgroundColor: '#14B8A6', width: 24, height: 24, borderRadius: 12, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#FFFFFF' },
  avatarText: { fontFamily: 'Inter-Bold', fontSize: 28, color: '#FFFFFF' },
  userName: { fontFamily: 'Inter-Bold', fontSize: 20, color: '#FFFFFF', marginTop: 14 },
  userEmail: { fontFamily: 'Inter-Regular', fontSize: 13, color: 'rgba(255,255,255,0.7)', marginTop: 4 },
  rolePill: { paddingVertical: 4, paddingHorizontal: 10, borderRadius: 8, marginTop: 12 },
  roleText: { fontFamily: 'Inter-Bold', fontSize: 11, letterSpacing: 0.5 },
  body: { paddingHorizontal: 20, marginTop: 24 },
  statsRow: { flexDirection: 'row', borderRadius: 20, padding: 18, alignItems: 'center', borderWidth: 1 },
  statItem: { flex: 1, alignItems: 'center' },
  statNum: { fontFamily: 'Inter-Bold', fontSize: 18 },
  statLabel: { fontFamily: 'Inter-Regular', fontSize: 12, marginTop: 2 },
  statDivider: { width: 1, height: 32 },
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 28, marginBottom: 12, marginHorizontal: 4 },
  sectionTitle: { fontFamily: 'Inter-Bold', fontSize: 15, marginTop: 24, marginBottom: 12 },
  editDetailsBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10, borderWidth: 1 },
  editDetailsBtnText: { fontFamily: 'Inter-Bold', fontSize: 12 },
  infoCard: { borderRadius: 20, borderWidth: 1, padding: 16 },
  infoRow: { flexDirection: 'row', alignItems: 'center', height: 44 },
  infoIcon: { width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  infoLabel: { fontFamily: 'Inter-Medium', fontSize: 14, flex: 1, marginLeft: 12 },
  infoValue: { fontFamily: 'Inter-SemiBold', fontSize: 14 },
  infoDivider: { height: 1, marginVertical: 4 },
  menuCard: { borderRadius: 20, borderWidth: 1, overflow: 'hidden' },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, height: 52 },
  menuItemBorder: { borderBottomWidth: 1 },
  menuPressed: { opacity: 0.8 },
  menuIcon: { width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  menuLabel: { fontFamily: 'Inter-Medium', fontSize: 14, flex: 1, marginLeft: 12 },
  menuValue: { fontFamily: 'Inter-Medium', fontSize: 13, marginRight: 8 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  // Language Modal (exact design as screenshot)
  langModalOverlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.5)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  langModalCard: { width: 230, backgroundColor: '#FFFFFF', borderRadius: 20, paddingVertical: 12, paddingHorizontal: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.15, shadowRadius: 16, elevation: 8 },
  langModalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 12, paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  langModalTitle: { fontFamily: 'Inter-Bold', fontSize: 15, color: '#0F172A' },
  langCloseBtn: { padding: 4 },
  langList: { gap: 4, marginTop: 6 },
  langItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 14, height: 42, borderRadius: 12 },
  langItemSelected: { backgroundColor: '#2563EB' },
  langName: { fontFamily: 'Inter-SemiBold', fontSize: 14, color: '#1E293B' },
  langNameSelected: { color: '#FFFFFF', fontFamily: 'Inter-Bold' },
  langCode: { fontFamily: 'Inter-Bold', fontSize: 12, color: '#94A3B8' },
  langCodeSelected: { color: 'rgba(255,255,255,0.85)' },

  // Saved Providers Modal
  savedCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 12, borderRadius: 16, borderWidth: 1, gap: 10 },
  savedLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  savedAvatar: { width: 48, height: 48, borderRadius: 12, backgroundColor: '#F1F5F9' },
  savedDetails: { flex: 1, gap: 2 },
  savedName: { fontFamily: 'Inter-Bold', fontSize: 14 },
  savedCategory: { fontFamily: 'Inter-Regular', fontSize: 12 },
  savedMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  savedRatingText: { fontFamily: 'Inter-Bold', fontSize: 12, color: '#0F172A' },
  savedRateText: { fontFamily: 'Inter-Medium', fontSize: 12 },
  savedRightActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  savedHeartBtn: { width: 32, height: 32, borderRadius: 10, backgroundColor: 'rgba(239, 68, 68, 0.1)', alignItems: 'center', justifyContent: 'center' },
  savedChatBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, height: 32, borderRadius: 10 },
  savedChatText: { fontFamily: 'Inter-Bold', fontSize: 12, color: '#FFFFFF' },
  emptySaved: { alignItems: 'center', justifyContent: 'center', paddingVertical: 40, gap: 6 },
  emptySavedTitle: { fontFamily: 'Inter-Bold', fontSize: 15 },
  emptySavedSub: { fontFamily: 'Inter-Regular', fontSize: 12, textAlign: 'center', paddingHorizontal: 16 },

  // General Edit Profile Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(15, 30, 36, 0.6)', justifyContent: 'flex-end' },
  modalCard: { borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 20, paddingBottom: 30, maxHeight: '85%', gap: 14 },
  modalCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  modalCardTitle: { fontFamily: 'Inter-Bold', fontSize: 20 },
  modalCardCloseBtn: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  formScroll: { gap: 14, paddingVertical: 6 },
  inputGroup: { gap: 6 },
  rowInputs: { flexDirection: 'row', gap: 12 },
  inputLabel: { fontFamily: 'Inter-Bold', fontSize: 12 },
  textInput: { fontFamily: 'Inter-Regular', fontSize: 14, borderRadius: 12, borderWidth: 1, paddingHorizontal: 14, height: 44 },
  multilineInput: { height: 80, textAlignVertical: 'top', paddingTop: 10 },
  modalFooterRow: { flexDirection: 'row', gap: 12, marginTop: 10, paddingTop: 14, borderTopWidth: 1 },
  cancelBtn: { flex: 1, height: 44, borderRadius: 22, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  cancelBtnText: { fontFamily: 'Inter-Bold', fontSize: 14 },
  saveBtn: { flex: 2, height: 44, borderRadius: 22, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  saveBtnText: { fontFamily: 'Inter-Bold', fontSize: 14, color: '#FFFFFF' },
});
