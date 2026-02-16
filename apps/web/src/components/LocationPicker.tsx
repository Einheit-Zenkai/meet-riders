import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useState } from 'react';

interface LocationPickerProps {
  label: string;
  value: { lat: number; lng: number } | null;
  onChange: (coords: { lat: number; lng: number }) => void;
}

export default function LocationPicker({ label, value, onChange }: LocationPickerProps) {
  // Default to Sarjapur, Bangalore if no value
  const defaultPosition = value || { lat: 12.9150, lng: 77.6870 };

  function LocationMarker() {
    useMapEvents({
      click(e: any) {
        onChange(e.latlng);
      },
    });
    return value ? <Marker position={value} /> : null;
  }

  return (
    <div className="mb-4">
      <label className="block text-lg font-semibold mb-2">{label}</label>
      <MapContainer
        center={defaultPosition}
        zoom={14}
        style={{ height: 300, width: '100%' }}
        className="rounded-lg border"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />
        <LocationMarker />
      </MapContainer>
      {value && (
        <div className="mt-2 text-sm text-muted-foreground">
          Lat: {value.lat.toFixed(5)}, Lng: {value.lng.toFixed(5)}
        </div>
      )}
    </div>
  );
}
