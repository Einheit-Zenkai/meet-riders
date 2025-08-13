// src/app/dashboard/page.tsx
'use client';

import Link from 'next/link';
import { useParties } from '@/context/PartyContext'; // <-- Get our party functions
import PartyCard from '@/components/PartyCard'; // <-- Import your improved card
import Sidebar from "@/components/sidebar"; // This is YOUR component, preserved.
import HostButton from "@/components/ui/hostbutton"; // This is YOUR component, preserved.
export default function HomePage() {
  const { parties } = useParties(); // <-- Get the live list of parties

  return (
    <div className="ml-16 p-6">

      <Sidebar />
      <HostButton />
      <h1 className="text-4xl font-bold text-foreground mb-8">
        Meet Riders
      </h1>

      <div className="bg-card p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold text-card-foreground mb-4">Available Rides</h2>

        {parties.length === 0 ? (
          // IF NO PARTIES EXIST:
          <div className="text-center py-10 border-2 border-dashed border rounded-lg">
            <p className="text-muted-foreground mb-4">
              No rides are available at the moment.
            </p>
            <Link
              href="/hostparty"
              className="inline-block px-6 py-2 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-colors duration-300 shadow"
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