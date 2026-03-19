import { getSupabaseClient } from '../lib/supabase';

export type MutualActivityType = 'mutual_online' | 'mutual_hosting';

export interface MutualActivityNotification {
  id: string;
  type: MutualActivityType;
  actorId: string;
  actorUsername: string;
  message: string;
  occurredAt: string;
  partyId?: string;
}

const safeUsername = (row: any): string => {
  const username = row?.profile?.username ?? row?.username ?? null;
  if (typeof username === 'string' && username.trim()) {
    return username.trim();
  }
  return 'mutual';
};

const ensureUser = async () => {
  const supabase = getSupabaseClient();
  if (!supabase) {
    throw new Error('Supabase client is not configured');
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

export const fetchMutualActivityNotifications = async (): Promise<MutualActivityNotification[]> => {
  const { supabase, user } = await ensureUser();

  const { data: connections, error: connectionsError } = await supabase
    .from('connections')
    .select('requester_id, addressee_id')
    .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`)
    .eq('status', 'accepted');

  if (connectionsError) {
    throw connectionsError;
  }

  const mutualIds = Array.from(
    new Set(
      (connections ?? []).map((row: any) =>
        row.requester_id === user.id ? row.addressee_id : row.requester_id
      )
    )
  ).filter(Boolean);

  if (!mutualIds.length) {
    return [];
  }

  const onlineCutoffIso = new Date(Date.now() - 5 * 60_000).toISOString();
  const hostingCutoffIso = new Date(Date.now() - 2 * 60 * 60_000).toISOString();

  const [onlineRes, hostingRes] = await Promise.all([
    supabase
      .from('user_locations')
      .select('user_id, last_updated, profile:user_id(username)')
      .in('user_id', mutualIds)
      .gte('last_updated', onlineCutoffIso),
    supabase
      .from('parties')
      .select('id, host_id, created_at, meetup_point, drop_off, profile:host_id(username)')
      .eq('is_active', true)
      .in('host_id', mutualIds)
      .gte('created_at', hostingCutoffIso)
      .order('created_at', { ascending: false })
      .limit(20),
  ]);

  if (onlineRes.error) {
    if (onlineRes.error.code !== '42P01') {
      throw onlineRes.error;
    }
  }

  if (hostingRes.error) {
    throw hostingRes.error;
  }

  const onlineNotifications: MutualActivityNotification[] = (onlineRes.data ?? []).map((row: any) => {
    const actorUsername = safeUsername(row);
    return {
      id: `online:${row.user_id}`,
      type: 'mutual_online',
      actorId: row.user_id,
      actorUsername,
      message: `@${actorUsername} is online now`,
      occurredAt: row.last_updated,
    };
  });

  const hostingNotifications: MutualActivityNotification[] = (hostingRes.data ?? []).map((row: any) => {
    const actorUsername = safeUsername(row);
    const meetup = typeof row.meetup_point === 'string' && row.meetup_point.trim() ? row.meetup_point.trim() : 'meetup point';
    const drop = typeof row.drop_off === 'string' && row.drop_off.trim() ? row.drop_off.trim() : 'destination';

    return {
      id: `hosting:${row.id}`,
      type: 'mutual_hosting',
      actorId: row.host_id,
      actorUsername,
      message: `@${actorUsername} is hosting a ride: ${meetup} to ${drop}`,
      occurredAt: row.created_at,
      partyId: row.id,
    };
  });

  return [...hostingNotifications, ...onlineNotifications].sort(
    (a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime()
  );
};
