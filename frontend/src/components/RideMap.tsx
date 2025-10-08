import { MapContainer, TileLayer, Marker, Polyline } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

// Custom icons for start and destination
const startIcon = L.icon({
  iconUrl: markerIcon.src ?? markerIcon,
  iconRetinaUrl: markerIcon2x.src ?? markerIcon2x,
  shadowUrl: markerShadow.src ?? markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const destIcon = L.icon({
  iconUrl: markerIcon2x.src ?? markerIcon2x, // You can use a different image for destination
  iconRetinaUrl: markerIcon2x.src ?? markerIcon2x,
  shadowUrl: markerShadow.src ?? markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface RideMapProps {
  start?: { lat: number | string; lng: number | string } | null;
  dest?: { lat: number | string; lng: number | string } | null;
  height?: number | string;
}

const BENGALURU_CENTER = { lat: 12.9716, lng: 77.5946 };
const BENGALURU_BOUNDS: [[number, number], [number, number]] = [
  [12.8, 77.4],
  [13.1, 77.8],
];

function toPoint(p?: { lat: number | string; lng: number | string } | null) {
  if (!p) return null;
  const lat = typeof p.lat === "string" ? parseFloat(p.lat) : p.lat;
  const lng = typeof p.lng === "string" ? parseFloat(p.lng) : p.lng;
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  return { lat, lng } as { lat: number; lng: number };
}

export default function RideMap({ start, dest, height = 300 }: RideMapProps) {
  // Only render the map if both start and dest are valid
  const s = toPoint(start);
  const d = toPoint(dest);
  if (!s || !d) return null;

  const center = {
    lat: (s.lat + d.lat) / 2,
    lng: (s.lng + d.lng) / 2,
  };

  return (
    <div style={{ width: "100%", height }}>
      <MapContainer
        center={center}
        zoom={13}
        style={{ width: "100%", height: "100%", borderRadius: 12 }}
        maxBounds={BENGALURU_BOUNDS}
        minZoom={11}
        maxZoom={18}
        scrollWheelZoom={false}
        dragging={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={s} icon={startIcon} />
        <Marker position={d} icon={destIcon} />
        <Polyline
          positions={[
            [s.lat, s.lng],
            [d.lat, d.lng],
          ]}
          color="blue"
        />
      </MapContainer>
    </div>
  );
}