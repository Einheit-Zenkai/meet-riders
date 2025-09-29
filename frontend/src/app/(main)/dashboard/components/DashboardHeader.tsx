"use client";

import SearchAndFilters from "./SearchAndFilters";
import NotificationsDropdown from "./NotificationsDropdown";
import ThemeToggle from "./ThemeToggle";
import LogoutButton from "./LogoutButton";

interface DashboardHeaderProps {
  welcomeName: string | null;
}

export default function DashboardHeader({ welcomeName }: DashboardHeaderProps) {
  return (
    <div className="flex flex-col gap-3 mb-4">
      <div className="flex items-center gap-3">
        <SearchAndFilters />
        
        <NotificationsDropdown />
        <ThemeToggle />
        <LogoutButton />
      </div>

      {/* Welcome message */}
      <h1 className="text-2xl md:text-3xl font-bold text-foreground">
        {welcomeName ? `Welcome back, ${welcomeName}` : 'Meet Riders'}
      </h1>
    </div>
  );
}
