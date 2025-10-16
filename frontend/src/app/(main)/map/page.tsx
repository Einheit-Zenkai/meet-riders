"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const ViewOnlyMap = dynamic(() => import("@/components/view-only-map"), { ssr: false });

export default function MapPage() {
  // Default to a neutral center (e.g., 20, 0) and fallback zoom
  const [center, setCenter] = useState<{ lat: number; lng: number }>({ lat: 20, lng: 0 });
  const [zoom, setZoom] = useState(2);

  // Try to use user's location non-blockingly
  useEffect(() => {
    if (typeof navigator !== "undefined" && navigator.geolocation) {
      const id = navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return;
          setCenter({ lat: latitude, lng: longitude });
          setZoom(13);
        },
        () => {},
        { enableHighAccuracy: false, maximumAge: 60_000, timeout: 5_000 }
      );
      return () => {
        // no watch to clear
      };
    }
  }, []);

  return (
    <div className="p-0 sm:p-6 relative z-10">
      <div className="p-4 sm:px-0">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">Map</h1>
        <p className="text-sm text-muted-foreground">Explore the map. No input required.</p>
      </div>
      <div className="h-[calc(100dvh-8rem)] sm:h-[70dvh] w-full relative z-10">
        <ViewOnlyMap center={center} zoom={zoom} />
      </div>
    </div>
  );
}
