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
import { Bell, LogOut, Moon, Filter } from "lucide-react";

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
  const [viewerUniversity, setViewerUniversity] = useState<string | null>(null);

  // Compute filtered list based on safe filters (must be above any returns to keep hook order stable)
  const filteredParties = useMemo(() => {
    const q = destinationQuery.trim().toLowerCase();
    const maxMs = timeWindowMins === "any" ? Infinity : parseInt(timeWindowMins, 10) * 60_000;
    const now = Date.now();
    return parties.filter((p) => {
      const matchesDestination = q === "" || p.dropOff.toLowerCase().includes(q) || p.meetupPoint.toLowerCase().includes(q);
      const timeLeft = p.expiryTimestamp - now;
      const matchesTime = maxMs === Infinity || (timeLeft > 0 && timeLeft <= maxMs);
      return matchesDestination && matchesTime;
    });
  }, [parties, destinationQuery, timeWindowMins]);

  // Compute recommended ordering (same university first) — must stay above any early returns
  const orderedParties = useMemo(() => {
    if (!viewerUniversity) return filteredParties;
    const a: typeof filteredParties = [];
    const b: typeof filteredParties = [];
    for (const p of filteredParties) {
      if ((p as any).hostUniversity && (p as any).displayUniversity && (p as any).hostUniversity === viewerUniversity) a.push(p);
      else b.push(p);
    }
    return [...a, ...b];
  }, [filteredParties, viewerUniversity]);

  // --- 3. UPDATED useEffect to check the profile and set the name ---
  useEffect(() => {
    // This outer check waits for your useAuth hook to finish loading the user.
    if (!loading && user) {
      // User is authenticated (middleware ensures this), check their profile
      const checkProfile = async () => {
        const supabase = createClient();
        const { data: profile } = await supabase
          .from('profiles')
          .select('nickname, full_name, university') // Get the names we can display
          .eq('id', user.id)
          .single();

        // **THE CORE LOGIC:**
        // Check if the user has filled out their profile yet.
        if (profile && (profile.nickname || profile.full_name)) {
          // If they have a name, they are an existing user.
          const nameToDisplay = profile.nickname || profile.full_name || 'Rider';
          setWelcomeName(nameToDisplay);
          setViewerUniversity(profile.university || null);
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

  // --- 4. UPDATED JSX to display the welcome message ---
  return (
    <div className="p-6">
      <HostButton />
      {/* Header with search + quick actions (notif, theme, logout) */}
      <div className="flex flex-col gap-3 mb-4">
        <div className="flex items-center gap-3">
          {/* Search bar with filters dropdown trigger */}
          {/* <div className="flex-1 relative">
            <input
              type="text"
              className="w-full p-3 pr-11 border rounded-full bg-white text-black placeholder:text-neutral-500 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="Search destination (e.g., MG Road, North Gate)"
              value={destinationQuery}
              onChange={(e) => setDestinationQuery(e.target.value)}
            />
            <button
              className="absolute right-1 top-1/2 -translate-y-1/2 p-2 rounded-md hover:bg-accent"
              title="Filters"
              onClick={(e) => {
                e.preventDefault();
                const panel = document.getElementById('filters-popover');
                if (panel) panel.classList.toggle('hidden');
              }}
            >
              <Filter className="w-4 h-4" />
            </button>
            <div id="filters-popover" className="hidden absolute z-50 mt-2 w-80 rounded-md border bg-card shadow p-3">
              <div className="space-y-2">
                <label htmlFor="timeWindow" className="text-sm font-medium text-muted-foreground">Expiring within</label>
                <select
                  id="timeWindow"
                  className="w-full p-2 border rounded-md bg-background"
                  value={timeWindowMins}
                  onChange={(e) => setTimeWindowMins(e.target.value)}
                >
                  <option value="any">Any time</option>
                  <option value="10">10 minutes</option>
                  <option value="15">15 minutes</option>
                  <option value="30">30 minutes</option>
                  <option value="60">1 hour</option>
                </select>
                <div className="flex items-center gap-2 pt-1">
                  <input type="checkbox" disabled />
                  <span className="text-sm text-muted-foreground">Same department (coming soon)</span>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" disabled />
                  <span className="text-sm text-muted-foreground">Same year (coming soon)</span>
                </div>
              </div>
            </div>
          </div> */}

          {/* Notifications with dropdown */}
          <div className="relative">
            <button
              className="p-2 rounded-full border hover:bg-accent"
              title="Notifications"
              onClick={() => {
                const dd = document.getElementById('notif-dd');
                if (dd) dd.classList.toggle('hidden');
              }}
            >
              <Bell className="w-5 h-5" />
            </button>
            <div id="notif-dd" className="hidden absolute right-0 mt-2 w-56 rounded-md border bg-card shadow p-3 text-sm text-muted-foreground z-50">No notifications</div>
          </div>

          {/* Theme toggle (simple icon for now) */}
          <button
            className="p-2 rounded-full border hover:bg-accent"
            title="Toggle theme"
            onClick={() => document.documentElement.classList.toggle('dark')}
          >
            <Moon className="w-5 h-5" />
          </button>

          {/* Logout with confirm dialog */}
          <div className="relative">
            <button
              className="p-2 rounded-md border hover:bg-accent flex items-center gap-2"
              title="Log out"
              onClick={() => {
                const dlg = document.getElementById('logout-dialog');
                if (dlg) dlg.classList.remove('hidden');
              }}
            >
              <LogOut className="w-5 h-5" />
              <span className="hidden sm:inline">Log out</span>
            </button>
            {/* Confirm dialog */}
            <div id="logout-dialog" className="hidden fixed inset-0 z-50 flex items-center justify-center bg-black/40">
              <div className="bg-card border rounded-lg shadow-lg w-full max-w-sm p-5">
                <h2 className="text-lg font-semibold mb-2">Sign out</h2>
                <p className="text-sm text-muted-foreground mb-4">Are you sure you want to log out?</p>
                <div className="flex justify-end gap-2">
                  <button
                    className="px-4 py-2 rounded-md border"
                    onClick={() => document.getElementById('logout-dialog')?.classList.add('hidden')}
                  >
                    Cancel
                  </button>
                  <button
                    className="px-4 py-2 rounded-md bg-destructive text-destructive-foreground"
                    onClick={async () => {
                      const supabase = createClient();
                      await supabase.auth.signOut();
                      window.location.href = '/login';
                    }}
                  >
                    Yes, log out
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Welcome below the top bar */}
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">
          {welcomeName ? `Welcome back, ${welcomeName}` : 'Meet Riders'}
        </h1>
      </div>

      {/* Old filters header removed; filters now live inside search bar */}

  <div className="bg-card p-6 rounded-lg shadow-md relative z-0">
        <h2 className="text-2xl font-semibold text-card-foreground mb-4">Available Rides</h2>

        {orderedParties.length === 0 ? (
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
            {orderedParties.map((party) => (
              <PartyCard key={party.id} party={party} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}