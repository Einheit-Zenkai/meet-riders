import React, { useImperativeHandle, forwardRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
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

// This is the web version - shows a fallback since react-native-maps doesn't support web
const MapPickerView = forwardRef<MapPickerRef, MapPickerViewProps>(
  ({ style }, ref) => {
    useImperativeHandle(ref, () => ({
      animateToRegion: () => {
        // No-op on web
      },
    }));

    return (
      <View style={[styles.webFallback, style]}>
        <Text style={styles.webFallbackText}>
          Map picker is not available on web.
        </Text>
        <Text style={styles.webFallbackHint}>
          Please use the mobile app or enter the address manually.
        </Text>
      </View>
    );
  }
);

MapPickerView.displayName = 'MapPickerView';

const styles = StyleSheet.create({
  webFallback: {
    backgroundColor: palette.surfaceAlt,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: palette.outline,
  },
  webFallbackText: {
    color: palette.textPrimary,
    fontWeight: '700',
    fontSize: 14,
    textAlign: 'center',
  },
  webFallbackHint: {
    color: palette.textSecondary,
    fontSize: 12,
    marginTop: 8,
    textAlign: 'center',
  },
});

export default MapPickerView;
