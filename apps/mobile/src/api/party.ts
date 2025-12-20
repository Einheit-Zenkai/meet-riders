import type { PostgrestError } from '@supabase/supabase-js';

import { getSupabaseClient } from '../lib/supabase';

export interface HostStatus {
  userId: string;
  isHosting: boolean;
  university: string | null;
  showUniversityPreference: boolean;
}

type ProfilePreferencesRow = {
  university: string | null;
  show_university: boolean | null;
};

export class SupabaseUnavailableError extends Error {
  constructor() {
    super('Supabase client is not configured');
    this.name = 'SupabaseUnavailableError';
  }
}

const hasActiveParty = async (userId: string): Promise<boolean> => {
  const supabase = getSupabaseClient();
  if (!supabase) {
    throw new SupabaseUnavailableError();
  }

  const nowIso = new Date().toISOString();
  const { data, error } = await supabase
    .from('parties')
    .select('id', { count: 'exact', head: false })
    .eq('host_id', userId)
    .eq('is_active', true)
    .gt('expires_at', nowIso)
    .limit(1);

  if (error) {
    throw error;
  }

  return Array.isArray(data) && data.length > 0;
};

export const loadHostStatus = async (): Promise<HostStatus> => {
  const supabase = getSupabaseClient();
  if (!supabase) {
    throw new SupabaseUnavailableError();
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    throw userError;
  }

  if (!user) {
    throw new Error('You must be signed in to host a party.');
  }

  const [active, profileResult] = await Promise.all([
    hasActiveParty(user.id),
    supabase
      .from('profiles')
      .select('university, show_university')
      .eq('id', user.id)
      .maybeSingle<ProfilePreferencesRow>(),
  ]);

  if (profileResult.error && profileResult.error.code !== 'PGRST116') {
    throw profileResult.error;
  }

  return {
    userId: user.id,
    isHosting: active,
    university: profileResult.data?.university ?? null,
    showUniversityPreference: Boolean(profileResult.data?.show_university ?? false),
  };
};

export interface CreatePartyInput {
  hostId: string;
  meetupPoint: string;
  dropOff: string;
  partySize: number;
  rideOptions: string[];
  durationMinutes: number;
  isFriendsOnly: boolean;
  displayUniversity: boolean;
  hostUniversity?: string | null;
  hostComments?: string;
}

export interface CreatePartyResult {
  error?: PostgrestError;
}

export const createParty = async (input: CreatePartyInput): Promise<CreatePartyResult> => {
  const supabase = getSupabaseClient();
  if (!supabase) {
    throw new SupabaseUnavailableError();
  }

  const payload = {
    host_id: input.hostId,
    meetup_point: input.meetupPoint,
    drop_off: input.dropOff,
    party_size: input.partySize,
    ride_options: input.rideOptions,
    duration_minutes: input.durationMinutes,
    is_friends_only: input.isFriendsOnly,
    is_gender_only: false,
    host_comments: input.hostComments ?? null,
    display_university: input.displayUniversity,
    host_university: input.displayUniversity ? input.hostUniversity ?? null : null,
    is_active: true,
    expires_at: new Date(Date.now() + input.durationMinutes * 60_000).toISOString(),
  };

  const { error } = await supabase.from('parties').insert(payload as never);
  return { error: error ?? undefined };
};
