"use client";

import { Filter } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import useDashboardFiltersStore, { TimeWindow } from "@/stores/dashboardFiltersStore";

export default function SearchAndFilters() {
  const [showFilters, setShowFilters] = useState(false);
  const filtersRef = useRef<HTMLDivElement>(null);

  const destinationQuery = useDashboardFiltersStore((state) => state.destinationQuery);
  const setDestinationQuery = useDashboardFiltersStore((state) => state.setDestinationQuery);
  const timeWindowMins = useDashboardFiltersStore((state) => state.timeWindowMins);
  const setTimeWindowMins = useDashboardFiltersStore((state) => state.setTimeWindowMins);
  const sameDepartment = useDashboardFiltersStore((state) => state.sameDepartment);
  const setSameDepartment = useDashboardFiltersStore((state) => state.setSameDepartment);
  const sameYear = useDashboardFiltersStore((state) => state.sameYear);
  const setSameYear = useDashboardFiltersStore((state) => state.setSameYear);
  const showFriendsOnly = useDashboardFiltersStore((state) => state.showFriendsOnly);
  const setShowFriendsOnly = useDashboardFiltersStore((state) => state.setShowFriendsOnly);
  const showMyUniversityOnly = useDashboardFiltersStore((state) => state.showMyUniversityOnly);
  const setShowMyUniversityOnly = useDashboardFiltersStore((state) => state.setShowMyUniversityOnly);

  // Close filters when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filtersRef.current && !filtersRef.current.contains(event.target as Node)) {
        setShowFilters(false);
      }
    };

    if (showFilters) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showFilters]);

  return (
    <div className="flex-1 relative" ref={filtersRef}>
      <input
        type="text"
        className="w-full p-3 pr-11 rounded-full bg-[rgba(255,255,255,0.63)] text-foreground placeholder:text-muted-foreground shadow-[0_4px_30px_rgba(0,0,0,0.1)] focus:outline-none focus:ring-2 focus:ring-ring border border-[rgba(255,255,255,0.27)] backdrop-blur-[2.2px]"
        style={{ WebkitBackdropFilter: "blur(2.2px)" }}
        placeholder="Search destination (e.g., MG Road, North Gate)"
        value={destinationQuery}
        onChange={(e) => setDestinationQuery(e.target.value)}
      />
      
      <button
        className="absolute right-1 top-1/2 -translate-y-1/2 p-2 rounded-md hover:bg-accent"
        title="Filters"
        onClick={() => setShowFilters(!showFilters)}
      >
        <Filter className="w-4 h-4" />
      </button>

      {showFilters && (
        <div
          className="absolute z-50 mt-2 w-80 rounded-[16px] border border-[rgba(255,255,255,0.27)] bg-[rgba(255,255,255,0.63)] shadow-[0_4px_30px_rgba(0,0,0,0.1)] backdrop-blur-[2.2px] p-3"
          style={{ WebkitBackdropFilter: "blur(2.2px)" }}
        >
          <div className="space-y-2">
            <label htmlFor="timeWindow" className="text-sm font-medium text-muted-foreground">
              Expiring within
            </label>
            <select
              id="timeWindow"
              className="w-full p-2 border rounded-md bg-background"
              value={timeWindowMins}
              onChange={(e) => setTimeWindowMins(e.target.value as TimeWindow)}
            >
              <option value="any">Any time</option>
              <option value="10">10 minutes</option>
              <option value="15">15 minutes</option>
              <option value="30">30 minutes</option>
              <option value="60">1 hour</option>
            </select>
            
            <div className="flex items-center gap-2 pt-1">
              <input 
                type="checkbox" 
                disabled 
                checked={sameDepartment}
                onChange={(e) => setSameDepartment(e.target.checked)}
              />
              <span className="text-sm text-muted-foreground">Same department (coming soon)</span>
            </div>
            
            <div className="flex items-center gap-2">
              <input 
                type="checkbox" 
                disabled 
                checked={sameYear}
                onChange={(e) => setSameYear(e.target.checked)}
              />
              <span className="text-sm text-muted-foreground">Same year (coming soon)</span>
            </div>
            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                checked={showFriendsOnly}
                onChange={e => setShowFriendsOnly(e.target.checked)}
              />
              <span className="text-sm text-foreground">Friends&apos; Parties only</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={showMyUniversityOnly}
                onChange={e => setShowMyUniversityOnly(e.target.checked)}
              />
              <span className="text-sm text-foreground">My University only</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
