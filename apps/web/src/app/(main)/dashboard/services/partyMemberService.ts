// Service functions for party member operations
import { createClient } from "@/utils/supabase/client";
import type { PartyMember, RideHistoryItem, RideHistoryParticipant, RouteStop } from "../types";

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
        .select('id, full_name, nickname, avatar_url, gender, points, university, show_university, student_type, phone_number, show_phone, created_at, updated_at, birth_date')
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
        reached_stop_at: memberRow.reached_stop_at ? new Date(memberRow.reached_stop_at) : null,
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
      const { data: partyRow, error: partyError } = await this.supabase
        .from('parties')
        .select('host_id, created_at, host_reached_stop_at')
        .eq('id', partyId)
        .maybeSingle();

      if (partyError) {
        console.warn('Error fetching party host while loading members:', partyError);
      }
      const hostId: string | null = partyRow?.host_id ?? null;
      const partyCreatedAt = partyRow?.created_at ? new Date(partyRow.created_at) : new Date();
      const hostReachedStopAt = partyRow?.host_reached_stop_at ? new Date(partyRow.host_reached_stop_at) : null;

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
      if (hostId && !userIds.includes(hostId)) {
        userIds.push(hostId);
      }

      // 2) If there are members, fetch their profiles in a second query
      let profilesById: Record<string, any> = {};
      if (userIds.length > 0) {
        const { data: profiles, error: profileErr } = await this.supabase
    .from('profiles')
    .select('id, full_name, nickname, avatar_url, gender, points, university, show_university, student_type, phone_number, show_phone, created_at, updated_at, birth_date')
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

      const transformProfile = (profile: any) => {
        if (!profile) return undefined;
        return {
          ...profile,
          created_at: profile.created_at ? new Date(profile.created_at) : null,
          updated_at: profile.updated_at ? new Date(profile.updated_at) : null,
          birth_date: profile.birth_date ? new Date(profile.birth_date) : null,
        };
      };

      // 3) Transform and attach profiles when available
      const transformedMembers: PartyMember[] = members.map((member: any) => {
        const profile = profilesById[member.user_id];
        return {
          ...member,
          joined_at: new Date(member.joined_at),
          left_at: member.left_at ? new Date(member.left_at) : undefined,
          reached_stop_at: member.reached_stop_at ? new Date(member.reached_stop_at) : null,
          created_at: new Date(member.created_at),
          updated_at: new Date(member.updated_at),
          profile: transformProfile(profile),
        };
      });

      if (hostId) {
        const hostAlreadyIncluded = transformedMembers.some((member) => member.user_id === hostId);
        if (!hostAlreadyIncluded) {
          const hostProfile = transformProfile(profilesById[hostId]);
          transformedMembers.unshift({
            id: `host-${partyId}`,
            party_id: partyId,
            user_id: hostId,
            status: 'joined',
            joined_at: partyCreatedAt,
            left_at: undefined,
            pickup_notes: undefined,
            contact_shared: false,
            created_at: partyCreatedAt,
            updated_at: partyCreatedAt,
            reached_stop_at: hostReachedStopAt,
            profile: hostProfile,
          });
        }
      }

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
      // Optional: sanity-check host authorization to avoid confusing RLS errors
      const { data: partyRow, error: partyErr } = await this.supabase
        .from('parties')
        .select('host_id')
        .eq('id', partyId)
        .single();
      if (partyErr) {
        // Continue; RLS might block this but RPC may still work
        console.warn('kickMember: failed to verify host_id, continuing to RPC:', (partyErr as any)?.message || partyErr);
      } else if (partyRow && partyRow.host_id !== user.id) {
        return { success: false, error: 'Only the host can kick members' };
      }

      // First try the generic RPC (may be overloaded in DB)
      const { error } = await this.supabase.rpc('kick_party_member', {
        p_party_id: partyId,
        p_member_user_id: memberUserId,
      });
      if (!error) return { success: true };

      const errMsg = (error as any)?.message || String(error);
      // Handle ambiguous overload by trying a UUID-specific function if present
      if (errMsg.toLowerCase().includes('choose the best candidate') || errMsg.toLowerCase().includes('ambiguous')) {
        const { error: errUuid } = await this.supabase.rpc('kick_party_member_uuid' as any, {
          p_party_id: partyId,
          p_member_user_id: memberUserId,
        });
        if (!errUuid) return { success: true };
        // Fallback: attempt a direct update if policies allow
        const { error: updErr } = await this.supabase
          .from('party_members')
          .update({ status: 'kicked', left_at: new Date().toISOString() })
          .eq('party_id', partyId)
          .eq('user_id', memberUserId)
          .eq('status', 'joined');
        if (!updErr) return { success: true };
        return { success: false, error: errUuid.message || updErr.message || 'Failed to kick member' };
      }

      return { success: false, error: errMsg };
    } catch (e: any) {
      return { success: false, error: e?.message || 'Failed to kick member' };
    }
  }

  /** Fetch pending join requests for parties hosted by the current user */
  async getPendingRequestsForHost(): Promise<{
    success: boolean;
    requests?: Array<{ id: string; party_id: string; user_id: string; created_at: Date; userProfile?: any; party?: any }>;
    error?: string;
  }> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      if (!user) return { success: false, error: 'Not authenticated' };

      let requests: any[] | null = null;
      let lastError: any = null;
      let partiesMap: Record<string, any> | null = null;

      const rpcVariants = [
        { p_host_id: user.id },
        { host_id: user.id },
        { p_host_uuid: user.id },
        { host_uuid: user.id },
        { host: user.id },
        { user_id: user.id },
      ];

      for (const args of rpcVariants) {
        const { data, error } = await this.supabase.rpc('get_pending_requests_for_host', args as any);
        if (!error) {
          requests = data || [];
          lastError = null;
          break;
        }
        lastError = error;
      }

      if (!requests) {
        const { data, error } = await this.supabase.rpc('get_pending_requests_for_host');
        if (!error) {
          requests = data || [];
          lastError = null;
        } else {
          lastError = error;
        }
      }

      if (!requests && lastError) {
        const nowIso = new Date().toISOString();
        const { data: hostParties, error: partiesErr } = await this.supabase
          .from('parties')
          .select('id, drop_off, meetup_point, expires_at, is_active')
          .eq('host_id', user.id)
          .eq('is_active', true)
          .gt('expires_at', nowIso);
        if (partiesErr) {
          console.error('getPendingRequestsForHost: fallback parties error:', partiesErr, 'rpc error:', lastError);
          return { success: false, error: 'Failed to fetch requests' };
        }

        const partyIds = (hostParties || []).map((p: any) => p.id);
        if (partyIds.length === 0) return { success: true, requests: [] };

        const { data: reqRows, error: reqErr } = await this.supabase
          .from('party_requests')
          .select('request_id, party_id, user_id, created_at, status')
          .in('party_id', partyIds)
          .eq('status', 'pending')
          .order('created_at', { ascending: true });

        if (reqErr) {
          console.error('getPendingRequestsForHost: fallback requests error:', reqErr, 'rpc error:', lastError);
          return { success: false, error: 'Failed to fetch requests' };
        }

        requests = reqRows || [];
        partiesMap = (hostParties || []).reduce((acc: Record<string, any>, p: any) => {
          acc[String(p.id)] = p;
          return acc;
        }, {});
      }

      const requestsList = requests || [];
      if (requestsList.length === 0) return { success: true, requests: [] };

      // 3) Fetch profiles for requesters
      const userIds = [...new Set(requestsList.map((r: any) => r.user_id))];
      let profilesMap: Record<string, any> = {};
      if (userIds.length > 0) {
        const { data: profs } = await this.supabase
          .from('profiles')
          .select('id, full_name, nickname, avatar_url, gender, university, show_university, student_type, points')
          .in('id', userIds);
        (profs || []).forEach((p: any) => { profilesMap[p.id] = p; });
      }

      const enriched = requestsList.map((r: any) => {
        const fallbackId = `${r.party_id}-${r.user_id}-${r.created_at || r.timestamp || Date.now()}`;
        const partyDetails = partiesMap?.[String(r.party_id)] || r.party || null;
        return {
          id: String(r.id ?? r.request_id ?? fallbackId),
          party_id: String(r.party_id),
          user_id: String(r.user_id),
          created_at: new Date(r.created_at || r.timestamp || Date.now()),
          userProfile: profilesMap[String(r.user_id)],
          party: {
            drop_off: partyDetails?.drop_off ?? r.drop_off ?? null,
            meetup_point: partyDetails?.meetup_point ?? r.meetup_point ?? null,
          },
        };
      });
      return { success: true, requests: enriched };
    } catch (e: any) {
      return { success: false, error: e?.message || 'Failed to load requests' };
    }
  }

  /** Host-only: approve a pending request */
  async approveRequest(requestId: string, partyId: string, requesterId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      if (!user) return { success: false, error: 'Not authenticated' };

      const normalizedRequestId = Number.isFinite(Number(requestId))
        ? Number(requestId)
        : requestId;

      // Check eligibility via RPC (capacity/duplicate/expiry)
      const { data: canJoin, error: checkError } = await this.supabase
        .rpc('can_user_join_party', { p_party_id: partyId, p_user_id: requesterId });
      if (checkError) {
        console.error('approveRequest: can_user_join_party:', checkError);
        return { success: false, error: 'Failed to verify capacity' };
      }
      if (!canJoin) return { success: false, error: 'Party full/expired or already a member' };

      // Add as joined member
      const { error: jErr } = await this.supabase
        .from('party_members')
        .insert({ party_id: partyId, user_id: requesterId, status: 'joined', contact_shared: false });
      if (jErr) {
        console.error('approveRequest: insert party_member:', jErr);
        return { success: false, error: 'Failed to add member' };
      }
      // Mark request accepted
      const { error: uErr } = await this.supabase
        .from('party_requests')
        .update({ status: 'accepted' })
        .eq('request_id', normalizedRequestId);
      if (uErr) console.warn('approveRequest: update request failed (non-blocking):', uErr);
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e?.message || 'Approve failed' };
    }
  }

  /** Host-only: decline a pending request */
  async declineRequest(requestId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const normalizedRequestId = Number.isFinite(Number(requestId))
        ? Number(requestId)
        : requestId;
      const { error } = await this.supabase
        .from('party_requests')
        .update({ status: 'declined' })
        .eq('request_id', normalizedRequestId);
      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e?.message || 'Decline failed' };
    }
  }

  /** Mark the current user as having reached their stop in a live party. */
  async markReachedStop(partyId: string): Promise<{
    success: boolean;
    rideCompleted?: boolean;
    reachedCount?: number;
    totalCount?: number;
    historyId?: string | null;
    error?: string;
  }> {
    try {
      const { data, error } = await this.supabase.rpc('mark_current_user_reached_stop', {
        p_party_id: partyId,
      });

      if (error) {
        return { success: false, error: error.message || 'Failed to mark your stop' };
      }

      const row = Array.isArray(data) ? data[0] : data;
      return {
        success: true,
        rideCompleted: Boolean(row?.ride_completed),
        reachedCount: Number(row?.reached_count ?? 0),
        totalCount: Number(row?.total_count ?? 0),
        historyId: row?.history_id ?? null,
      };
    } catch (e: any) {
      return { success: false, error: e?.message || 'Failed to mark your stop' };
    }
  }

  /** Host-only explicit end action for live party completion. */
  async endPartyWithReason(partyId: string, reason: 'host_connected' | 'host_difficulties'): Promise<{
    success: boolean;
    historyId?: string;
    error?: string;
  }> {
    try {
      const { data, error } = await this.supabase.rpc('end_party_with_reason', {
        p_party_id: partyId,
        p_reason: reason,
      });

      if (error) {
        return { success: false, error: error.message || 'Failed to end party' };
      }

      return { success: true, historyId: data || undefined };
    } catch (e: any) {
      return { success: false, error: e?.message || 'Failed to end party' };
    }
  }

  /** Fetch completed ride history for the current user. */
  async getRideHistory(): Promise<{ success: boolean; history?: RideHistoryItem[]; error?: string }> {
    try {
      const { data: historyRows, error: historyErr } = await this.supabase
        .from('ride_history')
        .select('id, party_id, host_id, meetup_point, drop_off, completed_at, ended_by, end_reason')
        .order('completed_at', { ascending: false });

      if (historyErr) {
        return { success: false, error: historyErr.message || 'Failed to load ride history' };
      }

      const history = historyRows || [];
      if (history.length === 0) {
        return { success: true, history: [] };
      }

      const rideIds = history.map((h: any) => h.id);
      const { data: participantRows, error: participantErr } = await this.supabase
        .from('ride_history_participants')
        .select('ride_history_id, user_id, role, reached_stop_at')
        .in('ride_history_id', rideIds);

      if (participantErr) {
        return { success: false, error: participantErr.message || 'Failed to load ride participants' };
      }

      const userIds = [...new Set((participantRows || []).map((p: any) => p.user_id))];
      const profilesById: Record<string, any> = {};
      if (userIds.length > 0) {
        const { data: profiles, error: profilesErr } = await this.supabase
          .from('profiles')
          .select('id, username, full_name, nickname, avatar_url, gender, points, university, show_university, student_type, phone_number, show_phone, created_at, updated_at, birth_date, major, bio, ideal_departure_time, ideal_location, punctuality, location')
          .in('id', userIds);
        if (!profilesErr && profiles) {
          for (const profile of profiles as any[]) {
            profilesById[profile.id] = {
              ...profile,
              created_at: profile.created_at ? new Date(profile.created_at) : null,
              updated_at: profile.updated_at ? new Date(profile.updated_at) : null,
              birth_date: profile.birth_date ? new Date(profile.birth_date) : null,
              isGenderOnly: null,
              rideOptions: null,
              expiresIn: null,
            };
          }
        }
      }

      const participantsByRide = new Map<string, RideHistoryParticipant[]>();
      for (const participant of (participantRows || []) as any[]) {
        const list = participantsByRide.get(participant.ride_history_id) || [];
        list.push({
          user_id: participant.user_id,
          role: participant.role,
          reached_stop_at: participant.reached_stop_at ? new Date(participant.reached_stop_at) : null,
          profile: profilesById[participant.user_id],
        });
        participantsByRide.set(participant.ride_history_id, list);
      }

      const mapped: RideHistoryItem[] = history.map((row: any) => ({
        id: row.id,
        party_id: row.party_id,
        host_id: row.host_id,
        meetup_point: row.meetup_point,
        drop_off: row.drop_off,
        completed_at: new Date(row.completed_at),
        ended_by: row.ended_by ?? null,
        end_reason: row.end_reason ?? null,
        participants: participantsByRide.get(row.id) || [],
      }));

      return { success: true, history: mapped };
    } catch (e: any) {
      return { success: false, error: e?.message || 'Failed to load ride history' };
    }
  }

  /** Delete one history entry (or all entries) for the current user only. */
  async deleteMyRideHistory(rideHistoryId?: string): Promise<{ success: boolean; deletedCount?: number; error?: string }> {
    try {
      const { data, error } = await this.supabase.rpc('delete_my_ride_history', {
        p_ride_history_id: rideHistoryId ?? null,
      });

      if (error) {
        return { success: false, error: error.message || 'Failed to delete ride history' };
      }

      return { success: true, deletedCount: Number(data ?? 0) };
    } catch (e: any) {
      return { success: false, error: e?.message || 'Failed to delete ride history' };
    }
  }

  /** Read persisted route stops for a party (host+members can view). */
  async getRouteStops(partyId: string): Promise<{ success: boolean; stops?: RouteStop[]; error?: string }> {
    try {
      const { data, error } = await this.supabase
        .from('party_route_stops')
        .select('id, party_id, user_id, stop_label, stop_coords, source, stop_order')
        .eq('party_id', partyId)
        .order('stop_order', { ascending: true });

      if (error) {
        return { success: false, error: error.message || 'Failed to load route stops' };
      }

      const mapped: RouteStop[] = (data || []).map((row: any) => ({
        id: row.id,
        party_id: row.party_id,
        user_id: row.user_id ?? null,
        stop_label: row.stop_label,
        stop_coords: row.stop_coords && Number.isFinite(Number(row.stop_coords?.lat)) && Number.isFinite(Number(row.stop_coords?.lng))
          ? { lat: Number(row.stop_coords.lat), lng: Number(row.stop_coords.lng) }
          : null,
        source: row.source,
        stop_order: Number(row.stop_order ?? 0),
      }));

      return { success: true, stops: mapped };
    } catch (e: any) {
      return { success: false, error: e?.message || 'Failed to load route stops' };
    }
  }

  /** Host action: refresh route stops from latest user_locations + destination. */
  async refreshRouteStopsFromLive(partyId: string): Promise<{ success: boolean; added?: number; error?: string }> {
    try {
      const { data, error } = await this.supabase.rpc('refresh_party_route_stops_from_user_locations', {
        p_party_id: partyId,
        p_include_host_destination: true,
      });

      if (error) {
        return { success: false, error: error.message || 'Failed to refresh route stops' };
      }

      return { success: true, added: Number(data ?? 0) };
    } catch (e: any) {
      return { success: false, error: e?.message || 'Failed to refresh route stops' };
    }
  }

  /** Host action: optimize route order by shortest next-stop heuristic. */
  async optimizeRouteStops(partyId: string): Promise<{ success: boolean; stops?: RouteStop[]; error?: string }> {
    try {
      const { error } = await this.supabase.rpc('optimize_party_route', {
        p_party_id: partyId,
      });

      if (error) {
        return { success: false, error: error.message || 'Failed to optimize route' };
      }

      // RPC returns basic ordering fields; pull full rows so UI keeps source/coords metadata.
      const full = await this.getRouteStops(partyId);
      if (!full.success) {
        return { success: true, stops: [] };
      }

      return { success: true, stops: full.stops };
    } catch (e: any) {
      return { success: false, error: e?.message || 'Failed to optimize route' };
    }
  }

  /** Host action: persist a custom route order from the UI. */
  async saveRouteOrder(partyId: string, stopIdsInOrder: string[]): Promise<{ success: boolean; saved?: number; error?: string }> {
    try {
      const { data, error } = await this.supabase.rpc('save_party_route_order', {
        p_party_id: partyId,
        p_stop_ids: stopIdsInOrder,
      });

      if (error) {
        return { success: false, error: error.message || 'Failed to save route order' };
      }

      return { success: true, saved: Number(data ?? 0) };
    } catch (e: any) {
      return { success: false, error: e?.message || 'Failed to save route order' };
    }
  }

  /** Read computed route savings summary for a party. */
  async getPartyRouteSavings(partyId: string): Promise<{
    success: boolean;
    distanceSavedKm?: number;
    timeSavedMinutes?: number;
    baselineKm?: number;
    optimizedKm?: number;
    error?: string;
  }> {
    try {
      const { data, error } = await this.supabase.rpc('get_party_route_savings', {
        p_party_id: partyId,
      });

      if (error) {
        return { success: false, error: error.message || 'Failed to load route savings' };
      }

      const row = Array.isArray(data) ? data[0] : data;
      return {
        success: true,
        distanceSavedKm: Number(row?.distance_saved_km ?? 0),
        timeSavedMinutes: Number(row?.time_saved_minutes ?? 0),
        baselineKm: Number(row?.baseline_km ?? 0),
        optimizedKm: Number(row?.optimized_km ?? 0),
      };
    } catch (e: any) {
      return { success: false, error: e?.message || 'Failed to load route savings' };
    }
  }
}

// Export a singleton instance
export const partyMemberService = new PartyMemberService();
