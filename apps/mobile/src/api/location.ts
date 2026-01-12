import { getSupabaseClient } from '../lib/supabase';

export interface ActiveUser {
  userId: string;
  username: string | null;
  fullName: string | null;
  latitude: number;
  longitude: number;
  lastUpdated: string;
}

export interface LocationSearchResult {
  name: string;
  displayName: string;
  latitude: number;
  longitude: number;
  type: string;
}

/**
 * Search for a location using OpenStreetMap Nominatim API
 */
export const searchLocation = async (query: string): Promise<LocationSearchResult[]> => {
  if (!query.trim()) return [];

  try {
    const encoded = encodeURIComponent(query.trim());
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encoded}&limit=5&countrycodes=in`,
      {
        headers: {
          'User-Agent': 'MeetRiders/1.0',
        },
      }
    );

    if (!response.ok) {
      console.error('Location search failed:', response.status);
      return [];
    }

    const data = await response.json();
    return data.map((item: any) => ({
      name: item.name || item.display_name.split(',')[0],
      displayName: item.display_name,
      latitude: parseFloat(item.lat),
      longitude: parseFloat(item.lon),
      type: item.type || 'place',
    }));
  } catch (error) {
    console.error('Location search error:', error);
    return [];
  }
};

/**
 * Reverse geocode coordinates to get address
 */
export const reverseGeocode = async (latitude: number, longitude: number): Promise<string | null> => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,
      {
        headers: {
          'User-Agent': 'MeetRiders/1.0',
        },
      }
    );

    if (!response.ok) return null;

    const data = await response.json();
    return data.display_name || null;
  } catch (error) {
    console.error('Reverse geocode error:', error);
    return null;
  }
};

/**
 * Update current user's location (for showing active users on map)
 */
export const updateUserLocation = async (latitude: number, longitude: number): Promise<void> => {
  const supabase = getSupabaseClient();
  if (!supabase) return;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  // Update or insert user location in user_locations table
  const { error } = await supabase.from('user_locations').upsert(
    {
      user_id: user.id,
      latitude,
      longitude,
      last_updated: new Date().toISOString(),
    } as never,
    { onConflict: 'user_id' }
  );

  if (error && !error.message.includes('does not exist')) {
    console.error('Failed to update user location:', error);
  }
};

/**
 * Fetch active users near a location
 */
export const fetchActiveUsersNearLocation = async (
  latitude: number,
  longitude: number,
  radiusKm: number = 10
): Promise<ActiveUser[]> => {
  const supabase = getSupabaseClient();
  if (!supabase) return [];

  // Simple bounding box calculation (approximation)
  const latDelta = radiusKm / 111; // 1 degree latitude ~ 111km
  const lonDelta = radiusKm / (111 * Math.cos(latitude * (Math.PI / 180)));

  const minLat = latitude - latDelta;
  const maxLat = latitude + latDelta;
  const minLon = longitude - lonDelta;
  const maxLon = longitude + lonDelta;

  // Only show users active in the last 15 minutes
  const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString();

  try {
    const { data, error } = await supabase
      .from('user_locations')
      .select('user_id, latitude, longitude, last_updated, profile:user_id(username, full_name)')
      .gte('latitude', minLat)
      .lte('latitude', maxLat)
      .gte('longitude', minLon)
      .lte('longitude', maxLon)
      .gte('last_updated', fifteenMinutesAgo);

    if (error) {
      // Table might not exist - return empty array
      if (error.code === '42P01' || error.message.includes('does not exist')) {
        return [];
      }
      console.error('Failed to fetch active users:', error);
      return [];
    }

    return (data ?? []).map((row: any) => ({
      userId: row.user_id,
      username: row.profile?.username ?? null,
      fullName: row.profile?.full_name ?? null,
      latitude: row.latitude,
      longitude: row.longitude,
      lastUpdated: row.last_updated,
    }));
  } catch (err) {
    console.error('Error fetching active users:', err);
    return [];
  }
};

/**
 * Get count of active users near a location
 */
export const getActiveUsersCount = async (
  latitude: number,
  longitude: number,
  radiusKm: number = 10
): Promise<number> => {
  const users = await fetchActiveUsersNearLocation(latitude, longitude, radiusKm);
  return users.length;
};
