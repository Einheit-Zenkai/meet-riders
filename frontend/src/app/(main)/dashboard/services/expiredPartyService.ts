import { createClient } from "@/utils/supabase/client";
import type { ExpiredParty } from "../types";

export class ExpiredPartyService {
  private supabase = createClient();

  async listRecent(): Promise<{ items: ExpiredParty[]; error?: string }> {
    try {
      const since = new Date(Date.now() - 10 * 60 * 1000).toISOString();
      const { data, error } = await this.supabase
        .from('expired_parties')
        .select('*, host_profile:profiles!expired_parties_host_id_fkey(id, nickname, full_name)')
        .gte('expired_at', since)
        .order('expired_at', { ascending: false });
      if (error) return { items: [], error: error.message };
      const items: ExpiredParty[] = (data || []).map((r: any) => ({
        id: r.id,
        party_id: r.party_id,
        host_id: r.host_id,
        meetup_point: r.meetup_point,
        drop_off: r.drop_off,
        ride_options: r.ride_options || [],
        party_size: r.party_size || undefined,
        expired_at: new Date(r.expired_at),
        host_profile: r.host_profile ? {
          ...r.host_profile,
          created_at: undefined,
          updated_at: undefined,
          birth_date: undefined,
          major: undefined,
          bio: undefined,
          gender: undefined,
          ideal_departure_time: undefined,
          ideal_location: undefined,
          nickname: r.host_profile?.nickname ?? null,
          full_name: r.host_profile?.full_name ?? null,
          avatar_url: undefined,
          points: undefined,
          university: undefined,
          show_university: undefined,
          location: undefined,
          isGenderOnly: undefined,
          rideOptions: undefined,
          expiresIn: undefined,
        } : undefined,
      }));
      return { items };
    } catch (e: any) {
      return { items: [], error: e?.message || 'Failed to load expired parties' };
    }
  }

  async restore(expiredId: number): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      if (!user) return { success: false, error: 'Not authenticated' };
      const { error } = await this.supabase.rpc('restore_expired_party', { p_expired_id: expiredId });
      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e?.message || 'Failed to restore party' };
    }
  }
}

export const expiredPartyService = new ExpiredPartyService();
