"use client";

import { Filter } from "lucide-react";
import { useState, useRef, useEffect } from "react";

interface SearchAndFiltersProps {
  destinationQuery: string;
  onDestinationQueryChange: (query: string) => void;
  timeWindowMins: string;
  onTimeWindowChange: (timeWindow: string) => void;
  sameDepartment: boolean;
  onSameDepartmentChange: (value: boolean) => void;
  sameYear: boolean;
  onSameYearChange: (value: boolean) => void;
}

export default function SearchAndFilters({
  destinationQuery,
  onDestinationQueryChange,
  timeWindowMins,
  onTimeWindowChange,
  sameDepartment,
  onSameDepartmentChange,
  sameYear,
  onSameYearChange,
}: SearchAndFiltersProps) {
  const [showFilters, setShowFilters] = useState(false);
  const filtersRef = useRef<HTMLDivElement>(null);

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
        className="w-full p-3 pr-11 border border-input rounded-full bg-background text-foreground placeholder:text-muted-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
        placeholder="Search destination (e.g., MG Road, North Gate)"
        value={destinationQuery}
        onChange={(e) => onDestinationQueryChange(e.target.value)}
      />
      
      <button
        className="absolute right-1 top-1/2 -translate-y-1/2 p-2 rounded-md hover:bg-accent"
        title="Filters"
        onClick={() => setShowFilters(!showFilters)}
      >
        <Filter className="w-4 h-4" />
      </button>

      {showFilters && (
        <div className="absolute z-50 mt-2 w-80 rounded-md border bg-card shadow p-3">
          <div className="space-y-2">
            <label htmlFor="timeWindow" className="text-sm font-medium text-muted-foreground">
              Expiring within
            </label>
            <select
              id="timeWindow"
              className="w-full p-2 border rounded-md bg-background"
              value={timeWindowMins}
              onChange={(e) => onTimeWindowChange(e.target.value)}
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
                onChange={(e) => onSameDepartmentChange(e.target.checked)}
              />
              <span className="text-sm text-muted-foreground">Same department (coming soon)</span>
            </div>
            
            <div className="flex items-center gap-2">
              <input 
                type="checkbox" 
                disabled 
                checked={sameYear}
                onChange={(e) => onSameYearChange(e.target.checked)}
              />
              <span className="text-sm text-muted-foreground">Same year (coming soon)</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
