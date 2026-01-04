import type { PostgrestError } from '@supabase/supabase-js';

import { getSupabaseClient } from '../lib/supabase';
import { SupabaseUnavailableError } from './party';

type ProfilePreferencesRow = {
  university: string | null;
  show_university: boolean | null;
};

type SoiRow = {
  id: string;
  start_time: string | null;
  expiry_timestamp: string | null;
};

export interface SoiStatus {
  userId: string;
  isHosting: boolean;
  university: string | null;
  showUniversityPreference: boolean;
}

const hasActiveSoi = async (userId: string): Promise<boolean> => {
  const supabase = getSupabaseClient();
  if (!supabase) {
    throw new SupabaseUnavailableError();
  }

  const { data, error } = await supabase
    .from('soi_parties')
    .select('id,start_time,expiry_timestamp')
    .eq('host_id', userId)
    .eq('is_active', true);

  if (error) {
    throw error;
  }

  if (!Array.isArray(data)) {
    return false;
  }

  const nowMs = Date.now();
  const startThreshold = nowMs - 10 * 60 * 1000;

  return (data as SoiRow[]).some((row) => {
    const startMs = row.start_time ? new Date(row.start_time).getTime() : Number.NaN;
    const expiryMs = row.expiry_timestamp ? new Date(row.expiry_timestamp).getTime() : null;

    if (Number.isNaN(startMs)) {
      return false;
    }

    const withinStartWindow = startMs >= startThreshold;
    const notExpired = expiryMs == null || expiryMs > nowMs;
    return withinStartWindow && notExpired;
  });
};

export const loadSoiStatus = async (): Promise<SoiStatus> => {
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
    throw new Error('You must be signed in to create a Show of Interest.');
  }

  const [active, profileResult] = await Promise.all([
    hasActiveSoi(user.id),
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

export interface CreateSoiInput {
  hostId: string;
  meetupPoint: string;
  dropOff: string;
  partySize: number;
  rideOptions: string[];
  startTime: string; // HH:MM
  displayUniversity: boolean;
  hostUniversity?: string | null;
}

export interface CreateSoiResult {
  error?: PostgrestError;
}

const computeNextOccurrenceIso = (timeHHMM: string): string => {
  const [hhRaw, mmRaw] = timeHHMM.split(':');
  const hh = Number.parseInt(hhRaw || '0', 10);
  const mm = Number.parseInt(mmRaw || '0', 10);

  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hh, mm, 0, 0);
  if (start.getTime() <= now.getTime()) {
    start.setDate(start.getDate() + 1);
  }

  return start.toISOString();
};

export const createSoi = async (input: CreateSoiInput): Promise<CreateSoiResult> => {
  const supabase = getSupabaseClient();
  if (!supabase) {
    throw new SupabaseUnavailableError();
  }

  const payload = {
    host_id: input.hostId,
    party_size: input.partySize,
    meetup_point: input.meetupPoint,
    drop_off: input.dropOff,
    ride_options: input.rideOptions,
    start_time: computeNextOccurrenceIso(input.startTime),
    is_active: true,
    display_university: input.displayUniversity,
    host_university: input.displayUniversity ? input.hostUniversity ?? null : null,
  };

  const { error } = await supabase.from('soi_parties').insert([payload] as never);
  return { error: error ?? undefined };
};
