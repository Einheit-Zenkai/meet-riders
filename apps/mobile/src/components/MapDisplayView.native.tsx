import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
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

const MapDisplayView: React.FC<MapDisplayViewProps> = ({
  style,
  meetupCoordinate,
  destinationCoordinate,
  meetupLabel = 'Meetup Point',
  destinationLabel = 'Destination',
}) => {
  if (!meetupCoordinate) {
    return (
      <View style={[styles.fallback, style]}>
        <Text style={styles.fallbackText}>No location set</Text>
      </View>
    );
  }

  return (
    <MapView
      style={[styles.map, style]}
      provider={PROVIDER_GOOGLE}
      initialRegion={{
        latitude: meetupCoordinate.latitude,
        longitude: meetupCoordinate.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }}
      showsUserLocation
      showsMyLocationButton={false}
    >
      <Marker
        coordinate={meetupCoordinate}
        title={meetupLabel}
        pinColor={palette.primary}
      />
      {destinationCoordinate && (
        <Marker
          coordinate={destinationCoordinate}
          title={destinationLabel}
          pinColor="green"
        />
      )}
    </MapView>
  );
};

const styles = StyleSheet.create({
  map: {
    width: '100%',
    height: 200,
    borderRadius: 16,
    overflow: 'hidden',
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
