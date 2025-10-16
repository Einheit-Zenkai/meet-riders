"use client";
import React from "react";
import L, { LatLngExpression } from "leaflet";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import redMarker from "@/public/red-pin.png";

// Custom icons for start and destination
const startIcon = L.icon({
  iconUrl: redMarker.src,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

type LatLngLiteral = { lat: number; lng: number };

type RideMapProps = {
  startCoords: LatLngLiteral | null;
  setStartCoords: React.Dispatch<React.SetStateAction<LatLngLiteral | null>>;
  destCoords: LatLngLiteral | null;
  setDestCoords: React.Dispatch<React.SetStateAction<LatLngLiteral | null>>;
};

const RideMap: React.FC<RideMapProps> = ({ startCoords, setStartCoords, destCoords, setDestCoords }) => {
  const AddMarkers = () => {
    // Once both markers are set, stop reacting to further clicks
    const bothSet = Boolean(startCoords && destCoords);
    useMapEvents({
      click: (e) => {
        if (bothSet) return;
        const clicked = { lat: e.latlng.lat, lng: e.latlng.lng };
        if (!startCoords) {
          setStartCoords(clicked);
        } else if (!destCoords) {
          setDestCoords(clicked);
        }
      },
    });

    return (
      <>
  {startCoords && <Marker position={startCoords as LatLngExpression} icon={startIcon}/>}
  {destCoords && <Marker position={destCoords as LatLngExpression} icon={startIcon} />}
      </>
    );
  };

  return (
    <MapContainer center={[51.505, -0.09]} zoom={13} style={{ height: "400px", width: "100%" }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      <AddMarkers />
    </MapContainer>
  );
};

export default RideMap;