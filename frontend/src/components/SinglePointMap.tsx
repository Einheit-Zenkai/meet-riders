"use client";

import { MapContainer, TileLayer, Marker } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

const icon = L.icon({
  iconUrl: (markerIcon as any).src ?? (markerIcon as any),
  iconRetinaUrl: (markerIcon2x as any).src ?? (markerIcon2x as any),
  shadowUrl: (markerShadow as any).src ?? (markerShadow as any),
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

function toPoint(p?: { lat: number | string; lng: number | string } | null) {
  if (!p) return null;
  const lat = typeof p.lat === "string" ? parseFloat(p.lat) : p.lat;
  const lng = typeof p.lng === "string" ? parseFloat(p.lng) : p.lng;
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  return { lat, lng } as { lat: number; lng: number };
}

export default function SinglePointMap({ point, height = 180 }: { point?: { lat: number | string; lng: number | string } | null; height?: number }) {
  const pos = toPoint(point || null);
  if (!pos) return null;
  return (
    <div style={{ width: "100%", height }}>
      <MapContainer center={pos} zoom={14} style={{ width: "100%", height: "100%", borderRadius: 12 }} scrollWheelZoom={false}>
        <TileLayer attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <Marker position={pos} icon={icon} />
      </MapContainer>
    </div>
  );
}
