"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";
import { Home, Users, Plus, Map as MapIcon, Trophy, Clock, User, CalendarClock, Menu, Settings, MapPin, LayoutGrid } from "lucide-react";

const tabs = [
  { href: "/dashboard", icon: Home, label: "Home" },
  { href: "/current-party", icon: Users, label: "Current" },
  { href: "/hostparty", icon: Plus, label: "Host" },
  { href: "/map", icon: MapIcon, label: "Map" },
  { href: "/expired-parties", icon: Clock, label: "Expired" },
];

const allOptions = [
  { href: "/dashboard", icon: Home, label: "Home" },
  { href: "/profile", icon: User, label: "Profile" },
  { href: "/hostparty", icon: Plus, label: "Host Party" },
  { href: "/current-party", icon: LayoutGrid, label: "Current Party" },
  { href: "/live-party", icon: MapPin, label: "Live Party" },
  { href: "/soi", icon: CalendarClock, label: "Show of Interest" },
  { href: "/connections", icon: Users, label: "Connections" },
  { href: "/leaderboard", icon: Trophy, label: "Leaderboard" },
  { href: "/map", icon: MapIcon, label: "Map" },
  { href: "/expired-parties", icon: Clock, label: "Expired" },
  { href: "/settings", icon: Settings, label: "Settings" },
];

export default function MobileTabBar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const orderedOptions = useMemo(() => {
    const deduped = new Map<string, (typeof allOptions)[number]>();
    for (const option of allOptions) {
      deduped.set(option.href, option);
    }
    return Array.from(deduped.values());
  }, []);

  return (
    <>
      {open ? (
        <div
          className="fixed inset-0 z-[60] bg-background/60 backdrop-blur-sm"
          onClick={() => setOpen(false)}
          role="button"
          tabIndex={-1}
        >
          <div
            className="absolute bottom-16 left-3 right-3 rounded-2xl border border-border bg-card p-2 shadow-lg"
            onClick={(e) => e.stopPropagation()}
            role="presentation"
          >
            <div className="px-3 pt-2 pb-1 text-sm font-semibold text-foreground">All options</div>
            <div className="grid grid-cols-2 gap-1 p-1">
              {orderedOptions.map(({ href, icon: Icon, label }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-foreground hover:bg-accent"
                >
                  <Icon size={18} className="text-muted-foreground" />
                  <span className="truncate">{label}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border/60 bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <ul className="grid grid-cols-6">
        {tabs.map(({ href, icon: Icon, label }) => {
          const active = pathname === href;
          return (
            <li key={href}>
              <Link
                href={href}
                className={`flex flex-col items-center justify-center py-2 text-xs transition-all ${
                  active
                    ? "text-primary font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon size={20} />
                <span className="mt-0.5">{label}</span>
              </Link>
            </li>
          );
        })}

        <li>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="flex w-full flex-col items-center justify-center py-2 text-xs text-muted-foreground hover:text-foreground"
          >
            <Menu size={20} />
            <span className="mt-0.5">All</span>
          </button>
        </li>
      </ul>
    </nav>
    </>
  );
}
