import React, { useImperativeHandle, forwardRef, useRef, useEffect, useState } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { palette } from '../theme/colors';

export interface MapPickerRef {
  animateToRegion: (region: {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  }) => void;
}

interface Coordinate {
  latitude: number;
  longitude: number;
}

interface MapPickerViewProps {
  style?: any;
  currentLocation: Coordinate;
  markerCoordinate: Coordinate | null;
  onLongPress: (coordinate: Coordinate) => void;
  expanded?: boolean;
}

// Dynamic imports for web only
let MapContainer: any;
let TileLayer: any;
let Marker: any;
let useMapEvents: any;
let L: any;

if (Platform.OS === 'web') {
  try {
    const ReactLeaflet = require('react-leaflet');
    MapContainer = ReactLeaflet.MapContainer;
    TileLayer = ReactLeaflet.TileLayer;
    Marker = ReactLeaflet.Marker;
    useMapEvents = ReactLeaflet.useMapEvents;
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

// Component to handle map click events
const MapClickHandler = ({ onLongPress }: { onLongPress: (coord: Coordinate) => void }) => {
  useMapEvents({
    click: (e: any) => {
      onLongPress({
        latitude: e.latlng.lat,
        longitude: e.latlng.lng,
      });
    },
  });
  return null;
};

const MapPickerView = forwardRef<MapPickerRef, MapPickerViewProps>(
  ({ style, currentLocation, markerCoordinate, onLongPress, expanded }, ref) => {
    const mapRef = useRef<any>(null);
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

    useImperativeHandle(ref, () => ({
      animateToRegion: (region) => {
        if (mapRef.current) {
          mapRef.current.flyTo([region.latitude, region.longitude], 15);
        }
      },
    }));

    // Don't render on server or if leaflet isn't loaded
    if (!isClient || !MapContainer || Platform.OS !== 'web') {
      return (
        <View style={[styles.fallback, style]}>
          <Text style={styles.fallbackText}>Loading map...</Text>
        </View>
      );
    }

    const customIcon = L ? new L.Icon({
      iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    }) : undefined;

    return (
      <View style={[styles.container, style, expanded && styles.containerExpanded]}>
        <MapContainer
          ref={mapRef}
          center={[currentLocation.latitude, currentLocation.longitude]}
          zoom={15}
          style={{ width: '100%', height: '100%', borderRadius: 16 }}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapClickHandler onLongPress={onLongPress} />
          {markerCoordinate && (
            <Marker
              position={[markerCoordinate.latitude, markerCoordinate.longitude]}
              icon={customIcon}
            />
          )}
        </MapContainer>
        <View style={styles.hint}>
          <Text style={styles.hintIcon}>👆</Text>
          <Text style={styles.hintText}>Click to set meetup point</Text>
        </View>
      </View>
    );
  }
);

MapPickerView.displayName = 'MapPickerView';

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 200,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: palette.surfaceAlt,
  },
  containerExpanded: {
    height: 350,
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
  hint: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.75)',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    gap: 8,
  },
  hintIcon: {
    fontSize: 14,
  },
  hintText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 13,
  },
});

export default MapPickerView;
