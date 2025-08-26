// src/app/dashboard/page.tsx
'use client';

// --- ADDED IMPORTS FOR THE REDIRECT LOGIC ---
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';

// --- YOUR EXISTING IMPORTS (UNTOUCHED) ---
import Link from 'next/link';
import { useParties } from '@/context/PartyContext';
import PartyCard from '@/components/PartyCard';
import Sidebar from "@/components/sidebar";
import HostButton from "@/components/ui/hostbutton";

export default function HomePage() {
  // --- YOUR EXISTING HOOK (UNTOUCHED) ---
  const { parties } = useParties();

  // --- ADDED LOGIC FOR PROFILE CHECK & REDIRECT ---
  const router = useRouter();
  const supabase = createClient();
  // We add a loading state to prevent the dashboard from flashing before the check is done
  const [isLoading, setIsLoading] = useState(true); 

  useEffect(() => {
    // This function will run as soon as the component loads
    const checkProfileAndRedirect = async () => {
      // Get the current user from Supabase
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        // If a user is logged in, check their profile in our 'profiles' table
        const { data: profile } = await supabase
          .from('profiles')
          .select('nickname') // We only need one field to check if it's been filled out
          .eq('id', user.id)
          .single();
        
        // **THE CORE LOGIC:** If a profile exists but the nickname is null (empty)...
        if (profile && profile.nickname === null) {
          // ...they are a new user. Force them to the create profile page.
          router.push('/user-create');
        } else {
          // Otherwise, they are a returning user. Show them the dashboard.
          setIsLoading(false);
        }
      } else {
        // If no one is logged in at all, send them to the login page.
        router.push('/login');
      }
    };

    checkProfileAndRedirect();
  }, [router, supabase]); // This tells the effect to run again if the router or supabase client changes (good practice)

  // While the check is running, we show a simple loading message.
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-xl">Loading your dashboard...</p>
      </div>
    );
  }

  // --- YOUR EXISTING DASHBOARD UI (100% UNTOUCHED) ---
  // This code will only be shown AFTER the check is complete and the user is confirmed to be an existing user.
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
            {parties.map(party => (
              <PartyCard key={party.id} party={party} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}