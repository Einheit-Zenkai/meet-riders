import { MapContainer, TileLayer, Marker, Polyline } from "react-leaflet";
import "leaflet/dist/leaflet.css";

interface RideMapProps {
  start?: { lat: number | string; lng: number | string } | null;
  dest?: { lat: number | string; lng: number | string } | null;
  height?: number | string;
  isReadOnly?: boolean; // New prop to disable interactions
}

const SARJAPUR_CENTER = { lat: 12.9150, lng: 77.6870 };
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

export default function RideMap({
  start,
  dest,
  height = 300,
  isReadOnly = false,
}: RideMapProps) {
  const s = toPoint(start);
  const d = toPoint(dest);
  if (!s || !d) return null;

  function clampToBounds(point: { lat: number; lng: number }) {
    const clampedLat = Math.max(
      BENGALURU_BOUNDS[0][0],
      Math.min(BENGALURU_BOUNDS[1][0], point.lat)
    );
    const clampedLng = Math.max(
      BENGALURU_BOUNDS[0][1],
      Math.min(BENGALURU_BOUNDS[1][1], point.lng)
    );
    return { lat: clampedLat, lng: clampedLng };
  }

  const center = clampToBounds({
    lat: (s.lat + d.lat) / 2,
    lng: (s.lng + d.lng) / 2,
  });

  console.log("Start Point:", s);
  console.log("Destination Point:", d);
  console.log("Calculated Center:", center);
  console.log("Bangalore Bounds:", BENGALURU_BOUNDS);

  return (
    <div style={{ width: "100%", height }}>
      <MapContainer
        center={center}
        zoom={13}
        style={{ width: "100%", height: "100%", borderRadius: 12 }}
        maxBounds={BENGALURU_BOUNDS}
        minZoom={11}
        maxZoom={18}
        scrollWheelZoom={!isReadOnly} // Disable scroll zoom if read-only
        dragging={!isReadOnly} // Disable dragging if read-only
        maxBoundsViscosity={1.0}
      >
        <TileLayer
          attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker
          position={s}
          icon={new window.L.DivIcon({
            html: `<img src='/assets/RedIcon.png' style='width:25px;height:41px;' alt='Start Icon' />`,
            className: "custom-marker",
          })}
        />
        <Marker
          position={d}
          icon={new window.L.DivIcon({
            html: `<img src='/assets/GreenIcon.png' style='width:25px;height:41px;' alt='Destination Icon' />`,
            className: "custom-marker",
          })}
        />
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