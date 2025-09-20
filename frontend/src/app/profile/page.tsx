"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { createClient } from "@/utils/supabase/client";

// This defines the shape of the data we'll be working with from our 'profiles' table
type ProfileData = {
  nickname: string;
  bio: string;
  avatar_url: string;
  email: string;
  // We will add rating and transport preferences later when the data exists
};

export default function ProfilePage() {
  const supabase = createClient();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  
  // A single state to hold all the profile data for easier management
  const [profileData, setProfileData] = useState<ProfileData | null>(null);

  // Your original state for features we haven't implemented yet (rating)
  const [avgRating, setAvgRating] = useState<number>(5);
  
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  // --- 1. RE-WIRED: Fetch data from the 'profiles' table ---
  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/login");
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select(`nickname, bio, avatar_url`) // Fetching the real data
        .eq("id", user.id)
        .single();

      if (error || !data) {
        console.error("Error fetching profile:", error);
        setError("Could not load your profile.");
      } else {
        setProfileData({
          nickname: data.nickname || "",
          bio: data.bio || "",
          avatar_url: data.avatar_url || "",
          email: user.email || "",
        });
      }
      setLoading(false);
    };

    fetchProfile();
  }, [supabase, router]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.replace("/");
  };

  // --- 2. RE-WIRED: Save data back to the 'profiles' table ---
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    if (!profileData) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const dataToUpdate = {
      nickname: profileData.nickname,
      bio: profileData.bio,
      updated_at: new Date(),
      // Note: We are not saving rating or transport mode yet
    };

    const { error: updateError } = await supabase
      .from("profiles")
      .update(dataToUpdate)
      .eq("id", user.id);

    if (updateError) {
      setError(updateError.message);
    } else {
      setMessage("Profile updated successfully!");
    }
  };
  
  // Helper function to update the single profile state object
  const handleInputChange = (field: keyof ProfileData, value: string) => {
    if (profileData) {
      setProfileData({ ...profileData, [field]: value });
    }
  };

  // --- YOUR ORIGINAL STARS COMPONENT (UNTOUCHED) ---
  const Stars = useMemo(() => {
    const full = Math.floor(avgRating);
    const half = avgRating - full >= 0.5;
    const empty = 5 - full - (half ? 1 : 0);
    return (
      <div className="flex items-center gap-1 text-yellow-500 select-none">
        {Array.from({ length: full }).map((_, i) => (<span key={`f-${i}`}>★</span>))}
        {half && <span>☆</span>}
        {Array.from({ length: empty }).map((_, i) => (<span key={`e-${i}`} className="text-muted-foreground">☆</span>))}
      </div>
    );
  }, [avgRating]);

  if (loading) {
    return <div className="flex items-center justify-center min-h-[60vh]"><p className="text-muted-foreground">Loading profile…</p></div>;
  }

  if (!profileData) {
    return <div className="flex items-center justify-center min-h-[60vh]"><p className="text-destructive">{error || "Could not find profile."}</p></div>;
  }

  // --- YOUR ORIGINAL JSX (with data sources re-wired) ---
  return (
    <div className="container mx-auto p-6 max-w-5xl">
      <div className="mb-4 flex items-center justify-between">
        <Button asChild variant="outline"><Link href="/">Home</Link></Button>
        <Button variant="secondary" onClick={handleSignOut}>Sign out</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card className="md:col-span-2">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <Avatar className="size-24">
                <AvatarImage src={profileData.avatar_url} alt={profileData.nickname} />
                <AvatarFallback className="text-2xl">{(profileData.nickname || "N").slice(0, 1).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <Input
                    value={profileData.nickname}
                    onChange={(e) => handleInputChange('nickname', e.target.value)}
                    className="text-2xl font-bold h-auto p-0 border-none shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent"
                  />
                  <span className="text-muted-foreground">@{profileData.email}</span>
                </div>
                <div className="mt-3">
                  <label className="block text-sm text-muted-foreground mb-1">Bio</label>
                  <Textarea
                    value={profileData.bio}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    placeholder="Tell people a bit about you…"
                  />
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-4">
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1">Preferred transport</label>
                    <ToggleGroup type="single" defaultValue="auto">
                      <ToggleGroupItem value="auto">Car</ToggleGroupItem>
                      <ToggleGroupItem value="bike">Bike</ToggleGroupItem>
                      <ToggleGroupItem value="public">Public</ToggleGroupItem>
                      <ToggleGroupItem value="walk">Walk</ToggleGroupItem>
                    </ToggleGroup>
                  </div>
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1">Avg rating</label>
                    <div className="flex items-center gap-2">
                      {Stars}
                      <Input type="number" step="0.5" min={0} max={5} value={avgRating} onChange={(e) => setAvgRating(Number(e.target.value))} className="w-20" />
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex gap-3">
                  <Button onClick={handleSave}>Save profile</Button>
                  <Button variant="outline">Add connection</Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Mutual connections</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">0 mutual connections</p>
            <p className="text-xs text-muted-foreground mt-2">This is a placeholder. Wire this up once you have connections data.</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Account</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm text-muted-foreground mb-1">Email</label>
            <Input value={profileData.email} disabled readOnly />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-muted-foreground mb-1">Nickname</label>
              <Input value={profileData.nickname} onChange={(e) => handleInputChange('nickname', e.target.value)} />
            </div>
            <div>
              <label className="block text-sm text-muted-foreground mb-1">Username</label>
              <Input value={profileData.email} disabled readOnly />
            </div>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          {message && <p className="text-sm text-green-600">{message}</p>}
        </CardContent>
      </Card>
    </div>
  );
}