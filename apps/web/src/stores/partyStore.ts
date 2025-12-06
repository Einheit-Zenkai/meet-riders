import { create } from 'zustand';

// We now store a precise timestamp for expiration.
export interface Party {
  id: number;
  host: string;
  partySize: number;
  meetupPoint: string;
  dropOff: string;
  isFriendsOnly: boolean;
  isGenderOnly: boolean;
  rideOptions: string[];
  expiryTimestamp: number; // The exact time (in milliseconds) the party expires
  hostUniversity?: string;
  displayUniversity?: boolean;
}

// This small utility converts a string like "10 min" or "1 hr" into milliseconds.
const parseDuration = (duration: string): number => {
    const [value, unit] = duration.split(' ');
    const numValue = parseInt(value, 10);
    if (unit === 'min') {
      return numValue * 60 * 1000;
    }
    if (unit === 'hr') {
      return numValue * 60 * 60 * 1000;
    }
    return 0; // Default case if something goes wrong
};
  

interface PartyState {
  parties: Party[];
  addParty: (partyData: Omit<Party, 'id' | 'host' | 'expiryTimestamp' | 'rideOptions'> & { expiresIn: string; rideOptions: string[] }) => void;
  cancelParty: (id: number) => void;
  startCleanup: () => () => void;
}

const usePartyStore = create<PartyState>((set) => ({
  parties: [],
  addParty: (partyData) => {
    const { expiresIn, ...restOfData } = partyData;

    const newParty: Party = {
      id: Date.now(),
      host: 'You',
      ...restOfData,
      rideOptions: partyData.rideOptions,
      expiryTimestamp: Date.now() + parseDuration(expiresIn),
    };
    set((state) => ({ parties: [newParty, ...state.parties] }));
  },
  cancelParty: (id) => {
    set((state) => ({
      parties: state.parties.filter((party) => party.id !== id),
    }));
  },
  startCleanup: () => {
    const interval = setInterval(() => {
        set((state) => ({
            parties: state.parties.filter((p) => p.expiryTimestamp > Date.now()),
        }));
    }, 5000); // This check runs every 5 seconds

    return () => clearInterval(interval);
  },
}));

export default usePartyStore;
