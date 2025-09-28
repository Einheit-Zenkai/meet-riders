"use client";

import SearchAndFilters from "./SearchAndFilters";
import NotificationsDropdown from "./NotificationsDropdown";
import ThemeToggle from "./ThemeToggle";
import LogoutButton from "./LogoutButton";

interface DashboardHeaderProps {
  welcomeName: string | null;
  destinationQuery: string;
  onDestinationQueryChange: (query: string) => void;
  timeWindowMins: string;
  onTimeWindowChange: (timeWindow: string) => void;
  sameDepartment: boolean;
  onSameDepartmentChange: (value: boolean) => void;
  sameYear: boolean;
  onSameYearChange: (value: boolean) => void;
  showFriendsOnly: boolean;
  onShowFriendsOnlyChange: (value: boolean) => void;
  showMyUniversityOnly: boolean;
  onShowMyUniversityOnlyChange: (value: boolean) => void;
}

export default function DashboardHeader({
  welcomeName,
  destinationQuery,
  onDestinationQueryChange,
  timeWindowMins,
  onTimeWindowChange,
  sameDepartment,
  onSameDepartmentChange,
  sameYear,
  onSameYearChange,
  showFriendsOnly,
  onShowFriendsOnlyChange,
  showMyUniversityOnly,
  onShowMyUniversityOnlyChange,
}: DashboardHeaderProps) {
  return (
    <div className="flex flex-col gap-3 mb-4">
      <div className="flex items-center gap-3">
        <SearchAndFilters
          destinationQuery={destinationQuery}
          onDestinationQueryChange={onDestinationQueryChange}
          timeWindowMins={timeWindowMins}
          onTimeWindowChange={onTimeWindowChange}
          sameDepartment={sameDepartment}
          onSameDepartmentChange={onSameDepartmentChange}
          sameYear={sameYear}
          onSameYearChange={onSameYearChange}
          showFriendsOnly={showFriendsOnly}
          onShowFriendsOnlyChange={onShowFriendsOnlyChange}
          showMyUniversityOnly={showMyUniversityOnly}
          onShowMyUniversityOnlyChange={onShowMyUniversityOnlyChange}
        />
        
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
