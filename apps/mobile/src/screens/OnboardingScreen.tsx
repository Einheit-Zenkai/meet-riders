import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { RootStackParamList } from '../navigation/AppNavigator';
import { palette } from '../theme/colors';
import { showAlert } from '../utils/alert';
import { fetchProfile, saveProfile, type SaveProfilePayload } from '../api/profile';
import { getSupabaseClient } from '../lib/supabase';

const TRANSPORT_MODES = [
  { id: 'walking', label: 'Walking' },
  { id: 'bus', label: 'Bus' },
  { id: 'cab', label: 'Cab' },
  { id: 'auto', label: 'Auto' },
  { id: 'suv', label: 'SUV' },
  { id: 'bike', label: 'Bike' },
] as const;

const PREFERENCE_LEVELS = {
  UNSELECTED: 0,
  PRIMARY: 1,
  SECONDARY: 2,
  TERTIARY: 3,
  DISLIKED: -1,
} as const;

const levelLabels: Record<number, string> = {
  [PREFERENCE_LEVELS.UNSELECTED]: 'Add',
  [PREFERENCE_LEVELS.PRIMARY]: 'Top pick',
  [PREFERENCE_LEVELS.SECONDARY]: 'Second pick',
  [PREFERENCE_LEVELS.TERTIARY]: 'Third pick',
  [PREFERENCE_LEVELS.DISLIKED]: 'Disliked',
};

type PreferencesState = Record<(typeof TRANSPORT_MODES)[number]['id'], number>;

const buildInitialPreferences = (): PreferencesState => {
  return TRANSPORT_MODES.reduce<PreferencesState>((acc, mode) => {
    acc[mode.id] = PREFERENCE_LEVELS.UNSELECTED;
    return acc;
  }, {} as PreferencesState);
};

