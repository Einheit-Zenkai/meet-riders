import { getSupabaseClient } from '../lib/supabase';

export type ReportReason = 
  | 'harassment'
  | 'bad_behavior'
  | 'spam'
  | 'inappropriate'
  | 'safety'
  | 'no_show'
  | 'other';

export interface ReportInput {
  reportedUserId: string;
  reason: ReportReason;
  details?: string;
  partyId?: string;
}

export interface Report {
  id: string;
  reporterId: string;
  reportedUserId: string;
  reason: ReportReason;
  details: string | null;
  partyId: string | null;
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
  createdAt: string;
}

export const REPORT_REASONS: { value: ReportReason; label: string; description: string }[] = [
  { value: 'harassment', label: 'Harassment', description: 'Unwanted behavior or communication' },
  { value: 'bad_behavior', label: 'Bad Behavior', description: 'Rude, disrespectful, or inappropriate conduct' },
  { value: 'spam', label: 'Spam', description: 'Unsolicited promotional content or messages' },
  { value: 'inappropriate', label: 'Inappropriate Content', description: 'Offensive profile or messages' },
  { value: 'safety', label: 'Safety Concern', description: 'Felt unsafe or threatened' },
  { value: 'no_show', label: 'No Show', description: 'Did not show up to the ride' },
  { value: 'other', label: 'Other', description: 'Another reason not listed above' },
];

/**
 * Submit a report against another user
 */
export const submitReport = async (input: ReportInput): Promise<{ success: boolean; error?: string }> => {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return { success: false, error: 'Supabase client not configured' };
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { success: false, error: 'You must be signed in to submit a report' };
  }

  // Prevent self-reporting
  if (user.id === input.reportedUserId) {
    return { success: false, error: 'You cannot report yourself' };
  }

  // Check for duplicate recent reports
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const { data: existingReport } = await supabase
    .from('reports')
    .select('id')
    .eq('reporter_id', user.id)
    .eq('reported_user_id', input.reportedUserId)
    .gte('created_at', oneHourAgo)
    .maybeSingle();

  if (existingReport) {
    return { success: false, error: 'You have already reported this user recently. Please wait before submitting another report.' };
  }

  const { error } = await supabase.from('reports').insert({
    reporter_id: user.id,
    reported_user_id: input.reportedUserId,
    reason: input.reason,
    details: input.details?.trim() || null,
    party_id: input.partyId || null,
    status: 'pending',
  } as never);

  if (error) {
    // If table doesn't exist, we simulate success (demo mode)
    if (error.code === '42P01' || error.message.includes('does not exist')) {
      console.log('[Report] Demo mode - report would be submitted:', input);
      return { success: true };
    }
    return { success: false, error: error.message };
  }

  return { success: true };
};

/**
 * Block a user (prevents them from seeing your parties and vice versa)
 */
export const blockUser = async (blockedUserId: string): Promise<{ success: boolean; error?: string }> => {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return { success: false, error: 'Supabase client not configured' };
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { success: false, error: 'You must be signed in to block a user' };
  }

  if (user.id === blockedUserId) {
    return { success: false, error: 'You cannot block yourself' };
  }

  // Update connection status to blocked if exists, or create new blocked entry
  const { data: existingConnection } = await supabase
    .from('connections')
    .select('id, status')
    .or(`and(requester_id.eq.${user.id},addressee_id.eq.${blockedUserId}),and(requester_id.eq.${blockedUserId},addressee_id.eq.${user.id})`)
    .maybeSingle();

  if (existingConnection) {
    const { error } = await supabase
      .from('connections')
      .update({ status: 'blocked' } as never)
      .eq('id', existingConnection.id);

    if (error) {
      return { success: false, error: error.message };
    }
  } else {
    const { error } = await supabase.from('connections').insert({
      requester_id: user.id,
      addressee_id: blockedUserId,
      status: 'blocked',
    } as never);

    if (error) {
      // If the error is not critical, consider it a success
      if (!error.message.includes('duplicate')) {
        return { success: false, error: error.message };
      }
    }
  }

  return { success: true };
};
