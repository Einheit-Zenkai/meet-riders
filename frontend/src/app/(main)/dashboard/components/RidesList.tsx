"use client";

import Link from "next/link";
import DashboardPartyCard from "./DashboardPartyCard";
import { Party } from "../types";

interface RidesListProps {
  parties: Party[];
  isLoading?: boolean;
  onPartyUpdate?: () => void;
}

export default function RidesList({ parties, isLoading = false, onPartyUpdate }: RidesListProps) {
  if (isLoading) {
    return (
      <div className="bg-card p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold text-card-foreground mb-4">Available Rides</h2>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-32 bg-muted rounded-lg"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card p-6 rounded-lg shadow-md relative z-0">
      <h2 className="text-2xl font-semibold text-card-foreground mb-4">Available Rides</h2>

      {parties.length === 0 ? (
        <EmptyRidesState />
      ) : (
        <div className="space-y-6">
          {parties.map((party) => (
            <DashboardPartyCard 
              key={party.id} 
              party={party} 
              onPartyUpdate={onPartyUpdate}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function EmptyRidesState() {
  return (
    <div className="text-center py-10 border-2 border-dashed border-border rounded-lg">
      <p className="text-muted-foreground mb-4">
        No rides match your filters right now.
      </p>
      <Link
        href="/hostparty"
        className="inline-block px-6 py-2 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-colors duration-300 shadow"
      >
        Host a Ride
      </Link>
    </div>
  );
}