const OnboardingScreen = ({ navigation }: NativeStackScreenProps<RootStackParamList, 'Onboarding'>): JSX.Element => {
  const [nickname, setNickname] = useState('');
  const [bio, setBio] = useState('');
  const [punctuality, setPunctuality] = useState<'on-time' | 'usually-on-time' | 'flexible'>('on-time');
  const [gender, setGender] = useState<'male' | 'female' | 'they/them' | ''>('');
  const [idealLocation, setIdealLocation] = useState('');
  const [idealDepartureTime, setIdealDepartureTime] = useState('');
  const [preferences, setPreferences] = useState<PreferencesState>(buildInitialPreferences);
  const [loading, setLoading] = useState(false);
  const [initialising, setInitialising] = useState(true);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const profile = await fetchProfile();
        if (!mounted || !profile) {
          setInitialising(false);
          return;
        }

        if (profile.nickname) {
          setNickname(profile.nickname);
        }
        if (profile.bio) {
          setBio(profile.bio);
        }
        if (profile.gender === 'male' || profile.gender === 'female' || profile.gender === 'they/them') {
          setGender(profile.gender);
        }
        if (profile.punctuality === 'on-time' || profile.punctuality === 'usually-on-time' || profile.punctuality === 'flexible') {
          setPunctuality(profile.punctuality);
        }
        if (profile.idealLocation) {
          setIdealLocation(profile.idealLocation);
        }
        if (profile.idealDepartureTime) {
          setIdealDepartureTime(profile.idealDepartureTime);
        }
        if (profile.rideOptions) {
          setPreferences((prev) => ({ ...prev, ...profile.rideOptions }));
        }
      } catch (error) {
        console.error('Failed to load profile', error);
      } finally {
        if (mounted) {
          setInitialising(false);
        }
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const orderedSelections = useMemo(() => {
    const ranking = Object.entries(preferences)
      .filter(([, level]) => level > 0)
      .sort(([, a], [, b]) => a - b)
      .map(([id]) => id);
    const disliked = Object.entries(preferences)
      .filter(([, level]) => level === PREFERENCE_LEVELS.DISLIKED)
      .map(([id]) => id);
    return { ranking, disliked };
  }, [preferences]);

  const handlePreferencePress = (modeId: (typeof TRANSPORT_MODES)[number]['id']): void => {
    setPreferences((prev) => {
      const current = prev[modeId];
      let next = current + 1;
      if (current === PREFERENCE_LEVELS.DISLIKED) {
        next = PREFERENCE_LEVELS.UNSELECTED;
      } else if (next > PREFERENCE_LEVELS.TERTIARY) {
        next = PREFERENCE_LEVELS.DISLIKED;
      }
      return { ...prev, [modeId]: next };
    });
  };

  const handleSubmit = async (): Promise<void> => {
    if (!nickname.trim()) {
      showAlert('Nickname required', 'Please add a nickname before continuing.');
      return;
    }

    if (!gender) {
      showAlert('Gender required', 'Please select a gender option.');
      return;
    }

    try {
      setLoading(true);
      const payload: SaveProfilePayload = {
        username: nickname.trim().toLowerCase().replace(/[^a-z0-9_-]/g, ''),
        nickname: nickname.trim(),
        bio: bio.trim(),
        gender,
        punctuality,
        idealLocation: idealLocation.trim(),
        idealDepartureTime,
        university: '',
        showUniversity: false,
        phoneNumber: '',
        showPhone: false,
        rideOptions: preferences,
      };

      await saveProfile(payload);

      const supabase = getSupabaseClient();
      let userEmail = '';
      if (supabase) {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        userEmail = user?.email ?? '';
      }

      navigation.reset({
        index: 0,
        routes: [{ name: 'Home', params: { email: userEmail } }],
      });
    } catch (error: unknown) {
      if (error instanceof Error) {
        showAlert('Could not save profile', error.message);
      } else {
        showAlert('Could not save profile', 'Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (initialising) {
    return (
      <LinearGradient colors={[palette.background, palette.backgroundAlt]} style={styles.loadingShell}>
        <StatusBar barStyle="light-content" />
        <ActivityIndicator color={palette.textPrimary} size="large" />
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={[palette.background, palette.backgroundAlt]} style={styles.container}>
      <StatusBar barStyle="light-content" />
      <KeyboardAvoidingView behavior={Platform.select({ ios: 'padding', android: undefined })} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={styles.card}>
            <Text style={styles.heading}>Complete your profile</Text>
            <Text style={styles.subheading}>Tell riders a little about yourself.</Text>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Nickname</Text>
              <TextInput
                value={nickname}
                onChangeText={(value) => setNickname(value.replace(/[^a-zA-Z0-9_.]/g, ''))}
                placeholder="e.g. awesome_user123"
                placeholderTextColor={palette.textSecondary}
                style={styles.input}
                autoCapitalize="none"
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Bio / About Me</Text>
              <TextInput
                value={bio}
                onChangeText={setBio}
                placeholder="e.g. 3rd year CS student, friendly and loves music!"
                placeholderTextColor={palette.textSecondary}
                style={[styles.input, styles.textArea]}
                multiline
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Punctuality</Text>
              <View style={styles.chipRow}>
                {[
                  { id: 'on-time', label: 'Always on time' },
                  { id: 'usually-on-time', label: 'Usually on time' },
                  { id: 'flexible', label: 'Flexible' },
                ].map((option) => (
                  <TouchableOpacity
                    key={option.id}
                    style={[
                      styles.chip,
                      punctuality === option.id && styles.chipActive,
                    ]}
                    onPress={() => setPunctuality(option.id as typeof punctuality)}
                  >
                    <Text style={[styles.chipText, punctuality === option.id && styles.chipTextActive]}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Gender</Text>
              <View style={styles.chipRow}>
                {[
                  { id: 'male', label: 'Male' },
                  { id: 'female', label: 'Female' },
                  { id: 'they/them', label: 'They/Them' },
                ].map((option) => (
                  <TouchableOpacity
                    key={option.id}
                    style={[
                      styles.chip,
                      gender === option.id && styles.chipActive,
                    ]}
                    onPress={() => setGender(option.id as typeof gender)}
                  >
                    <Text style={[styles.chipText, gender === option.id && styles.chipTextActive]}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={styles.helper}>This will be shown to others in parties and on your profile.</Text>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Travel Preferences</Text>
              <Text style={styles.helper}>Tap successively to rank 1, 2, 3 or mark as disliked.</Text>
              <View style={styles.chipGrid}>
                {TRANSPORT_MODES.map((mode) => {
                  const level = preferences[mode.id];
                  return (
                    <TouchableOpacity
                      key={mode.id}
                      style={[
                        styles.preferenceChip,
                        level === PREFERENCE_LEVELS.PRIMARY && styles.prefPrimary,
                        level === PREFERENCE_LEVELS.SECONDARY && styles.prefSecondary,
                        level === PREFERENCE_LEVELS.TERTIARY && styles.prefTertiary,
                        level === PREFERENCE_LEVELS.DISLIKED && styles.prefDisliked,
                      ]}
                      onPress={() => handlePreferencePress(mode.id)}
                    >
                      <Text
                        style={[
                          styles.preferenceText,
                          (level === PREFERENCE_LEVELS.PRIMARY ||
                            level === PREFERENCE_LEVELS.SECONDARY ||
                            level === PREFERENCE_LEVELS.TERTIARY) && styles.preferenceTextActive,
                          level === PREFERENCE_LEVELS.DISLIKED && styles.preferenceTextDisliked,
                        ]}
                      >
                        {mode.label}
                      </Text>
                      <Text style={styles.preferenceLabel}>{levelLabels[level]}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Ideal Pickup / Drop-off Location</Text>
              <TextInput
                value={idealLocation}
                onChangeText={setIdealLocation}
                placeholder="e.g. Main College Gate"
                placeholderTextColor={palette.textSecondary}
                style={styles.input}
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Ideal time of leaving college</Text>
              <TextInput
                value={idealDepartureTime}
                onChangeText={setIdealDepartureTime}
                placeholder="HH:MM"
                placeholderTextColor={palette.textSecondary}
                style={styles.input}
              />
            </View>

            {orderedSelections.ranking.length > 0 && (
              <View style={styles.summaryBox}>
                <Text style={styles.summaryHeading}>Top picks:</Text>
                <Text style={styles.summaryText}>{orderedSelections.ranking.join(', ')}</Text>
                {orderedSelections.disliked.length > 0 && (
                  <Text style={[styles.summaryText, styles.summaryDisliked]}>
                    Disliked: {orderedSelections.disliked.join(', ')}
                  </Text>
                )}
              </View>
            )}

            <TouchableOpacity style={[styles.submitButton, loading && styles.submitDisabled]} onPress={handleSubmit} disabled={loading}>
              {loading ? (
                <ActivityIndicator color={palette.textPrimary} />
              ) : (
                <Text style={styles.submitButtonText}>Save and continue</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: palette.surface,
    borderRadius: 28,
    padding: 24,
    gap: 20,
    borderWidth: 1,
    borderColor: palette.outline,
  },
  heading: {
    fontSize: 24,
    fontWeight: '700',
    color: palette.textPrimary,
  },
  subheading: {
    fontSize: 16,
    color: palette.textSecondary,
  },
  fieldGroup: {
    gap: 10,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: palette.textPrimary,
  },
  helper: {
    fontSize: 12,
    color: palette.textSecondary,
  },
  input: {
    backgroundColor: palette.surfaceAlt,
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 14,
    color: palette.textPrimary,
    fontSize: 16,
    borderWidth: 1,
    borderColor: palette.outline,
  },
  textArea: {
    minHeight: 90,
    textAlignVertical: 'top',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: palette.outline,
    backgroundColor: palette.surfaceAlt,
  },
  chipActive: {
    backgroundColor: palette.primary,
    borderColor: palette.primary,
  },
  chipText: {
    color: palette.textPrimary,
    fontWeight: '600',
  },
  chipTextActive: {
    color: palette.textPrimary,
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  preferenceChip: {
    width: '48%',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: palette.outline,
    backgroundColor: palette.surfaceAlt,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  preferenceText: {
    color: palette.textPrimary,
    fontWeight: '600',
    fontSize: 15,
  },
  preferenceLabel: {
    marginTop: 6,
    color: palette.textSecondary,
    fontSize: 12,
  },
  prefPrimary: {
    backgroundColor: '#9f1239',
    borderColor: '#9f1239',
  },
  prefSecondary: {
    backgroundColor: '#881337',
    borderColor: '#881337',
  },
  prefTertiary: {
    backgroundColor: '#7f1d1d',
    borderColor: '#7f1d1d',
  },
  prefDisliked: {
    backgroundColor: '#450a0a',
    borderColor: '#991b1b',
  },
  preferenceTextActive: {
    color: palette.textPrimary,
  },
  preferenceTextDisliked: {
    color: '#fca5a5',
  },
  summaryBox: {
    backgroundColor: palette.surfaceAlt,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: palette.outline,
    gap: 4,
  },
  summaryHeading: {
    color: palette.textSecondary,
    fontWeight: '600',
  },
  summaryText: {
    color: palette.textPrimary,
    fontWeight: '600',
  },
  summaryDisliked: {
    color: '#fca5a5',
  },
  submitButton: {
    marginTop: 12,
    backgroundColor: palette.primary,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: palette.textPrimary,
    fontWeight: '700',
    fontSize: 16,
  },
  loadingShell: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default OnboardingScreen;
