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

export type SoiParty = {
  id: number;
  hostId: string;
  partySize: number;
  meetupPoint: string;
  dropOff: string;
  rideOptions: string[];
  startTime: string;
  expiryTimestamp: string | null;
  hostUniversity: string | null;
  displayUniversity: boolean;
  isActive: boolean;
  currentMemberCount?: number;
  userIsMember?: boolean;
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
    console.error('[createSoi] Supabase client is not available');
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

  console.log('[createSoi] Inserting payload:', JSON.stringify(payload, null, 2));

  const { data, error } = await supabase.from('soi_parties').insert([payload] as never).select();
  
  console.log('[createSoi] Result - data:', data, 'error:', error);
  
  return { error: error ?? undefined };
};

/**
 * Fetch active SOI parties visible to the current user.
 * Uses the same 10-minute start window as the web dashboard.
 */
export const fetchActiveSoiFeed = async (): Promise<SoiParty[]> => {
  const supabase = getSupabaseClient();
  if (!supabase) {
    throw new SupabaseUnavailableError();
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const userId = user?.id ?? null;
  const nowMs = Date.now();
  const startThreshold = new Date(nowMs - 10 * 60 * 1000).toISOString();

  const { data, error } = await supabase
    .from('soi_parties')
    .select('*')
    .eq('is_active', true)
    .gte('start_time', startThreshold)
    .order('start_time', { ascending: true });

  if (error) {
    throw error;
  }

  if (!Array.isArray(data)) {
    return [];
  }

  // Fetch membership info
  const soiIds = data.map((row: any) => String(row.id));
  const membershipSet = new Set<string>();
  const membersBySoi = new Map<string, Array<{ user_id: string; status: string }>>();

  if (soiIds.length > 0) {
    const { data: memberRows, error: memberError } = await supabase
      .from('soi_members')
      .select('soi_id, user_id, status')
      .in('soi_id', soiIds);

    if (!memberError && memberRows) {
      for (const row of memberRows as any[]) {
        if (row.status === 'left' || row.status === 'kicked') continue;
        const soiId = String(row.soi_id);
        const bucket = membersBySoi.get(soiId) ?? [];
        bucket.push({ user_id: row.user_id, status: row.status });
        membersBySoi.set(soiId, bucket);
        if (userId && row.user_id === userId) {
          membershipSet.add(soiId);
        }
      }
    }
  }

  return data.map((row: any) => {
    const viewerIsHost = Boolean(userId && userId === row.host_id);
    const partyMembers = membersBySoi.get(String(row.id)) ?? [];
    const hostAlreadyMember = partyMembers.some((member) => member.user_id === row.host_id);
    const joinedCount = partyMembers.length;
    const base = hostAlreadyMember ? 0 : 1;

    return {
      id: row.id,
      hostId: row.host_id,
      partySize: row.party_size,
      meetupPoint: row.meetup_point,
      dropOff: row.drop_off,
      rideOptions: row.ride_options || [],
      startTime: row.start_time,
      expiryTimestamp: row.expiry_timestamp,
      hostUniversity: row.host_university,
      displayUniversity: Boolean(row.display_university),
      isActive: Boolean(row.is_active),
      currentMemberCount: Math.max(1, joinedCount + base),
      userIsMember: viewerIsHost || membershipSet.has(String(row.id)),
    };
  });
};

/**
 * Cancel an SOI party by setting it inactive.
 */
export const cancelSoi = async (soiId: number): Promise<{ success: boolean; error?: string }> => {
  const supabase = getSupabaseClient();
  if (!supabase) {
    throw new SupabaseUnavailableError();
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'Not authenticated' };
  }

  const { error } = await supabase
    .from('soi_parties')
    .update({ is_active: false })
    .eq('id', soiId)
    .eq('host_id', user.id)
    .eq('is_active', true);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
};

/**
 * Join an SOI party.
 */
export const joinSoi = async (soiId: number): Promise<{ success: boolean; error?: string }> => {
  const supabase = getSupabaseClient();
  if (!supabase) {
    throw new SupabaseUnavailableError();
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'Not authenticated' };
  }

  // Check if already a member
  const { data: existing } = await supabase
    .from('soi_members')
    .select('id, status')
    .eq('soi_id', soiId)
    .eq('user_id', user.id)
    .maybeSingle();

  if (existing && (existing as any).status !== 'left' && (existing as any).status !== 'kicked') {
    return { success: false, error: 'You have already joined this SOI' };
  }

  // Check capacity
  const { data: soiData } = await supabase
    .from('soi_parties')
    .select('party_size, host_id')
    .eq('id', soiId)
    .single();

  if (!soiData) {
    return { success: false, error: 'SOI not found' };
  }

  const { data: memberCount } = await supabase
    .from('soi_members')
    .select('id', { count: 'exact', head: true })
    .eq('soi_id', soiId)
    .not('status', 'in', '("left","kicked")');

  const currentCount = (memberCount as any)?.count ?? 0;
  const hostIncluded = (soiData as any).host_id === user.id ? 0 : 1;

  if (currentCount + hostIncluded >= (soiData as any).party_size) {
    return { success: false, error: 'This SOI is full' };
  }

  // Insert membership
  const { error } = await supabase
    .from('soi_members')
    .insert({
      soi_id: soiId,
      user_id: user.id,
      status: 'joined',
      contact_shared: false,
    });

  if (error) {
    if (error.code === '23505') {
      return { success: false, error: 'You have already joined this SOI' };
    }
    return { success: false, error: error.message };
  }

  return { success: true };
};
