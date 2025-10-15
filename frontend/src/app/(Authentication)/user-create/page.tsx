'use client';

import { useState, ChangeEvent, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from '@/components/ui/input';
import { Label } from "@/components/ui/label";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Bus, Car, TramFront, Bike, Footprints, Mars, Venus } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { createClient } from '@/utils/supabase/client';

const transportModes = [
  { id: 'walking', label: 'Walking', icon: <Footprints className="h-4 w-4 mr-2"/> },
  { id: 'bus', label: 'Bus', icon: <Bus className="h-4 w-4 mr-2"/> },
  { id: 'cab', label: 'Cab', icon: <Car className="h-4 w-4 mr-2"/> },
  { id: 'auto', label: 'Auto', icon: <TramFront className="h-4 w-4 mr-2"/> },
  { id: 'suv', label: 'SUV', icon: <Car className="h-4 w-4 mr-2"/> },
  { id: 'bike', label: 'Bike', icon: <Bike className="h-4 w-4 mr-2"/> },
];
const PREFERENCE_LEVELS = { UNSELECTED: 0, PRIMARY: 1, SECONDARY: 2, TERTIARY: 3, DISLIKED: -1 };
const initialPreferences = transportModes.reduce((acc, mode) => {
  acc[mode.id] = PREFERENCE_LEVELS.UNSELECTED;
  return acc;
}, {} as Record<string, number>);


