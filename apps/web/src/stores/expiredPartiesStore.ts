import { create } from "zustand";
import { createClient } from "@/utils/supabase/client";

export interface ExpiredParty {
  id: string;
  title: string;
  meetupPoint?: string | null;
  dropOff?: string | null;
  expiredAt: Date;
  hostName?: string | null;
  partySize?: number | null;
  joinedCount?: number | null;
  canRestore: boolean;
}

interface ExpiredPartiesState {
  expiredParties: ExpiredParty[];
  isRefreshing: boolean;
  setExpiredParties: (parties: ExpiredPartyInput[]) => void;
  addExpiredParty: (party: ExpiredPartyInput) => void;
  markPartyRestored: (partyId: string) => void;
  pruneExpiredParties: () => void;
  refreshExpiredParties: () => Promise<void>;
  restoreExpiredParty: (partyId: string) => Promise<{ success: boolean; error?: string }>;
}

const FIVE_MINUTES_MS = 5 * 60 * 1000;

type ExpiredPartyInput = Omit<ExpiredParty, "expiredAt"> & { expiredAt: Date | string | number };

const normalizeParty = (party: ExpiredPartyInput): ExpiredParty => ({
  ...party,
  expiredAt: party.expiredAt instanceof Date ? party.expiredAt : new Date(party.expiredAt),
});

const useExpiredPartiesStore = create<ExpiredPartiesState>((set, get) => ({
  expiredParties: [],
  isRefreshing: false,
  setExpiredParties: (parties) => {
    set({
      expiredParties: parties
        .map(normalizeParty)
        .filter((party) => !Number.isNaN(party.expiredAt.getTime())),
    });
  },
  addExpiredParty: (party) => {
    const normalized = normalizeParty(party);
    if (Number.isNaN(normalized.expiredAt.getTime())) {
      return;
    }

    set((state) => ({
      expiredParties: [normalized, ...state.expiredParties.filter((existing) => existing.id !== normalized.id)],
    }));
  },
  markPartyRestored: (partyId) => {
    set((state) => ({
      expiredParties: state.expiredParties.filter((party) => party.id !== partyId),
    }));
  },
  pruneExpiredParties: () => {
    const cutoff = Date.now() - FIVE_MINUTES_MS;
    set((state) => ({
      expiredParties: state.expiredParties.filter((party) => party.expiredAt.getTime() >= cutoff),
    }));
  },
  refreshExpiredParties: async () => {
    set({ isRefreshing: true });
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      const now = new Date();
      const cutoff = new Date(now.getTime() - FIVE_MINUTES_MS);

      const nowIso = now.toISOString();
      const cutoffIso = cutoff.toISOString();

      // 1) parties that are inactive or past expiry, within last 5 minutes
      const { data: parties, error: pErr } = await supabase
        .from('parties')
        .select('id, host_id, meetup_point, drop_off, expires_at, is_active, duration_minutes, party_size')
        .or(`is_active.eq.false,expires_at.lte.${nowIso}`)
        .gte('expires_at', cutoffIso);
      if (pErr) {
        console.warn('refreshExpiredParties: parties', pErr);
        get().pruneExpiredParties();
        return;
      }
      const partyRows = parties || [];
      if (partyRows.length === 0) { set({ expiredParties: [] }); return; }

      const partyIds = partyRows.map((p: any) => p.id);
      const partiesById: Record<string, any> = {};
      partyRows.forEach((p: any) => { partiesById[p.id] = p; });

      // 2) joined members for these parties
      const { data: memberRows, error: mErr } = await supabase
        .from('party_members')
        .select('party_id, user_id, status')
        .in('party_id', partyIds)
        .eq('status', 'joined');
      if (mErr) console.warn('refreshExpiredParties: members', mErr);

      const joinedByParty: Record<string, number> = {};
      (memberRows || []).forEach((m: any) => {
        const hostId = partiesById[m.party_id]?.host_id;
        if (m.user_id && hostId && m.user_id !== hostId) {
          joinedByParty[m.party_id] = (joinedByParty[m.party_id] || 0) + 1;
        }
      });

      const candidates = partyRows.filter((p: any) => (joinedByParty[p.id] || 0) === 0);
      if (candidates.length === 0) { set({ expiredParties: [] }); return; }

      // 3) host display names
      const hostIds = Array.from(new Set(candidates.map((p: any) => p.host_id)));
      let hostNameById: Record<string, string> = {};
      if (hostIds.length > 0) {
        const { data: profs } = await supabase
          .from('profiles')
          .select('id, full_name, nickname')
          .in('id', hostIds);
        (profs || []).forEach((pr: any) => {
          hostNameById[pr.id] = pr.nickname || pr.full_name || 'Host';
        });
      }

      // 4) build entries
      const result: ExpiredPartyInput[] = candidates.map((p: any) => {
        const expiredAt = p.expires_at ? new Date(p.expires_at) : now;
        const withinRestoreWindow = now.getTime() - expiredAt.getTime() <= FIVE_MINUTES_MS;
        return {
          id: p.id,
          title: p.drop_off || p.meetup_point || 'Party',
          meetupPoint: p.meetup_point,
          dropOff: p.drop_off,
          expiredAt,
          hostName: hostNameById[p.host_id] || 'Host',
          partySize: p.party_size ?? null,
          joinedCount: 0,
          canRestore: !!user && user.id === p.host_id && withinRestoreWindow,
        };
      });

      get().setExpiredParties(result);
      get().pruneExpiredParties();
    } finally {
      set({ isRefreshing: false });
    }
  },
  restoreExpiredParty: async (partyId: string) => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { success: false, error: 'Not authenticated' };

      const { data: party, error: pErr } = await supabase
        .from('parties')
        .select('id, host_id, duration_minutes, expires_at')
        .eq('id', partyId)
        .single();
      if (pErr || !party) return { success: false, error: 'Party not found' };
      if (party.host_id !== user.id) return { success: false, error: 'Only the host can restore' };

      const expiredAt = party.expires_at ? new Date(party.expires_at) : new Date();
      if (Date.now() - expiredAt.getTime() > FIVE_MINUTES_MS) {
        return { success: false, error: 'Restore window has passed' };
      }

      const minutes = typeof party.duration_minutes === 'number' && party.duration_minutes > 0 ? party.duration_minutes : 30;
      const newExpiryIso = new Date(Date.now() + minutes * 60_000).toISOString();

      const { error: uErr } = await supabase
        .from('parties')
        .update({ is_active: true, expires_at: newExpiryIso })
        .eq('id', partyId)
        .eq('host_id', user.id);
      if (uErr) return { success: false, error: uErr.message || 'Failed to restore' };

      get().markPartyRestored(partyId);
      await get().refreshExpiredParties();
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e?.message || 'Failed to restore' };
    }
  },
}));

export default useExpiredPartiesStore;
