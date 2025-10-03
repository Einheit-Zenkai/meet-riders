"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import useAuthStore from "@/stores/authStore";
import useDashboardFiltersStore from "@/stores/dashboardFiltersStore";
import useDashboardDataStore from "@/stores/dashboardDataStore";
import type { Party } from "../types";

const TIME_WINDOW_ANY = "any";

export function useDashboard() {
  const { user, loading } = useAuthStore();
  const router = useRouter();

  const refreshProfile = useDashboardDataStore((state) => state.refreshProfile);
  const refreshParties = useDashboardDataStore((state) => state.refreshParties);
  const resetDashboard = useDashboardDataStore((state) => state.reset);
  const welcomeName = useDashboardDataStore((state) => state.welcomeName);
  const isCheckingProfile = useDashboardDataStore((state) => state.isCheckingProfile);
  const partiesLoading = useDashboardDataStore((state) => state.partiesLoading);

  useEffect(() => {
    if (loading) return;

    if (!user) {
      resetDashboard();
      router.push("/login");
      return;
    }

    let cancelled = false;

    (async () => {
      const profileStatus = await refreshProfile();
      if (cancelled) return;

      if (profileStatus === "needs-onboarding") {
        router.push("/user-create");
        return;
      }

      if (profileStatus === "error") {
        router.push("/login");
        return;
      }

      if (profileStatus === "ok") {
        await refreshParties();
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [loading, user, refreshProfile, refreshParties, router, resetDashboard]);

  useEffect(() => {
    if (!user || loading) return;

    const interval = setInterval(() => {
      refreshParties();
    }, 30000);

    return () => clearInterval(interval);
  }, [user, loading, refreshParties]);

  const isLoading = loading || isCheckingProfile || partiesLoading;

  return {
    welcomeName,
    isLoading,
  };
}

export function useDashboardParties() {
  const parties = useDashboardDataStore((state) => state.parties);
  const viewerUniversity = useDashboardDataStore((state) => state.viewerUniversity);
  const partiesLoading = useDashboardDataStore((state) => state.partiesLoading);

  const destinationQuery = useDashboardFiltersStore((state) => state.destinationQuery);
  const timeWindowMins = useDashboardFiltersStore((state) => state.timeWindowMins);
  const showFriendsOnly = useDashboardFiltersStore((state) => state.showFriendsOnly);
  const showMyUniversityOnly = useDashboardFiltersStore((state) => state.showMyUniversityOnly);

  const filteredParties = useMemo(() => {
    return filterParties(parties, {
      destinationQuery,
      timeWindowMins,
      showFriendsOnly,
      showMyUniversityOnly,
    }, viewerUniversity);
  }, [parties, destinationQuery, timeWindowMins, showFriendsOnly, showMyUniversityOnly, viewerUniversity]);

  const orderedParties = useMemo(() => {
    return orderParties(filteredParties, viewerUniversity);
  }, [filteredParties, viewerUniversity]);

  return {
    filteredParties,
    orderedParties,
    partiesLoading,
  };
}

interface FilterArgs {
  destinationQuery: string;
  timeWindowMins: string;
  showFriendsOnly: boolean;
  showMyUniversityOnly: boolean;
}

function filterParties(
  parties: Party[],
  filters: FilterArgs,
  viewerUniversity: string | null,
) {
  const query = filters.destinationQuery.trim().toLowerCase();
  const maxMs = filters.timeWindowMins === TIME_WINDOW_ANY
    ? Infinity
    : parseInt(filters.timeWindowMins, 10) * 60_000;
  const now = Date.now();

  return parties.filter((party) => {
    const matchesDestination =
      query === "" ||
      party.drop_off.toLowerCase().includes(query) ||
      party.meetup_point.toLowerCase().includes(query);

    const timeLeft = party.expires_at.getTime() - now;
    const matchesTime = maxMs === Infinity || (timeLeft > 0 && timeLeft <= maxMs);

    const matchesFriends = !filters.showFriendsOnly || party.is_friends_only;
    const matchesUniversity = !filters.showMyUniversityOnly || (
      viewerUniversity && party.host_university === viewerUniversity
    );

    return matchesDestination && matchesTime && matchesFriends && matchesUniversity;
  });
}

function orderParties(filteredParties: Party[], viewerUniversity: string | null) {
  const friends: Party[] = [];
  const sameUniversity: Party[] = [];
  const others: Party[] = [];

  for (const party of filteredParties) {
    if (party.is_friends_only) {
      friends.push(party);
      continue;
    }

    const sameSchool = Boolean(
      viewerUniversity &&
      party.host_university &&
      party.display_university &&
      party.host_university === viewerUniversity,
    );

    if (sameSchool) {
      sameUniversity.push(party);
    } else {
      others.push(party);
    }
  }

  return [...friends, ...sameUniversity, ...others];
}
