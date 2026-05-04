import { useEffect, useState } from "react";
import { Polyline, useMap } from "react-leaflet";

interface Waypoint {
  lat: number;
  lng: number;
  type: "pickup" | "dropoff";
  memberId: string;
}

export function OptimizedRoutePolyline({ members }: { members: any[] }) {
  const map = useMap();
  const [route, setRoute] = useState<Waypoint[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function fetchOptimization() {
      if (!members || members.length === 0) return;
      
      setIsLoading(true);
      try {
        const res = await fetch("/api/optimize-route", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ members }),
        });
        const data = await res.json();
        
        if (data.success && data.optimizedRoute) {
          setRoute(data.optimizedRoute);
          
          if (data.optimizedRoute.length > 0) {
            map.flyTo([data.optimizedRoute[0].lat, data.optimizedRoute[0].lng], 13);
          }
        }
      } catch (err) {
        console.error("Failed to fetch optimized route", err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchOptimization();
  }, [members, map]);

  if (isLoading) return null; // Or return a loader marker if needed
  if (route.length < 2) return null;

  const positions = route.map(wp => [wp.lat, wp.lng] as [number, number]);

  return (
    <>
      <Polyline positions={positions} color="blue" weight={5} opacity={0.7} />
      {/* Optionally render Markers for pickups and dropoffs here based on the 'route' array */}
    </>
  );
}