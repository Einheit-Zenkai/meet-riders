"use client";

// src/components/Sidebar.tsx

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { User, Settings, Home, Users, Plus, Map as MapIcon, CalendarClock, Clock, type LucideIcon } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import useAuthStore from "@/stores/authStore";

interface PartyFlags {
  hosting: boolean;
  member: boolean;
  loaded: boolean;
}

export default function Sidebar() {
  const { user } = useAuthStore();
  const supabase = useMemo(() => createClient(), []);
  const [partyFlags, setPartyFlags] = useState<PartyFlags>({ hosting: false, member: false, loaded: false });

  useEffect(() => {
    let active = true;

    const loadStatus = async () => {
      if (!user) {
        if (active) {
          setPartyFlags({ hosting: false, member: false, loaded: true });
        }
        return;
      }

      const nowIso = new Date().toISOString();

      let hostingActive = false;
      let memberActive = false;

      try {
        const { data: hostingRows, error: hostingError } = await supabase
          .from("parties")
          .select("id")
          .eq("host_id", user.id)
          .eq("is_active", true)
          .gt("expires_at", nowIso)
          .limit(1);

        if (hostingError) {
          console.error("Sidebar host party fetch error:", hostingError);
        }

        hostingActive = Boolean(hostingRows && hostingRows.length > 0);

        const { data: membershipRows, error: membershipError } = await supabase
          .from("party_members")
          .select("party_id")
          .eq("user_id", user.id)
          .eq("status", "joined");

        if (membershipError) {
          console.error("Sidebar membership fetch error:", membershipError);
        }

        const joinedIds = (membershipRows || []).map((row) => row.party_id);
        if (joinedIds.length > 0) {
          const { data: activeJoined, error: activeJoinedError } = await supabase
            .from("parties")
            .select("id")
            .in("id", joinedIds)
            .eq("is_active", true)
            .gt("expires_at", nowIso)
            .limit(1);

          if (activeJoinedError) {
            console.error("Sidebar active membership fetch error:", activeJoinedError);
          }

          memberActive = Boolean(activeJoined && activeJoined.length > 0);
        }
      } catch (error) {
        console.error("Sidebar party status check failed:", error);
      }

      if (active) {
        setPartyFlags({ hosting: hostingActive, member: memberActive, loaded: true });
      }
    };

    loadStatus();

    const interval = setInterval(loadStatus, 30_000);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [supabase, user]);

  const hasActiveParty = partyFlags.hosting || partyFlags.member;

  const menuItems = useMemo(() => {
    const items: Array<{ href: string; icon: LucideIcon; label: string }> = [
      { href: "/dashboard", icon: Home, label: "Home" },
      { href: "/profile", icon: User, label: "Profile" },
    ];

    if (!partyFlags.loaded || !hasActiveParty) {
      items.push({ href: "/hostparty", icon: Plus, label: "Host Party" });
    }

    items.push(
      { href: "/soi", icon: CalendarClock, label: "Show of Interest" },
      { href: "/connections", icon: Users, label: "Connections" },
    );

    if (partyFlags.loaded && hasActiveParty) {
      items.push({ href: "/live-party", icon: MapIcon, label: "Live Party" });
    }

    items.push({ href: "/expired-parties", icon: Clock, label: "Expired" });

    return items;
  }, [partyFlags.loaded, hasActiveParty]);

  return (
    <div
      className="fixed left-0 top-0 h-full bg-[rgba(255,255,255,0.63)] dark:bg-[rgba(15,15,15,0.48)] text-foreground flex flex-col py-4 shadow-[0_4px_30px_rgba(0,0,0,0.1)] group group/sidebar transition-all duration-200 w-16 hover:w-48 z-[70] pointer-events-auto backdrop-blur-[2.2px] rounded-r-[16px]"
      style={{ WebkitBackdropFilter: "blur(2.2px)" }}
    >
      <nav className="flex-1 flex flex-col gap-2 px-2">
        {menuItems.map(({ href, icon: Icon, label }) => (
          <Link
            key={href}
            href={href}
            className="flex items-center gap-3 p-3 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer"
            title={label}
          >
            <Icon size={22} className="shrink-0" />
            <span className="ml-1 text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 group-hover/sidebar:opacity-100 transition-opacity duration-200">
              {label}
            </span>
          </Link>
        ))}
      </nav>
      <div className="mt-auto px-2 pb-4">
        <Link
          href="/settings"
          className="flex items-center gap-3 p-3 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer"
          title="Settings"
        >
          <Settings size={22} className="shrink-0" />
          <span className="ml-1 text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 group-hover/sidebar:opacity-100 transition-opacity duration-200">Settings</span>
        </Link>
      </div>
    </div>
  );
}
