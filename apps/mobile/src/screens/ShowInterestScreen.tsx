import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Pressable,
  Modal,
  Switch,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import type { RootStackParamList } from '../navigation/AppNavigator';
import { palette } from '../theme/colors';
import { showAlert } from '../utils/alert';
import { mobileMenuItems } from '../constants/menuItems';
import { createSoi, loadSoiStatus } from '../api/soi';
import { SupabaseUnavailableError } from '../api/party';

type ShowInterestScreenProps = NativeStackScreenProps<RootStackParamList, 'ShowInterest'>;

type RidePreference = 'On Foot' | 'Auto' | 'Cab' | 'Bus' | 'SUV';

const rideOptions: RidePreference[] = ['On Foot', 'Auto', 'Cab', 'Bus', 'SUV'];

const ShowInterestScreen = ({ navigation }: ShowInterestScreenProps): JSX.Element => {
  const [loading, setLoading] = useState(true);
  const [initializationError, setInitializationError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const [hostId, setHostId] = useState<string | null>(null);
  const [alreadyHosting, setAlreadyHosting] = useState(false);
  const [hostUniversity, setHostUniversity] = useState<string | null>(null);
  const [displayUniversity, setDisplayUniversity] = useState(false);

  const [partySize, setPartySize] = useState(1);
  const [meetupPoint, setMeetupPoint] = useState('');
  const [dropOff, setDropOff] = useState('');
  const [selectedRides, setSelectedRides] = useState<RidePreference[]>([]);
  const [startTime, setStartTime] = useState(''); // HH:MM

  useFocusEffect(
    useCallback(() => {
      let mounted = true;

      const initialize = async (): Promise<void> => {
        try {
          setLoading(true);
          setInitializationError(null);

          const status = await loadSoiStatus();
          if (!mounted) return;

          setHostId(status.userId);
          setAlreadyHosting(status.isHosting);
          setHostUniversity(status.university);
          setDisplayUniversity(Boolean(status.university) && status.showUniversityPreference);
        } catch (error) {
          if (!mounted) return;

          if (error instanceof SupabaseUnavailableError) {
            setInitializationError('Supabase is not configured; SOI is unavailable.');
            showAlert('Offline mode', 'Supabase client is not configured. SOI requires a Supabase setup.');
          } else if (error instanceof Error) {
            setInitializationError(error.message);
            showAlert('Unable to load', error.message);
          } else {
            setInitializationError('An unknown error occurred while initializing SOI.');
            showAlert('Unable to load', 'An unknown error occurred while preparing the SOI screen.');
          }
        } finally {
          if (mounted) {
            setLoading(false);
          }
        }
      };

      initialize();

      return () => {
        mounted = false;
      };
    }, [])
  );

  const toggleRidePreference = (option: RidePreference): void => {
    setSelectedRides((current) => {
      if (current.includes(option)) {
        return current.filter((ride) => ride !== option);
      }

      if (current.length >= 2) {
        showAlert('Limit reached', 'You can select a maximum of two ride options.');
        return current;
      }

      return [...current, option];
    });
  };

  const handleCreateSoi = (): void => {
    if (loading || initializationError) {
      showAlert('Unavailable', initializationError ?? 'Please wait for the screen to finish loading.');
      return;
    }

    if (!hostId) {
      showAlert('Sign-in required', 'Please sign in again to create a Show of Interest.');
      return;
    }

    if (alreadyHosting) {
      showAlert('Active SOI found', 'You already have an active Show of Interest. Cancel it before creating a new one.');
      return;
    }

    if (!meetupPoint.trim() || !dropOff.trim()) {
      showAlert('Missing information', 'Enter both the meetup point and the final destination.');
      return;
    }

    if (!startTime.trim() || !/^\d{2}:\d{2}$/.test(startTime.trim())) {
      showAlert('Start time required', 'Enter a start time in HH:MM format (e.g. 18:30).');
      return;
    }

    if (partySize < 1 || partySize > 7) {
      showAlert('Invalid party size', 'Party size should be between 1 and 7 riders.');
      return;
    }

    if (selectedRides.length === 0) {
      showAlert('Choose ride preferences', 'Select at least one preferred ride option.');
      return;
    }

    const create = async (): Promise<void> => {
      try {
        setSubmitting(true);
        const result = await createSoi({
          hostId,
          meetupPoint: meetupPoint.trim(),
          dropOff: dropOff.trim(),
          partySize,
          rideOptions: selectedRides,
          startTime: startTime.trim(),
          displayUniversity: displayUniversity && Boolean(hostUniversity),
          hostUniversity,
        });

        if (result.error) {
          const message = result.error.message || 'Failed to create SOI. Please try again.';
          showAlert('Unable to create SOI', message);
          return;
        }

        setAlreadyHosting(true);
        showAlert('SOI created', 'Your Show of Interest is live! Redirecting to home.', [
          {
            text: 'OK',
            onPress: () => navigation.navigate('Home', { email: '' }),
          },
        ]);
      } catch (error) {
        if (error instanceof SupabaseUnavailableError) {
          showAlert('Unavailable', 'Supabase client is not configured. SOI requires Supabase.');
        } else if (error instanceof Error) {
          showAlert('Unable to create SOI', error.message);
        } else {
          showAlert('Unable to create SOI', 'An unknown error occurred.');
        }
      } finally {
        setSubmitting(false);
      }
    };

    create();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={palette.primary} />
        <Text style={styles.loadingLabel}>Loading SOI details…</Text>
      </View>
    );
  }

  if (alreadyHosting) {
    return (
      <View style={styles.root}>
        <StatusBar barStyle="light-content" />
        <View style={styles.alreadyHostingCard}>
          <Ionicons name="alert-circle" size={52} color={palette.primary} style={styles.alreadyHostingIcon} />
          <Text style={styles.alreadyHostingTitle}>You're already hosting an SOI!</Text>
          <Text style={styles.alreadyHostingCopy}>
            You can only host one Show of Interest at a time. Cancel it from the dashboard (web) or wait until it ends.
          </Text>
          <TouchableOpacity style={styles.primaryButton} onPress={() => navigation.navigate('Home', { email: '' })}>
            <Text style={styles.primaryLabel}>Back to Home</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" />
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <Pressable style={styles.menuButton} onPress={() => setMenuOpen(true)}>
            <View style={styles.menuStripe} />
            <View style={styles.menuStripe} />
            <View style={styles.menuStripe} />
          </Pressable>
          <Text style={styles.screenTitle}>Show of Interest</Text>
        </View>

        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollArea} showsVerticalScrollIndicator={false}>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Meetup point</Text>
            <TextInput
              style={styles.input}
              placeholder="Where should everyone meet?"
              placeholderTextColor={palette.textSecondary}
              value={meetupPoint}
              onChangeText={setMeetupPoint}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Final destination</Text>
            <TextInput
              style={styles.input}
              placeholder="Where are you heading?"
              placeholderTextColor={palette.textSecondary}
              value={dropOff}
              onChangeText={setDropOff}
            />
          </View>

          <View style={styles.rowGroup}>
            <View style={styles.rowItem}>
              <Text style={styles.label}>Start time (HH:MM)</Text>
              <TextInput
                style={styles.input}
                placeholder="18:30"
                placeholderTextColor={palette.textSecondary}
                value={startTime}
                onChangeText={setStartTime}
                keyboardType="numeric"
              />
              <Text style={styles.helperText}>Next occurrence of this time</Text>
            </View>

            <View style={styles.rowItem}>
              <Text style={styles.label}>Max party size</Text>
              <View style={styles.counterRow}>
                <TouchableOpacity
                  style={styles.counterButton}
                  onPress={() => setPartySize((v) => Math.max(1, v - 1))}
                >
                  <Text style={styles.counterButtonText}>−</Text>
                </TouchableOpacity>
                <Text style={styles.counterValue}>{partySize}</Text>
                <TouchableOpacity
                  style={styles.counterButton}
                  onPress={() => setPartySize((v) => Math.min(7, v + 1))}
                >
                  <Text style={styles.counterButtonText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Ride preferences (max 2)</Text>
            <View style={styles.pillsRow}>
              {rideOptions.map((ride) => {
                const selected = selectedRides.includes(ride);
                return (
                  <TouchableOpacity
                    key={ride}
                    style={[styles.pill, selected ? styles.pillActive : styles.pillInactive]}
                    onPress={() => toggleRidePreference(ride)}
                  >
                    <Text style={[styles.pillText, selected ? styles.pillTextActive : styles.pillTextInactive]}>
                      {ride}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <View style={styles.switchCard}>
            <View style={styles.switchRow}>
              <View style={styles.switchTextBlock}>
                <Text style={styles.switchTitle}>Display university</Text>
                <Text style={styles.switchSubtitle}>
                  {hostUniversity ? `Show ${hostUniversity} on your SOI.` : 'Add a university in settings to enable this.'}
                </Text>
              </View>
              <Switch
                value={displayUniversity && Boolean(hostUniversity)}
                onValueChange={(next) => {
                  if (!hostUniversity) {
                    showAlert('Add university', 'Update your profile with a university to share it.');
                    return;
                  }

                  setDisplayUniversity(next);
                }}
                trackColor={{ false: palette.surface, true: palette.primary }}
                thumbColor={palette.textPrimary}
                disabled={!hostUniversity}
              />
            </View>
          </View>

          <TouchableOpacity
            style={[styles.primaryButton, submitting ? styles.primaryButtonDisabled : null]}
            disabled={submitting}
            onPress={handleCreateSoi}
          >
            {submitting ? <ActivityIndicator color={palette.textPrimary} /> : <Text style={styles.primaryLabel}>Create SOI</Text>}
          </TouchableOpacity>
        </ScrollView>
      </View>

      <Modal visible={menuOpen} animationType="fade" transparent>
        <View style={styles.menuOverlay}>
          <Pressable style={styles.menuBackdrop} onPress={() => setMenuOpen(false)} />
          <View style={styles.menuPanel}>
            {mobileMenuItems.map((item) => (
              <TouchableOpacity
                key={item.label}
                style={styles.menuItem}
                onPress={() => {
                  setMenuOpen(false);
                  switch (item.label) {
                    case 'Home':
                      navigation.navigate('Home');
                      return;
                    case 'Profile':
                      navigation.navigate('Profile');
                      return;
                    case 'Map':
                      navigation.navigate('Map');
                      return;
                    case 'Host Party':
                      navigation.navigate('HostParty');
                      return;
                    case 'Current Party':
                      navigation.navigate('CurrentParty');
                      return;
                    case 'Live Party':
                      navigation.navigate('LiveParty');
                      return;
                    case 'Show of Interest':
                      return;
                    case 'Connections':
                      navigation.navigate('Connections');
                      return;
                    case 'Leaderboard':
                      navigation.navigate('Leaderboard');
                      return;
                    case 'Expired':
                      navigation.navigate('Expired');
                      return;
                    case 'Settings':
                      navigation.navigate('Settings');
                      return;
                    default:
                      showAlert(item.label, 'Navigation coming soon.');
                  }
                }}
              >
                <Ionicons name={item.icon} size={22} color={palette.textPrimary} />
                <Text style={styles.menuLabel}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.background,
    paddingVertical: 24,
  },
  container: {
    width: '90%',
    maxWidth: 420,
    flex: 1,
    backgroundColor: palette.backgroundAlt,
    borderRadius: 32,
    padding: 24,
    borderWidth: 1,
    borderColor: palette.outline,
    shadowColor: '#000',
    shadowOpacity: 0.28,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 18 },
    elevation: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  menuButton: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: palette.surface,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: palette.outline,
  },
  menuStripe: {
    width: 22,
    height: 3,
    backgroundColor: palette.textPrimary,
    borderRadius: 2,
    alignSelf: 'center',
    marginVertical: 2,
  },
  screenTitle: {
    color: palette.textPrimary,
    fontWeight: '800',
    fontSize: 18,
    marginLeft: 14,
  },
  scroll: {
    flex: 1,
  },
  scrollArea: {
    paddingBottom: 24,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    color: palette.textPrimary,
    fontWeight: '700',
    marginBottom: 8,
  },
  input: {
    backgroundColor: palette.surface,
    borderRadius: 18,
    paddingHorizontal: 18,
    paddingVertical: 14,
    color: palette.textPrimary,
    borderWidth: 1,
    borderColor: palette.outline,
  },
  helperText: {
    color: palette.textSecondary,
    marginTop: 8,
    fontSize: 12,
  },
  rowGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  rowItem: {
    flex: 1,
  },
  counterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: palette.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: palette.outline,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  counterButton: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.backgroundAlt,
    borderWidth: 1,
    borderColor: palette.outline,
  },
  counterButtonText: {
    color: palette.textPrimary,
    fontWeight: '800',
    fontSize: 18,
  },
  counterValue: {
    color: palette.textPrimary,
    fontWeight: '800',
    fontSize: 18,
    minWidth: 28,
    textAlign: 'center',
  },
  sectionCard: {
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.outline,
    borderRadius: 22,
    padding: 16,
    marginBottom: 14,
  },
  sectionTitle: {
    color: palette.textPrimary,
    fontWeight: '800',
    marginBottom: 10,
  },
  pillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  pill: {
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginRight: 10,
    marginBottom: 10,
    borderWidth: 1,
  },
  pillActive: {
    backgroundColor: palette.primary,
    borderColor: palette.primary,
  },
  pillInactive: {
    backgroundColor: palette.backgroundAlt,
    borderColor: palette.outline,
  },
  pillText: {
    fontWeight: '700',
  },
  pillTextActive: {
    color: palette.textPrimary,
  },
  pillTextInactive: {
    color: palette.textSecondary,
  },
  switchCard: {
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.outline,
    borderRadius: 22,
    padding: 16,
    marginBottom: 18,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  switchTextBlock: {
    flex: 1,
    paddingRight: 12,
  },
  switchTitle: {
    color: palette.textPrimary,
    fontWeight: '800',
    marginBottom: 4,
  },
  switchSubtitle: {
    color: palette.textSecondary,
    fontSize: 12,
  },
  primaryButton: {
    backgroundColor: palette.primary,
    borderRadius: 22,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonDisabled: {
    opacity: 0.7,
  },
  primaryLabel: {
    color: palette.textPrimary,
    fontWeight: '800',
  },

  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.background,
    padding: 24,
  },
  loadingLabel: {
    marginTop: 14,
    color: palette.textSecondary,
    fontWeight: '700',
  },

  alreadyHostingCard: {
    width: '90%',
    maxWidth: 420,
    backgroundColor: palette.backgroundAlt,
    borderRadius: 32,
    padding: 24,
    borderWidth: 1,
    borderColor: palette.outline,
    alignItems: 'center',
  },
  alreadyHostingIcon: {
    marginBottom: 16,
  },
  alreadyHostingTitle: {
    color: palette.textPrimary,
    fontWeight: '900',
    fontSize: 20,
    marginBottom: 10,
    textAlign: 'center',
  },
  alreadyHostingCopy: {
    color: palette.textSecondary,
    textAlign: 'center',
    marginBottom: 18,
  },

  menuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuBackdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  menuPanel: {
    width: '85%',
    maxWidth: 360,
    backgroundColor: palette.backgroundAlt,
    borderRadius: 24,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: palette.outline,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 16,
  },
  menuLabel: {
    color: palette.textPrimary,
    fontWeight: '700',
    marginLeft: 12,
  },
});

export default ShowInterestScreen;
