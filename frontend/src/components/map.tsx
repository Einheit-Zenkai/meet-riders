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

type RideMapProps = {
  startCoords: LatLngExpression | null;
  setStartCoords: (coords: LatLngExpression) => void;
  destCoords: LatLngExpression | null;
  setDestCoords: (coords: LatLngExpression) => void;
};

const RideMap: React.FC<RideMapProps> = ({ startCoords, setStartCoords, destCoords, setDestCoords }) => {
  const AddMarkers = () => {
    useMapEvents({
      click: (e) => {
        if (!startCoords) {
          setStartCoords(e.latlng);
        } else if (!destCoords) {
          setDestCoords(e.latlng);
        }
      },
    });

    return (
      <>
        {startCoords && <Marker position={startCoords} icon={startIcon}/>}
        {destCoords && <Marker position={destCoords} icon={startIcon} />}
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