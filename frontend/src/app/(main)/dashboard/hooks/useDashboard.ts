"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/Authcontext";
import { createClient } from "@/utils/supabase/client";
import { Party, UserProfile } from "../types";

export function useDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();

  // User profile state
  const [welcomeName, setWelcomeName] = useState<string | null>(null);
  const [isCheckingProfile, setIsCheckingProfile] = useState(true);
  const [viewerUniversity, setViewerUniversity] = useState<string | null>(null);

  // Parties state
  const [parties, setParties] = useState<Party[]>([]);
  const [partiesLoading, setPartiesLoading] = useState(true);

  // Filter state
  const [destinationQuery, setDestinationQuery] = useState("");
  const [timeWindowMins, setTimeWindowMins] = useState<string>("any");
  const [sameDepartment, setSameDepartment] = useState(false);
  const [sameYear, setSameYear] = useState(false);

  // Profile check effect
  useEffect(() => {
    if (!loading && user) {
      checkUserProfile();
      fetchParties();
    } else if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  // Set up periodic refresh for parties
  useEffect(() => {
    if (!user || loading) return;

    const interval = setInterval(() => {
      fetchParties();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [user, loading]);

  // Fetch parties from Supabase
  const fetchParties = async () => {
    try {
      setPartiesLoading(true);
      const supabase = createClient();
      
      const { data: partiesData, error } = await supabase
        .from('parties')
        .select(`
          id,
          created_at,
          host_id,
          party_size,
          meetup_point,
          drop_off,
          is_friends_only,
          is_gender_only,
          ride_options,
          expires_in,
          expiry_timestamp,
          host_university,
          display_university,
          is_active
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching parties:', error);
        return;
      }

      // Transform the data to ensure dates are proper Date objects
      const transformedParties = partiesData?.map(party => ({
        ...party,
        created_at: new Date(party.created_at),
        expiry_timestamp: new Date(party.expiry_timestamp),
      })) || [];

      setParties(transformedParties);
    } catch (error) {
      console.error('Failed to fetch parties:', error);
    } finally {
      setPartiesLoading(false);
    }
  };

  const checkUserProfile = async () => {
    if (!user) return;

    try {
      const supabase = createClient();
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('nickname, full_name, university')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        router.push('/login');
        return;
      }

      if (profile && (profile.nickname || profile.full_name)) {
        const nameToDisplay = profile.nickname || profile.full_name || 'Rider';
        setWelcomeName(nameToDisplay);
        setViewerUniversity(profile.university || null);
        setIsCheckingProfile(false);
      } else {
        router.push('/user-create');
      }
    } catch (error) {
      console.error('Profile check failed:', error);
      router.push('/login');
    }
  };

  // Filtered parties based on search and filters
  const filteredParties = useMemo(() => {
    const query = destinationQuery.trim().toLowerCase();
    const maxMs = timeWindowMins === "any" ? Infinity : parseInt(timeWindowMins, 10) * 60_000;
    const now = Date.now();

    return parties.filter((party: Party) => {
      const matchesDestination = 
        query === "" || 
        party.drop_off.toLowerCase().includes(query) || 
        party.meetup_point.toLowerCase().includes(query);
      
      const timeLeft = party.expiry_timestamp.getTime() - now;
      const matchesTime = maxMs === Infinity || (timeLeft > 0 && timeLeft <= maxMs);
      
      return matchesDestination && matchesTime;
    });
  }, [parties, destinationQuery, timeWindowMins]);

  // Ordered parties (same university first)
  const orderedParties = useMemo(() => {
    if (!viewerUniversity) return filteredParties;
    
    const sameUniversity: Party[] = [];
    const otherUniversity: Party[] = [];
    
    for (const party of filteredParties) {
      if (
        party.host_university && 
        party.display_university && 
        party.host_university === viewerUniversity
      ) {
        sameUniversity.push(party);
      } else {
        otherUniversity.push(party);
      }
    }
    
    return [...sameUniversity, ...otherUniversity];
  }, [filteredParties, viewerUniversity]);

  const isLoading = loading || isCheckingProfile || partiesLoading;

  return {
    // State
    welcomeName,
    isLoading,
    orderedParties,
    
    // Data refresh
    refreshParties: fetchParties,
    
    // Filters
    destinationQuery,
    setDestinationQuery,
    timeWindowMins,
    setTimeWindowMins,
    sameDepartment,
    setSameDepartment,
    sameYear,
    setSameYear,
  };
}
