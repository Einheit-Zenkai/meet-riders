import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { palette } from '../theme/colors';

interface Coordinate {
  latitude: number;
  longitude: number;
}

interface MapDisplayViewProps {
  style?: any;
  meetupCoordinate: Coordinate | null;
  destinationCoordinate?: Coordinate | null;
  meetupLabel?: string;
  destinationLabel?: string;
}

// Dynamic imports for web only
let MapContainer: any;
let TileLayer: any;
let Marker: any;
let Popup: any;
let L: any;

if (Platform.OS === 'web') {
  try {
    const ReactLeaflet = require('react-leaflet');
    MapContainer = ReactLeaflet.MapContainer;
    TileLayer = ReactLeaflet.TileLayer;
    Marker = ReactLeaflet.Marker;
    Popup = ReactLeaflet.Popup;
    L = require('leaflet');

    // Fix for default marker icon
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
    });
  } catch (e) {
    console.warn('Leaflet not available:', e);
  }
}

const MapDisplayView: React.FC<MapDisplayViewProps> = ({
  style,
  meetupCoordinate,
  destinationCoordinate,
  meetupLabel = 'Meetup Point',
  destinationLabel = 'Destination',
}) => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    // Inject Leaflet CSS
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      const existingLink = document.getElementById('leaflet-css');
      if (!existingLink) {
        const link = document.createElement('link');
        link.id = 'leaflet-css';
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
        link.crossOrigin = '';
        document.head.appendChild(link);
      }
    }
  }, []);

  if (!meetupCoordinate) {
    return (
      <View style={[styles.fallback, style]}>
        <Text style={styles.fallbackText}>No location set</Text>
      </View>
    );
  }

  // Don't render on server or if leaflet isn't loaded
  if (!isClient || !MapContainer || Platform.OS !== 'web') {
    return (
      <View style={[styles.fallback, style]}>
        <Text style={styles.fallbackText}>Loading map...</Text>
      </View>
    );
  }

  const redIcon = L ? new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  }) : undefined;

  const greenIcon = L ? new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  }) : undefined;

  return (
    <View style={[styles.container, style]}>
      <MapContainer
        center={[meetupCoordinate.latitude, meetupCoordinate.longitude]}
        zoom={15}
        style={{ width: '100%', height: '100%', borderRadius: 16 }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker
          position={[meetupCoordinate.latitude, meetupCoordinate.longitude]}
          icon={redIcon}
        >
          <Popup>{meetupLabel}</Popup>
        </Marker>
        {destinationCoordinate && (
          <Marker
            position={[destinationCoordinate.latitude, destinationCoordinate.longitude]}
            icon={greenIcon}
          >
            <Popup>{destinationLabel}</Popup>
          </Marker>
        )}
      </MapContainer>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 200,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: palette.surfaceAlt,
  },
  fallback: {
    backgroundColor: palette.surfaceAlt,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200,
    borderWidth: 1,
    borderColor: palette.outline,
  },
  fallbackText: {
    color: palette.textSecondary,
    fontWeight: '600',
  },
});

export default MapDisplayView;
