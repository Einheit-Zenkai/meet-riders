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
    <div className="relative" ref={filtersRef}>
      <input
        type="text"
        className="w-full px-5 py-3 pr-12 rounded-full bg-card/60 text-foreground placeholder:text-muted-foreground shadow-[0_4px_30px_rgba(0,0,0,0.12)] focus:outline-none focus:ring-2 focus:ring-primary/50 border border-white/10 backdrop-blur-[6px]"
        style={{ WebkitBackdropFilter: "blur(2.2px)" }}
        placeholder="Search destination (e.g., MG Road, North Gate)"
        value={destinationQuery}
        onChange={(e) => setDestinationQuery(e.target.value)}
      />

      {/* Button wrapper to anchor dropdown directly below the funnel icon */}
      <div className="absolute right-1.5 top-1/2 -translate-y-1/2">
        <button
          className="p-2 rounded-full hover:bg-foreground/10"
          title="Filters"
          onClick={() => setShowFilters(!showFilters)}
        >
          <Filter className="w-4 h-4 text-foreground" />
        </button>

        {showFilters && (
          <div
            className="absolute top-full right-0 z-50 mt-2 w-80 rounded-xl border border-white/10 bg-card/60 shadow-lg backdrop-blur-[6px] p-3"
            style={{ WebkitBackdropFilter: "blur(6px)" }}
          >
            <div className="space-y-2">
              <label htmlFor="timeWindow" className="text-sm font-medium text-muted-foreground">
                Expiring within
              </label>
              <select
                id="timeWindow"
                className="w-full p-2 border rounded-full bg-background/70 text-foreground"
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
                <span className="text-sm text-foreground">Connections&apos; Parties only</span>
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
    </div>
  );
}
