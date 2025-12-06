"use client";

import { MapContainer, TileLayer, Marker } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import redMarker from "@/public/red-pin.png";

const pin = L.icon({
  iconUrl: (redMarker as any).src ?? (redMarker as any),
  iconSize: [28, 44],
  iconAnchor: [14, 44],
});

function toPoint(p?: { lat: number | string; lng: number | string } | null) {
  if (!p) return null;
  const lat = typeof p.lat === "string" ? parseFloat(p.lat) : p.lat;
  const lng = typeof p.lng === "string" ? parseFloat(p.lng) : p.lng;
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  return { lat, lng } as { lat: number; lng: number };
}

export default function SinglePointMap({ point, height = 180 }: { point?: { lat: number | string; lng: number | string } | null; height?: number }) {
  const pos = toPoint(point || null) ?? { lat: 20, lng: 0 };
  return (
    <div style={{ width: "100%", height }}>
      <MapContainer
        center={pos}
        zoom={15}
        style={{ width: "100%", height: "100%", borderRadius: 12 }}
        scrollWheelZoom={false}
        dragging={false}
        doubleClickZoom={false}
        zoomControl={false}
        attributionControl={false}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <Marker position={pos} icon={pin} />
      </MapContainer>
    </div>
  );
}
