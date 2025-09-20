"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useParties } from "@/context/PartyContext";
import PartyCard from "@/components/PartyCard";
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
  // --- Filters state (safe): destination + time window; dept/year shown (coming soon)
  const [destinationQuery, setDestinationQuery] = useState("");
  const [timeWindowMins, setTimeWindowMins] = useState<string>("any"); // any | 10 | 15 | 30 | 60
  const [sameDepartment, setSameDepartment] = useState(false); // placeholder UI
  const [sameYear, setSameYear] = useState(false); // placeholder UI

  // --- 3. UPDATED useEffect to check the profile and set the name ---
  useEffect(() => {
    // This outer check waits for your useAuth hook to finish loading the user.
    if (!loading && user) {
      // User is authenticated (middleware ensures this), check their profile
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
    } else if (!loading && !user) {
      // This shouldn't happen due to middleware, but as a fallback
      router.push("/login");
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

  // Compute filtered list based on safe filters
  const filteredParties = useMemo(() => {
    const q = destinationQuery.trim().toLowerCase();
    const maxMs = timeWindowMins === "any" ? Infinity : parseInt(timeWindowMins, 10) * 60_000;
    const now = Date.now();
    return parties.filter((p) => {
      const matchesDestination = q === "" || p.dropOff.toLowerCase().includes(q) || p.meetupPoint.toLowerCase().includes(q);
      const timeLeft = p.expiryTimestamp - now;
      const matchesTime = maxMs === Infinity || (timeLeft > 0 && timeLeft <= maxMs);
      // sameDepartment / sameYear are placeholders until profile data is wired
      return matchesDestination && matchesTime;
    });
  }, [parties, destinationQuery, timeWindowMins]);

  // --- 4. UPDATED JSX to display the welcome message ---
  return (
    <div className="p-6">
      <HostButton />
      {/* This h1 tag is now dynamic! */}
      <h1 className="text-4xl font-bold text-foreground mb-8">
        {welcomeName ? `Welcome back, ${welcomeName}` : 'Meet Riders'}
      </h1>

      {/* Safe filters header */}
      <div className="bg-card p-4 rounded-lg shadow mb-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div className="flex-1">
            <label htmlFor="dest" className="text-sm font-medium text-muted-foreground">Search destination</label>
            <input
              id="dest"
              type="text"
              className="mt-1 w-full p-2 border rounded-md bg-background"
              placeholder="e.g. MG Road, North Gate, Hostel"
              value={destinationQuery}
              onChange={(e) => setDestinationQuery(e.target.value)}
            />
          </div>
          <div className="md:w-64">
            <label htmlFor="timeWindow" className="text-sm font-medium text-muted-foreground">Expiring within</label>
            <select
              id="timeWindow"
              className="mt-1 w-full p-2 border rounded-md bg-background"
              value={timeWindowMins}
              onChange={(e) => setTimeWindowMins(e.target.value)}
            >
              <option value="any">Any time</option>
              <option value="10">10 minutes</option>
              <option value="15">15 minutes</option>
              <option value="30">30 minutes</option>
              <option value="60">1 hour</option>
            </select>
          </div>
        </div>
        <div className="flex gap-6 mt-3 text-sm text-muted-foreground">
          <label className="inline-flex items-center gap-2">
            <input type="checkbox" disabled checked={sameDepartment} onChange={(e) => setSameDepartment(e.target.checked)} />
            Same department (coming soon)
          </label>
          <label className="inline-flex items-center gap-2">
            <input type="checkbox" disabled checked={sameYear} onChange={(e) => setSameYear(e.target.checked)} />
            Same year (coming soon)
          </label>
        </div>
      </div>

      <div className="bg-card p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold text-card-foreground mb-4">Available Rides</h2>

        {filteredParties.length === 0 ? (
          <div className="text-center py-10 border-2 border-dashed border rounded-lg">
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
        ) : (
          <div className="space-y-6">
            {filteredParties.map((party) => (
              <PartyCard key={party.id} party={party} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}