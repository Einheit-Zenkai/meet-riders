"use client";

import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import L from "leaflet";
import redMarker from "@/public/red-pin.png";

export default function ViewOnlyMap({
  center,
  zoom = 12,
}: {
  center: { lat: number; lng: number };
  zoom?: number;
}) {
  // Guard against NaN and invalid coords
  const safeCenter = (
    center && Number.isFinite(center.lat) && Number.isFinite(center.lng)
      ? center
      : { lat: 20, lng: 0 }
  );

  return (
    <MapContainer
      center={[safeCenter.lat, safeCenter.lng]}
      zoom={zoom}
      style={{ height: "100%", width: "100%", borderRadius: 12, zIndex: 10 }}
      scrollWheelZoom={true}
      attributionControl={false}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker
        position={[safeCenter.lat, safeCenter.lng]}
        icon={L.icon({ iconUrl: redMarker.src, iconSize: [28, 44], iconAnchor: [14, 44] })}
      />
    </MapContainer>
  );
}
