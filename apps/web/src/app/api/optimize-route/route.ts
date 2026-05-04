import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { members } = await req.json();

    if (!members || members.length === 0) {
      return NextResponse.json({ error: "No members provided" }, { status: 400 });
    }

    // A valid state requires a user to be picked up before being dropped off.
    // For small party sizes (e.g., max 4), we can calculate all permutations of 
    // [pickup_1, dropoff_1, pickup_2, dropoff_2, ...] and filter invalid ones.

    const locations: { type: "pickup" | "dropoff"; lat: number; lng: number; memberId: string }[] = [];
    members.forEach((m: any) => {
      if (m.pickup_coords && m.dropoff_coords) {
        locations.push({ type: "pickup", lat: m.pickup_coords[0], lng: m.pickup_coords[1], memberId: m.id });
        locations.push({ type: "dropoff", lat: m.dropoff_coords[0], lng: m.dropoff_coords[1], memberId: m.id });
      }
    });

    if (locations.length === 0) {
      return NextResponse.json({ error: "No valid coordinates provided for members" }, { status: 400 });
    }

    // --- Google Maps Distance Matrix Hook Placeholder ---
    // In production, send all these locations to Google Maps Distance Matrix API:
    // https://maps.googleapis.com/maps/api/distancematrix/json?origins=...&destinations=...&key=YOUR_API_KEY
    const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
      // Fallback: Haversine distance (straight line) for testing without an API key
      const R = 6371; // km
      const dLat = ((lat2 - lat1) * Math.PI) / 180;
      const dLon = ((lon2 - lon1) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
          Math.cos((lat2 * Math.PI) / 180) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c;
    };

    // Helper: generate valid permutations (pickup must precede dropoff for each member)
    const getValidPermutations = (locs: typeof locations) => {
      const results: typeof locations[] = [];

      const permute = (arr: typeof locations, m: typeof locations = []) => {
        if (arr.length === 0) {
          // Validate: check if all dropoffs happen AFTER their pickups
          let isValid = true;
          const pickedUp = new Set<string>();
          for (const loc of m) {
            if (loc.type === "pickup") {
              pickedUp.add(loc.memberId);
            } else if (loc.type === "dropoff") {
              if (!pickedUp.has(loc.memberId)) {
                isValid = false;
                break;
              }
            }
          }
          if (isValid) results.push(m);
        } else {
          for (let i = 0; i < arr.length; i++) {
            const curr = arr.slice();
            const next = curr.splice(i, 1);
            permute(curr.slice(), m.concat(next));
          }
        }
      };
      permute(locs);
      return results;
    };

    const validRoutes = getValidPermutations(locations);
    
    let bestRoute = null;
    let minDistance = Infinity;

    for (const route of validRoutes) {
      let currentDistance = 0;
      for (let i = 0; i < route.length - 1; i++) {
        currentDistance += getDistance(route[i].lat, route[i].lng, route[i+1].lat, route[i+1].lng);
      }

      if (currentDistance < minDistance) {
        minDistance = currentDistance;
        bestRoute = route;
      }
    }

    // Assume average speed = 30km/h (30/60 km/min = 0.5 km/min).
    const estimatedTimeMins = Math.round(minDistance / 0.5); 
    
    // Base fare: $2.00 + $1.50 per km.
    const averageFare = 2 + minDistance * 1.5;

    return NextResponse.json({
      success: true,
      optimizedRoute: bestRoute,
      stats: {
        totalDistanceKm: minDistance.toFixed(2),
        estimatedTimeMins,
        estimatedFare: `$${averageFare.toFixed(2)}`,
        note: "Using Haversine distance. Plug in Google Maps API for real road distances."
      }
    });
  } catch (error) {
    console.error("Routing Error:", error);
    return NextResponse.json({ error: "Failed to optimize route." }, { status: 500 });
  }
}