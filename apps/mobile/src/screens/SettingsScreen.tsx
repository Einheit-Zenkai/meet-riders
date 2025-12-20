import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

import type { RootStackParamList } from '../navigation/AppNavigator';
import { palette } from '../theme/colors';
import { fetchProfile, saveProfile } from '../api/profile';
import { getSupabaseClient } from '../lib/supabase';

const transportModes = [
  { id: 'walking', label: 'Walking', icon: 'walk-outline' as const },
  { id: 'bus', label: 'Bus', icon: 'bus-outline' as const },
  { id: 'cab', label: 'Cab', icon: 'car-outline' as const },
  { id: 'auto', label: 'Auto', icon: 'car-sport-outline' as const },
  { id: 'suv', label: 'SUV', icon: 'car-outline' as const },
  { id: 'bike', label: 'Bike', icon: 'bicycle-outline' as const },
];

const PREFERENCE_LEVELS = {
  UNSELECTED: 0,
  PRIMARY: 1,
  SECONDARY: 2,
  TERTIARY: 3,
  DISLIKED: -1,
} as const;

type PreferenceMap = Record<string, number>;

type SettingsScreenProps = NativeStackScreenProps<RootStackParamList, 'Settings'>;

const createDefaultPreferences = (): PreferenceMap => {
  return transportModes.reduce<PreferenceMap>((acc, mode) => {
    acc[mode.id] = PREFERENCE_LEVELS.UNSELECTED;
    return acc;
  }, {});
};

