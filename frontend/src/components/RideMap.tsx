import { MapContainer, TileLayer, Marker, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

interface RideMapProps {
  start?: { lat: number; lng: number } | null;
  dest?: { lat: number; lng: number } | null;
  height?: number | string;
}

export default function RideMap({ start, dest, height = 300 }: RideMapProps) {
  // Center map between start and dest, or default to India
  let center = { lat: 20.5937, lng: 78.9629 };
  if (start && dest) {
    center = {
      lat: (start.lat + dest.lat) / 2,
      lng: (start.lng + dest.lng) / 2,
    };
  } else if (start) {
    center = start;
  } else if (dest) {
    center = dest;
  }

  const markers = [];
  if (start) markers.push(<Marker key="start" position={start} />);
  if (dest) markers.push(<Marker key="dest" position={dest} />);

  return (
    <MapContainer
      center={center}
      zoom={start && dest ? 10 : 5}
      style={{ height, width: '100%' }}
      className="rounded-lg border"
      scrollWheelZoom={false}
      dragging={false}
      doubleClickZoom={false}
      zoomControl={false}
      attributionControl={false}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap contributors"
      />
      {markers}
      {start && dest && (
        <Polyline positions={[start, dest]} color="blue" />
      )}
    </MapContainer>
  );
}
