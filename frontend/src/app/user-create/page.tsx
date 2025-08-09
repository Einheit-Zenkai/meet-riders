'use client';

import { useState, ChangeEvent, useRef } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from '@/components/ui/input';
import { Label } from "@/components/ui/label";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Bus, Car, TramFront, Bike, Footprints } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils'; // Import for combining class names

// --- NEW LOGIC SETUP ---

// Define the list of transport modes in one place for easy management
const transportModes = [
  { id: 'walking', label: 'Walking', icon: <Footprints className="h-4 w-4 mr-2"/> },
  { id: 'bus', label: 'Bus', icon: <Bus className="h-4 w-4 mr-2"/> },
  { id: 'cab', label: 'Cab', icon: <Car className="h-4 w-4 mr-2"/> },
  { id: 'auto', label: 'Auto', icon: <TramFront className="h-4 w-4 mr-2"/> },
  { id: 'suv', label: 'SUV', icon: <Car className="h-4 w-4 mr-2"/> },
  { id: 'bike', label: 'Bike', icon: <Bike className="h-4 w-4 mr-2"/> },
];

// Define the preference levels for clarity
const PREFERENCE_LEVELS = {
  UNSELECTED: 0,
  PRIMARY: 1,    // Green
  SECONDARY: 2,  // Light Green
  TERTIARY: 3,   // Yellow
  DISLIKED: -1   // Red
};

// Create the initial state object for all preferences
const initialPreferences = transportModes.reduce((acc, mode) => {
  acc[mode.id] = PREFERENCE_LEVELS.UNSELECTED;
  return acc;
}, {} as Record<string, number>);


