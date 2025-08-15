// src/components/Sidebar.tsx

import Link from "next/link";
import { User, Settings, Home, Users, Trophy } from "lucide-react";

export default function Sidebar() {
  const menuItems = [
    { href: "/", icon: Home, label: "Home" },
    { href: "/profile", icon: User, label: "Profile" },
    { href: "/my-parties", icon: Users, label: "Parties" },
    { href: "/leaderboard", icon: Trophy, label: "Leaderboard" },
  ];

  return (
    <div className="fixed left-0 top-0 h-full w-16 bg-sidebar text-foreground flex flex-col items-center py-4 space-y-6 shadow-lg">
      {menuItems.map(({ href, icon: Icon, label }) => (
        <Link
          key={href}
          href={href}
          className="group relative flex items-center justify-center hover:text-primary"
        >
          <Icon size={24} />
          {/* Circular Tooltip */}
          <span className="absolute left-10 opacity-0 group-hover:opacity-100 bg-gray-800 text-white text-xs font-medium rounded-full px-3 py-2 transition-opacity duration-200">
            {label}
          </span>
        </Link>
      ))}

      {/* Settings at bottom */}
      <Link
        href="/settings"
        className="group relative flex items-center justify-center hover:text-primary mt-auto mb-4"
      >
        <Settings size={24} />
        <span className="absolute left-10 opacity-0 group-hover:opacity-100 bg-gray-800 text-white text-xs font-medium rounded-full px-3 py-2 transition-opacity duration-200">
          Settings
        </span>
      </Link>
    </div>
  );
}
