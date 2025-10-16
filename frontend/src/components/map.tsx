import React from "react";
import { LatLngExpression } from "leaflet";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";

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
        {startCoords && <Marker position={startCoords} />}
        {destCoords && <Marker position={destCoords} />}
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