import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
  StatusBar,
} from 'react-native';
import MapView, { type LongPressEvent, Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import type { RootStackParamList } from '../navigation/AppNavigator';
import { palette } from '../theme/colors';

type MapScreenProps = NativeStackScreenProps<RootStackParamList, 'Map'>;

type Coordinate = {
  latitude: number;
  longitude: number;
};

const defaultCoordinate: Coordinate = {
  latitude: 12.9716,
  longitude: 77.5946,
};

const MapScreen = ({ navigation }: MapScreenProps): JSX.Element => {
  const [locating, setLocating] = useState(true);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [currentCoordinate, setCurrentCoordinate] = useState<Coordinate>(defaultCoordinate);
  const [pinnedCoordinate, setPinnedCoordinate] = useState<Coordinate | null>(null);

  useEffect(() => {
    let active = true;

    const init = async (): Promise<void> => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (!active) return;

        if (status !== 'granted') {
          setLocationError('Location permission denied. You can still pin a place manually.');
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
      latitude: pinnedCoordinate?.latitude ?? currentCoordinate.latitude,
      longitude: pinnedCoordinate?.longitude ?? currentCoordinate.longitude,
      latitudeDelta: 0.02,
      longitudeDelta: 0.02,
    }),
    [currentCoordinate, pinnedCoordinate]
  );

  const handleLongPress = (event: LongPressEvent): void => {
    const { coordinate } = event.nativeEvent;
    setPinnedCoordinate({ latitude: coordinate.latitude, longitude: coordinate.longitude });
  };

  const handleConfirmPin = (): void => {
    if (!pinnedCoordinate) {
      Alert.alert('Drop a pin', 'Long-press on the map to place a pin.');
      return;
    }

    Alert.alert(
      'Pinned location',
      `Lat: ${pinnedCoordinate.latitude.toFixed(6)}\nLng: ${pinnedCoordinate.longitude.toFixed(6)}`
    );
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={20} color={palette.textPrimary} />
          <Text style={styles.backLabel}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Map</Text>
      </View>

      <View style={styles.mapContainer}>
        {locating ? (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color={palette.primary} />
            <Text style={styles.loadingLabel}>Getting your location…</Text>
          </View>
        ) : null}

        <MapView
          style={StyleSheet.absoluteFillObject}
          provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
          initialRegion={region}
          onLongPress={handleLongPress}
          showsUserLocation
          showsMyLocationButton
        >
          {pinnedCoordinate ? <Marker coordinate={pinnedCoordinate} title="Pinned location" /> : null}
        </MapView>

        <View style={styles.bottomCard}>
          <View style={styles.bottomRow}>
            <Ionicons name="pin" size={18} color={palette.textPrimary} />
            <Text style={styles.bottomTitle}>Drop a pin</Text>
          </View>
          <Text style={styles.bottomSubtitle}>Long-press anywhere on the map to pin a location.</Text>

          {locationError ? <Text style={styles.warningText}>{locationError}</Text> : null}

          <View style={styles.pinPreview}>
            <Text style={styles.pinLabel}>Pinned:</Text>
            <Text style={styles.pinValue}>
              {pinnedCoordinate
                ? `${pinnedCoordinate.latitude.toFixed(6)}, ${pinnedCoordinate.longitude.toFixed(6)}`
                : 'None'}
            </Text>
          </View>

          <View style={styles.actionsRow}>
            <TouchableOpacity style={styles.secondaryButton} onPress={() => setPinnedCoordinate(null)}>
              <Text style={styles.secondaryButtonText}>Clear</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.primaryButton} onPress={handleConfirmPin}>
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
    fontSize: 18,
    fontWeight: '700',
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
  bottomCard: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 16,
    backgroundColor: palette.backgroundAlt,
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: palette.outline,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  bottomTitle: {
    color: palette.textPrimary,
    fontWeight: '700',
    marginLeft: 8,
  },
  bottomSubtitle: {
    color: palette.textSecondary,
    marginBottom: 10,
  },
  warningText: {
    color: palette.textSecondary,
    marginBottom: 10,
  },
  pinPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: palette.surface,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: palette.outline,
    marginBottom: 12,
  },
  pinLabel: {
    color: palette.textSecondary,
    fontWeight: '600',
  },
  pinValue: {
    color: palette.textPrimary,
    fontWeight: '700',
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: palette.surface,
    borderRadius: 16,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: palette.outline,
    marginRight: 10,
  },
  secondaryButtonText: {
    color: palette.textPrimary,
    fontWeight: '700',
  },
  primaryButton: {
    flex: 1,
    backgroundColor: palette.primary,
    borderRadius: 16,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: palette.textPrimary,
    fontWeight: '700',
  },
});

export default MapScreen;
