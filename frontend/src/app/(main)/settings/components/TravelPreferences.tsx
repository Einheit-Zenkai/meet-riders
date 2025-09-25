'use client';

import { Bus, Car, TramFront, Bike, Footprints } from 'lucide-react';
import { Label } from "@/components/ui/label";
import { cn } from '@/lib/utils';
import { Preferences } from '../hooks/useProfile';

const transportModes = [
  { id: 'walking', label: 'Walking', icon: <Footprints className="h-4 w-4 mr-2"/> },
  { id: 'bus', label: 'Bus', icon: <Bus className="h-4 w-4 mr-2"/> },
  { id: 'cab', label: 'Cab', icon: <Car className="h-4 w-4 mr-2"/> },
  { id: 'auto', label: 'Auto', icon: <TramFront className="h-4 w-4 mr-2"/> },
  { id: 'suv', label: 'SUV', icon: <Car className="h-4 w-4 mr-2"/> },
  { id: 'bike', label: 'Bike', icon: <Bike className="h-4 w-4 mr-2"/> },
];

interface TravelPreferencesProps {
  preferences: Preferences;
  handlePreferenceClick: (modeId: string) => void;
  handleDislikeClick: (modeId: string) => void;
  PREFERENCE_LEVELS: {
    UNSELECTED: 0;
    PRIMARY: 1;
    SECONDARY: 2;
    TERTIARY: 3;
    DISLIKED: -1;
  };
}

export const TravelPreferences = ({
  preferences,
  handlePreferenceClick,
  handleDislikeClick,
  PREFERENCE_LEVELS,
}: TravelPreferencesProps) => {
  const unselectedModes = transportModes.filter(mode => 
    preferences[mode.id] === PREFERENCE_LEVELS.UNSELECTED
  );

  return (
    <>
      <div className="space-y-2">
        <Label>Travel Preferences (Click to rank 1, 2, 3 or mark as disliked)</Label>
        <div className="flex flex-wrap gap-3">
          {transportModes.map((mode) => (
            <button
              key={mode.id}
              type="button"
              onClick={() => handlePreferenceClick(mode.id)}
              className={cn(
                "inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border h-10 px-4 py-2",
                preferences[mode.id] === PREFERENCE_LEVELS.PRIMARY && "bg-primary text-primary-foreground border-primary hover:bg-primary/90",
                preferences[mode.id] === PREFERENCE_LEVELS.SECONDARY && "bg-secondary text-secondary-foreground border-secondary hover:bg-secondary/80",
                preferences[mode.id] === PREFERENCE_LEVELS.TERTIARY && "bg-yellow-100 text-yellow-900 border-yellow-300 hover:bg-yellow-200",
                preferences[mode.id] === PREFERENCE_LEVELS.DISLIKED && "bg-destructive text-destructive-foreground border-destructive hover:bg-destructive/90 line-through",
                preferences[mode.id] === PREFERENCE_LEVELS.UNSELECTED && "bg-background hover:bg-accent hover:text-accent-foreground"
              )}
            >
              {mode.icon} {mode.label}
            </button>
          ))}
        </div>
      </div>
      
      {unselectedModes.length > 0 && (
        <div className="space-y-2 border-t pt-4">
          <Label className="text-sm text-muted-foreground">
            Not Preferred Modes (Click to mark red)
          </Label>
          <div className="flex flex-wrap gap-3">
            {unselectedModes.map((mode) => (
              <button
                key={mode.id}
                type="button"
                onClick={() => handleDislikeClick(mode.id)}
                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-destructive/10 hover:border-destructive h-10 px-4 py-2"
              >
                {mode.icon} {mode.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
};
