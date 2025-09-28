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
  const [showFriendsOnly, setShowFriendsOnly] = useState(false);
  const [showMyUniversityOnly, setShowMyUniversityOnly] = useState(false);

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
      
      // First, fetch the parties
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

      if (!partiesData || partiesData.length === 0) {
        setParties([]);
        return;
      }

      // Get unique host IDs
      const hostIds = [...new Set(partiesData.map(party => party.host_id))];

      // Fetch profiles for all hosts
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select(`
          id,
          full_name,
          nickname,
          gender,
          avatar_url,
          university,
          points,
          phone_number,
          show_phone,
          major,
          bio
        `)
        .in('id', hostIds);

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
      }

      // Create a map of profiles by ID for easy lookup
      const profilesMap = new Map();
      profilesData?.forEach(profile => {
        profilesMap.set(profile.id, profile);
      });

      // Get party IDs to fetch member counts and user memberships
      const partyIds = partiesData.map(party => party.id);

      // Fetch member counts for all parties
      const memberCountPromises = partyIds.map(async (partyId) => {
        const { data: count } = await supabase
          .rpc('get_party_member_count', { party_bigint: partyId });
        return { partyId, count: count || 0 };
      });

      const memberCounts = await Promise.all(memberCountPromises);
      const memberCountsMap = new Map();
      memberCounts.forEach(({ partyId, count }) => {
        memberCountsMap.set(partyId, count);
      });

      // Check if current user is a member of any parties
      const { data: userMemberships } = await supabase
        .from('party_members')
        .select('party_id')
        .eq('user_id', user?.id)
        .eq('status', 'joined')
        .in('party_id', partyIds);

      const userMembershipSet = new Set(
        userMemberships?.map(membership => membership.party_id) || []
      );

      // Transform the data to ensure dates are proper Date objects and add host profiles
      const transformedParties = partiesData.map(party => ({
        ...party,
        created_at: new Date(party.created_at),
        expiry_timestamp: new Date(party.expiry_timestamp),
        host_profile: profilesMap.get(party.host_id) || null,
        current_member_count: memberCountsMap.get(party.id) || 0,
        user_is_member: userMembershipSet.has(party.id),
      })) as Party[];

      setParties(transformedParties);
    } catch (error) {
      console.error('Failed to fetch parties:', error);
      // Set empty array on error to prevent UI issues
      setParties([]);
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

      // Friends filter
      const matchesFriends = !showFriendsOnly || party.is_friends_only;
      // University filter
      const matchesUniversity = !showMyUniversityOnly || (
        viewerUniversity && party.host_university === viewerUniversity
      );

      return matchesDestination && matchesTime && matchesFriends && matchesUniversity;
    });
  }, [parties, destinationQuery, timeWindowMins, showFriendsOnly, showMyUniversityOnly, viewerUniversity]);

  // Ordered parties: friends first, then same university, then others
  const orderedParties = useMemo(() => {
    // Placeholder: if you have a real friends table, wire it here.
    // For now, treat party.is_friends_only as "friends-hosted" category.
    const friends: Party[] = [];
    const sameUniversity: Party[] = [];
    const others: Party[] = [];

    for (const party of filteredParties) {
      if (party.is_friends_only) {
        friends.push(party);
        continue;
      }
      if (
        viewerUniversity &&
        party.host_university &&
        party.display_university &&
        party.host_university === viewerUniversity
      ) {
        sameUniversity.push(party);
      } else {
        others.push(party);
      }
    }

    return [...friends, ...sameUniversity, ...others];
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
    showFriendsOnly,
    setShowFriendsOnly,
    showMyUniversityOnly,
    setShowMyUniversityOnly,
  };
}
