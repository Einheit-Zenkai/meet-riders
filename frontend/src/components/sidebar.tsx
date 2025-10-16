// src/components/Sidebar.tsx

import Link from "next/link";
import { User, Settings, Home, Users, Trophy, Plus, Map as MapIcon, CalendarClock, Clock } from "lucide-react";

export default function Sidebar() {
  const menuItems = [
    { href: "/dashboard", icon: Home, label: "Home" },
    { href: "/profile", icon: User, label: "Profile" },
    { href: "/hostparty", icon: Plus, label: "Host Party" },
    { href: "/soi", icon: CalendarClock, label: "Show of Interest" },
    { href: "/current-party", icon: Users, label: "Current Party" },
    { href: "/leaderboard", icon: Trophy, label: "Leaderboard" },
    { href: "/map", icon: MapIcon, label: "Map" },
    { href: "/expired-parties", icon: Clock, label: "Expired" },
  ];

  return (
    <div className="fixed left-0 top-0 h-full bg-white/60 text-foreground flex flex-col py-4 shadow-lg group group/sidebar transition-all duration-200 w-16 hover:w-48 z-[70] pointer-events-auto backdrop-blur-[9.1px] border border-white/30 rounded-r-2xl">
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
