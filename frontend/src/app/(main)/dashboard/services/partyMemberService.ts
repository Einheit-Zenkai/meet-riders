// Service functions for party member operations
import { createClient } from "@/utils/supabase/client";
import type { PartyMember } from "../types";

export class PartyMemberService {
  private supabase = createClient();

  /**
   * Join a party as the current user
   */
  async joinParty(partyId: string, pickupNotes?: string): Promise<{ success: boolean; error?: string; member?: PartyMember }> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      if (!user) {
        return { success: false, error: "User not authenticated" };
      }

      // Check if user can join the party using our helper function
      const { data: canJoin, error: checkError } = await this.supabase
        .rpc('can_user_join_party', { 
          p_party_id: partyId, 
          p_user_id: user.id 
        });

      if (checkError) {
        console.error('Error checking join eligibility:', checkError);
        return { success: false, error: "Failed to verify join eligibility" };
      }

      if (!canJoin) {
        return { success: false, error: "Cannot join this party (full, expired, or already a member)" };
      }

      // Join the party
      const { data: memberRow, error: joinError } = await this.supabase
        .from('party_members')
        .insert({
          party_id: partyId,
          user_id: user.id,
          status: 'joined',
          pickup_notes: pickupNotes || null,
          contact_shared: false
        })
        .select()
        .single();

      if (joinError) {
        console.error('Error joining party:', joinError?.message || joinError);
        return { success: false, error: "Failed to join party" };
      }

      if (!memberRow) {
        return { success: false, error: "Failed to join party" };
      }

      // Fetch the member profile in a follow-up query to avoid relying on implicit FK relationships
      let profile: Record<string, any> | null = null;
      const { data: profileRow, error: profileError } = await this.supabase
        .from('profiles')
        .select('id, full_name, nickname, avatar_url, gender, points, university, show_university, created_at, updated_at, birth_date')
        .eq('id', memberRow.user_id)
        .single();

      if (profileError) {
        const errMsg = (profileError as any)?.message || (profileError as any)?.hint || JSON.stringify(profileError);
        console.warn('Joined member profile fetch failed; continuing without profile details:', errMsg);
      } else {
        profile = profileRow;
      }

      // Transform the data to match our PartyMember type
      const transformedMember: PartyMember = {
        ...memberRow,
        joined_at: new Date(memberRow.joined_at),
        left_at: memberRow.left_at ? new Date(memberRow.left_at) : undefined,
        created_at: new Date(memberRow.created_at),
        updated_at: new Date(memberRow.updated_at),
        profile: profile
          ? {
              ...profile,
              created_at: profile.created_at ? new Date(profile.created_at) : null,
              updated_at: profile.updated_at ? new Date(profile.updated_at) : null,
              birth_date: profile.birth_date ? new Date(profile.birth_date) : null,
            }
          : undefined
        
      };

