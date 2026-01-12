import React, { useRef, useImperativeHandle, forwardRef } from 'react';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
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

const MapPickerView = forwardRef<MapPickerRef, MapPickerViewProps>(
  ({ style, currentLocation, markerCoordinate, onLongPress }, ref) => {
    const mapRef = useRef<MapView>(null);

    useImperativeHandle(ref, () => ({
      animateToRegion: (region) => {
        if (mapRef.current) {
          mapRef.current.animateToRegion(region, 300);
        }
      },
    }));

    return (
      <MapView
        ref={mapRef}
        style={style}
        provider={PROVIDER_GOOGLE}
        initialRegion={{
          latitude: currentLocation.latitude,
          longitude: currentLocation.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
        onLongPress={(e) => {
          const coord = e.nativeEvent.coordinate;
          if (coord) {
            onLongPress({ latitude: coord.latitude, longitude: coord.longitude });
          }
        }}
        showsUserLocation
        showsMyLocationButton={false}
      >
        {markerCoordinate && (
          <Marker
            coordinate={markerCoordinate}
            title="Meetup Point"
            pinColor={palette.primary}
          />
        )}
      </MapView>
    );
  }
);

MapPickerView.displayName = 'MapPickerView';

export default MapPickerView;

MapPickerViewNative.displayName = 'MapPickerViewNative';

export default MapPickerViewNative;
