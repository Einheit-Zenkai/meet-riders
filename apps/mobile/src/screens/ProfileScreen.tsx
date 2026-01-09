import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StatusBar,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import type { RootStackParamList } from '../navigation/AppNavigator';
import { palette } from '../theme/colors';
import { fetchProfile, type ProfileData } from '../api/profile';
import { getSupabaseClient } from '../lib/supabase';

const punctualityLabels: Record<string, string> = {
  'on-time': 'Always On-Time',
  'usually-on-time': 'Usually On-Time',
  flexible: 'Flexible',
};

type ProfileScreenProps = NativeStackScreenProps<RootStackParamList, 'Profile'>;

const ProfileScreen = ({ navigation }: ProfileScreenProps): JSX.Element => {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [email, setEmail] = useState<string>('');
  const [memberSince, setMemberSince] = useState<string>('');

  const supabaseAvailable = useMemo(() => Boolean(getSupabaseClient()), []);

  useEffect(() => {
    let active = true;

    const loadProfile = async (): Promise<void> => {
      const supabase = getSupabaseClient();

      if (!supabase) {
        if (active) {
          setErrorMessage('Supabase client is not configured. Profile data is unavailable offline.');
          setLoading(false);
        }
        return;
      }

      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!active) {
          return;
        }

        if (user) {
          setEmail(user.email ?? '');
          if (user.created_at) {
            const joined = new Date(user.created_at);
            const label = joined.toLocaleString('en-US', {
              month: 'long',
              year: 'numeric',
            });
            setMemberSince(label);
          }
        }

        const result = await fetchProfile();
        if (!active) {
          return;
        }

        setProfile(result);
        setErrorMessage(null);
      } catch (error) {
        if (active) {
          const message = error instanceof Error ? error.message : 'Unable to load profile.';
          setErrorMessage(message);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadProfile();
    return () => {
      active = false;
    };
  }, []);

  const handleEditProfile = (): void => {
    navigation.navigate('Settings');
  };

  const handleSignOut = async (): Promise<void> => {
    const supabase = getSupabaseClient();
    if (!supabase) {
      Alert.alert('Unavailable', 'Supabase is not configured. Sign out from the web app.');
      return;
    }

    await supabase.auth.signOut();
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  };

  const displayName = useMemo(() => {
    if (profile?.nickname && profile.nickname.trim()) {
      return profile.nickname.trim();
    }
    if (profile?.username && profile.username.trim()) {
      return profile.username.trim();
    }
    if (email.trim()) {
      return email.split('@')[0];
    }
    return 'Rider';
  }, [profile, email]);

  const handleLabel = profile?.username ? `@${profile.username}` : email ? `@${email.split('@')[0]}` : '@rider';
  const avatarLetter = displayName.charAt(0).toUpperCase();
  const aboutMe = profile?.bio && profile.bio.trim() ? profile.bio.trim() : 'No bio added yet.';
  const punctuality = profile?.punctuality ? punctualityLabels[profile.punctuality] ?? 'Flexible' : 'Flexible';
  const idealLocation = profile?.idealLocation && profile.idealLocation.trim() ? profile.idealLocation.trim() : 'Not specified';
  const genderLabel = profile?.gender && profile.gender.trim() ? profile.gender.trim() : '';

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={palette.primary} />
        <Text style={styles.loadingLabel}>Loading profile…</Text>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={20} color={palette.textPrimary} />
          <Text style={styles.backLabel}>Back</Text>
        </TouchableOpacity>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.editButton} onPress={handleEditProfile}>
            <Text style={styles.editButtonText}>Edit Profile</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.signOutPill} onPress={handleSignOut}>
            <Text style={styles.signOutPillText}>Sign out</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.contentWrapper}>
          {errorMessage ? (
            <View style={styles.errorBanner}>
              <Ionicons name="warning" size={18} color={palette.danger} style={styles.errorIcon} />
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          ) : null}

          <View style={styles.profileCard}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarLetter}>{avatarLetter}</Text>
            </View>
            <View style={styles.profileRow}>
              <View style={styles.profileMeta}>
                <Text style={styles.displayName}>{displayName}</Text>
                <View style={styles.handleRow}>
                  <Text style={styles.handleText}>{handleLabel}</Text>
                  {email ? <Text style={styles.emailText}> • {email}</Text> : null}
                  {genderLabel ? (
                    <View style={styles.genderBadge}>
                      <Ionicons name="male" size={14} color={palette.textPrimary} />
                      <Text style={styles.genderText}>{genderLabel}</Text>
                    </View>
                  ) : null}
                </View>
                <View style={styles.pointsRow}>
                  <Ionicons name="star" size={16} color={palette.primary} />
                  <Text style={styles.pointsText}>0 pts</Text>
                </View>
              </View>
            </View>

            <View style={styles.sectionSpacing}>
              <Text style={styles.sectionHeading}>About Me</Text>
              <Text style={styles.sectionBody}>{aboutMe}</Text>
            </View>

            <View style={styles.inlineStats}>
              <View style={styles.statBlock}>
                <Text style={styles.statLabel}>Punctuality</Text>
                <Text style={styles.statValue}>{punctuality}</Text>
              </View>
              <View style={[styles.statBlock, styles.statBlockLast]}>
                <Text style={styles.statLabel}>Ideal Pickup Location</Text>
                <Text style={styles.statValue}>{idealLocation}</Text>
              </View>
            </View>

            <View style={styles.memberRow}>
              <Ionicons name="calendar" size={16} color={palette.textSecondary} />
              <Text style={styles.memberText}>
                Member since {memberSince || 'recently'}
              </Text>
            </View>

            <View style={styles.ratingsCard}>
              <View style={styles.ratingStars}>
                {[0, 1, 2, 3, 4].map((index) => (
                  <Ionicons
                    key={index}
                    name={index < 4 ? 'star' : 'star-outline'}
                    size={18}
                    color={palette.primary}
                  />
                ))}
              </View>
              <Text style={styles.ratingScore}>4.4 / 5.0</Text>
              <Text style={styles.ratingHint}>Placeholder ratings. Real feedback will arrive with ride history.</Text>
            </View>
          </View>

          <View style={styles.connectionsCard}>
            <View style={styles.connectionsHeader}>
              <Ionicons name="people" size={18} color={palette.textPrimary} />
              <Text style={styles.connectionsTitle}>Connections</Text>
              <Text style={styles.connectionsCount}>(preview)</Text>
            </View>
            <Text style={styles.connectionsHint}>Connections syncing will arrive in a later build.</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: palette.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 16,
    width: '100%',
    maxWidth: 420,
    alignSelf: 'center',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backLabel: {
    color: palette.textPrimary,
    fontWeight: '600',
    marginLeft: 8,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editButton: {
    backgroundColor: palette.primary,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
  },
  editButtonText: {
    color: palette.textPrimary,
    fontWeight: '700',
  },
  signOutPill: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: palette.outline,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  signOutPillText: {
    color: palette.textSecondary,
    fontWeight: '600',
  },
  content: {
    paddingBottom: 60,
    width: '100%',
    alignItems: 'center',
  },
  contentWrapper: {
    width: '100%',
    maxWidth: 420,
    paddingHorizontal: 20,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: palette.surfaceAlt,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: palette.danger,
    padding: 12,
    marginBottom: 16,
  },
  errorIcon: {
    marginRight: 8,
  },
  errorText: {
    color: palette.danger,
    flex: 1,
    fontWeight: '600',
  },
  profileCard: {
    backgroundColor: palette.surface,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: palette.outline,
    marginBottom: 20,
  },
  avatarCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: palette.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  avatarLetter: {
    fontSize: 40,
    fontWeight: '700',
    color: palette.textPrimary,
  },
  profileRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  profileMeta: {
    flex: 1,
  },
  displayName: {
    fontSize: 24,
    fontWeight: '700',
    color: palette.textPrimary,
    marginBottom: 4,
  },
  handleRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  handleText: {
    color: palette.textSecondary,
    fontWeight: '600',
  },
  emailText: {
    color: palette.textSecondary,
    fontWeight: '600',
  },
  genderBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: palette.surfaceAlt,
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginLeft: 8,
  },
  genderText: {
    color: palette.textPrimary,
    marginLeft: 4,
    fontWeight: '600',
  },
  pointsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  pointsText: {
    color: palette.textSecondary,
    fontWeight: '600',
    marginLeft: 6,
  },
  sectionSpacing: {
    marginTop: 20,
  },
  sectionHeading: {
    color: palette.textPrimary,
    fontWeight: '700',
    marginBottom: 6,
  },
  sectionBody: {
    color: palette.textSecondary,
    lineHeight: 20,
  },
  inlineStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  statBlock: {
    flex: 1,
    backgroundColor: palette.surfaceAlt,
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: palette.outline,
    marginRight: 10,
  },
  statBlockLast: {
    marginRight: 0,
  },
  statLabel: {
    color: palette.textSecondary,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statValue: {
    color: palette.textPrimary,
    fontWeight: '700',
    marginTop: 6,
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
  },
  memberText: {
    color: palette.textSecondary,
    marginLeft: 8,
  },
  ratingsCard: {
    backgroundColor: palette.surfaceAlt,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: palette.outline,
    marginTop: 20,
  },
  ratingStars: {
    flexDirection: 'row',
  },
  ratingScore: {
    color: palette.textPrimary,
    fontWeight: '700',
    marginTop: 8,
  },
  ratingHint: {
    color: palette.textSecondary,
    marginTop: 4,
    fontSize: 12,
  },
  connectionsCard: {
    backgroundColor: palette.surface,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: palette.outline,
    marginBottom: 40,
  },
  connectionsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  connectionsTitle: {
    color: palette.textPrimary,
    fontWeight: '700',
    marginLeft: 8,
  },
  connectionsCount: {
    color: palette.textSecondary,
    marginLeft: 8,
    fontWeight: '600',
  },
  connectionsHint: {
    color: palette.textSecondary,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.background,
  },
  loadingLabel: {
    color: palette.textSecondary,
    marginTop: 12,
  },
});

export default ProfileScreen;
