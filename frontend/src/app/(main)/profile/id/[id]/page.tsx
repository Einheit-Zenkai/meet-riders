"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ShieldAlert, User, Star, Users } from "lucide-react";
import GenderBadge from "@/components/GenderBadge";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";
import useAuthStore from "@/stores/authStore";

type Profile = {
  id: string;
  username: string;
  nickname: string | null;
  bio: string | null;
  avatar_url: string | null;
  points: number | null;
  university?: string | null;
  show_university?: boolean | null;
  gender?: string | null;
};

type RelationshipStatus = "connected" | "blocked" | null;

export default function PublicProfilePage() {
  const supabase = createClient();
  const router = useRouter();
  const params = useParams();
  const { user: me } = useAuthStore();

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [status, setStatus] = useState<RelationshipStatus>(null);
  const [blockedByThem, setBlockedByThem] = useState<boolean>(false);
  const [connectionsCount, setConnectionsCount] = useState<number>(0);
  const viewedId = String(params?.id || "");

  const isOwnProfile = useMemo(() => !!me && me.id === viewedId, [me, viewedId]);

  useEffect(() => {
    const run = async () => {
      if (!viewedId) return;
      setLoading(true);

      // If not logged in, send to login (consistent with existing pages)
      if (!me) {
        router.replace("/login");
        return;
      }

      // 1) Fetch the profile being viewed
      const { data: p, error: pErr } = await supabase
        .from("profiles")
  .select("id, username, nickname, bio, avatar_url, points, university, show_university, gender")
        .eq("id", viewedId)
        .single();

      if (pErr || !p) {
        setProfile(null);
        setLoading(false);
        return;
      }
      setProfile(p as Profile);

      // Count accepted connections for this user
      const { count } = await supabase
        .from("connections")
        .select("id", { count: 'exact', head: true })
        .or(`requester_id.eq.${viewedId},addressee_id.eq.${viewedId}`)
        .eq("status", "accepted");
      setConnectionsCount(count || 0);

      // 2) Fetch relationship where I am the initiator looking at them
      if (!isOwnProfile) {
        const { data: rel } = await supabase
          .from("user_relationships")
          .select("status")
          .eq("initiator_id", me.id)
          .eq("receiver_id", viewedId)
          .maybeSingle();
        setStatus((rel?.status as RelationshipStatus) ?? null);

        // 3) Check if they blocked me (reverse direction)
        const { data: rev } = await supabase
          .from("user_relationships")
          .select("status")
          .eq("initiator_id", viewedId)
          .eq("receiver_id", me.id)
          .maybeSingle();
        setBlockedByThem(rev?.status === "blocked");
      }

      setLoading(false);
    };

    run();
  }, [me, supabase, viewedId, isOwnProfile, router]);

  const upsertRelationship = async (newStatus: Exclude<RelationshipStatus, null>) => {
    if (!me || !profile) return;
    const { error } = await supabase
      .from("user_relationships")
      .upsert({ initiator_id: me.id, receiver_id: profile.id, status: newStatus })
      .select()
      .single();
    if (error) {
      toast.error(error.message || 'Failed to update relationship');
      return;
    }
    toast.success('Updated');
    setStatus(newStatus);
  };

  const removeRelationship = async () => {
    if (!me || !profile) return;
    const { error } = await supabase
      .from("user_relationships")
      .delete()
      .eq("initiator_id", me.id)
      .eq("receiver_id", profile.id);
    if (error) {
      toast.error(error.message || 'Failed to remove relationship');
      return;
    }
    toast.success('Removed');
    setStatus(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-muted-foreground">Loading profile…</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-3">
          <p className="text-destructive">User not found.</p>
          <Button asChild variant="outline"><Link href="/dashboard">Back to Dashboard</Link></Button>
        </div>
      </div>
    );
  }

  const nickname = profile.nickname || "Unnamed";
  const username = profile.username || "no-username";
  const points = profile.points ?? 0;

  return (
    <div className="container mx-auto p-6 max-w-3xl">
      <div className="mb-4 flex items-center justify-between">
        <Button asChild variant="outline"><Link href="/dashboard">← Back</Link></Button>
        {isOwnProfile ? (
          <Button asChild variant="secondary"><Link href="/profile">Edit profile</Link></Button>
        ) : null}
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center text-center">
            <Avatar className="w-24 h-24 mb-4 border-2 border-primary">
              <AvatarImage src={profile.avatar_url ?? undefined} alt={nickname} />
              <AvatarFallback><User className="w-10 h-10" /></AvatarFallback>
            </Avatar>
            <h1 className="text-2xl font-bold flex items-center gap-2">{nickname} {profile.gender && <GenderBadge gender={profile.gender} />}</h1>
            <p className="text-sm text-muted-foreground mt-1">@{username}</p>

            {!isOwnProfile && !blockedByThem && (
              <div className="mt-4 flex items-center gap-3">
                {status !== "connected" && status !== "blocked" && (
                  <Button onClick={() => upsertRelationship("connected")}>Add Connection</Button>
                )}
                {status !== "blocked" && (
                  <Button variant="outline" onClick={() => {
                    if (confirm("Are you sure you want to block this user?")) upsertRelationship("blocked");
                  }}>Block</Button>
                )}
                {status === "blocked" && (
                  <Button variant="secondary" onClick={removeRelationship}>Unblock</Button>
                )}
                <Button
                  variant="destructive"
                  asChild
                >
                  <Link href={`/report?type=user&id=${viewedId}`}>
                    <ShieldAlert className="w-4 h-4 mr-2" /> Report
                  </Link>
                </Button>
              </div>
            )}
          </div>

          {/* Content visibility rules */}
          {blockedByThem ? (
            <div className="text-center mt-8 p-6 bg-secondary rounded-lg">
              <p className="text-muted-foreground">This user has blocked you.</p>
            </div>
          ) : status === "blocked" ? (
            <div className="text-center mt-8 p-6 bg-secondary rounded-lg">
              <p className="text-muted-foreground">You have blocked this user.</p>
            </div>
          ) : (
            <div className="mt-8 grid gap-6">
              {/* Ratings card */}
              <Card>
                <CardHeader>
                  <CardTitle>Ratings</CardTitle>
                </CardHeader>
                <CardContent>
                  {(() => {
                    const rating = 4.6; // placeholder
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
                  <p className="text-xs text-muted-foreground mt-3">This is a placeholder. Real ratings will appear once rides and feedback are enabled.</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Bio</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground bg-accent/50 p-4 rounded-md">
                    {profile.bio || "No bio provided."}
                  </p>
                </CardContent>
              </Card>

              {(profile.show_university ?? true) && profile.university && (
                <Card>
                  <CardHeader>
                    <CardTitle>University</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-foreground">{profile.university}</p>
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"> <Users className="w-4 h-4"/> Connections</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-primary">{connectionsCount}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Leaderboard Points</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-primary">{points}</p>
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
