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
import { Star } from "lucide-react";
import { toast } from "sonner";
import HostButton from "@/components/ui/hostbutton";

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

      let { data, error } = await supabase
        .from("profiles")
  .select(`nickname, bio, avatar_url, points, university, show_university`) // points + university
        .eq("id", user.id)
        .maybeSingle();
      if (error) {
        console.error("Error fetching profile:", error);
      }

      if (!data) {
        // Bootstrap a minimal profile row if missing (RLS must allow inserting own row)
        const insert = await supabase
          .from("profiles")
          .insert({ id: user.id, nickname: null, bio: null, avatar_url: null })
          .select("nickname, bio, avatar_url, points, university, show_university")
          .single();
        if (insert.data) {
          data = insert.data as any;
        } else if (insert.error) {
          console.error("Error creating profile:", insert.error);
          setError("Could not load your profile.");
        }
      }

      if (data) {
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
      updated_at: new Date(),
    } as any;

    // Settings-only fields (university/show_university) are NOT updated here.
    let { error: updateError } = await supabase.from("profiles").update(base).eq("id", user.id);

    if (updateError) {
      setError(updateError.message);
      toast.error(updateError.message || 'Failed to update profile');
    } else {
      setMessage("Profile updated successfully!");
      toast.success('Profile updated');
    }
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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto p-6 max-w-6xl">
        {/* Header with glass effect */}
        <div className="mb-6 flex items-center justify-between p-4 rounded-xl bg-card/60 backdrop-blur-[6.2px] border border-white/10 shadow-lg">
          <Button asChild variant="outline" className="glass-button">
            <Link href="/dashboard">← Back to Dashboard</Link>
          </Button>
          <Button variant="secondary" onClick={handleSignOut} className="hover:bg-destructive/10 hover:text-destructive transition-colors">
            Sign out
          </Button>
        </div>

  {/* Main content with improved layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <Card className="lg:col-span-2 bg-card/60 backdrop-blur-[6.2px] border border-white/10 shadow-xl">
            <CardContent className="p-8">
              <div className="flex flex-col sm:flex-row items-start gap-6">
                {/* Enhanced Avatar Section */}
                <div className="relative group">
                  <Avatar className="size-32 ring-4 ring-primary/20 transition-all duration-300 group-hover:ring-primary/40">
                    <AvatarImage src={profileData.avatar_url} alt={profileData.nickname} className="object-cover" />
                    <AvatarFallback className="text-3xl font-bold bg-gradient-to-br from-primary/20 to-primary/10">
                      {(profileData.nickname || "User").slice(0, 1).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute inset-0 rounded-full bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-3">
                    <span className="text-xs text-white/80 font-medium">Edit Photo</span>
                  </div>
                </div>
                
                <div className="flex-1 space-y-6">
                  {/* Enhanced Name Section */}
                  <div className="space-y-2">
                    <Input
                      value={profileData.nickname}
                      onChange={(e) => handleInputChange('nickname', e.target.value)}
                      className="text-3xl font-bold h-auto p-0 border-none shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent placeholder:text-muted-foreground/50"
                      placeholder="Enter your nickname"
                    />
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">{profileData.email}</span>
                      {typeof profileData.points === 'number' && (
                        <div className="flex items-center gap-1 px-3 py-1 bg-primary/10 rounded-full">
                          <Star className="w-3 h-3 text-primary" />
                          <span className="text-xs font-medium text-primary">{profileData.points} pts</span>
                        </div>
                      )}
                    </div>
                  </div>
                  {/* Enhanced Bio Section */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-foreground">About Me</label>
                    <Textarea
                      value={profileData.bio}
                      onChange={(e) => handleInputChange('bio', e.target.value)}
                      placeholder="Tell people a bit about yourself... What do you enjoy? What's your travel style?"
                      className="resize-none min-h-[100px] bg-background/50 border-border/50 focus:border-primary/50 transition-colors"
                      rows={4}
                    />
                  </div>
                  {/* Enhanced University Display */}
                  {profileData.university && (
                    <div className="p-4 bg-accent/30 rounded-lg border border-accent/50">
                      <label className="block text-sm font-medium text-foreground mb-1">University</label>
                      <p className="text-base font-semibold text-primary">{profileData.university}</p>
                      <p className="text-xs text-muted-foreground mt-1">Visible to other users</p>
                    </div>
                  )}

                  {/* Contact number moved to Settings page */}
                  {/* Enhanced Transport Preferences */}
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-foreground">Preferred Transport</label>
                    <ToggleGroup type="single" defaultValue="auto" className="justify-start">
                      <ToggleGroupItem value="auto" className="data-[state=on]:bg-primary/20 data-[state=on]:text-primary">
                        🚗 Car
                      </ToggleGroupItem>
                      <ToggleGroupItem value="bike" className="data-[state=on]:bg-primary/20 data-[state=on]:text-primary">
                        🚲 Bike
                      </ToggleGroupItem>
                      <ToggleGroupItem value="public" className="data-[state=on]:bg-primary/20 data-[state=on]:text-primary">
                        🚌 Public
                      </ToggleGroupItem>
                      <ToggleGroupItem value="walk" className="data-[state=on]:bg-primary/20 data-[state=on]:text-primary">
                        🚶‍♂️ Walk
                      </ToggleGroupItem>
                    </ToggleGroup>
                  </div>
                  {/* Enhanced Action Buttons */}
                  <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-border/50">
                    <Button onClick={handleSave} className="bg-primary hover:bg-primary/90 font-medium">
                      💾 Save Profile
                    </Button>
                    <Button variant="outline" className="hover:bg-accent/50">
                      👥 Add Connection
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      asChild
                      className="ml-auto opacity-70 hover:opacity-100"
                    >
                      <Link href={user ? `/report?type=user&id=${user.id}` : "/report"}>
                        🚨 Report Issue
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Right column cards: Connections + Metrics */}
          <Card className="bg-card/60 backdrop-blur-[6.2px] border border-white/10 shadow-xl">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2">
                👥 Connections
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted/30 flex items-center justify-center">
                  <span className="text-2xl">🤝</span>
                </div>
                <p className="text-sm text-muted-foreground mb-2">No connections yet</p>
                <p className="text-xs text-muted-foreground">Start connecting with fellow riders!</p>
              </div>
            </CardContent>
          </Card>

          {/* Dummy Ratings card (placeholder) */}
          <Card className="bg-card/60 backdrop-blur-[6.2px] border border-white/10 shadow-xl">
            <CardHeader className="pb-2">
              <CardTitle>Ratings</CardTitle>
            </CardHeader>
            <CardContent>
              {(() => {
                const rating = 4.6; // placeholder
                const total = 5;
                const full = Math.floor(rating);
                const stars = Array.from({ length: total }, (_, i) => (
                  <Star key={i} className={`w-5 h-5 ${i < full ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`} />
                ));
                return (
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">{stars}</div>
                    <span className="text-sm text-muted-foreground">{rating.toFixed(1)} / 5.0</span>
                  </div>
                );
              })()}
              <p className="text-xs text-muted-foreground mt-3">This is a placeholder. Real ratings will appear once rides and feedback are enabled.</p>
            </CardContent>
          </Card>

          {/* Points card (Leaderboard) */}
          <Card className="bg-card/60 backdrop-blur-[6.2px] border border-white/10 shadow-xl">
            <CardHeader className="pb-2">
              <CardTitle>Leaderboard Points</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-primary">{profileData.points}</p>
              <p className="text-xs text-muted-foreground mt-1">Earn more points by hosting rides and participating.</p>
            </CardContent>
          </Card>
      </div>
      {/* Floating Host (+) button */}
      <HostButton />
      </div>
    </div>
  );
}
