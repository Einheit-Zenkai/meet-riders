import { getSupabaseClient } from '../lib/supabase';

export type ScheduleCandidate = {
  id: string;
  username: string | null;
  fullName: string | null;
  idealLocation: string | null;
  idealDepartureTime: string | null;
  source: 'mutual' | 'location_match';
};

export type FriendScheduleStatus = 'pending' | 'accepted' | 'declined' | 'cancelled';

export type FriendSchedule = {
  id: string;
  requesterId: string;
  inviteeId: string;
  proposedDayOfWeek: number;
  proposedTime: string;
  locationNote: string | null;
  requestMessage: string | null;
  status: FriendScheduleStatus;
  responseNote: string | null;
  createdAt: string;
  requester: { username: string | null; fullName: string | null } | null;
  invitee: { username: string | null; fullName: string | null } | null;
};

export type ScheduleBundle = {
  currentUserId: string;
  myIdealLocation: string | null;
  candidates: ScheduleCandidate[];
  incoming: FriendSchedule[];
  outgoing: FriendSchedule[];
  accepted: FriendSchedule[];
};

export type ScheduleNotificationItem = {
  id: string;
  message: string;
  occurredAt: string;
  kind: 'incoming_request' | 'request_accepted' | 'request_declined';
};

const ensureUser = async () => {
  const supabase = getSupabaseClient();
  if (!supabase) {
    throw new Error('Supabase client not configured');
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

const mapSchedule = (row: any): FriendSchedule => ({
  id: row.id,
  requesterId: row.requester_id,
  inviteeId: row.invitee_id,
  proposedDayOfWeek: Number(row.proposed_day_of_week ?? 0),
  proposedTime: String(row.proposed_time ?? ''),
  locationNote: row.location_note ?? null,
  requestMessage: row.request_message ?? null,
  status: row.status,
  responseNote: row.response_note ?? null,
  createdAt: row.created_at,
  requester: row.requester
    ? { username: row.requester.username ?? null, fullName: row.requester.full_name ?? null }
    : null,
  invitee: row.invitee
    ? { username: row.invitee.username ?? null, fullName: row.invitee.full_name ?? null }
    : null,
});

export const fetchScheduleBundle = async (): Promise<ScheduleBundle> => {
  const { supabase, user } = await ensureUser();

  const [profileRes, connRes, schedulesRes] = await Promise.all([
    supabase
      .from('profiles')
      .select('ideal_location')
      .eq('id', user.id)
      .maybeSingle(),
    supabase
      .from('connections')
      .select('requester_id, addressee_id')
      .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`)
      .eq('status', 'accepted'),
    supabase
      .from('friend_schedules')
      .select('id, requester_id, invitee_id, proposed_day_of_week, proposed_time, location_note, request_message, status, response_note, created_at, requester:requester_id(username, full_name), invitee:invitee_id(username, full_name)')
      .or(`requester_id.eq.${user.id},invitee_id.eq.${user.id}`)
      .order('created_at', { ascending: false }),
  ]);

  if (profileRes.error) throw profileRes.error;
  if (connRes.error) throw connRes.error;
  if (schedulesRes.error) throw schedulesRes.error;

  const myIdealLocation = profileRes.data?.ideal_location ?? null;

  const connectedIds = Array.from(
    new Set(
      (connRes.data ?? []).map((row: any) =>
        row.requester_id === user.id ? row.addressee_id : row.requester_id
      )
    )
  ).filter(Boolean);

  const locationBase = supabase
    .from('profiles')
    .select('id, username, full_name, ideal_location, ideal_departure_time')
    .neq('id', user.id)
    .not('ideal_location', 'is', null)
    .not('ideal_departure_time', 'is', null)
    .limit(20);

  const locationQuery = myIdealLocation
    ? locationBase.ilike('ideal_location', myIdealLocation)
    : locationBase;

  const [mutualRes, locationRes] = await Promise.all([
    connectedIds.length
      ? supabase
          .from('profiles')
          .select('id, username, full_name, ideal_location, ideal_departure_time')
          .in('id', connectedIds)
      : Promise.resolve({ data: [], error: null } as any),
    locationQuery,
  ]);

  if (mutualRes.error) throw mutualRes.error;
  if (locationRes.error) throw locationRes.error;

  const dedup = new Map<string, ScheduleCandidate>();
  (mutualRes.data ?? []).forEach((row: any) => {
    dedup.set(row.id, {
      id: row.id,
      username: row.username ?? null,
      fullName: row.full_name ?? null,
      idealLocation: row.ideal_location ?? null,
      idealDepartureTime: row.ideal_departure_time ?? null,
      source: 'mutual',
    });
  });

  (locationRes.data ?? []).forEach((row: any) => {
    if (row.id === user.id || dedup.has(row.id)) return;
    dedup.set(row.id, {
      id: row.id,
      username: row.username ?? null,
      fullName: row.full_name ?? null,
      idealLocation: row.ideal_location ?? null,
      idealDepartureTime: row.ideal_departure_time ?? null,
      source: 'location_match',
    });
  });

  const schedules = (schedulesRes.data ?? []).map(mapSchedule);

  return {
    currentUserId: user.id,
    myIdealLocation,
    candidates: Array.from(dedup.values()),
    incoming: schedules.filter((s) => s.inviteeId === user.id && s.status === 'pending'),
    outgoing: schedules.filter((s) => s.requesterId === user.id && s.status === 'pending'),
    accepted: schedules.filter((s) => s.status === 'accepted'),
  };
};

export const sendScheduleRequest = async (input: {
  inviteeId: string;
  source: 'mutual' | 'location_match';
  proposedDayOfWeek: number;
  proposedTime: string;
  locationNote?: string;
  requestMessage?: string;
}): Promise<void> => {
  const { supabase, user } = await ensureUser();

  const { error } = await supabase.from('friend_schedules').insert({
    requester_id: user.id,
    invitee_id: input.inviteeId,
    candidate_source: input.source,
    proposed_day_of_week: input.proposedDayOfWeek,
    proposed_time: input.proposedTime,
    location_note: input.locationNote?.trim() || null,
    request_message: input.requestMessage?.trim() || null,
    status: 'pending',
  });

  if (error) {
    throw error;
  }
};

export const updateScheduleRequest = async (
  scheduleId: string,
  status: Extract<FriendScheduleStatus, 'accepted' | 'declined'>,
  note?: string,
): Promise<void> => {
  const { supabase } = await ensureUser();

  const patch: Record<string, any> = {
    status,
    response_note: note?.trim() || null,
  };
  if (status === 'accepted') {
    patch.accepted_at = new Date().toISOString();
  }

  const { error } = await supabase
    .from('friend_schedules')
    .update(patch)
    .eq('id', scheduleId);

  if (error) {
    throw error;
  }
};

export const fetchScheduleNotifications = async (): Promise<ScheduleNotificationItem[]> => {
  const { supabase, user } = await ensureUser();

  const recentIso = new Date(Date.now() - 72 * 60 * 60_000).toISOString();
  const { data, error } = await supabase
    .from('friend_schedules')
    .select('id, requester_id, invitee_id, status, response_note, created_at, updated_at, requester:requester_id(username, full_name), invitee:invitee_id(username, full_name)')
    .or(`requester_id.eq.${user.id},invitee_id.eq.${user.id}`)
    .gte('updated_at', recentIso)
    .order('updated_at', { ascending: false })
    .limit(20);

  if (error) {
    throw error;
  }

  const items: ScheduleNotificationItem[] = [];

  (data ?? []).forEach((row: any) => {
    const requesterName = row.requester?.full_name || row.requester?.username || 'A friend';
    const inviteeName = row.invitee?.full_name || row.invitee?.username || 'A friend';

    if (row.status === 'pending' && row.invitee_id === user.id) {
      items.push({
        id: `schedule-incoming:${row.id}`,
        message: `${requesterName} sent you a schedule request`,
        occurredAt: row.updated_at || row.created_at,
        kind: 'incoming_request' as const,
      });
      return;
    }

    if (row.requester_id === user.id && row.status === 'accepted') {
      items.push({
        id: `schedule-accepted:${row.id}`,
        message: `${inviteeName} accepted your schedule request`,
        occurredAt: row.updated_at || row.created_at,
        kind: 'request_accepted' as const,
      });
      return;
    }

    if (row.requester_id === user.id && row.status === 'declined') {
      const note = row.response_note ? ` (${row.response_note})` : '';
      items.push({
        id: `schedule-declined:${row.id}`,
        message: `${inviteeName} declined your schedule request${note}`,
        occurredAt: row.updated_at || row.created_at,
        kind: 'request_declined' as const,
      });
    }
  });

  return items;
};