      return { success: true, member: transformedMember };
    } catch (error) {
      console.error('Unexpected error joining party:', error);
      return { success: false, error: "An unexpected error occurred" };
    }
  }

  /**
   * Leave a party as the current user
   */
  async leaveParty(partyId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      if (!user) {
        return { success: false, error: "User not authenticated" };
      }

      // Update the member status to 'left'
      const { error } = await this.supabase
        .from('party_members')
        .update({ 
          status: 'left', 
          left_at: new Date().toISOString() 
        })
        .eq('party_id', partyId)
        .eq('user_id', user.id)
        .eq('status', 'joined');

      if (error) {
        console.error('Error leaving party:', error);
        return { success: false, error: "Failed to leave party" };
      }

      return { success: true };
    } catch (error) {
      console.error('Unexpected error leaving party:', error);
      return { success: false, error: "An unexpected error occurred" };
    }
  }

  /**
   * Get party members for a specific party
   */
  async getPartyMembers(partyId: string): Promise<{ success: boolean; members?: PartyMember[]; error?: string }> {
    try {
      // 1) Fetch raw members without cross-table joins to avoid RLS/relationship issues
      const { data: memberRows, error: memberErr } = await this.supabase
        .from('party_members')
        .select('*')
        .eq('party_id', partyId)
        .eq('status', 'joined')
        .order('joined_at', { ascending: true });

      if (memberErr) {
        const errMsg = (memberErr as any)?.message || (memberErr as any)?.hint || JSON.stringify(memberErr);
        console.error('Error fetching party members (base rows):', errMsg);
        return { success: false, error: 'Failed to fetch party members' };
      }

      const members = memberRows || [];
      const userIds = members.map((m: any) => m.user_id).filter(Boolean);

      // 2) If there are members, fetch their profiles in a second query
      let profilesById: Record<string, any> = {};
      if (userIds.length > 0) {
        const { data: profiles, error: profileErr } = await this.supabase
          .from('profiles')
          .select('id, full_name, nickname, avatar_url, gender, points, university, show_university, created_at, updated_at, birth_date')
          .in('id', userIds);

        if (profileErr) {
          const errMsg = (profileErr as any)?.message || (profileErr as any)?.hint || JSON.stringify(profileErr);
          // If profiles are blocked by RLS, we still return members without profile to avoid hard failure
          console.warn('Profiles fetch blocked or failed; continuing without profile details:', errMsg);
        } else {
          profilesById = (profiles || []).reduce((acc: Record<string, any>, p: any) => {
            acc[p.id] = p;
            return acc;
          }, {});
        }
      }

      // 3) Transform and attach profiles when available
      const transformedMembers: PartyMember[] = members.map((member: any) => {
        const profile = profilesById[member.user_id];
        return {
          ...member,
          joined_at: new Date(member.joined_at),
          left_at: member.left_at ? new Date(member.left_at) : undefined,
          created_at: new Date(member.created_at),
          updated_at: new Date(member.updated_at),
          profile: profile
            ? {
                ...profile,
                created_at: profile.created_at ? new Date(profile.created_at) : null,
                updated_at: profile.updated_at ? new Date(profile.updated_at) : null,
                birth_date: profile.birth_date ? new Date(profile.birth_date) : null,
              }
            : undefined,
        };
      });

      return { success: true, members: transformedMembers };
    } catch (error) {
      console.error('Unexpected error fetching party members:', error);
      return { success: false, error: "An unexpected error occurred" };
    }
  }

  /**
   * Get member count for a party
   */
  async getPartyMemberCount(partyId: string): Promise<{ success: boolean; count?: number; error?: string }> {
    try {
      const { data: count, error } = await this.supabase
  .rpc('get_party_member_count', { p_party_id: partyId });

      if (error) {
        console.error('Error getting member count:', error);
        return { success: false, error: "Failed to get member count" };
      }

      return { success: true, count: count || 0 };
    } catch (error) {
      console.error('Unexpected error getting member count:', error);
      return { success: false, error: "An unexpected error occurred" };
    }
  }

  /**
   * Check if current user is a member of a party
   */
  async isUserMember(partyId: string): Promise<{ success: boolean; isMember?: boolean; error?: string }> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      if (!user) {
        return { success: true, isMember: false };
      }

      const { data: membership, error } = await this.supabase
        .from('party_members')
        .select('id')
        .eq('party_id', partyId)
        .eq('user_id', user.id)
        .eq('status', 'joined')
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "not found" error
        console.error('Error checking membership:', error);
        return { success: false, error: "Failed to check membership" };
      }

      return { success: true, isMember: !!membership };
    } catch (error) {
      console.error('Unexpected error checking membership:', error);
      return { success: false, error: "An unexpected error occurred" };
    }
  }

  /** Host-only: kick a member from a party via RPC */
  async kickMember(partyId: string, memberUserId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      if (!user) return { success: false, error: 'Not authenticated' };
      const { error } = await this.supabase.rpc('kick_party_member', {
        p_party_id: partyId,
        p_member_user_id: memberUserId,
      });
      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e?.message || 'Failed to kick member' };
    }
  }
}

// Export a singleton instance
export const partyMemberService = new PartyMemberService();
