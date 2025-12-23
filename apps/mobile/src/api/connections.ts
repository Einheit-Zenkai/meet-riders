import { getSupabaseClient } from '../lib/supabase';

export type ConnectionStatus = 'pending' | 'accepted' | 'declined' | 'blocked';

export interface ConnectionProfile {
  id: string;
  username: string | null;
  fullName: string | null;
  avatarUrl: string | null;
}

export interface ConnectionRecord {
  id: number;
  requesterId: string;
  addresseeId: string;
  status: ConnectionStatus;
  createdAt: string;
  requester: ConnectionProfile;
  addressee: ConnectionProfile;
}

export interface ConnectionsBundle {
  currentUserId: string;
  connections: ConnectionRecord[];
  incomingRequests: ConnectionRecord[];
  outgoingRequests: ConnectionRecord[];
  university: string | null;
}

const connectionSelect = `
  id,
  requester_id,
  addressee_id,
  status,
  created_at,
  requester:requester_id(id, username, full_name, avatar_url),
  addressee:addressee_id(id, username, full_name, avatar_url)
`;

const mapProfile = (profile: any): ConnectionProfile => ({
  id: profile?.id ?? '',
  username: profile?.username ?? null,
  fullName: profile?.full_name ?? null,
  avatarUrl: profile?.avatar_url ?? null,
});

const mapConnection = (row: any): ConnectionRecord => ({
  id: row.id,
  requesterId: row.requester_id,
  addresseeId: row.addressee_id,
  status: row.status,
  createdAt: row.created_at,
  requester: mapProfile(row.requester),
  addressee: mapProfile(row.addressee),
});

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
    throw new Error('User not authenticated');
  }
  return { supabase, user } as const;
};

export const fetchConnectionsBundle = async (): Promise<ConnectionsBundle> => {
  const { supabase, user } = await ensureUser();

  const [acceptedRes, incomingRes, outgoingRes, profileRes] = await Promise.all([
    supabase
      .from('connections')
      .select(connectionSelect)
      .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`)
      .eq('status', 'accepted'),
    supabase
      .from('connections')
      .select(connectionSelect)
      .eq('addressee_id', user.id)
      .eq('status', 'pending'),
    supabase
      .from('connections')
      .select(connectionSelect)
      .eq('requester_id', user.id)
      .eq('status', 'pending'),
    supabase
      .from('profiles')
      .select('university')
      .eq('id', user.id)
      .maybeSingle(),
  ]);

  if (acceptedRes.error) {
    throw acceptedRes.error;
  }
  if (incomingRes.error) {
    throw incomingRes.error;
  }
  if (outgoingRes.error) {
    throw outgoingRes.error;
  }
  if (profileRes.error) {
    throw profileRes.error;
  }

  return {
    currentUserId: user.id,
    connections: (acceptedRes.data ?? []).map(mapConnection),
    incomingRequests: (incomingRes.data ?? []).map(mapConnection),
    outgoingRequests: (outgoingRes.data ?? []).map(mapConnection),
    university: profileRes.data?.university ?? null,
  };
};

export const searchProfilesByUsername = async (query: string, sameUniversityOnly: boolean, myUniversity: string | null): Promise<ConnectionProfile[]> => {
  if (!query.trim()) {
    return [];
  }
  const { supabase } = await ensureUser();
  let builder = supabase
    .from('profiles')
    .select('id, username, full_name, avatar_url')
    .ilike('username', `%${query.trim()}%`)
    .limit(8);

  if (sameUniversityOnly && myUniversity) {
    builder = builder.eq('university', myUniversity);
  }

  const { data, error } = await builder;
  if (error) {
    throw error;
  }

  return (data ?? []).map(mapProfile);
};

export const sendConnectionRequest = async (username: string): Promise<void> => {
  const { supabase, user } = await ensureUser();
  const cleaned = username.trim();
  if (!cleaned) {
    throw new Error('Username is required');
  }

  const { data: addressee, error: findError } = await supabase
    .from('profiles')
    .select('id')
    .eq('username', cleaned)
    .maybeSingle();

  if (findError) {
    throw findError;
  }
  if (!addressee) {
    throw new Error('User not found');
  }
  if (addressee.id === user.id) {
    throw new Error('Cannot connect to self');
  }

  const { error } = await supabase.from('connections').insert({
    requester_id: user.id,
    addressee_id: addressee.id,
    status: 'pending',
  });

  if (error) {
    throw error;
  }
};

export const updateConnectionStatus = async (connectionId: number, status: Extract<ConnectionStatus, 'accepted' | 'declined'>): Promise<void> => {
  const { supabase } = await ensureUser();
  const { error } = await supabase
    .from('connections')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', connectionId);

  if (error) {
    throw error;
  }
};

export const removeConnection = async (connectionId: number): Promise<void> => {
  const { supabase } = await ensureUser();
  const { error } = await supabase
    .from('connections')
    .delete()
    .eq('id', connectionId);

  if (error) {
    throw error;
  }
};
