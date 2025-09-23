// src/context/PartyContext.tsx
'use client';

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

// --- 1. UPDATED Party interface ---
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

// --- 2. UPDATED ContextType ---
// The `addParty` function is smarter now. It will receive the user-friendly
// string like "10 min" and do the conversion to a timestamp internally.
interface PartyContextType {
  parties: Party[];
  addParty: (partyData: Omit<Party, 'id' | 'host' | 'expiryTimestamp' | 'rideOptions'> & { expiresIn: string; rideOptions: string[] }) => void;
  cancelParty: (id: number) => void;
}

const PartyContext = createContext<PartyContextType | undefined>(undefined);

// --- 3. HELPER FUNCTION ---
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

// The Provider component that wraps your app
export function PartyProvider({ children }: { children: ReactNode }) {
  const [parties, setParties] = useState<Party[]>([]);

  // --- 4. UPDATED addParty function ---
  const addParty = (partyData: Omit<Party, 'id' | 'host' | 'expiryTimestamp' | 'rideOptions'> & { expiresIn: string; rideOptions: string[] }) => {
    // We separate the 'expiresIn' string from the rest of the data
    const { expiresIn, ...restOfData } = partyData;

    const newParty: Party = {
      id: Date.now(),
      host: 'You',
      ...restOfData,
      rideOptions: partyData.rideOptions,
      hostUniversity: (partyData as any).hostUniversity,
      displayUniversity: (partyData as any).displayUniversity,
      // Here's the magic: we calculate the exact future time
      expiryTimestamp: Date.now() + parseDuration(expiresIn),
    };
    // Add the new party to the top of the list
    setParties(prevParties => [newParty, ...prevParties]);
  };

  // Your original cancelParty function (unchanged)
  const cancelParty = (id: number) => {
    setParties(prevParties => prevParties.filter(party => party.id !== id));
  };

  // --- 5. AUTOMATIC CLEANUP ---
  // This effect runs in the background to automatically remove parties
  // from the list once their timer has hit zero.
  useEffect(() => {
    const interval = setInterval(() => {
      setParties(prev => prev.filter(p => p.expiryTimestamp > Date.now()));
    }, 5000); // This check runs every 5 seconds

    // Important: clean up the interval when the app closes
    return () => clearInterval(interval);
  }, []);


  return (
    <PartyContext.Provider value={{ parties, addParty, cancelParty }}>
      {children}
    </PartyContext.Provider>
  );
}

// Your hook to access the context (unchanged)
export function useParties() {
  const context = useContext(PartyContext);
  if (context === undefined) {
    throw new Error('useParties must be used within a PartyProvider');
  }
  return context;
}