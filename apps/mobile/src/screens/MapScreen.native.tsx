import React, { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
  StatusBar,
  Keyboard,
} from 'react-native';
import MapView, { type LongPressEvent, Marker, PROVIDER_GOOGLE
} from 'react-native-maps';
import * as Location from 'expo-location';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import type { RootStackParamList } from '../navigation/AppNavigator';
import { palette } from '../theme/colors';
import { LocationSearchBar, ActiveUsersIndicator, LocationMarkerDisplay } from '../components/LocationComponents';
import { fetchActiveUsersNearLocation, ActiveUser, updateUserLocation, reverseGeocode, LocationSearchResult } from '../api/location';

type MapScreenProps = NativeStackScreenProps<RootStackParamList, 'Map'>;

type Coordinate = {
  latitude: number;
  longitude: number;
};

const defaultCoordinate: Coordinate = {
  latitude: 12.9716,
  longitude: 77.5946,
};

const MapScreen = ({ navigation, route }: MapScreenProps): JSX.Element => {
  const mapRef = useRef<MapView>(null);
  const [locating, setLocating] = useState(true);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [currentCoordinate, setCurrentCoordinate] = useState<Coordinate>(defaultCoordinate);
  const [pinnedCoordinate, setPinnedCoordinate] = useState<Coordinate | null>(null);
  const [pinnedAddress, setPinnedAddress] = useState<string | null>(null);

  // Active users state
  const [activeUsers, setActiveUsers] = useState<ActiveUser[]>([]);
  const [activeUsersLoading, setActiveUsersLoading] = useState(false);
  const [searchedLocation, setSearchedLocation] = useState<LocationSearchResult | null>(null);
  const [sharingLocation, setSharingLocation] = useState(false);

  // Get route params
  const routeStart = route.params?.start;
  const routeDestination = route.params?.destination;

  // Fetch active users when search location changes
  const loadActiveUsers = useCallback(async (lat: number, lng: number) => {
    setActiveUsersLoading(true);
    try {
      const users = await fetchActiveUsersNearLocation(lat, lng, 10);
      setActiveUsers(users);
    } catch (error) {
      console.error('Failed to fetch active users:', error);
      setActiveUsers([]);
    } finally {
      setActiveUsersLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;

    const init = async (): Promise<void> => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (!active) return;

        if (status !== 'granted') {
          setLocationError('Location permission denied. You can still search and pin locations.');
          setLocating(false);
          return;
        }

        const position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        if (!active) return;

        setCurrentCoordinate({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setLocating(false);
      } catch (error) {
        if (active) {
          const message = error instanceof Error ? error.message : 'Unable to get current location.';
          setLocationError(message);
          setLocating(false);
        }
      }
    };

    init();
    return () => {
      active = false;
    };
  }, []);

  const region = useMemo(
    () => ({
      latitude: searchedLocation?.latitude ?? pinnedCoordinate?.latitude ?? currentCoordinate.latitude,
      longitude: searchedLocation?.longitude ?? pinnedCoordinate?.longitude ?? currentCoordinate.longitude,
      latitudeDelta: 0.02,
      longitudeDelta: 0.02,
    }),
    [currentCoordinate, pinnedCoordinate, searchedLocation]
  );

  const handleLongPress = async (event: LongPressEvent): Promise<void> => {
    const { coordinate } = event.nativeEvent;
    setPinnedCoordinate({ latitude: coordinate.latitude, longitude: coordinate.longitude });
    // Get address for pinned location
    const address = await reverseGeocode(coordinate.latitude, coordinate.longitude);
    setPinnedAddress(address);
  };

  const handleLocationSelect = (location: LocationSearchResult) => {
    Keyboard.dismiss();
    setSearchedLocation(location);
    
    // Animate to the selected location
    mapRef.current?.animateToRegion({
      latitude: location.latitude,
      longitude: location.longitude,
      latitudeDelta: 0.02,
      longitudeDelta: 0.02,
    }, 500);

    // Fetch active users near this location
    loadActiveUsers(location.latitude, location.longitude);
  };

  const handleSearchClear = () => {
    setSearchedLocation(null);
    setActiveUsers([]);
  };

  const handleConfirmPin = (): void => {
    if (!pinnedCoordinate) {
      Alert.alert('Drop a pin', 'Long-press on the map to place a pin.');
      return;
    }

    Alert.alert(
      'Location Selected',
      pinnedAddress || `Lat: ${pinnedCoordinate.latitude.toFixed(6)}\nLng: ${pinnedCoordinate.longitude.toFixed(6)}`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Use Location', onPress: () => navigation.goBack() },
      ]
    );
  };

  const handleCenterOnUser = async () => {
    try {
      const position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const userCoord = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      };
      setCurrentCoordinate(userCoord);
      mapRef.current?.animateToRegion({
        ...userCoord,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      }, 500);
    } catch (error) {
      Alert.alert('Location Error', 'Unable to get your current location.');
    }
  };

  const toggleLocationSharing = () => {
    setSharingLocation(!sharingLocation);
    if (!sharingLocation) {
      updateUserLocation(currentCoordinate.latitude, currentCoordinate.longitude);
    }
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={20} color={palette.textPrimary} />
          <Text style={styles.backLabel}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Explore Map</Text>
        <TouchableOpacity 
          style={[styles.shareButton, sharingLocation && styles.shareButtonActive]} 
          onPress={toggleLocationSharing}
        >
          <Ionicons 
            name={sharingLocation ? 'radio' : 'radio-outline'} 
            size={20} 
            color={sharingLocation ? palette.textPrimary : palette.textSecondary} 
          />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <LocationSearchBar
          placeholder="Search for a location..."
          onLocationSelect={handleLocationSelect}
          onClear={handleSearchClear}
        />
      </View>

      <View style={styles.mapContainer}>
        {locating ? (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color={palette.primary} />
            <Text style={styles.loadingLabel}>Getting your location…</Text>
          </View>
        ) : null}

        <MapView
          ref={mapRef}
          style={StyleSheet.absoluteFillObject}
          provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
          initialRegion={region}
          onLongPress={handleLongPress}
          showsUserLocation
          showsMyLocationButton={false}
        >
          {/* Pinned location marker */}
          {pinnedCoordinate && (
            <Marker 
              coordinate={pinnedCoordinate} 
              title="Pinned Location"
              description={pinnedAddress || 'Long-press to move'}
              pinColor={palette.primary}
            />
          )}
          
          {/* Search result marker */}
          {searchedLocation && (
            <Marker
              coordinate={{
                latitude: searchedLocation.latitude,
                longitude: searchedLocation.longitude,
              }}
              title={searchedLocation.name}
              description={searchedLocation.displayName}
              pinColor="#3b82f6"
            />
          )}

          {/* Active users markers */}
          {activeUsers.map((user) => (
            <Marker
              key={user.userId}
              coordinate={{
                latitude: user.latitude,
                longitude: user.longitude,
              }}
              title={user.fullName || user.username || 'Rider'}
              pinColor="#22c55e"
            />
          ))}

          {/* Route markers if provided */}
          {routeStart && (
            <Marker coordinate={routeStart} title="Start Point" pinColor="#22c55e" />
          )}
          {routeDestination && (
            <Marker coordinate={routeDestination} title="Destination" pinColor="#ef4444" />
          )}
        </MapView>

        {/* FAB for centering on user */}
        <TouchableOpacity style={styles.fabButton} onPress={handleCenterOnUser}>
          <Ionicons name="locate" size={22} color={palette.textPrimary} />
        </TouchableOpacity>

        <View style={styles.bottomCard}>
          <View style={styles.bottomHeader}>
            <View style={styles.bottomRow}>
              <Ionicons name="map" size={18} color={palette.textPrimary} />
              <Text style={styles.bottomTitle}>Map Controls</Text>
            </View>
            <ActiveUsersIndicator 
              count={activeUsers.length} 
              onPress={() => {
                if (activeUsers.length > 0) {
                  Alert.alert(
                    'Nearby Riders',
                    `${activeUsers.length} rider(s) active nearby:\n${activeUsers.map(u => u.fullName || u.username || 'Anonymous').join(', ')}`
                  );
                }
              }}
            />
          </View>
          <Text style={styles.bottomSubtitle}>
            {searchedLocation 
              ? `Showing: ${searchedLocation.name}` 
              : 'Long-press to pin a location, or search above.'
            }
          </Text>

          {locationError && (
            <View style={styles.warningBanner}>
              <Ionicons name="warning" size={16} color="#f59e0b" />
              <Text style={styles.warningText}>{locationError}</Text>
            </View>
          )}

          {pinnedCoordinate && (
            <LocationMarkerDisplay
              latitude={pinnedCoordinate.latitude}
              longitude={pinnedCoordinate.longitude}
              label={pinnedAddress ? pinnedAddress.split(',')[0] : 'Pinned Location'}
              type="meetup"
            />
          )}

          <View style={styles.actionsRow}>
            <TouchableOpacity 
              style={styles.secondaryButton} 
              onPress={() => {
                setPinnedCoordinate(null);
                setPinnedAddress(null);
              }}
            >
              <Text style={styles.secondaryButtonText}>Clear Pin</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.primaryButton, !pinnedCoordinate && styles.primaryButtonDisabled]} 
              onPress={handleConfirmPin}
              disabled={!pinnedCoordinate}
            >
              <Text style={styles.primaryButtonText}>Confirm</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
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
    paddingTop: 50,
    paddingBottom: 12,
    backgroundColor: palette.background,
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
    fontSize: 18,
    fontWeight: '700',
  },
  shareButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: palette.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: palette.outline,
  },
  shareButtonActive: {
    backgroundColor: palette.primary,
    borderColor: palette.primary,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: palette.background,
    zIndex: 100,
  },
  mapContainer: {
    flex: 1,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 16,
    left: 16,
    right: 16,
    zIndex: 10,
    backgroundColor: palette.surface,
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: palette.outline,
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadingLabel: {
    color: palette.textSecondary,
    marginLeft: 12,
    fontWeight: '600',
  },
  fabButton: {
    position: 'absolute',
    right: 16,
    bottom: 240,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: palette.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: palette.outline,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  bottomCard: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 24,
    backgroundColor: palette.backgroundAlt,
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: palette.outline,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: -4 },
    elevation: 8,
  },
  bottomHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bottomTitle: {
    color: palette.textPrimary,
    fontWeight: '700',
    marginLeft: 8,
    fontSize: 16,
  },
  bottomSubtitle: {
    color: palette.textSecondary,
    marginBottom: 12,
    fontSize: 13,
  },
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: palette.surfaceAlt,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
    gap: 8,
  },
  warningText: {
    color: '#f59e0b',
    fontSize: 13,
    flex: 1,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 12,
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: palette.surface,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: palette.outline,
  },
  secondaryButtonText: {
    color: palette.textPrimary,
    fontWeight: '700',
    fontSize: 14,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: palette.primary,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonDisabled: {
    opacity: 0.5,
  },
  primaryButtonText: {
    color: palette.textPrimary,
    fontWeight: '700',
    fontSize: 14,
  },
});

export default MapScreen;
