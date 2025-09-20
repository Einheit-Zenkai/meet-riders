'use client';

import { useEffect, useRef, useState, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from '@/components/ui/input';
import { Label } from "@/components/ui/label";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Bus, Car, TramFront, Bike, Footprints } from 'lucide-react';
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
const PREFERENCE_LEVELS = { UNSELECTED: 0, PRIMARY: 1, SECONDARY: 2, TERTIARY: 3, DISLIKED: -1 } as const;

type Preferences = Record<string, number>;

export default function SettingsPage() {
  const supabase = createClient();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const [nickname, setNickname] = useState('');
  const [bio, setBio] = useState('');
  const [punctuality, setPunctuality] = useState('on-time');
  const [gender, setGender] = useState('they');
  const [idealLocation, setIdealLocation] = useState('');
  const [idealDepartureTime, setIdealDepartureTime] = useState('');

  const [preferences, setPreferences] = useState<Preferences>(() => {
    const init: Preferences = {};
    transportModes.forEach(m => { init[m.id] = PREFERENCE_LEVELS.UNSELECTED; });
    return init;
  });

  // Avatar state
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Password change
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState('');
  const [passwordErr, setPasswordErr] = useState('');

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError('');
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.replace('/login');
        return;
      }

      // Load profile row
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (error) {
        setError(error.message);
      } else if (profile) {
        setNickname(profile.nickname || '');
        setBio(profile.bio || '');
        setPunctuality(profile.punctuality || 'on-time');
        setGender(profile.gender || 'they');
        setIdealLocation(profile.ideal_location || '');
        setIdealDepartureTime(profile.ideal_departure_time || '');
        if (profile.avatar_url) setImagePreview(profile.avatar_url);
        // If you later store preferences JSON, initialize from it here
        // if (profile.preferences) setPreferences(profile.preferences);
      }
      setLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePreferenceClick = (modeId: string) => {
    setPreferences(prev => {
      const current = prev[modeId];
      const next = current === PREFERENCE_LEVELS.DISLIKED
        ? PREFERENCE_LEVELS.UNSELECTED
        : (current + 1) % 4;
      return { ...prev, [modeId]: next };
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

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };
  const handleAvatarClick = () => fileInputRef.current?.click();

  const unselectedModes = transportModes.filter(mode => preferences[mode.id] === PREFERENCE_LEVELS.UNSELECTED);

  const handleSave = async () => {
    setSaveLoading(true);
    setError('');
    setMessage('');

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setError('Not logged in');
      setSaveLoading(false);
      return;
    }

    let avatar_url: string | null = null;
    // If a new image was selected, upload it and get public URL
    if (imageFile) {
      const fileName = `${user.id}-${Date.now()}`;
      const { data: uploadData, error: uploadError } = await supabase
        .storage
        .from('avatars')
        .upload(fileName, imageFile, { upsert: false });

      if (uploadError) {
        setError(`Image upload failed: ${uploadError.message}`);
        setSaveLoading(false);
        return;
      }

      const { data: urlData } = supabase
        .storage
        .from('avatars')
        .getPublicUrl(uploadData.path);
      avatar_url = urlData.publicUrl;
    }

    const profileDataToSave: Record<string, any> = {
      nickname,
      bio,
      punctuality,
      gender,
      ideal_location: idealLocation,
      ideal_departure_time: idealDepartureTime,
      updated_at: new Date(),
    };
    if (avatar_url) profileDataToSave.avatar_url = avatar_url;
    // If you create a column, you can persist preferences: profileDataToSave.preferences = preferences

    const { error: updateError } = await supabase
      .from('profiles')
      .update(profileDataToSave)
      .eq('id', user.id);

    if (updateError) {
      setError(updateError.message);
    } else {
      setMessage('Settings saved');
    }
    setSaveLoading(false);
  };

  const handlePasswordChange = async () => {
    setPasswordErr('');
    setPasswordMsg('');
    if (newPassword.length < 6) {
      setPasswordErr('Password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordErr('Passwords do not match');
      return;
    }
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) setPasswordErr(error.message);
    else setPasswordMsg('Password updated');
    setNewPassword('');
    setConfirmPassword('');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-muted-foreground">Loading settings…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Top-left: Avatar */}
        <div className="lg:col-span-1 flex flex-col items-center">
          <Card className="w-full">
            <CardHeader className="text-center"><CardTitle>Profile Picture</CardTitle></CardHeader>
            <CardContent className="flex flex-col items-center justify-center">
              <p className="text-sm text-muted-foreground mb-4 text-center">Update your picture</p>
              <Dialog>
                <DialogTrigger asChild>
                  <button type="button" className="cursor-pointer">
                    <Avatar className="w-32 h-32 text-muted-foreground border-2 border-dashed">
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
              <Button variant="outline" className="mt-4" onClick={handleAvatarClick}>{imagePreview ? "Change Image" : "Select Image"}</Button>
              <input type="file" ref={fileInputRef} onChange={handleImageChange} className="hidden" accept="image/*" />
            </CardContent>
          </Card>
        </div>

        {/* Top-right: Change Password */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="newPassword">New Password</Label>
                <Input id="newPassword" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
              </div>
              {passwordErr && <p className="text-sm text-destructive">{passwordErr}</p>}
              {passwordMsg && <p className="text-sm text-green-600">{passwordMsg}</p>}
              <Button onClick={handlePasswordChange}>Update Password</Button>
            </CardContent>
          </Card>
        </div>

        {/* Full-width: Settings form */}
        <div className="lg:col-span-3 flex flex-col justify-center">
          <Card className="w-full">
            <CardHeader><CardTitle>Settings</CardTitle></CardHeader>
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
                <ToggleGroup type="single" variant="outline" value={punctuality} className="flex flex-wrap justify-start" onValueChange={(value) => { if(value) setPunctuality(value) }}>
                  <ToggleGroupItem value="on-time" aria-label="Select always on time">Always on time</ToggleGroupItem>
                  <ToggleGroupItem value="usually-on-time" aria-label="Select usually on time">Usually on time</ToggleGroupItem>
                  <ToggleGroupItem value="flexible" aria-label="Select flexible">Flexible</ToggleGroupItem>
                </ToggleGroup>
              </div>

              <div className="space-y-2">
                <Label>Gender</Label>
                <ToggleGroup type="single" variant="outline" value={gender} className="flex flex-wrap justify-start " onValueChange={(value) => { if(value) setGender(value) }}>
                  <ToggleGroupItem value="male" aria-label="Select male">♂ Male</ToggleGroupItem>
                  <ToggleGroupItem value="female" aria-label="Select female">♀ Female</ToggleGroupItem>
                  <ToggleGroupItem value="they" aria-label="Select they/them">👤 They/Them</ToggleGroupItem>
                </ToggleGroup>
              </div>
              
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
                  <Label className="text-sm text-muted-foreground">Not Preferred Modes (Click to mark red)</Label>
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
              
              <div className="space-y-2">
                <Label htmlFor="location">Ideal Pickup/Drop-off Location</Label>
                <Input id="location" placeholder="e.g. Main College Gate" value={idealLocation} onChange={(e) => setIdealLocation(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="time">Ideal time of leaving college</Label>
                <Input id="time" type="time" value={idealDepartureTime} onChange={(e) => setIdealDepartureTime(e.target.value)} />
              </div>

              {error && <p className="text-destructive text-center text-sm mb-4">{error}</p>}
              {message && <p className="text-green-600 text-center text-sm mb-4">{message}</p>}
              <Button className="w-full" onClick={handleSave} disabled={saveLoading}>
                {saveLoading ? 'Saving…' : 'Save Settings'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
      
    </div>
  );
}