const SettingsScreen = ({ navigation }: SettingsScreenProps): JSX.Element => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [preferences, setPreferences] = useState<PreferenceMap>(createDefaultPreferences);

  const [username, setUsername] = useState('');
  const [nickname, setNickname] = useState('');
  const [bio, setBio] = useState('');
  const [gender, setGender] = useState('');
  const [punctuality, setPunctuality] = useState('on-time');
  const [idealLocation, setIdealLocation] = useState('');
  const [idealDepartureTime, setIdealDepartureTime] = useState('');
  const [university, setUniversity] = useState('');
  const [showUniversity, setShowUniversity] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [showPhone, setShowPhone] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  const supabaseAvailable = useMemo(() => Boolean(getSupabaseClient()), []);

  useEffect(() => {
    let active = true;

    const loadProfile = async (): Promise<void> => {
      if (!supabaseAvailable) {
        setLoading(false);
        setErrorMessage('Supabase client is not configured. Settings are unavailable in offline mode.');
        return;
      }

      try {
        const profile = await fetchProfile();
        if (!active) {
          return;
        }

        if (profile) {
          setUsername(profile.username ?? '');
          setNickname(profile.nickname ?? '');
          setBio(profile.bio ?? '');
          setGender(profile.gender ?? '');
          setPunctuality(profile.punctuality ?? 'on-time');
          setIdealLocation(profile.idealLocation ?? '');
          setIdealDepartureTime(profile.idealDepartureTime ?? '');
          setUniversity(profile.university ?? '');
          setShowUniversity(profile.showUniversity);
          setPhoneNumber(profile.phoneNumber ?? '');
          setShowPhone(profile.showPhone);
          setAvatarUrl(profile.avatarUrl);

          const ridePrefs = profile.rideOptions ?? null;
          if (ridePrefs) {
            setPreferences({ ...createDefaultPreferences(), ...ridePrefs });
          } else {
            setPreferences(createDefaultPreferences());
          }
        }
      } catch (error) {
        if (active) {
          const message = error instanceof Error ? error.message : 'Unable to load profile';
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
  }, [supabaseAvailable]);

  const cyclePreference = (modeId: string): void => {
    setPreferences((current) => {
      const nextValue = (() => {
        const currentValue = current[modeId] ?? PREFERENCE_LEVELS.UNSELECTED;
        if (currentValue === PREFERENCE_LEVELS.DISLIKED) {
          return PREFERENCE_LEVELS.PRIMARY;
        }
        if (currentValue === PREFERENCE_LEVELS.TERTIARY) {
          return PREFERENCE_LEVELS.UNSELECTED;
        }
        return (currentValue + 1) as number;
      })();

      return { ...current, [modeId]: nextValue };
    });
  };

  const toggleDislike = (modeId: string): void => {
    setPreferences((current) => {
      const currentValue = current[modeId] ?? PREFERENCE_LEVELS.UNSELECTED;
      const nextValue = currentValue === PREFERENCE_LEVELS.DISLIKED ? PREFERENCE_LEVELS.UNSELECTED : PREFERENCE_LEVELS.DISLIKED;
      return { ...current, [modeId]: nextValue };
    });
  };

  const handleSave = async (): Promise<void> => {
    if (!supabaseAvailable) {
      Alert.alert('Unavailable', 'Supabase client is not configured. Settings cannot be saved.');
      return;
    }

    if (saving) {
      return;
    }

    try {
      setSaving(true);
      setErrorMessage(null);

      await saveProfile({
        username,
        nickname,
        bio,
        gender,
        punctuality,
        idealLocation,
        idealDepartureTime,
        university,
        showUniversity,
        phoneNumber,
        showPhone,
        rideOptions: preferences,
      });

      Alert.alert('Settings saved', 'Your preferences have been updated.', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'USERNAME_IN_USE') {
          Alert.alert('Username taken', 'Please choose a different username.');
        } else {
          Alert.alert('Save failed', error.message);
        }
      } else {
        Alert.alert('Save failed', 'An unexpected error occurred while saving settings.');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async (): Promise<void> => {
    const supabase = getSupabaseClient();
    if (supabase) {
      await supabase.auth.signOut();
    }
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  };

  const preferenceChips = transportModes.map((mode) => {
    const value = preferences[mode.id] ?? PREFERENCE_LEVELS.UNSELECTED;

    return (
      <TouchableOpacity
        key={mode.id}
        style={[
          styles.preferenceChip,
          styles.chipSpacing,
          value === PREFERENCE_LEVELS.PRIMARY && styles.prefPrimary,
          value === PREFERENCE_LEVELS.SECONDARY && styles.prefSecondary,
          value === PREFERENCE_LEVELS.TERTIARY && styles.prefTertiary,
          value === PREFERENCE_LEVELS.DISLIKED && styles.prefDisliked,
        ]}
        onPress={() => cyclePreference(mode.id)}
        activeOpacity={0.8}
      >
        <Ionicons name={mode.icon} size={16} color={palette.textPrimary} style={styles.preferenceIcon} />
        <Text style={styles.preferenceLabel}>{mode.label}</Text>
      </TouchableOpacity>
    );
  });

  const dislikedRow = transportModes.filter((mode) => (preferences[mode.id] ?? 0) === PREFERENCE_LEVELS.UNSELECTED).map((mode) => (
    <TouchableOpacity
      key={mode.id}
      style={[styles.dislikedChip, styles.chipSpacing]}
      onPress={() => toggleDislike(mode.id)}
      activeOpacity={0.8}
    >
      <Ionicons name={mode.icon} size={16} color={palette.textSecondary} style={styles.preferenceIcon} />
      <Text style={styles.preferenceLabel}>{mode.label}</Text>
    </TouchableOpacity>
  ));

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={palette.primary} />
        <Text style={styles.loadingLabel}>Loading settings…</Text>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={20} color={palette.textPrimary} />
          <Text style={styles.backLabel}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.contentWrapper}>
          {!supabaseAvailable ? (
            <View style={styles.offlineNotice}>
              <Text style={styles.offlineTitle}>Offline preview</Text>
              <Text style={styles.offlineSubtitle}>
                Supabase credentials are not configured in this build. You can review settings but changes cannot be saved.
              </Text>
              <TouchableOpacity style={styles.secondaryButton} onPress={() => navigation.goBack()}>
                <Text style={styles.secondaryButtonText}>Back to Home</Text>
              </TouchableOpacity>
            </View>
          ) : null}

          <View style={styles.sectionCard}>
            <View style={styles.avatarCircle}>
              <Ionicons name="person" size={48} color={palette.textSecondary} />
            </View>
            <Text style={styles.sectionTitle}>Profile Picture</Text>
            <Text style={styles.sectionSubtitle}>Avatar upload from mobile will arrive soon.</Text>
            {avatarUrl ? <Text style={styles.avatarHint}>Current avatar: {avatarUrl}</Text> : null}
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => Alert.alert('Coming soon', 'Avatar upload is not available in the mobile preview yet.')}
            >
              <Text style={styles.secondaryButtonText}>Select Image</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Settings</Text>

            <View style={styles.formField}>
              <Text style={styles.label}>Username</Text>
              <TextInput
                value={username}
                onChangeText={(value) => setUsername(value.replace(/[^a-z0-9_-]/g, '').toLowerCase())}
                placeholder="e.g. john_doe"
                placeholderTextColor={palette.textSecondary}
                style={styles.input}
                autoCapitalize="none"
              />
              <Text style={styles.helperText}>
                Your unique identifier. Students should use roll numbers.
              </Text>
            </View>

            <View style={styles.formField}>
              <Text style={styles.label}>Nickname</Text>
              <TextInput
                value={nickname}
                onChangeText={(value) => setNickname(value.replace(/[^a-zA-Z0-9_.]/g, ''))}
                placeholder="e.g. awesome_user"
                placeholderTextColor={palette.textSecondary}
                style={styles.input}
              />
            </View>

            <View style={styles.formField}>
              <Text style={styles.label}>Bio / About Me</Text>
              <TextInput
                value={bio}
                onChangeText={setBio}
                placeholder="Share something about yourself"
                placeholderTextColor={palette.textSecondary}
                style={[styles.input, styles.multilineInput]}
                multiline
              />
            </View>

            <View style={styles.formField}>
              <Text style={styles.label}>University (optional)</Text>
              <TextInput
                value={university}
                onChangeText={setUniversity}
                placeholder="e.g. NIT Surat"
                placeholderTextColor={palette.textSecondary}
                style={styles.input}
              />
              <View style={styles.switchRow}>
                <Switch value={showUniversity} onValueChange={setShowUniversity} />
                <Text style={styles.switchLabel}>Display my university publicly</Text>
              </View>
            </View>

            <View style={styles.formField}>
              <Text style={styles.label}>Punctuality</Text>
              <View style={styles.punctualityRow}>
                {[
                  { id: 'on-time', label: 'Always on time' },
                  { id: 'usually-on-time', label: 'Usually on time' },
                  { id: 'flexible', label: 'Flexible' },
                ].map((option) => (
                  <TouchableOpacity
                    key={option.id}
                    style={[styles.punctualityChip, punctuality === option.id && styles.punctualityChipActive]}
                    onPress={() => setPunctuality(option.id)}
                  >
                    <Text
                      style={[styles.punctualityLabel, punctuality === option.id && styles.punctualityLabelActive]}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.formField}>
              <Text style={styles.label}>Ideal Pickup/Drop-off Location</Text>
              <TextInput
                value={idealLocation}
                onChangeText={setIdealLocation}
                placeholder="e.g. Main College Gate"
                placeholderTextColor={palette.textSecondary}
                style={styles.input}
              />
            </View>

            <View style={styles.formField}>
              <Text style={styles.label}>Ideal time of leaving college</Text>
              <TextInput
                value={idealDepartureTime}
                onChangeText={setIdealDepartureTime}
                placeholder="HH:MM"
                placeholderTextColor={palette.textSecondary}
                style={styles.input}
              />
            </View>

            <View style={styles.formField}>
              <Text style={styles.label}>Travel Preferences</Text>
              <Text style={styles.helperTextSmall}>Tap to cycle through priority levels (1, 2, 3). Disliked options can be marked below.</Text>
              <View style={styles.preferenceRow}>{preferenceChips}</View>
            </View>

            <View style={styles.formField}>
              <Text style={styles.label}>Not Preferred Modes</Text>
              <Text style={styles.helperTextSmall}>Tap to toggle red for disliked rides.</Text>
              <View style={styles.preferenceRow}>{dislikedRow}</View>
            </View>

            <View style={styles.formField}>
              <Text style={styles.label}>Phone number (private by default)</Text>
              <TextInput
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                placeholder="e.g. +91 98765 43210"
                placeholderTextColor={palette.textSecondary}
                style={styles.input}
                keyboardType="phone-pad"
              />
              <View style={styles.switchRow}>
                <Switch value={showPhone} onValueChange={setShowPhone} />
                <Text style={styles.switchLabel}>Show my contact to people who join my ride</Text>
              </View>
            </View>
          </View>

          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Security</Text>
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => navigation.navigate('ForgotPassword')}
            >
              <Text style={styles.secondaryButtonText}>Change Password</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Danger Zone</Text>
            <Text style={styles.helperTextSmall}>Deleting your account is permanent. This action is disabled in the preview build.</Text>
            <TouchableOpacity
              style={styles.dangerButton}
              onPress={() => Alert.alert('Unavailable', 'Account deletion is handled from the web dashboard.')}
            >
              <Text style={styles.dangerButtonText}>Delete Account</Text>
            </TouchableOpacity>
          </View>

          {errorMessage ? <Text style={styles.errorLabel}>{errorMessage}</Text> : null}

          <TouchableOpacity
            style={[styles.primaryButton, saving && styles.primaryButtonDisabled]}
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color={palette.textPrimary} />
            ) : (
              <Text style={styles.primaryLabel}>Save Settings</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
            <Text style={styles.signOutLabel}>Sign out</Text>
          </TouchableOpacity>
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
  headerTitle: {
    color: palette.textPrimary,
    fontSize: 20,
    fontWeight: '700',
  },
  content: {
    paddingBottom: 40,
    width: '100%',
    alignItems: 'center',
  },
  contentWrapper: {
    width: '100%',
    maxWidth: 420,
    paddingHorizontal: 20,
  },
  offlineNotice: {
    backgroundColor: palette.surfaceAlt,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: palette.outline,
    marginBottom: 20,
  },
  offlineTitle: {
    color: palette.textPrimary,
    fontWeight: '700',
    marginBottom: 6,
  },
  offlineSubtitle: {
    color: palette.textSecondary,
    marginBottom: 12,
  },
  sectionCard: {
    backgroundColor: palette.surface,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: palette.outline,
    marginBottom: 20,
  },
  sectionTitle: {
    color: palette.textPrimary,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  sectionSubtitle: {
    color: palette.textSecondary,
    marginBottom: 12,
  },
  avatarCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: palette.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 16,
  },
  avatarHint: {
    color: palette.textSecondary,
    fontSize: 12,
    marginBottom: 8,
    textAlign: 'center',
  },
  secondaryButton: {
    alignSelf: 'flex-start',
    backgroundColor: palette.surfaceAlt,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: palette.outline,
  },
  secondaryButtonText: {
    color: palette.textPrimary,
    fontWeight: '600',
  },
  formField: {
    marginBottom: 18,
  },
  label: {
    color: palette.textPrimary,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    backgroundColor: palette.surfaceAlt,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: palette.textPrimary,
    borderWidth: 1,
    borderColor: palette.outline,
  },
  multilineInput: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  helperText: {
    color: palette.textSecondary,
    fontSize: 12,
    marginTop: 6,
  },
  helperTextSmall: {
    color: palette.textSecondary,
    fontSize: 12,
    marginBottom: 8,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  switchLabel: {
    color: palette.textPrimary,
    flex: 1,
    marginLeft: 12,
  },
  punctualityRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  punctualityChip: {
    backgroundColor: palette.surfaceAlt,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: palette.outline,
    marginRight: 10,
    marginBottom: 10,
  },
  punctualityChipActive: {
    backgroundColor: palette.primary,
    borderColor: palette.primary,
  },
  punctualityLabel: {
    color: palette.textSecondary,
    fontWeight: '600',
  },
  punctualityLabelActive: {
    color: palette.textPrimary,
  },
  preferenceRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  preferenceChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: palette.surfaceAlt,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: palette.outline,
  },
  chipSpacing: {
    marginRight: 10,
    marginBottom: 10,
  },
  preferenceIcon: {
    marginRight: 8,
  },
  preferenceLabel: {
    color: palette.textPrimary,
    fontWeight: '600',
  },
  prefPrimary: {
    backgroundColor: palette.primary,
    borderColor: palette.primary,
  },
  prefSecondary: {
    backgroundColor: '#3c82f6',
    borderColor: '#3c82f6',
  },
  prefTertiary: {
    backgroundColor: '#facc15',
    borderColor: '#facc15',
  },
  prefDisliked: {
    backgroundColor: palette.danger,
    borderColor: palette.danger,
  },
  dislikedChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: palette.surfaceAlt,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: palette.outline,
  },
  primaryButton: {
    backgroundColor: palette.primary,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    marginTop: 8,
  },
  primaryButtonDisabled: {
    opacity: 0.7,
  },
  primaryLabel: {
    color: palette.textPrimary,
    fontWeight: '700',
    fontSize: 16,
  },
  secondarySection: {
    marginTop: 12,
  },
  dangerButton: {
    backgroundColor: palette.danger,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    marginTop: 10,
  },
  dangerButtonText: {
    color: palette.textPrimary,
    fontWeight: '700',
  },
  signOutButton: {
    marginTop: 16,
    alignItems: 'center',
  },
  signOutLabel: {
    color: palette.textSecondary,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.background,
    paddingHorizontal: 24,
  },
  loadingLabel: {
    marginTop: 16,
    color: palette.textSecondary,
  },
  errorLabel: {
    color: palette.danger,
    marginTop: 8,
    textAlign: 'center',
  },
});

export default SettingsScreen;
