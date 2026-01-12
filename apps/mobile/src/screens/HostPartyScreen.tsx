import React, { useCallback, useState, useRef } from 'react';
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
  Alert,
  ActivityIndicator,
  StatusBar,
  Platform,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';

import type { RootStackParamList } from '../navigation/AppNavigator';
import { palette } from '../theme/colors';
import { mobileMenuItems } from '../constants/menuItems';
import { createParty, loadHostStatus, SupabaseUnavailableError } from '../api/party';
import { reverseGeocode } from '../api/location';
import MapPickerView, { MapPickerRef } from '../components/MapPickerView';

const ridePreferences = ['On Foot', 'Auto', 'Cab', 'Bus', 'SUV'] as const;
const expiryOptions = [10, 15, 20, 30, 60] as const;

type RidePreference = (typeof ridePreferences)[number];
type ExpiryOption = (typeof expiryOptions)[number];

type HostPartyScreenProps = NativeStackScreenProps<RootStackParamList, 'HostParty'>;

type Coordinate = {
  latitude: number;
  longitude: number;
};

const defaultCoordinate: Coordinate = {
  latitude: 12.9716,
  longitude: 77.5946,
};

const HostPartyScreen = ({ navigation }: HostPartyScreenProps): JSX.Element => {
  const mapRef = useRef<MapPickerRef>(null);
  const [loading, setLoading] = useState(true);
  const [initializationError, setInitializationError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [hostId, setHostId] = useState<string | null>(null);
  const [alreadyHosting, setAlreadyHosting] = useState(false);
  const [hostUniversity, setHostUniversity] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [meetupPoint, setMeetupPoint] = useState('');
  const [destination, setDestination] = useState('');
  const [connectionsOnly, setConnectionsOnly] = useState(false);
  const [displayUniversity, setDisplayUniversity] = useState(false);
  const [maxPartySize, setMaxPartySize] = useState(2);
  const [comments, setComments] = useState('');
  const [selectedRides, setSelectedRides] = useState<RidePreference[]>([]);
  const [expiry, setExpiry] = useState<ExpiryOption>(10);

  // Map state
  const [meetupCoordinate, setMeetupCoordinate] = useState<Coordinate | null>(null);
  const [currentLocation, setCurrentLocation] = useState<Coordinate>(defaultCoordinate);
  const [mapExpanded, setMapExpanded] = useState(false);

  // Get user location on mount
  useFocusEffect(
    useCallback(() => {
      let mounted = true;

      const getLocation = async () => {
        try {
          const { status } = await Location.requestForegroundPermissionsAsync();
          if (status === 'granted') {
            const position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
            if (mounted) {
              setCurrentLocation({
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
              });
            }
          }
        } catch (error) {
          console.log('Location error:', error);
        }
      };

      getLocation();
      return () => { mounted = false; };
    }, [])
  );

  useFocusEffect(
    useCallback(() => {
      let mounted = true;

      const initialize = async (): Promise<void> => {
        try {
          setLoading(true);
          setInitializationError(null);
          const status = await loadHostStatus();
          if (!mounted) {
            return;
          }

          setHostId(status.userId);
          setAlreadyHosting(status.isHosting);
          setHostUniversity(status.university);
          setDisplayUniversity(Boolean(status.university) && status.showUniversityPreference);
        } catch (error) {
          if (!mounted) {
            return;
          }

          if (error instanceof SupabaseUnavailableError) {
            setInitializationError('Supabase is not configured; hosting is unavailable.');
            Alert.alert('Offline mode', 'Supabase client is not configured. Hosting requires a Supabase setup.');
          } else if (error instanceof Error) {
            setInitializationError(error.message);
            Alert.alert('Unable to load', error.message);
          } else {
            setInitializationError('An unknown error occurred while initializing host data.');
            Alert.alert('Unable to load', 'An unknown error occurred while preparing the host screen.');
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
        Alert.alert('Limit reached', 'You can select a maximum of two ride preferences.');
        return current;
      }

      return [...current, option];
    });
  };

  const handleStartParty = (): void => {
    if (loading || initializationError) {
      Alert.alert('Unavailable', initializationError ?? 'Please wait for the screen to finish loading.');
      return;
    }

    if (!hostId) {
      Alert.alert('Sign-in required', 'Please sign in again to host a party.');
      return;
    }

    if (alreadyHosting) {
      Alert.alert('Active party found', 'You already have an active party. End it before starting a new one.');
      return;
    }

    if (!meetupPoint.trim() || !destination.trim()) {
      Alert.alert('Missing information', 'Enter both the meetup point and the final destination.');
      return;
    }

    if (maxPartySize < 2 || maxPartySize > 7) {
      Alert.alert('Invalid party size', 'Party size should be between 2 and 7 riders.');
      return;
    }

    if (selectedRides.length === 0) {
      Alert.alert('Choose ride preferences', 'Select at least one preferred ride option.');
      return;
    }

    const create = async (): Promise<void> => {
      try {
        setSubmitting(true);
        const result = await createParty({
          hostId,
          meetupPoint: meetupPoint.trim(),
          dropOff: destination.trim(),
          partySize: maxPartySize,
          rideOptions: selectedRides,
          durationMinutes: expiry,
          isFriendsOnly: connectionsOnly,
          displayUniversity: displayUniversity && Boolean(hostUniversity),
          hostUniversity,
          hostComments: comments.trim() || undefined,
        });

        if (result.error) {
          const message = result.error.message || 'Failed to create party. Please try again.';
          if (message.toLowerCase().includes('active party')) {
            setAlreadyHosting(true);
            Alert.alert('Active party found', 'Let your existing party end or cancel it before creating another.');
            return;
          }

          Alert.alert('Unable to create party', message);
          return;
        }

        setAlreadyHosting(true);
        Alert.alert('Party created', 'Your ride party is live! Opening Current Party.', [
          {
            text: 'OK',
            onPress: () => navigation.navigate('CurrentParty'),
          },
        ]);
      } catch (error) {
        if (error instanceof SupabaseUnavailableError) {
          Alert.alert('Unavailable', 'Supabase client is not configured. Hosting requires Supabase.');
        } else if (error instanceof Error) {
          Alert.alert('Unable to create party', error.message);
        } else {
          Alert.alert('Unable to create party', 'An unknown error occurred.');
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
        <Text style={styles.loadingLabel}>Loading host details…</Text>
      </View>
    );
  }

  if (alreadyHosting) {
    return (
      <View style={styles.root}>
        <StatusBar barStyle="light-content" />
        <View style={styles.alreadyHostingCard}>
          <Ionicons name="alert-circle" size={52} color={palette.primary} style={styles.alreadyHostingIcon} />
          <Text style={styles.alreadyHostingTitle}>You're already hosting!</Text>
          <Text style={styles.alreadyHostingCopy}>
            You can only host one party at a time. Cancel your active party or wait for it to expire to start a new one.
          </Text>
          <TouchableOpacity style={styles.primaryButton} onPress={() => navigation.navigate('CurrentParty')}>
            <Text style={styles.primaryLabel}>View Current Party</Text>
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
          <Text style={styles.screenTitle}>Host a Party</Text>
        </View>

        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollArea} showsVerticalScrollIndicator={false}>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Meetup point (address)</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter the full meeting address"
              placeholderTextColor={palette.textSecondary}
              value={meetupPoint}
              onChangeText={setMeetupPoint}
            />
          </View>

          <View style={styles.mapSection}>
            <View style={styles.mapLabelRow}>
              <Text style={styles.label}>Select meetup on map</Text>
              <TouchableOpacity onPress={() => setMapExpanded(!mapExpanded)}>
                <Ionicons 
                  name={mapExpanded ? 'contract' : 'expand'} 
                  size={20} 
                  color={palette.textSecondary} 
                />
              </TouchableOpacity>
            </View>
            <View style={[styles.mapFrame, mapExpanded && styles.mapFrameExpanded]}>
              <MapPickerView
                ref={mapRef}
                style={StyleSheet.absoluteFillObject}
                currentLocation={currentLocation}
                markerCoordinate={meetupCoordinate}
                expanded={mapExpanded}
                onLongPress={async (coordinate) => {
                  setMeetupCoordinate(coordinate);
                  // Get address from coordinates
                  const address = await reverseGeocode(coordinate.latitude, coordinate.longitude);
                  if (address && !meetupPoint.trim()) {
                    setMeetupPoint(address.split(',').slice(0, 2).join(','));
                  }
                }}
              />
              {!meetupCoordinate && (
                <View style={styles.mapHint}>
                  <Ionicons name="hand-left" size={16} color={palette.textSecondary} />
                  <Text style={styles.mapHintText}>Long-press to set meetup point</Text>
                </View>
              )}
            </View>
            {meetupCoordinate && (
              <View style={styles.coordinateDisplay}>
                <Ionicons name="location" size={16} color={palette.primary} />
                <Text style={styles.coordinateText}>
                  {meetupCoordinate.latitude.toFixed(5)}, {meetupCoordinate.longitude.toFixed(5)}
                </Text>
                <TouchableOpacity onPress={() => setMeetupCoordinate(null)}>
                  <Ionicons name="close-circle" size={18} color={palette.textSecondary} />
                </TouchableOpacity>
              </View>
            )}
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Final Destination (address)</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your final destination address"
              placeholderTextColor={palette.textSecondary}
              value={destination}
              onChangeText={setDestination}
            />
          </View>

          <View style={styles.rowGroup}>
            <View style={styles.privacyBlock}>
              <Text style={styles.label}>Privacy</Text>
              <View style={styles.toggleRow}>
                <Switch
                  value={connectionsOnly}
                  onValueChange={setConnectionsOnly}
                  trackColor={{ false: palette.surfaceAlt, true: palette.primary }}
                  thumbColor={palette.textPrimary}
                />
                <Text style={styles.toggleLabel}>Connections only (Private Party)</Text>
              </View>
              <View style={styles.toggleRow}>
                <Switch
                  value={displayUniversity}
                  onValueChange={(value) => {
                    if (!hostUniversity) {
                      Alert.alert('Add university', 'Update your profile with a university to share it.');
                      return;
                    }

                    setDisplayUniversity(value);
                  }}
                  trackColor={{ false: palette.surfaceAlt, true: palette.primary }}
                  thumbColor={palette.textPrimary}
                  disabled={!hostUniversity}
                />
                <Text style={styles.toggleLabel}>
                  Display my university on this party
                  {!hostUniversity ? ' (add your university in Profile)' : ''}
                </Text>
              </View>
            </View>

            <View style={styles.partySizeBlock}>
              <Text style={styles.label}>Max party size</Text>
              <View style={styles.partySizeControl}>
                <TouchableOpacity
                  onPress={() => setMaxPartySize((value) => Math.max(2, value - 1))}
                  style={styles.sizeButton}
                >
                  <Ionicons name="remove" size={20} color={palette.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.partySizeValue}>{maxPartySize}</Text>
                <TouchableOpacity
                  onPress={() => setMaxPartySize((value) => Math.min(7, value + 1))}
                  style={styles.sizeButton}
                >
                  <Ionicons name="add" size={20} color={palette.textPrimary} />
                </TouchableOpacity>
              </View>
              <Text style={styles.partySizeHint}>Invites include you.</Text>
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Additional Comments (optional)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Add any special instructions, notes, or comments"
              placeholderTextColor={palette.textSecondary}
              value={comments}
              onChangeText={setComments}
              multiline
              numberOfLines={4}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Ideal ride from destination</Text>
            <View style={styles.chipRow}>
              {ridePreferences.map((option) => {
                const active = selectedRides.includes(option);
                return (
                  <TouchableOpacity
                    key={option}
                    style={[styles.chip, active && styles.chipActive]}
                    onPress={() => toggleRidePreference(option)}
                  >
                    <Text style={[styles.chipLabel, active && styles.chipLabelActive]}>{option}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Expire party request in</Text>
            <View style={styles.chipRow}>
              {expiryOptions.map((option) => {
                const active = expiry === option;
                return (
                  <TouchableOpacity
                    key={option}
                    style={[styles.radiusChip, active && styles.radiusChipActive]}
                    onPress={() => setExpiry(option)}
                  >
                    <View style={[styles.radioDot, active && styles.radioDotActive]} />
                    <Text style={[styles.chipLabel, active && styles.chipLabelActive]}>{option} min</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </ScrollView>

        <View style={styles.actionsRow}>
          <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.goBack()}>
            <Text style={styles.cancelLabel}>Cancel Party</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.primaryButton, submitting && styles.primaryButtonDisabled]}
            onPress={handleStartParty}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color={palette.textPrimary} />
            ) : (
              <Text style={styles.primaryLabel}>Start Party!</Text>
            )}
          </TouchableOpacity>
        </View>
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
                      return;
                    case 'Current Party':
                      navigation.navigate('CurrentParty');
                      return;
                    case 'Live Party':
                      navigation.navigate('LiveParty');
                      return;
                    case 'Show of Interest':
                      navigation.navigate('ShowInterest');
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
                      Alert.alert(item.label, 'Navigation coming soon.');
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: palette.background,
  },
  loadingLabel: {
    marginTop: 16,
    color: palette.textSecondary,
    fontSize: 16,
  },
  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.background,
    paddingVertical: 24,
  },
  alreadyHostingCard: {
    width: '90%',
    maxWidth: 420,
    backgroundColor: palette.surface,
    borderRadius: 28,
    padding: 28,
    borderWidth: 1,
    borderColor: palette.outline,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 12 },
    alignItems: 'center',
  },
  alreadyHostingIcon: {
    marginBottom: 8,
  },
  alreadyHostingTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: palette.textPrimary,
    marginBottom: 8,
  },
  alreadyHostingCopy: {
    textAlign: 'center',
    color: palette.textSecondary,
    fontSize: 15,
    marginBottom: 18,
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
    paddingBottom: 110,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
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
    marginLeft: 16,
    fontSize: 22,
    fontWeight: '700',
    color: palette.textPrimary,
  },
  scroll: {
    flex: 1,
  },
  scrollArea: {
    paddingBottom: 140,
  },
  formGroup: {
    marginBottom: 24,
  },
  label: {
    color: palette.textPrimary,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  input: {
    backgroundColor: palette.surface,
    borderRadius: 18,
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    paddingVertical: 14,
    color: palette.textPrimary,
    borderWidth: 1,
    borderColor: palette.outline,
  },
  mapSection: {
    marginBottom: 24,
  },
  mapLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  mapFrame: {
    height: 180,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: palette.outline,
    backgroundColor: palette.surfaceAlt,
    overflow: 'hidden',
    position: 'relative',
  },
  mapFrameExpanded: {
    height: 280,
  },
  mapHint: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    gap: 8,
  },
  mapHintText: {
    color: palette.textSecondary,
    fontSize: 13,
  },
  coordinateDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: palette.surface,
    marginTop: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: palette.outline,
    gap: 8,
  },
  coordinateText: {
    flex: 1,
    color: palette.textPrimary,
    fontFamily: 'monospace',
    fontSize: 12,
  },
  mapPlaceholder: {
    color: palette.textSecondary,
    fontStyle: 'italic',
  },
  rowGroup: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  privacyBlock: {
    flex: 1,
    backgroundColor: palette.surface,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: palette.outline,
    padding: 20,
    marginRight: 16,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  toggleLabel: {
    color: palette.textPrimary,
    marginLeft: 12,
    flex: 1,
  },
  partySizeBlock: {
    width: 150,
    backgroundColor: palette.surface,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: palette.outline,
    padding: 20,
    alignItems: 'center',
  },
  partySizeControl: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  sizeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: palette.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  partySizeValue: {
    color: palette.textPrimary,
    fontSize: 20,
    fontWeight: '700',
    marginHorizontal: 12,
  },
  partySizeHint: {
    color: palette.textSecondary,
    fontSize: 12,
  },
  textArea: {
    minHeight: 120,
    textAlignVertical: 'top',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  chip: {
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.outline,
    marginRight: 10,
    marginBottom: 10,
  },
  chipActive: {
    backgroundColor: palette.primary,
    borderColor: palette.primary,
  },
  chipLabel: {
    color: palette.textSecondary,
    fontWeight: '600',
  },
  chipLabelActive: {
    color: palette.textPrimary,
  },
  radiusChip: {
    borderRadius: 22,
    paddingHorizontal: 18,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.outline,
    marginRight: 10,
    marginBottom: 10,
  },
  radiusChipActive: {
    backgroundColor: palette.primary,
    borderColor: palette.primary,
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: palette.textSecondary,
  },
  radioDotActive: {
    backgroundColor: palette.textPrimary,
    borderColor: palette.textPrimary,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
  },
  cancelButton: {
    flex: 1,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: palette.outline,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: palette.surface,
    marginRight: 16,
  },
  cancelLabel: {
    color: palette.textSecondary,
    fontWeight: '600',
  },
  primaryButton: {
    flex: 1,
    borderRadius: 18,
    backgroundColor: palette.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
  },
  primaryButtonDisabled: {
    opacity: 0.7,
  },
  primaryLabel: {
    color: palette.textPrimary,
    fontWeight: '700',
  },
  menuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    paddingTop: 80,
    paddingHorizontal: 20,
    position: 'relative',
  },
  menuBackdrop: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 0,
  },
  menuPanel: {
    width: 260,
    backgroundColor: palette.surface,
    borderRadius: 20,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: palette.outline,
    zIndex: 1,
    marginTop: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  menuLabel: {
    color: palette.textPrimary,
    fontWeight: '600',
    fontSize: 15,
  },
});

export default HostPartyScreen;