export default function UserCreatePage() {
  const supabase = createClient();
  const router = useRouter();
  const [punctuality, setPunctuality] = useState('on-time');
  const [idealLocation, setIdealLocation] = useState('');
  const [idealDepartureTime, setIdealDepartureTime] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [nickname, setNickname] = useState('');
  const [bio, setBio] = useState('');
  const [gender, setGender] = useState<string>('');
  
  // --- 1. ADD STATE TO HOLD THE ACTUAL IMAGE FILE ---
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preferences, setPreferences] = useState(initialPreferences);

  // --- 2. UPDATE THE MAIN SAVE FUNCTION WITH UPLOAD LOGIC ---
  const handleCreateProfile = async () => {
    setLoading(true);
    setError('');

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setError("Error: Not logged in. Cannot save profile.");
      setLoading(false);
      return;
    }

    let avatar_url = null;

    if (imageFile) {
      const fileName = `${user.id}-${Date.now()}`;
      const { data: uploadData, error: uploadError } = await supabase
        .storage
        .from('avatars')
        .upload(fileName, imageFile);

      if (uploadError) {
        setError(`Image upload failed: ${uploadError.message}`);
        setLoading(false);
        return;
      }

      const { data: urlData } = supabase
        .storage
        .from('avatars')
        .getPublicUrl(uploadData.path);
      
      avatar_url = urlData.publicUrl;
    }

    if (!gender) {
      setError('Please select your gender');
      setLoading(false);
      return;
    }

    const profileDataToSave = {
      nickname,
      bio,
      gender,
      punctuality,
      ideal_location: idealLocation,
      ideal_departure_time: idealDepartureTime,
      updated_at: new Date(),
      avatar_url: avatar_url,
    };

    const { error: updateError } = await supabase
      .from('profiles')
      .update(profileDataToSave)
      .eq('id', user.id);

    if (updateError) {
      setError(updateError.message);
    } else {
      alert('Profile created successfully!');
      router.push('/dashboard');
    }
    setLoading(false);
  };
  
  const handlePreferenceClick = (modeId: string) => {
    setPreferences(prev => {
      const currentLevel = prev[modeId];
      let nextLevel = (currentLevel === PREFERENCE_LEVELS.DISLIKED) ? PREFERENCE_LEVELS.UNSELECTED : (currentLevel + 1) % 4;
      return { ...prev, [modeId]: nextLevel };
    });
  };
  const handleDislikeClick = (modeId: string) => {
    setPreferences(prev => ({ ...prev, [modeId]: PREFERENCE_LEVELS.DISLIKED }));
  };
  const handleNicknameChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const validNickname = value.replace(/[^a-zA-Z0-9_.]/g, '');
    setNickname(validNickname);
  };
  const handleBioChange = (e: ChangeEvent<HTMLTextAreaElement>) => setBio(e.target.value);
  
  // --- 3. UPDATE `handleImageChange` TO STORE THE FILE ---
  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file); // This is the important new line
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };
  const handleAvatarClick = () => fileInputRef.current?.click();
  const unselectedModes = transportModes.filter(mode => preferences[mode.id] === PREFERENCE_LEVELS.UNSELECTED);

  // --- YOUR FULL JSX, 100% UNCHANGED ---
  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
      
        <div className="lg:col-span-1 flex flex-col items-center">
          <Card className="w-full">
            <CardHeader className="text-center"><CardTitle>Profile Picture</CardTitle></CardHeader>
            <CardContent className="flex flex-col items-center justify-center">
              <p className="text-sm text-muted-foreground mb-4 text-center">For Students: Use your Roll Number. <br /> Others: Use your Username.</p>
              <Dialog>
                <DialogTrigger asChild><button type="button" className="cursor-pointer"><Avatar className="w-32 h-32 text-muted-foreground border-2 border-dashed"><AvatarImage src={imagePreview || ''} alt="User profile" /><AvatarFallback className="flex flex-col items-center justify-center"><User className="h-12 w-12" /><span>Upload</span></AvatarFallback></Avatar></button></DialogTrigger>
                {imagePreview && (<DialogContent className="max-w-md p-0"><img src={imagePreview} alt="Selected preview" className="w-full h-full object-contain rounded-lg" /></DialogContent>)}
              </Dialog>
              <Button variant="outline" className="mt-4" onClick={handleAvatarClick}>{imagePreview ? "Change Image" : "Select Image"}</Button>
              <input type="file" ref={fileInputRef} onChange={handleImageChange} className="hidden" accept="image/*" />
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 flex flex-col justify-center">
          <Card className="w-full">
            <CardHeader><CardTitle>Tell us about yourself</CardTitle></CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="nickname">Nickname</Label>
                <Input id="nickname" placeholder="e.g. awesome_user.123" value={nickname} onChange={handleNicknameChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bio">Bio / About Me</Label>
                <Textarea id="bio" placeholder="e.g. 3rd year CS student, friendly and loves music!" value={bio} onChange={handleBioChange} className="min-h-[80px]" />
              </div>

              <div className="space-y-2">
                <Label>Punctuality</Label>
                <ToggleGroup type="single" variant="outline" defaultValue="on-time" className="flex flex-wrap justify-start" onValueChange={(value) => { if(value) setPunctuality(value) }}>
                  <ToggleGroupItem value="on-time" aria-label="Select always on time">Always on time</ToggleGroupItem>
                  <ToggleGroupItem value="usually-on-time" aria-label="Select usually on time">Usually on time</ToggleGroupItem>
                  <ToggleGroupItem value="flexible" aria-label="Select flexible">Flexible</ToggleGroupItem>
                </ToggleGroup>
              </div>

              {/* Gender selection - mandatory */}
              <div className="space-y-2">
                <Label>Gender</Label>
                <div className="flex flex-wrap gap-2">
                  <Button type="button" variant={gender === 'male' ? 'default' : 'outline'} onClick={() => setGender('male')}>
                    <Mars className="h-4 w-4 mr-1 text-sky-500" /> Male
                  </Button>
                  <Button type="button" variant={gender === 'female' ? 'default' : 'outline'} onClick={() => setGender('female')}>
                    <Venus className="h-4 w-4 mr-1 text-pink-500" /> Female
                  </Button>
                  <Button type="button" variant={gender === 'they/them' ? 'default' : 'outline'} onClick={() => setGender('they/them')}>
                    <User className="h-4 w-4 mr-1 text-zinc-500" /> They/Them
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">This will be shown to others in parties and your profile.</p>
              </div>
              
              <div className="space-y-2">
                <Label>Travel Preferences (Click to rank 1, 2, 3 or mark as disliked)</Label>
                <div className="flex flex-wrap gap-3">
                  {transportModes.map((mode) => (<button key={mode.id} type="button" onClick={() => handlePreferenceClick(mode.id)} className={cn("inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border h-10 px-4 py-2", preferences[mode.id] === PREFERENCE_LEVELS.PRIMARY && "bg-primary text-primary-foreground border-primary hover:bg-primary/90", preferences[mode.id] === PREFERENCE_LEVELS.SECONDARY && "bg-secondary text-secondary-foreground border-secondary hover:bg-secondary/80", preferences[mode.id] === PREFERENCE_LEVELS.TERTIARY && "bg-yellow-100 text-yellow-900 border-yellow-300 hover:bg-yellow-200", preferences[mode.id] === PREFERENCE_LEVELS.DISLIKED && "bg-destructive text-destructive-foreground border-destructive hover:bg-destructive/90 line-through", preferences[mode.id] === PREFERENCE_LEVELS.UNSELECTED && "bg-background hover:bg-accent hover:text-accent-foreground")}>{mode.icon} {mode.label}</button>))}
                </div>
              </div>
              {unselectedModes.length > 0 && (
                <div className="space-y-2 border-t pt-4">
                  <Label className="text-sm text-muted-foreground">Not Preferred Modes (Click to mark red)</Label>
                  <div className="flex flex-wrap gap-3">
                    {unselectedModes.map((mode) => (<button key={mode.id} type="button" onClick={() => handleDislikeClick(mode.id)} className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-destructive/10 hover:border-destructive h-10 px-4 py-2">{mode.icon} {mode.label}</button>))}
                  </div>
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="location">Ideal Pickup/Drop-off Location</Label>
                <Input id="location" placeholder="e.g. Main College Gate" value={idealLocation} onChange={(e) => setIdealLocation(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="time">Ideal time of leaving college</Label>
                <Input id="time" type="time" value={idealDepartureTime} onChange={(e) => setIdealDepartureTime(e.target.value)} />
              </div>

              {error && <p className="text-destructive text-center text-sm mb-4">{error}</p>}
              <Button className="w-full" onClick={handleCreateProfile} disabled={loading}>
                {loading ? 'Saving...' : 'Create Profile'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}