// Service functions for party member operations
import { createClient } from "@/utils/supabase/client";
import type { PartyMember } from "../types";

export class PartyMemberService {
  private supabase = createClient();

  /**
   * Join a party as the current user
   */
  async joinParty(partyId: number, pickupNotes?: string): Promise<{ success: boolean; error?: string; member?: PartyMember }> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      if (!user) {
        return { success: false, error: "User not authenticated" };
      }

      // Check if user can join the party using our helper function
      const { data: canJoin, error: checkError } = await this.supabase
        .rpc('can_user_join_party', { 
          party_bigint: partyId, 
          user_uuid: user.id 
        });

      if (checkError) {
        console.error('Error checking join eligibility:', checkError);
        return { success: false, error: "Failed to verify join eligibility" };
      }

      if (!canJoin) {
        return { success: false, error: "Cannot join this party (full, expired, or already a member)" };
      }

      // Join the party
      const { data: member, error: joinError } = await this.supabase
        .from('party_members')
        .insert({
          party_id: partyId,
          user_id: user.id,
          status: 'joined',
          pickup_notes: pickupNotes || null,
          contact_shared: false
        })
        .select(`
          *,
          profile:user_id (
            id,
            full_name,
            nickname,
            avatar_url,
            gender,
            points,
            university,
            show_university
          )
        `)
        .single();

      if (joinError) {
        console.error('Error joining party:', joinError);
        return { success: false, error: "Failed to join party" };
      }

      // Transform the data to match our PartyMember type
      const transformedMember: PartyMember = {
        ...member,
        joined_at: new Date(member.joined_at),
        left_at: member.left_at ? new Date(member.left_at) : undefined,
        created_at: new Date(member.created_at),
        updated_at: new Date(member.updated_at),
        profile: member.profile ? {
          ...member.profile,
          created_at: member.profile.created_at ? new Date(member.profile.created_at) : null,
          updated_at: member.profile.updated_at ? new Date(member.profile.updated_at) : null,
          birth_date: member.profile.birth_date ? new Date(member.profile.birth_date) : null,
        } : undefined
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
  async leaveParty(partyId: number): Promise<{ success: boolean; error?: string }> {
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
  async getPartyMembers(partyId: number): Promise<{ success: boolean; members?: PartyMember[]; error?: string }> {
    try {
      const { data: members, error } = await this.supabase
        .from('party_members')
        .select(`
          *,
          profile:user_id (
            id,
            full_name,
            nickname,
            avatar_url,
            gender,
            points,
            university,
            show_university
          )
        `)
        .eq('party_id', partyId)
        .eq('status', 'joined')
        .order('joined_at', { ascending: true });

      if (error) {
        console.error('Error fetching party members:', error);
        return { success: false, error: "Failed to fetch party members" };
      }

      // Transform the data to match our PartyMember type
      const transformedMembers: PartyMember[] = (members || []).map(member => ({
        ...member,
        joined_at: new Date(member.joined_at),
        left_at: member.left_at ? new Date(member.left_at) : undefined,
        created_at: new Date(member.created_at),
        updated_at: new Date(member.updated_at),
        profile: member.profile ? {
          ...member.profile,
          created_at: member.profile.created_at ? new Date(member.profile.created_at) : null,
          updated_at: member.profile.updated_at ? new Date(member.profile.updated_at) : null,
          birth_date: member.profile.birth_date ? new Date(member.profile.birth_date) : null,
        } : undefined
      }));

      return { success: true, members: transformedMembers };
    } catch (error) {
      console.error('Unexpected error fetching party members:', error);
      return { success: false, error: "An unexpected error occurred" };
    }
  }

  /**
   * Get member count for a party
   */
  async getPartyMemberCount(partyId: number): Promise<{ success: boolean; count?: number; error?: string }> {
    try {
      const { data: count, error } = await this.supabase
        .rpc('get_party_member_count', { party_bigint: partyId });

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
  async isUserMember(partyId: number): Promise<{ success: boolean; isMember?: boolean; error?: string }> {
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
}

// Export a singleton instance
export const partyMemberService = new PartyMemberService();
