// src/app/page.tsx
'use client';

import Link from 'next/link';
import { useParties } from '@/context/PartyContext'; // <-- Get our party functions
import PartyCard from '@/components/PartyCard'; // <-- Import your improved card

export default function HomePage() {
  const { parties } = useParties(); // <-- Get the live list of parties

  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold text-gray-800 mb-8">
        MeetRiders
      </h1>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Available Rides</h2>

        {parties.length === 0 ? (
          // IF NO PARTIES EXIST:
          <div className="text-center py-10 border-2 border-dashed border-gray-300 rounded-lg">
            <p className="text-gray-500 mb-4">
              No rides are available at the moment.
            </p>
            <Link 
              href="/hostparty"
              className="px-6 py-2 bg-rose-500 text-white font-semibold rounded-lg hover:bg-rose-600 transition-colors duration-300 shadow"
            >
              Host a Ride
            </Link>
          </div>
        ) : (
          // IF PARTIES EXIST, MAP OVER THEM AND SHOW A CARD FOR EACH:
          <div className="space-y-6">
            {parties.map(party => (
              <PartyCard key={party.id} party={party} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}