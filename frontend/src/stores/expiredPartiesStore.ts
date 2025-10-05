import { create } from "zustand";

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
}

const TEN_MINUTES_MS = 10 * 60 * 1000;

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
    const cutoff = Date.now() - TEN_MINUTES_MS;
    set((state) => ({
      expiredParties: state.expiredParties.filter((party) => party.expiredAt.getTime() >= cutoff),
    }));
  },
  refreshExpiredParties: async () => {
    // Placeholder implementation: Supabase integration will replace this.
    // Keeping the signature async allows callers to await future RPC work seamlessly.
    set({ isRefreshing: true });
    try {
      // TODO: Replace with Supabase query for expired parties within the last 10 minutes.
      get().pruneExpiredParties();
    } finally {
      set({ isRefreshing: false });
    }
  },
}));

export default useExpiredPartiesStore;