export default function UserCreatePage() {
  const [nickname, setNickname] = useState('');
  const [bio, setBio] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // State for our new custom preference system
  const [preferences, setPreferences] = useState(initialPreferences);

  // --- NEW HANDLER FUNCTIONS ---

  // Handle click for the main preference ranking section
  const handlePreferenceClick = (modeId: string) => {
    setPreferences(prev => {
      const currentLevel = prev[modeId];
      let nextLevel;

      // If it was disliked, one click makes it unselected
      if (currentLevel === PREFERENCE_LEVELS.DISLIKED) {
        nextLevel = PREFERENCE_LEVELS.UNSELECTED;
      } else {
        // Cycle from 0 -> 1 -> 2 -> 3 -> 0
        nextLevel = (currentLevel + 1) % 4;
      }
      
      return { ...prev, [modeId]: nextLevel };
    });
  };

  // Handle click for the "not preferred" section
  const handleDislikeClick = (modeId: string) => {
    setPreferences(prev => ({
      ...prev,
      [modeId]: PREFERENCE_LEVELS.DISLIKED,
    }));
  };

  // Helper function to get Tailwind CSS classes for button colors
  const getPreferenceStyle = (level: number) => {
    switch (level) {
      case PREFERENCE_LEVELS.PRIMARY:
        return "bg-green-500 text-white border-green-500 hover:bg-green-600";
      case PREFERENCE_LEVELS.SECONDARY:
        return "bg-green-200 text-green-800 border-green-300 hover:bg-green-300";
      case PREFERENCE_LEVELS.TERTIARY:
        return "bg-yellow-200 text-yellow-800 border-yellow-300 hover:bg-yellow-300";
      case PREFERENCE_LEVELS.DISLIKED:
        return "bg-red-500 text-white border-red-500 hover:bg-red-600 line-through";
      default:
        return "bg-transparent hover:bg-accent hover:text-accent-foreground";
    }
  };


  // --- OLD HANDLER FUNCTIONS (UNCHANGED) ---
  const handleNicknameChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const validNickname = value.replace(/[^a-zA-Z0-9_.]/g, '');
    setNickname(validNickname);
  };
  const handleBioChange = (e: ChangeEvent<HTMLTextAreaElement>) => setBio(e.target.value);
  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };
  const handleAvatarClick = () => fileInputRef.current?.click();
  
  // Filter for the "Not Preferred" section
  const unselectedModes = transportModes.filter(mode => preferences[mode.id] === PREFERENCE_LEVELS.UNSELECTED);

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl lg:ml-64 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Section - Profile Picture (UNCHANGED) */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader className="text-center">
              <CardTitle>Profile Picture</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center">
              <p className="text-sm text-gray-500 mb-4 text-center">
                For Students: Use your Roll Number. <br /> Others: Use your Username.
              </p>
              <Dialog>
                <DialogTrigger asChild>
                  <button type="button" className="cursor-pointer">
                    <Avatar className="w-32 h-32 text-gray-400 border-2 border-dashed">
                      <AvatarImage src={imagePreview || ''} alt="User profile" />
                      <AvatarFallback className="flex flex-col items-center justify-center">
                        <User className="h-12 w-12" />
                        <span>Upload</span>
                      </AvatarFallback>
                    </Avatar>
                  </button>
                </DialogTrigger>
                {imagePreview && (
                  <DialogContent className="max-w-md p-0">
                    <img src={imagePreview} alt="Selected preview" className="w-full h-full object-contain rounded-lg" />
                  </DialogContent>
                )}
              </Dialog>
              <Button variant="outline" className="mt-4" onClick={handleAvatarClick}>
                {imagePreview ? "Change Image" : "Select Image"}
              </Button>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleImageChange} 
                className="hidden" 
                accept="image/*"
              />
            </CardContent>
          </Card>
        </div>

        {/* Right Section - User Details */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Tell us about yourself</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Nickname Field (UNCHANGED) */}
              <div className="space-y-2">
                <Label htmlFor="nickname">Nickname</Label>
                <Input id="nickname" placeholder="e.g. awesome_user.123" value={nickname} onChange={handleNicknameChange} />
              </div>

              {/* Bio Field (UNCHANGED) */}
              <div className="space-y-2">
                <Label htmlFor="bio">Bio / About Me</Label>
                <Textarea id="bio" placeholder="e.g. 3rd year CS student, friendly and loves music!" value={bio} onChange={handleBioChange} className="min-h-[80px]" />
              </div>

              {/* Punctuality Field (UNCHANGED) */}
              <div className="space-y-2">
                <Label>Punctuality</Label>
                <ToggleGroup type="single" variant="outline" defaultValue="on-time" className="flex flex-wrap justify-start gap-2">
                  <ToggleGroupItem value="on-time" aria-label="Select always on time">Always on time</ToggleGroupItem>
                  <ToggleGroupItem value="usually-on-time" aria-label="Select usually on time">Usually on time</ToggleGroupItem>
                  <ToggleGroupItem value="flexible" aria-label="Select flexible">Flexible</ToggleGroupItem>
                </ToggleGroup>
              </div>

              {/* Gender Field (UNCHANGED) */}
              <div className="space-y-2">
                <Label>Gender</Label>
                <ToggleGroup type="single" variant="outline" defaultValue="they" className="flex flex-wrap justify-start gap-2">
                  <ToggleGroupItem value="male" aria-label="Select male">♂ Male</ToggleGroupItem>
                  <ToggleGroupItem value="female" aria-label="Select female">♀ Female</ToggleGroupItem>
                  <ToggleGroupItem value="they" aria-label="Select they/them">👤 They/Them</ToggleGroupItem>
                </ToggleGroup>
              </div>
              
              {/* --- START OF REPLACEMENT: New Travel Preferences Section --- */}
              <div className="space-y-2">
                <Label>Travel Preferences (Click to rank 1, 2, 3 or mark as disliked)</Label>
                <div className="flex flex-wrap justify-start gap-2">
                  {transportModes.map((mode) => (
                    <button
                      key={mode.id}
                      type="button"
                      onClick={() => handlePreferenceClick(mode.id)}
                      className={cn(
                        "inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border h-10 px-4 py-2",
                        getPreferenceStyle(preferences[mode.id])
                      )}
                    >
                      {mode.icon} {mode.label}
                    </button>
                  ))}
                </div>
              </div>

              {unselectedModes.length > 0 && (
                <div className="space-y-2 border-t pt-4">
                  <Label className="text-sm text-muted-foreground">Not Preferred Modes (Click to mark red)</Label>
                  <div className="flex flex-wrap justify-start gap-2">
                    {unselectedModes.map((mode) => (
                      <button
                        key={mode.id}
                        type="button"
                        onClick={() => handleDislikeClick(mode.id)}
                        className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-transparent hover:bg-red-100 hover:border-red-500 h-10 px-4 py-2"
                      >
                        {mode.icon} {mode.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {/* --- END OF REPLACEMENT --- */}

              {/* Location Field (UNCHANGED) */}
              <div className="space-y-2">
                <Label htmlFor="location">Ideal Pickup/Drop-off Location</Label>
                <Input id="location" placeholder="e.g. Main College Gate" />
              </div>

              {/* Time Field (UNCHANGED) */}
              <div className="space-y-2">
                <Label htmlFor="time">Ideal time of leaving college</Label>
                <Input id="time" type="time" />
              </div>

              {/* Create Profile Button (UNCHANGED) */}
              <Button className="w-full">Create Profile</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}