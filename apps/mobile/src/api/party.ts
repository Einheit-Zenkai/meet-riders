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

export type ActiveParty = {
  id: string;
  hostId: string;
  partySize: number;
  expiresAt: string;
  meetupPoint: string;
  dropOff: string;
  hostComments: string | null;
  isActive: boolean;
};

export type PartyMemberProfile = {
  id: string;
  username: string;
  fullName: string | null;
  gender: string | null;
  avatarUrl: string | null;
  phoneNumber?: string | null;
  showPhone?: boolean | null;
};

export type PartyMember = {
  userId: string;
  status: string;
  profile: PartyMemberProfile;
  isHost: boolean;
};

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

const ensureUser = async () => {
  const supabase = getSupabaseClient();
  if (!supabase) {
    throw new SupabaseUnavailableError();
  }

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    throw error;
  }
  if (!user) {
    throw new Error('You must be signed in.');
  }

  return { supabase, user } as const;
};

const mapPartyRow = (row: any): ActiveParty => ({
  id: row.id,
  hostId: row.host_id,
  partySize: row.party_size,
  expiresAt: row.expires_at,
  meetupPoint: row.meetup_point,
  dropOff: row.drop_off,
  hostComments: row.host_comments ?? null,
  isActive: Boolean(row.is_active),
});

const mapProfileRow = (row: any): PartyMemberProfile => ({
  id: row?.id ?? '',
  username: row?.username ?? '',
  fullName: row?.full_name ?? null,
  gender: row?.gender ?? null,
  avatarUrl: row?.avatar_url ?? null,
  phoneNumber: row?.phone_number ?? null,
  showPhone: row?.show_phone ?? null,
});

export const fetchMyActiveParties = async (): Promise<ActiveParty[]> => {
  const { supabase, user } = await ensureUser();
  const nowIso = new Date().toISOString();

  const partyFields = 'id, host_id, party_size, expires_at, meetup_point, drop_off, host_comments, is_active';

  const [hostedRes, memberRes] = await Promise.all([
    supabase
      .from('parties')
      .select(partyFields)
      .eq('host_id', user.id)
      .eq('is_active', true)
      .gt('expires_at', nowIso)
      .order('expires_at', { ascending: true }),
    supabase
      .from('party_members')
      .select(`party:party_id(${partyFields})`)
      .eq('user_id', user.id)
      .eq('status', 'joined'),
  ]);

  if (hostedRes.error) {
    throw hostedRes.error;
  }
  if (memberRes.error) {
    throw memberRes.error;
  }

  const hosted = (hostedRes.data ?? []).map(mapPartyRow);
  const fromMembership = (memberRes.data ?? [])
    .map((row: any) => row?.party)
    .filter(Boolean)
    .map(mapPartyRow)
    .filter((p) => p.isActive && p.expiresAt > nowIso);

  const dedup = new Map<string, ActiveParty>();
  for (const party of [...hosted, ...fromMembership]) {
    dedup.set(party.id, party);
  }

  return Array.from(dedup.values()).sort((a, b) => a.expiresAt.localeCompare(b.expiresAt));
};

export const fetchPartyMembers = async (partyId: string): Promise<PartyMember[]> => {
  const { supabase } = await ensureUser();

  const partyRes = await supabase.from('parties').select('id, host_id').eq('id', partyId).maybeSingle();
  if (partyRes.error) {
    throw partyRes.error;
  }
  const hostId: string | null = (partyRes.data as any)?.host_id ?? null;

  const { data, error } = await supabase
    .from('party_members')
    .select('user_id, status, profile:user_id(id, username, full_name, gender, avatar_url, phone_number, show_phone)')
    .eq('party_id', partyId)
    .eq('status', 'joined');

  if (error) {
    throw error;
  }

  const members: PartyMember[] = (data ?? []).map((row: any) => ({
    userId: row.user_id,
    status: row.status,
    profile: mapProfileRow(row.profile),
    isHost: Boolean(hostId && row.user_id === hostId),
  }));

  if (hostId && !members.some((m) => m.userId === hostId)) {
    const hostProfileRes = await supabase
      .from('profiles')
      .select('id, username, full_name, gender, avatar_url, phone_number, show_phone')
      .eq('id', hostId)
      .maybeSingle();

    if (!hostProfileRes.error && hostProfileRes.data) {
      members.unshift({
        userId: hostId,
        status: 'host',
        profile: mapProfileRow(hostProfileRes.data),
        isHost: true,
      });
    }
  }

  return members;
};

export const cancelParty = async (partyId: string): Promise<void> => {
  const { supabase, user } = await ensureUser();
  const nowIso = new Date().toISOString();

  const { error } = await supabase
    .from('parties')
    .update({ is_active: false, expires_at: nowIso, updated_at: nowIso } as never)
    .eq('id', partyId)
    .eq('host_id', user.id);

  if (error) {
    throw error;
  }
};
