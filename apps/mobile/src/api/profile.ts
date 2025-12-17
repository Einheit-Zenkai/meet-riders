import { getSupabaseClient } from '../lib/supabase';

export interface ProfileData {
  nickname: string | null;
  bio: string | null;
  gender: string | null;
  punctuality: string | null;
  idealLocation: string | null;
  idealDepartureTime: string | null;
  rideOptions: Record<string, number> | null;
}

export const fetchProfile = async (): Promise<ProfileData | null> => {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return null;
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return null;
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('nickname, bio, gender, punctuality, ideal_location, ideal_departure_time, "rideOptions"')
    .eq('id', user.id)
    .maybeSingle();

  if (error || !data) {
    return {
      nickname: null,
      bio: null,
      gender: null,
      punctuality: null,
      idealLocation: null,
      idealDepartureTime: null,
      rideOptions: null,
    };
  }

  let parsedRideOptions: Record<string, number> | null = null;
  if (typeof data.rideOptions === 'string') {
    try {
      parsedRideOptions = JSON.parse(data.rideOptions);
    } catch {
      parsedRideOptions = null;
    }
  }

  return {
    nickname: data.nickname ?? null,
    bio: data.bio ?? null,
    gender: data.gender ?? null,
    punctuality: data.punctuality ?? null,
    idealLocation: data.ideal_location ?? null,
    idealDepartureTime: data.ideal_departure_time ?? null,
    rideOptions: parsedRideOptions,
  };
};

export interface SaveProfilePayload {
  nickname: string;
  bio: string;
  gender: string;
  punctuality: string;
  idealLocation: string;
  idealDepartureTime: string;
  rideOptions: Record<string, number>;
}

export const saveProfile = async (payload: SaveProfilePayload): Promise<void> => {
  const supabase = getSupabaseClient();
  if (!supabase) {
    throw new Error('Supabase client not configured');
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error('User not authenticated');
  }

  const { error } = await supabase
    .from('profiles')
    .update({
      nickname: payload.nickname,
      bio: payload.bio,
      gender: payload.gender,
      punctuality: payload.punctuality,
      ideal_location: payload.idealLocation,
      ideal_departure_time: payload.idealDepartureTime,
      rideOptions: JSON.stringify(payload.rideOptions),
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id);

  if (error) {
    throw error;
  }
};
