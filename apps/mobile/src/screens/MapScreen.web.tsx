import 'leaflet/dist/leaflet.css';

import React, { useEffect, useMemo, useState } from 'react';
import { StatusBar, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { CircleMarker, MapContainer, TileLayer, useMapEvents } from 'react-leaflet';

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

const PinDropper = ({ onPin }: { onPin: (coord: Coordinate) => void }): null => {
  useMapEvents({
    click: (e) => {
      onPin({ latitude: e.latlng.lat, longitude: e.latlng.lng });
    },
  });
  return null;
};

const MapScreen = ({ navigation }: MapScreenProps): JSX.Element => {
  const [currentCoordinate, setCurrentCoordinate] = useState<Coordinate>(defaultCoordinate);
  const [pinnedCoordinate, setPinnedCoordinate] = useState<Coordinate | null>(null);
  const [locationStatus, setLocationStatus] = useState<'loading' | 'ready' | 'denied' | 'error'>('loading');

  useEffect(() => {
    let mounted = true;

    if (!('geolocation' in navigator)) {
      setLocationStatus('error');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        if (!mounted) return;
        setCurrentCoordinate({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
        setLocationStatus('ready');
      },
      () => {
        if (!mounted) return;
        setLocationStatus('denied');
      },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 30_000 }
    );

    return () => {
      mounted = false;
    };
  }, []);

  const center = useMemo(
    () => [pinnedCoordinate?.latitude ?? currentCoordinate.latitude, pinnedCoordinate?.longitude ?? currentCoordinate.longitude] as const,
    [currentCoordinate.latitude, currentCoordinate.longitude, pinnedCoordinate]
  );

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
        <View style={styles.mapFrame}>
          <MapContainer center={center as any} zoom={15} style={{ height: '100%', width: '100%' }}>
            <TileLayer
              attribution='&copy; OpenStreetMap contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <PinDropper onPin={setPinnedCoordinate} />
            {pinnedCoordinate ? (
              <CircleMarker
                center={[pinnedCoordinate.latitude, pinnedCoordinate.longitude] as any}
                radius={10}
                pathOptions={{ color: '#111827', fillColor: '#22c55e', fillOpacity: 0.85 }}
              />
            ) : null}
          </MapContainer>
        </View>

        <View style={styles.bottomCard}>
          <View style={styles.bottomRow}>
            <Ionicons name="pin" size={18} color={palette.textPrimary} />
            <Text style={styles.bottomTitle}>Click to drop a pin</Text>
          </View>
          <Text style={styles.bottomSubtitle}>
            {locationStatus === 'ready'
              ? 'Centered on your location.'
              : locationStatus === 'loading'
                ? 'Getting your location…'
                : locationStatus === 'denied'
                  ? 'Location permission denied. Using default center.'
                  : 'Location unavailable. Using default center.'}
          </Text>

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
    width: '100%',
    maxWidth: 420,
    alignSelf: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  mapFrame: {
    flex: 1,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: palette.outline,
    backgroundColor: palette.surface,
  },
  bottomCard: {
    marginTop: 12,
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
    fontWeight: '800',
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  secondaryButton: {
    backgroundColor: palette.surface,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: palette.outline,
  },
  secondaryButtonText: {
    color: palette.textPrimary,
    fontWeight: '800',
  },
});

export default MapScreen;
