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

// Supabase/Postgres uses its own clock (NOW()) for constraints/triggers.
// If a device clock is ahead, client-side `new Date().toISOString()` comparisons can
// incorrectly treat an active party as expired. Use a small grace window to avoid mismatches.
const CLOCK_SKEW_GRACE_MS = 5 * 60_000;

const nowIsoWithGrace = (): string => new Date(Date.now() - CLOCK_SKEW_GRACE_MS).toISOString();

/**
 * Clean up expired parties for a user by marking them as inactive.
 * This should be called before checking if a user is hosting.
 */
export const cleanupExpiredParties = async (userId: string): Promise<void> => {
  const supabase = getSupabaseClient();
  if (!supabase) return;

  // Use grace window to account for clock skew between client and Postgres
  const nowIso = nowIsoWithGrace();
  
  // Mark all expired parties as inactive
  await supabase
    .from('parties')
    .update({ is_active: false })
    .eq('host_id', userId)
    .eq('is_active', true)
    .lt('expires_at', nowIso);
};

const hasActiveParty = async (userId: string): Promise<boolean> => {
  const supabase = getSupabaseClient();
  if (!supabase) {
    throw new SupabaseUnavailableError();
  }

  // First, clean up any expired parties
  await cleanupExpiredParties(userId);

  // Use grace window to account for clock skew between client and Postgres
  const nowIso = nowIsoWithGrace();
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

export type ExpiredParty = ActiveParty & {
  durationMinutes: number;
  createdAt: string;
  updatedAt: string;
  endedAt: string;
  restoreDeadlineAt: string;
  endedReason: 'expired' | 'cancelled';
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

const mapExpiredPartyRow = (row: any, nowIso: string): ExpiredParty => {
  const base = mapPartyRow(row);
  const expiresAt = String(row.expires_at ?? '');
  const updatedAt = String(row.updated_at ?? row.created_at ?? '');
  const createdAt = String(row.created_at ?? '');
  const durationMinutes = Number(row.duration_minutes ?? 10);

  const endedReason: ExpiredParty['endedReason'] = !row.is_active && expiresAt > nowIso ? 'cancelled' : 'expired';
  const endedAt = endedReason === 'cancelled' ? updatedAt : expiresAt;
  const restoreDeadlineAt = new Date(new Date(endedAt).getTime() + 5 * 60_000).toISOString();

  return {
    ...base,
    durationMinutes,
    createdAt,
    updatedAt,
    endedAt,
    restoreDeadlineAt,
    endedReason,
  };
};

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
  
  // Clean up expired parties first
  await cleanupExpiredParties(user.id);
  
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
    .filter((p) => p.isActive && new Date(p.expiresAt) > new Date(nowIso));

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
  const { error } = await supabase
    .from('parties')
    // Match the web app behavior: only flip is_active.
    .update({ is_active: false } as never)
    .eq('id', partyId)
    .eq('host_id', user.id);

  if (error) {
    throw error;
  }
};

/**
 * Leave a party as the current user (non-host member)
 */
export const leaveParty = async (partyId: string): Promise<{ success: boolean; error?: string }> => {
  try {
    const { supabase, user } = await ensureUser();

    // Update the member status to 'left'
    const { error } = await supabase
      .from('party_members')
      .update({ 
        status: 'left', 
        left_at: new Date().toISOString() 
      } as never)
      .eq('party_id', partyId)
      .eq('user_id', user.id)
      .eq('status', 'joined');

    if (error) {
      console.error('Error leaving party:', error);
      return { success: false, error: 'Failed to leave party' };
    }

    return { success: true };
  } catch (error: any) {
    console.error('Unexpected error leaving party:', error);
    return { success: false, error: error?.message || 'An unexpected error occurred' };
  }
};

export const restoreParty = async (partyId: string): Promise<void> => {
  const { supabase, user } = await ensureUser();

  const isAlreadyHosting = await hasActiveParty(user.id);
  if (isAlreadyHosting) {
    throw new Error('You already have an active party. Cancel it before restoring another.');
  }

  const { data: party, error: fetchError } = await supabase
    .from('parties')
    .select('id, host_id, duration_minutes')
    .eq('id', partyId)
    .eq('host_id', user.id)
    .maybeSingle();

  if (fetchError) {
    throw fetchError;
  }
  if (!party) {
    throw new Error('Party not found (or you are not the host).');
  }

  const durationMinutes = Number((party as any).duration_minutes ?? 10);
  const now = Date.now();
  const newExpiresAt = new Date(now + durationMinutes * 60_000).toISOString();

  const { error } = await supabase
    .from('parties')
    .update({ is_active: true, expires_at: newExpiresAt } as never)
    .eq('id', partyId)
    .eq('host_id', user.id);

  if (error) {
    throw error;
  }
};

export type FeedHostProfile = {
  id: string;
  username: string | null;
  fullName: string | null;
  avatarUrl: string | null;
  university: string | null;
};

export type FeedParty = ActiveParty & {
  isFriendsOnly: boolean;
  isJoined: boolean;
  rideOptions: string[];
  hostUniversity: string | null;
  displayUniversity: boolean;
  hostProfile: FeedHostProfile | null;
};

const mapFeedProfileRow = (row: any): FeedHostProfile => ({
  id: row?.id ?? '',
  username: row?.username ?? null,
  fullName: row?.full_name ?? null,
  avatarUrl: row?.avatar_url ?? null,
  university: row?.university ?? null,
});

export const fetchActivePartyFeed = async (): Promise<FeedParty[]> => {
  const { supabase, user } = await ensureUser();
  const nowIso = nowIsoWithGrace();

  const partyFields =
    'id, created_at, host_id, party_size, expires_at, meetup_point, drop_off, host_comments, is_active, is_friends_only, ride_options, host_university, display_university';

  const { data: partiesData, error: partiesError } = await supabase
    .from('parties')
    .select(partyFields)
    .eq('is_active', true)
    .gt('expires_at', nowIso)
    .order('created_at', { ascending: false })
    .limit(30);

  if (partiesError) {
    throw partiesError;
  }

  const rows = (partiesData ?? []) as any[];
  if (!rows.length) {
    return [];
  }

  const hostIds = Array.from(new Set(rows.map((p) => p.host_id).filter(Boolean)));

  // Resolve connections for friends-only parties using the mobile `connections` table.
  const connectedHostIds = new Set<string>();
  if (hostIds.length) {
    const [fromMe, toMe] = await Promise.all([
      supabase
        .from('connections')
        .select('addressee_id')
        .eq('requester_id', user.id)
        .in('addressee_id', hostIds)
        .eq('status', 'accepted'),
      supabase
        .from('connections')
        .select('requester_id')
        .eq('addressee_id', user.id)
        .in('requester_id', hostIds)
        .eq('status', 'accepted'),
    ]);

    if (fromMe.error) throw fromMe.error;
    if (toMe.error) throw toMe.error;

    (fromMe.data ?? []).forEach((r: any) => connectedHostIds.add(r.addressee_id));
    (toMe.data ?? []).forEach((r: any) => connectedHostIds.add(r.requester_id));
  }

  const visible = rows.filter((p) => {
    if (p.host_id === user.id) return true;
    return !p.is_friends_only || connectedHostIds.has(p.host_id);
  });

  if (!visible.length) {
    return [];
  }

  const visibleHostIds = Array.from(new Set(visible.map((p) => p.host_id)));
  const { data: profilesData, error: profilesError } = await supabase
    .from('profiles')
    .select('id, username, full_name, avatar_url, university')
    .in('id', visibleHostIds);

  if (profilesError) {
    throw profilesError;
  }

  const profilesMap = new Map<string, FeedHostProfile>();
  (profilesData ?? []).forEach((p: any) => profilesMap.set(p.id, mapFeedProfileRow(p)));

  // Determine which of the visible parties the viewer has already joined.
  const visiblePartyIds = visible.map((p) => p.id).filter(Boolean);
  const joinedPartyIds = new Set<string>();
  if (visiblePartyIds.length) {
    const { data: memberRows, error: memberError } = await supabase
      .from('party_members')
      .select('party_id')
      .eq('user_id', user.id)
      .eq('status', 'joined')
      .in('party_id', visiblePartyIds);

    if (memberError) {
      throw memberError;
    }
    (memberRows ?? []).forEach((r: any) => joinedPartyIds.add(r.party_id));
  }

  return visible.map((row: any) => {
    const base = mapPartyRow(row);
    return {
      ...base,
      isFriendsOnly: Boolean(row.is_friends_only),
      isJoined: joinedPartyIds.has(row.id),
      rideOptions: Array.isArray(row.ride_options) ? row.ride_options : [],
      hostUniversity: row.host_university ?? null,
      displayUniversity: Boolean(row.display_university),
      hostProfile: profilesMap.get(row.host_id) ?? null,
    } satisfies FeedParty;
  });
};

export const joinParty = async (partyId: string): Promise<void> => {
  const { supabase, user } = await ensureUser();

  const { data: canJoin, error: canJoinError } = await supabase.rpc('can_user_join_party', {
    p_party_id: partyId,
    p_user_id: user.id,
  });

  if (canJoinError) {
    throw canJoinError;
  }

  if (!canJoin) {
    throw new Error('You cannot join this party right now.');
  }

  const { error } = await supabase.from('party_members').insert({
    party_id: partyId,
    user_id: user.id,
    status: 'joined',
  } as never);

  if (error) {
    throw error;
  }
};

// ============ PARTY JOIN REQUESTS ============

export interface PartyJoinRequest {
  requestId: string;
  partyId: string;
  userId: string;
  status: 'pending' | 'accepted' | 'declined' | 'cancelled';
  createdAt: string;
  profile: {
    id: string;
    username: string;
    fullName: string | null;
    avatarUrl: string | null;
    gender: string | null;
    university: string | null;
    showUniversity: boolean;
  };
  rating: {
    averageRating: number;
    totalRatings: number;
  };
}

/**
 * Fetch pending join requests for parties the current user is hosting
 */
export const fetchMyPartyJoinRequests = async (): Promise<PartyJoinRequest[]> => {
  const { supabase, user } = await ensureUser();
  const nowIso = new Date().toISOString();

  // Get parties I'm hosting that are active
  const { data: myParties, error: partiesError } = await supabase
    .from('parties')
    .select('id')
    .eq('host_id', user.id)
    .eq('is_active', true)
    .gt('expires_at', nowIso);

  if (partiesError) throw partiesError;

  const partyIds = (myParties ?? []).map((p: any) => p.id);
  if (!partyIds.length) return [];

  // Fetch pending requests for these parties
  const { data: requests, error: requestsError } = await supabase
    .from('party_requests')
    .select('request_id, party_id, user_id, status, created_at')
    .in('party_id', partyIds)
    .eq('status', 'pending')
    .order('created_at', { ascending: false });

  if (requestsError) throw requestsError;

  const requestRows = (requests ?? []) as any[];
  if (!requestRows.length) return [];

  // Get unique user IDs
  const userIds = Array.from(new Set(requestRows.map((r) => r.user_id)));

  // Fetch profiles
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('id, username, full_name, avatar_url, gender, university, show_university')
    .in('id', userIds);

  if (profilesError) throw profilesError;

  const profilesMap = new Map((profiles ?? []).map((p: any) => [p.id, p]));

  // Fetch ratings for all users
  const ratingsMap = new Map<string, { averageRating: number; totalRatings: number }>();
  for (const userId of userIds) {
    const { data: ratingsData } = await supabase
      .from('ratings')
      .select('score')
      .eq('rated_user_id', userId);

    const scores = (ratingsData ?? []).map((r: any) => r.score);
    if (scores.length > 0) {
      const avg = scores.reduce((a: number, b: number) => a + b, 0) / scores.length;
      ratingsMap.set(userId, { averageRating: Math.round(avg * 10) / 10, totalRatings: scores.length });
    } else {
      ratingsMap.set(userId, { averageRating: 0, totalRatings: 0 });
    }
  }

  return requestRows.map((row: any) => {
    const profile = profilesMap.get(row.user_id) ?? {};
    const rating = ratingsMap.get(row.user_id) ?? { averageRating: 0, totalRatings: 0 };
    return {
      requestId: row.request_id,
      partyId: row.party_id,
      userId: row.user_id,
      status: row.status,
      createdAt: row.created_at,
      profile: {
        id: profile.id ?? row.user_id,
        username: profile.username ?? 'Unknown',
        fullName: profile.full_name ?? null,
        avatarUrl: profile.avatar_url ?? null,
        gender: profile.gender ?? null,
        university: profile.university ?? null,
        showUniversity: Boolean(profile.show_university),
      },
      rating,
    };
  });
};

/**
 * Request to join a party (for non-instant join parties)
 */
export const requestToJoinParty = async (partyId: string): Promise<void> => {
  const { supabase, user } = await ensureUser();

  // Check if already requested
  const { data: existing } = await supabase
    .from('party_requests')
    .select('request_id')
    .eq('party_id', partyId)
    .eq('user_id', user.id)
    .in('status', ['pending', 'accepted'] as never)
    .maybeSingle();

  if (existing) {
    throw new Error('You have already requested to join this party');
  }

  const { error } = await supabase.from('party_requests').insert({
    party_id: partyId,
    user_id: user.id,
    status: 'pending',
  } as never);

  if (error) throw error;
};

/**
 * Accept a join request (host only)
 */
export const acceptJoinRequest = async (requestId: string): Promise<void> => {
  const { supabase, user } = await ensureUser();

  // Fetch the request to get party details
  const { data: request, error: reqError } = await supabase
    .from('party_requests')
    .select('party_id, user_id')
    .eq('request_id', requestId)
    .maybeSingle();

  if (reqError) throw reqError;
  if (!request) throw new Error('Request not found');

  // Verify caller is the host
  const { data: party, error: partyError } = await supabase
    .from('parties')
    .select('host_id')
    .eq('id', request.party_id)
    .maybeSingle();

  if (partyError) throw partyError;
  if (!party || party.host_id !== user.id) {
    throw new Error('Only the host can accept join requests');
  }

  // Update request status
  const { error: updateError } = await supabase
    .from('party_requests')
    .update({ status: 'accepted' } as never)
    .eq('request_id', requestId);

  if (updateError) throw updateError;

  // Add user to party members
  const { error: memberError } = await supabase.from('party_members').insert({
    party_id: request.party_id,
    user_id: request.user_id,
    status: 'joined',
  } as never);

  if (memberError) throw memberError;
};

/**
 * Decline a join request (host only)
 */
export const declineJoinRequest = async (requestId: string): Promise<void> => {
  const { supabase, user } = await ensureUser();

  // Fetch the request to get party details
  const { data: request, error: reqError } = await supabase
    .from('party_requests')
    .select('party_id')
    .eq('request_id', requestId)
    .maybeSingle();

  if (reqError) throw reqError;
  if (!request) throw new Error('Request not found');

  // Verify caller is the host
  const { data: party, error: partyError } = await supabase
    .from('parties')
    .select('host_id')
    .eq('id', request.party_id)
    .maybeSingle();

  if (partyError) throw partyError;
  if (!party || party.host_id !== user.id) {
    throw new Error('Only the host can decline join requests');
  }

  // Update request status
  const { error: updateError } = await supabase
    .from('party_requests')
    .update({ status: 'declined' } as never)
    .eq('request_id', requestId);

  if (updateError) throw updateError;
};

// ============ EXPIRED PARTIES ============

export const fetchMyExpiredParties = async (): Promise<ExpiredParty[]> => {
  const { supabase, user } = await ensureUser();
  const nowIso = new Date().toISOString();
  const cutoffIso = new Date(Date.now() - 5 * 60_000).toISOString();

  const partyFields =
    'id, created_at, updated_at, host_id, party_size, duration_minutes, expires_at, meetup_point, drop_off, host_comments, is_active';

  const [hostedRes, memberIdsRes] = await Promise.all([
    supabase
      .from('parties')
      .select(partyFields)
      .eq('host_id', user.id)
      .or(
        `and(is_active.eq.false,updated_at.gte.${cutoffIso}),and(expires_at.lte.${nowIso},expires_at.gte.${cutoffIso})`
      )
      .order('updated_at', { ascending: false }),
    supabase
      .from('party_members')
      .select('party_id')
      .eq('user_id', user.id)
      .in('status', ['joined', 'expired'] as never),
  ]);

  if (hostedRes.error) {
    throw hostedRes.error;
  }
  if (memberIdsRes.error) {
    throw memberIdsRes.error;
  }

  const hosted = (hostedRes.data ?? []).map((row: any) => mapExpiredPartyRow(row, nowIso));
  const partyIds = (memberIdsRes.data ?? [])
    .map((row: any) => row?.party_id)
    .filter(Boolean) as string[];

  let fromMembership: ExpiredParty[] = [];
  if (partyIds.length) {
    const memberPartiesRes = await supabase
      .from('parties')
      .select(partyFields)
      .in('id', partyIds)
      .or(
        `and(is_active.eq.false,updated_at.gte.${cutoffIso}),and(expires_at.lte.${nowIso},expires_at.gte.${cutoffIso})`
      )
      .order('updated_at', { ascending: false });

    if (memberPartiesRes.error) {
      throw memberPartiesRes.error;
    }

    fromMembership = (memberPartiesRes.data ?? []).map((row: any) => mapExpiredPartyRow(row, nowIso));
  }

  const dedup = new Map<string, ExpiredParty>();
  for (const party of [...hosted, ...fromMembership]) {
    dedup.set(party.id, party);
  }

  return Array.from(dedup.values()).sort((a, b) => b.endedAt.localeCompare(a.endedAt));
};
