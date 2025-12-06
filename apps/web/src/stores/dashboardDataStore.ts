import { create } from "zustand";
import { createClient } from "@/utils/supabase/client";
import useAuthStore from "@/stores/authStore";
import type { Party, Profile } from "@/app/(main)/dashboard/types";

export type RefreshProfileStatus = "no-user" | "ok" | "needs-onboarding" | "error";
export type RefreshPartiesStatus = "no-user" | "ok" | "error";

interface DashboardDataState {
  welcomeName: string | null;
  viewerUniversity: string | null;
  parties: Party[];
  partiesLoading: boolean;
  isCheckingProfile: boolean;
  refreshProfile: () => Promise<RefreshProfileStatus>;
  refreshParties: () => Promise<RefreshPartiesStatus>;
  reset: () => void;
}

const initialState: Omit<DashboardDataState, "refreshProfile" | "refreshParties" | "reset"> = {
  welcomeName: null,
  viewerUniversity: null,
  parties: [],
  partiesLoading: true,
  isCheckingProfile: true,
};

const useDashboardDataStore = create<DashboardDataState>((set, get) => ({
  ...initialState,
  refreshProfile: async () => {
    const user = useAuthStore.getState().user;
    if (!user) {
      set({ ...initialState, partiesLoading: false, isCheckingProfile: false });
      return "no-user";
    }

    set({ isCheckingProfile: true });

    try {
      const supabase = createClient();
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("nickname, full_name, university")
        .eq("id", user.id)
        .single();

      if (error) {
        console.error("Error fetching profile:", error);
        set({ welcomeName: null, viewerUniversity: null, isCheckingProfile: false });
        return "error";
      }

      if (!profile || (!profile.nickname && !profile.full_name)) {
        set({ welcomeName: null, viewerUniversity: null, isCheckingProfile: false });
        return "needs-onboarding";
      }

      set({
        welcomeName: profile.nickname || profile.full_name || "Rider",
        viewerUniversity: profile.university || null,
        isCheckingProfile: false,
      });

      return "ok";
    } catch (error) {
      console.error("Profile check failed:", error);
      set({ welcomeName: null, viewerUniversity: null, isCheckingProfile: false });
      return "error";
    }
  },
  refreshParties: async () => {
    const user = useAuthStore.getState().user;
    if (!user) {
      set({ parties: [], partiesLoading: false });
      return "no-user";
    }

    set({ partiesLoading: true });

    try {
      const supabase = createClient();

      const nowIso = new Date().toISOString();

      const { data: partiesData, error } = await supabase
        .from("parties")
        .select(`
          id,
          created_at,
          updated_at,
          host_id,
          party_size,
          duration_minutes,
          expires_at,
          meetup_point,
          drop_off,
          is_friends_only,
          is_gender_only,
          ride_options,
          host_comments,
          host_university,
          display_university,
          is_active
        `)
        .eq("is_active", true)
        .gt("expires_at", nowIso)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching parties:", (error as any)?.message || error);
        set({ parties: [], partiesLoading: false });
        return "error";
      }

      if (!partiesData || partiesData.length === 0) {
        set({ parties: [], partiesLoading: false });
        return "ok";
      }

      const hostIds = [...new Set(partiesData.map((party) => party.host_id))];

      // Determine which hosts are "connections" with the viewer (either direction)
      const connectedHostIds = new Set<string>();
      if (hostIds.length > 0) {
        const { data: relFromMe } = await supabase
          .from("user_relationships")
          .select("receiver_id, status")
          .eq("initiator_id", user.id)
          .in("receiver_id", hostIds)
          .eq("status", "connected");
        relFromMe?.forEach((r: any) => connectedHostIds.add(r.receiver_id));

        const { data: relToMe } = await supabase
          .from("user_relationships")
          .select("initiator_id, status")
          .eq("receiver_id", user.id)
          .in("initiator_id", hostIds)
          .eq("status", "connected");
        relToMe?.forEach((r: any) => connectedHostIds.add(r.initiator_id));
      }

      // Enforce visibility: connections-only parties appear only if viewer is connected to host
      const visiblePartiesData = (partiesData || []).filter((p: any) => {
        return !p.is_friends_only || connectedHostIds.has(p.host_id);
      });

      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select(`
          id,
          full_name,
          nickname,
          gender,
          avatar_url,
          university,
          points,
          phone_number,
          show_phone,
          major,
          bio
        `)
        .in("id", hostIds);

      if (profilesError) {
        console.error("Error fetching profiles:", (profilesError as any)?.message || profilesError);
      }

      const profilesMap = new Map<string, Profile>();
      profilesData?.forEach((profile) => {
        profilesMap.set(profile.id, profile as Profile);
      });

  const partyIds = visiblePartiesData.map((party) => party.id as string);

      const memberCounts = await Promise.all(
        partyIds.map(async (partyId) => {
          const { data: count } = await supabase.rpc("get_party_member_count", { p_party_id: partyId });
          return { partyId, count: count || 0 };
        })
      );

      const memberCountsMap = new Map<string, number>();
      memberCounts.forEach(({ partyId, count }) => {
        memberCountsMap.set(partyId, count);
      });

      const { data: userMemberships } = await supabase
        .from("party_members")
        .select("party_id")
        .eq("user_id", user.id)
        .eq("status", "joined")
        .in("party_id", partyIds);

      const userMembershipSet = new Set<string>(
        userMemberships?.map((membership) => membership.party_id) || []
      );

      const transformedParties = visiblePartiesData.map((party) => {
        const baseCount = memberCountsMap.get(party.id) || 0;
        const viewerIsHost = party.host_id === user.id;
        const viewerIsMember = viewerIsHost || userMembershipSet.has(party.id);
        // Show members excluding host in the main feed to align with join capacity display, but keep track that hosts count separately elsewhere.
        const visibleCount = baseCount;

        return {
        ...party,
        created_at: new Date(party.created_at),
        updated_at: party.updated_at ? new Date(party.updated_at) : new Date(party.created_at),
        expires_at: party.expires_at ? new Date(party.expires_at) : new Date(),
        ride_options: Array.isArray(party.ride_options) ? party.ride_options : [],
        is_active: Boolean(party.is_active),
        display_university: Boolean(party.display_university),
        host_profile: profilesMap.get(party.host_id),
          current_member_count: visibleCount,
        user_is_member: viewerIsMember,
      };
      }) as Party[];

      set({ parties: transformedParties, partiesLoading: false });
      return "ok";
    } catch (error) {
      try {
        console.error("Failed to fetch parties:", (error as any)?.message || JSON.stringify(error));
      } catch {
        console.error("Failed to fetch parties:", error);
      }
      set({ parties: [], partiesLoading: false });
      return "error";
    }
  },
  reset: () => {
    set({ ...initialState, partiesLoading: false, isCheckingProfile: false });
  },
}));

export default useDashboardDataStore;
