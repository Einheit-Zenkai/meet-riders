"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useParties } from "@/context/PartyContext";
import PartyCard from "@/components/PartyCard";
import Sidebar from "@/components/sidebar";
import HostButton from "@/components/ui/hostbutton";
import { useAuth } from "@/context/Authcontext";
// --- 1. ADDED IMPORT for the Supabase client ---
import { createClient } from "@/utils/supabase/client";

export default function HomePage() {
  const { parties } = useParties();
  const { user, loading } = useAuth(); // Your global user state is perfect.
  const router = useRouter();
  
  // --- 2. ADDED STATE to hold the user's display name ---
  const [welcomeName, setWelcomeName] = useState<string | null>(null);
  const [isCheckingProfile, setIsCheckingProfile] = useState(true); // Renamed for clarity

  // --- 3. UPDATED useEffect to check the profile and set the name ---
  useEffect(() => {
    // This outer check waits for your useAuth hook to finish loading the user.
    if (!loading) {
      if (user) {
        // If a user exists, we then check their profile in our database.
        const checkProfile = async () => {
          const supabase = createClient();
          const { data: profile } = await supabase
            .from('profiles')
            .select('nickname, full_name') // Get the names we can display
            .eq('id', user.id)
            .single();

          // **THE CORE LOGIC:**
          // Check if the user has filled out their profile yet.
          if (profile && (profile.nickname || profile.full_name)) {
            // If they have a name, they are an existing user.
            const nameToDisplay = profile.nickname || profile.full_name || 'Rider';
            setWelcomeName(nameToDisplay);
            setIsCheckingProfile(false); // Stop loading and show the dashboard.
          } else {
            // If their profile has no name, they are a new user. Redirect them.
            router.push('/user-create');
          }
        };
        
        checkProfile();

      } else {
        // If your useAuth hook confirms there is no user, redirect to login.
        router.push("/login");
      }
    }
  }, [user, loading, router]);

  // The loading screen now waits for both the auth check and our profile check.
  if (loading || isCheckingProfile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-xl">Loading your dashboard...</p>
      </div>
    );
  }

  // --- 4. UPDATED JSX to display the welcome message ---
  return (
    <div className="ml-16 p-6">
      <Sidebar />
      <HostButton />
      {/* This h1 tag is now dynamic! */}
      <h1 className="text-4xl font-bold text-foreground mb-8">
        {welcomeName ? `Welcome back, ${welcomeName}` : 'Meet Riders'}
      </h1>

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