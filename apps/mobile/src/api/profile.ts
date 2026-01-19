import { getSupabaseClient } from '../lib/supabase';

export interface ProfileData {
  username: string | null;
  nickname: string | null;
  bio: string | null;
  gender: string | null;
  punctuality: string | null;
  idealLocation: string | null;
  idealDepartureTime: string | null;
  rideOptions: Record<string, number> | null;
  university: string | null;
  showUniversity: boolean;
  phoneNumber: string | null;
  showPhone: boolean;
  avatarUrl: string | null;
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
    .select(
      'username, nickname, bio, gender, punctuality, ideal_location, ideal_departure_time, university, show_university, phone_number, show_phone, avatar_url, "rideOptions"'
    )
    .eq('id', user.id)
    .maybeSingle();

  if (error || !data) {
    return {
      username: null,
      nickname: null,
      bio: null,
      gender: null,
      punctuality: null,
      idealLocation: null,
      idealDepartureTime: null,
      rideOptions: null,
      university: null,
      showUniversity: false,
      phoneNumber: null,
      showPhone: false,
      avatarUrl: null,
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
    username: data.username ?? null,
    nickname: data.nickname ?? null,
    bio: data.bio ?? null,
    gender: data.gender ?? null,
    punctuality: data.punctuality ?? null,
    idealLocation: data.ideal_location ?? null,
    idealDepartureTime: data.ideal_departure_time ?? null,
    rideOptions: parsedRideOptions,
    university: data.university ?? null,
    showUniversity: typeof data.show_university === 'boolean' ? data.show_university : false,
    phoneNumber: data.phone_number ?? null,
    showPhone: Boolean(data.show_phone),
    avatarUrl: data.avatar_url ?? null,
  };
};

export interface SaveProfilePayload {
  username: string;
  nickname: string;
  bio: string;
  gender: string;
  punctuality: string;
  idealLocation: string;
  idealDepartureTime: string;
  university: string;
  showUniversity: boolean;
  phoneNumber: string;
  showPhone: boolean;
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

  const trimmedUsername = payload.username.trim().toLowerCase();
  if (!trimmedUsername) {
    throw new Error('Username is required');
  }

  const { data: usernameOwner, error: usernameError } = await supabase
    .from('profiles')
    .select('id')
    .eq('username', trimmedUsername)
    .neq('id', user.id)
    .maybeSingle();

  if (usernameError) {
    throw usernameError;
  }

  if (usernameOwner) {
    const duplicationError = new Error('USERNAME_IN_USE');
    duplicationError.name = 'UsernameTaken';
    throw duplicationError;
  }

  const { error } = await supabase
    .from('profiles')
    .update({
      username: trimmedUsername,
      nickname: payload.nickname,
      bio: payload.bio,
      gender: payload.gender,
      punctuality: payload.punctuality,
      ideal_location: payload.idealLocation,
      ideal_departure_time: payload.idealDepartureTime,
      university: payload.university || null,
      show_university: payload.showUniversity,
      phone_number: payload.phoneNumber || null,
      show_phone: payload.showPhone,
      rideOptions: JSON.stringify(payload.rideOptions),
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id);

  if (error) {
    throw error;
  }
};

/**
 * Fetch another user's profile by their ID
 */
export const fetchProfileById = async (userId: string): Promise<ProfileData | null> => {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase
    .from('profiles')
    .select(
      'username, nickname, bio, gender, punctuality, ideal_location, ideal_departure_time, university, show_university, phone_number, show_phone, avatar_url, "rideOptions"'
    )
    .eq('id', userId)
    .maybeSingle();

  if (error || !data) {
    return null;
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
    username: data.username ?? null,
    nickname: data.nickname ?? null,
    bio: data.bio ?? null,
    gender: data.gender ?? null,
    punctuality: data.punctuality ?? null,
    idealLocation: data.ideal_location ?? null,
    idealDepartureTime: data.ideal_departure_time ?? null,
    rideOptions: parsedRideOptions,
    university: data.university ?? null,
    showUniversity: typeof data.show_university === 'boolean' ? data.show_university : false,
    phoneNumber: data.phone_number ?? null,
    showPhone: Boolean(data.show_phone),
    avatarUrl: data.avatar_url ?? null,
  };
};
