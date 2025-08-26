"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
// 👈 use our new context

import Link from "next/link";
import { useParties } from "@/context/PartyContext";
import PartyCard from "@/components/PartyCard";
import Sidebar from "@/components/sidebar";
import HostButton from "@/components/ui/hostbutton";
import { useAuth } from "@/context/Authcontext";

export default function HomePage() {
  const { parties } = useParties();
  const { user, loading } = useAuth(); // 👈 get user state globally
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/login");
      } else {
        setIsChecking(false);
      }
    }
  }, [user, loading, router]);

  if (loading || isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-xl">Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="ml-16 p-6">
      <Sidebar />
      <HostButton />
      <h1 className="text-4xl font-bold text-foreground mb-8">Meet Riders</h1>

      <div className="bg-card p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold text-card-foreground mb-4">Available Rides</h2>

        {parties.length === 0 ? (
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
          <div className="space-y-6">
            {parties.map((party) => (
              <PartyCard key={party.id} party={party} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
