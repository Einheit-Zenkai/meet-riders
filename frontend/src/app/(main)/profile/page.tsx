"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { createClient } from "@/utils/supabase/client";
import useAuthStore from "@/stores/authStore";
import { Star } from "lucide-react";
import GenderBadge from "@/components/GenderBadge";

// This defines the shape of the data we'll be working with from our 'profiles' table
type ProfileData = {
  username: string;
  nickname: string;
  full_name: string | null;
  bio: string;
  avatar_url: string;
  email: string;
  points: number;
  university?: string;
  show_university?: boolean;
  gender?: string | null;
  major?: string | null;
  punctuality?: string | null;
  ideal_location?: string | null;
  ideal_departure_time?: string | null;
  birth_date?: string | null;
  phone_number?: string | null;
  show_phone?: boolean;
  created_at?: string | null;
};

type MiniProfile = {
  id: string;
  username: string;
  full_name: string | null;
  avatar_url?: string | null;
};

export default function ProfilePage() {
  const supabase = createClient();
  const router = useRouter();
  const { user, signOut } = useAuthStore();
  const [loading, setLoading] = useState(true);
  
  // A single state to hold all the profile data for easier management
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [connections, setConnections] = useState<{
    id: number;
    requester_id: string;
    addressee_id: string;
    requester: MiniProfile;
    addressee: MiniProfile;
  }[]>([]);
  const connectionsCount = useMemo(() => connections.length, [connections]);

  // --- 1. RE-WIRED: Fetch data from the 'profiles' table ---
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return; // User guaranteed by middleware
      
      setLoading(true);

      let { data, error } = await supabase
        .from("profiles")
        .select(`
          username, 
          nickname, 
          full_name,
          bio, 
          avatar_url, 
          points, 
          university, 
          show_university, 
          gender,
          major,
          punctuality,
          ideal_location,
          ideal_departure_time,
          birth_date,
          phone_number,
          show_phone,
          created_at
        `)
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
        }
      }

      if (data) {
        setProfileData({
          username: data.username || "",
          nickname: data.nickname || "",
          full_name: data.full_name || null,
          bio: data.bio || "",
          avatar_url: data.avatar_url || "",
          email: user.email || "",
          points: typeof data.points === 'number' ? data.points : 0,
          university: data.university || "",
          show_university: typeof (data as any).show_university === 'boolean' ? (data as any).show_university : true,
          gender: data.gender ?? null,
          major: data.major || null,
          punctuality: data.punctuality || null,
          ideal_location: data.ideal_location || null,
          ideal_departure_time: data.ideal_departure_time || null,
          birth_date: data.birth_date || null,
          phone_number: data.phone_number || null,
          show_phone: data.show_phone || false,
          created_at: data.created_at || null,
        });
      }
      setLoading(false);
    };

    const fetchConnections = async () => {
      if (!user) return;
      const { data, error } = await supabase
        .from("connections")
        .select("*, requester:requester_id(id, username, full_name, avatar_url), addressee:addressee_id(id, username, full_name, avatar_url)")
        .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`)
        .eq("status", "accepted");
      if (!error && data) setConnections(data as any);
    };

    fetchProfile();
    fetchConnections();
  }, [user, supabase]);

  const handleSignOut = async () => {
    await signOut();
    router.replace("/");
  };

  // --- 2. Profile is READ-ONLY - No save functionality ---
  // Users should use Settings page to edit their profile

  if (loading) {
    return <div className="flex items-center justify-center min-h-[60vh]"><p className="text-muted-foreground">Loading profile…</p></div>;
  }

  if (!profileData) {
    return <div className="flex items-center justify-center min-h-[60vh]"><p className="text-destructive">Could not find profile.</p></div>;
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
          <div className="flex gap-2">
            <Button asChild variant="default">
              <Link href="/settings">✏️ Edit Profile</Link>
            </Button>
            <Button variant="secondary" onClick={handleSignOut} className="hover:bg-destructive/10 hover:text-destructive transition-colors">
              Sign out
            </Button>
          </div>
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
                  {/* Enhanced Name Section - READ ONLY */}
                  <div className="space-y-2">
                    <h1 className="text-3xl font-bold">
                      {profileData.full_name || profileData.nickname || "Anonymous User"}
                    </h1>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm text-muted-foreground">@{profileData.username}</span>
                      <span className="text-muted-foreground">•</span>
                      <span className="text-muted-foreground">{profileData.email}</span>
                      {profileData.gender && <GenderBadge gender={profileData.gender} />}
                      {typeof profileData.points === 'number' && (
                        <div className="flex items-center gap-1 px-3 py-1 bg-primary/10 rounded-full">
                          <Star className="w-3 h-3 text-primary" />
                          <span className="text-xs font-medium text-primary">{profileData.points} pts</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Bio Section - READ ONLY */}
                  {profileData.bio && (
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-foreground">About Me</label>
                      <p className="text-muted-foreground whitespace-pre-wrap">
                        {profileData.bio}
                      </p>
                    </div>
                  )}
                  
                  {/* Additional Profile Information - READ ONLY */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {profileData.major && (
                      <div className="space-y-1">
                        <label className="block text-xs font-medium text-muted-foreground">Major</label>
                        <p className="text-sm font-semibold">{profileData.major}</p>
                      </div>
                    )}
                    
                    {profileData.punctuality && (
                      <div className="space-y-1">
                        <label className="block text-xs font-medium text-muted-foreground">Punctuality</label>
                        <p className="text-sm font-semibold capitalize">{profileData.punctuality.replace('-', ' ')}</p>
                      </div>
                    )}
                    
                    {profileData.ideal_location && (
                      <div className="space-y-1">
                        <label className="block text-xs font-medium text-muted-foreground">Ideal Pickup Location</label>
                        <p className="text-sm font-semibold">{profileData.ideal_location}</p>
                      </div>
                    )}
                    
                    {profileData.ideal_departure_time && (
                      <div className="space-y-1">
                        <label className="block text-xs font-medium text-muted-foreground">Ideal Departure Time</label>
                        <p className="text-sm font-semibold">{profileData.ideal_departure_time}</p>
                      </div>
                    )}
                  </div>
                  
                  {/* University Display - READ ONLY */}
                  {profileData.university && profileData.show_university && (
                    <div className="p-4 bg-accent/30 rounded-lg border border-accent/50">
                      <label className="block text-sm font-medium text-foreground mb-1">University</label>
                      <p className="text-base font-semibold text-primary">{profileData.university}</p>
                      <p className="text-xs text-muted-foreground mt-1">Visible to other users</p>
                    </div>
                  )}
                  
                  {/* Member Since */}
                  {profileData.created_at && (
                    <div className="pt-4 border-t border-border/50">
                      <p className="text-xs text-muted-foreground">
                        Member since {new Date(profileData.created_at).toLocaleDateString('en-US', { 
                          month: 'long', 
                          year: 'numeric' 
                        })}
                      </p>
                    </div>
                  )}

                  {/* Dummy Ratings */}
                  <div className="mt-6 p-4 bg-accent/30 rounded-lg border border-accent/50">
                    <label className="block text-sm font-medium text-foreground mb-2">Ratings</label>
                    {(() => {
                      const rating = 4.4; // placeholder avg rating
                      const total = 5;
                      const full = Math.floor(rating);
                      const stars = Array.from({ length: total }, (_, i) => (
                        <Star
                          key={i}
                          className={`w-5 h-5 ${i < full ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`}
                        />
                      ));
                      return (
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1">{stars}</div>
                          <span className="text-sm text-muted-foreground">{rating.toFixed(1)} / 5.0</span>
                        </div>
                      );
                    })()}
                    <p className="text-xs text-muted-foreground mt-2">Placeholder ratings. Real feedback will arrive with ride history.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Right column card: Connections */}
          <Card className="bg-card/60 backdrop-blur-[6.2px] border border-white/10 shadow-xl">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2">
                👥 Connections{typeof connectionsCount === 'number' ? ` (${connectionsCount})` : ''}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {connections.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted/30 flex items-center justify-center">
                    <span className="text-2xl">🤝</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">No connections yet</p>
                  <p className="text-xs text-muted-foreground">Start connecting with fellow riders!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {connections.map((conn) => {
                    const meId = user!.id;
                    const other = conn.requester_id === meId ? conn.addressee : conn.requester;
                    return (
                      <div key={conn.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/40">
                        <div className="flex items-center gap-3">
                          <Avatar className="size-8">
                            <AvatarImage src={other.avatar_url ?? undefined} />
                            <AvatarFallback>{(other.username || '?').slice(0,1).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div className="leading-tight">
                            <div className="font-medium">{other.full_name || other.username}</div>
                            <div className="text-xs text-muted-foreground">@{other.username}</div>
                          </div>
                        </div>
                        <Link href={`/profile/id/${other.id}`} className="text-xs text-primary hover:underline">View</Link>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
      </div>
      </div>
    </div>
  );
}
