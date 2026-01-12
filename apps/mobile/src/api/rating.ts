import { getSupabaseClient } from '../lib/supabase';

export interface Rating {
  id: string;
  raterId: string;
  ratedUserId: string;
  partyId: string;
  score: number;
  comment: string | null;
  createdAt: string;
}

export interface UserRatingSummary {
  averageRating: number;
  totalRatings: number;
  ratings: Rating[];
}

/**
 * Submit a rating for another user after a party/ride
 */
export const submitRating = async (params: {
  ratedUserId: string;
  partyId: string;
  score: number;
  comment?: string;
}): Promise<{ error?: Error }> => {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return { error: new Error('Supabase client not configured') };
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { error: new Error('You must be signed in to submit a rating') };
  }

  // Prevent self-rating
  if (user.id === params.ratedUserId) {
    return { error: new Error('You cannot rate yourself') };
  }

  // Check if already rated this user for this party
  const { data: existingRating } = await supabase
    .from('ratings')
    .select('id')
    .eq('rater_id', user.id)
    .eq('rated_user_id', params.ratedUserId)
    .eq('party_id', params.partyId)
    .maybeSingle();

  if (existingRating) {
    return { error: new Error('You have already rated this user for this ride') };
  }

  const { error } = await supabase.from('ratings').insert({
    rater_id: user.id,
    rated_user_id: params.ratedUserId,
    party_id: params.partyId,
    score: Math.min(5, Math.max(1, params.score)),
    comment: params.comment?.trim() || null,
  } as never);

  if (error) {
    return { error: new Error(error.message) };
  }

  return {};
};

/**
 * Fetch rating summary for a user
 */
export const fetchUserRatings = async (userId: string): Promise<UserRatingSummary> => {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return { averageRating: 0, totalRatings: 0, ratings: [] };
  }

  const { data, error } = await supabase
    .from('ratings')
    .select('id, rater_id, rated_user_id, party_id, score, comment, created_at')
    .eq('rated_user_id', userId)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error || !data || data.length === 0) {
    return { averageRating: 0, totalRatings: 0, ratings: [] };
  }

  const ratings: Rating[] = data.map((row: any) => ({
    id: row.id,
    raterId: row.rater_id,
    ratedUserId: row.rated_user_id,
    partyId: row.party_id,
    score: row.score,
    comment: row.comment,
    createdAt: row.created_at,
  }));

  const totalRatings = ratings.length;
  const averageRating = ratings.reduce((sum, r) => sum + r.score, 0) / totalRatings;

  return { averageRating, totalRatings, ratings };
};

/**
 * Check if the current user can rate members of a party (party must be active or recently ended)
 */
export const canRatePartyMembers = async (partyId: string): Promise<boolean> => {
  const supabase = getSupabaseClient();
  if (!supabase) return false;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;

  // Check if user is a member of this party
  const { data: membership } = await supabase
    .from('party_members')
    .select('party_id')
    .eq('party_id', partyId)
    .eq('user_id', user.id)
    .eq('status', 'joined')
    .maybeSingle();

  if (!membership) {
    // Check if user is the host
    const { data: party } = await supabase
      .from('parties')
      .select('host_id')
      .eq('id', partyId)
      .maybeSingle();

    if (!party || (party as any).host_id !== user.id) {
      return false;
    }
  }

  return true;
};
