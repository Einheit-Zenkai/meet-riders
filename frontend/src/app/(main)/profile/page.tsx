"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { createClient } from "@/utils/supabase/client";
import { useAuth } from "@/context/Authcontext";

// This defines the shape of the data we'll be working with from our 'profiles' table
type ProfileData = {
  nickname: string;
  bio: string;
  avatar_url: string;
  email: string;
  points: number;
  university?: string;
  show_university?: boolean; // optional preference; if missing, treat as true
  // We will add transport preferences later when the data exists
};

export default function ProfilePage() {
  const supabase = createClient();
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [loading, setLoading] = useState(true);
  
  // A single state to hold all the profile data for easier management
  const [profileData, setProfileData] = useState<ProfileData | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  // --- 1. RE-WIRED: Fetch data from the 'profiles' table ---
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return; // User guaranteed by middleware
      
      setLoading(true);

      const { data, error } = await supabase
        .from("profiles")
        .select(`nickname, bio, avatar_url, points, university, show_university`) // points + university
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
          points: typeof data.points === 'number' ? data.points : 0,
          university: data.university || "",
          show_university: typeof (data as any).show_university === 'boolean' ? (data as any).show_university : true,
        });
      }
      setLoading(false);
    };

    fetchProfile();
  }, [user, supabase]);

  const handleSignOut = async () => {
    await signOut();
    router.replace("/");
  };

  // --- 2. RE-WIRED: Save data back to the 'profiles' table ---
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    if (!profileData || !user) return;

    // First try updating with show_university; if the column doesn't exist, retry without it
    const base = {
      nickname: profileData.nickname,
      bio: profileData.bio,
      university: profileData.university || null,
      updated_at: new Date(),
    } as any;
    const withPref = { ...base, show_university: profileData.show_university ?? true };

    let { error: updateError } = await supabase.from("profiles").update(withPref).eq("id", user.id);
    if (updateError && (updateError.message || "").toLowerCase().includes("show_university")) {
      // Retry without the preference column
      const { error: retryError } = await supabase.from("profiles").update(base).eq("id", user.id);
      updateError = retryError || null;
    }

    if (updateError) setError(updateError.message);
    else setMessage("Profile updated successfully!");
  };
  
  // Helper function to update the single profile state object
  const handleInputChange = (field: keyof ProfileData, value: string) => {
    if (profileData) {
      setProfileData({ ...profileData, [field]: value });
    }
  };

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
        <Button asChild variant="outline"><Link href="/dashboard">← Back</Link></Button>
        <Button variant="secondary" onClick={handleSignOut}>Sign out</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card className="md:col-span-2">
          <CardContent className="py-0">
            <div className="flex items-start gap-4">
              <Avatar className="size-24">
                <AvatarImage src={profileData.avatar_url} alt={profileData.nickname} />
                <AvatarFallback className="text-2xl">{(profileData.nickname || "No Nickname").slice(0, 1).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <Input
                    value={profileData.nickname}
                    onChange={(e) => handleInputChange('nickname', e.target.value)}
                    className="text-2xl font-bold h-auto p-0 border-none shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent"
                  />
                  <span className="text-muted-foreground">{profileData.email}</span>
                </div>
                <div className="mt-3">
                  <label className="block text-sm text-muted-foreground mb-1">Bio</label>
                  <Textarea
                  value={profileData.bio}

                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  placeholder="Tell people a bit about you…"
                  className="resize-none"
                  />
                </div>
                <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-muted-foreground mb-1">University (optional)</label>
                    <Input
                      value={profileData.university || ''}
                      onChange={(e) => handleInputChange('university', e.target.value)}
                      placeholder="e.g., NIT Surat"
                    />
                  </div>
                  <div className="flex items-end">
                    <label className="inline-flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={profileData.show_university ?? true}
                        onChange={(e) => handleInputChange('show_university' as any, e.target.checked as any)}
                      />
                      Display my university publicly
                    </label>
                  </div>
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
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <Button onClick={handleSave}>Save profile</Button>
                  <Button variant="outline">Add connection</Button>
                  <Button
                    variant="destructive"
                    asChild
                  >
                    <Link href={user ? `/report?type=user&id=${user.id}` : "/report"}>Report</Link>
                  </Button>
                  {typeof profileData.points === 'number' && (
                    <span className="ml-auto text-sm text-muted-foreground">
                      Leaderboard points: <span className="font-semibold text-primary">{profileData.points}</span>
                    </span>
                  )}
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

      {/* Prominent Leaderboard points card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Leaderboard Points</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold text-primary">{profileData.points ?? 0}</p>
          <p className="text-sm text-muted-foreground mt-2">Earn points by hosting rides, joining successfully, and being a great co-traveler.</p>
        </CardContent>
      </Card>

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
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          {message && <p className="text-sm text-green-600">{message}</p>}
        </CardContent>
      </Card>
    </div>
  );
}
