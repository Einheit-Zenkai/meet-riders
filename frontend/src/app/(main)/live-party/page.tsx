"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import useAuthStore from "@/stores/authStore";
import { partyMemberService } from "../dashboard/services/partyMemberService";
import type { Party, PartyMember, Profile } from "../dashboard/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MapPin, Phone, Users, ArrowLeft, Route as RouteIcon } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import dynamic from "next/dynamic";

// Dynamically import RideMap to avoid SSR issues
const RideMap = dynamic(() => import("@/components/RideMap"), { ssr: false });

export default function LivePartyPage() {
  const user = useAuthStore((s) => s.user);
  const authLoading = useAuthStore((s) => s.loading);
  const router = useRouter();
  const params = useSearchParams();
  const supabase = useMemo(() => createClient(), []);

  const [loading, setLoading] = useState(true);
  const [party, setParty] = useState<Party | null>(null);
  const [members, setMembers] = useState<PartyMember[]>([]);
  const [hostProfile, setHostProfile] = useState<Profile | null>(null);

  useEffect(() => {
    if (!authLoading && !user) router.replace("/login");
  }, [authLoading, user, router]);

  useEffect(() => {
    const load = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const idParam = params.get("id");

        // Fetch the target party
        const partyFields = `id, created_at, updated_at, host_id, party_size, duration_minutes, expires_at, meetup_point, drop_off, is_friends_only, is_gender_only, ride_options, host_comments, host_university, display_university, is_active, start_coords, dest_coords`;

        let target: any | null = null;
        if (idParam) {
          const { data, error } = await supabase
            .from("parties")
            .select(partyFields)
            .eq("id", idParam)
            .maybeSingle();
          if (error) console.warn("live party fetch error", error);
          target = data || null;
        } else {
          // Fallback: user's most recent active party (host or member) – already expired
          const nowIso = new Date().toISOString();
          // Host
          const { data: hosting } = await supabase
            .from("parties")
            .select(partyFields)
            .eq("host_id", user.id)
            .eq("is_active", true)
            .lte("expires_at", nowIso)
            .order("expires_at", { ascending: false })
            .limit(1);

          if (hosting && hosting.length > 0) {
            target = hosting[0];
          } else {
            // Member
            const { data: memberRows } = await supabase
              .from("party_members")
              .select("party_id")
              .eq("user_id", user.id)
              .eq("status", "joined");
            const ids = (memberRows || []).map((r: any) => r.party_id);
            if (ids.length) {
              const { data: joined } = await supabase
                .from("parties")
                .select(partyFields)
                .in("id", ids)
                .eq("is_active", true)
                .lte("expires_at", nowIso)
                .order("expires_at", { ascending: false })
                .limit(1);
              if (joined && joined.length > 0) target = joined[0];
            }
          }
        }

        if (!target) {
          toast.info("No live party found yet");
          router.replace("/current-party");
          return;
        }

        const normalized: Party = {
          ...target,
          created_at: new Date(target.created_at),
          updated_at: target.updated_at ? new Date(target.updated_at) : new Date(target.created_at),
          expires_at: new Date(target.expires_at),
          ride_options: Array.isArray(target.ride_options) ? target.ride_options : [],
          duration_minutes: typeof target.duration_minutes === "number" ? target.duration_minutes : 0,
          is_active: Boolean(target.is_active),
        };
        setParty(normalized);

        // Load members
        const res = await partyMemberService.getPartyMembers(target.id);
        const mems = res.success && res.members ? res.members : [];
        setMembers(mems);

        // Host profile
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", target.host_id)
          .maybeSingle();
        if (profile) {
          const norm: Profile = {
            id: profile.id,
            full_name: profile.full_name,
            major: profile.major,
            bio: profile.bio,
            updated_at: profile.updated_at ? new Date(profile.updated_at) : null,
            gender: profile.gender,
            ideal_departure_time: profile.ideal_departure_time,
            ideal_location: profile.ideal_location,
            nickname: profile.nickname,
            punctuality: profile.punctuality,
            birth_date: profile.birth_date ? new Date(profile.birth_date) : null,
            location: profile.location,
            avatar_url: profile.avatar_url,
            points: profile.points,
            university: profile.university,
            created_at: profile.created_at ? new Date(profile.created_at) : null,
            show_university: profile.show_university,
            phone_number: profile.phone_number,
            show_phone: profile.show_phone,
            isGenderOnly: null,
            rideOptions: null,
            expiresIn: null,
          };
          setHostProfile(norm);
        } else {
          setHostProfile(null);
        }

        // Guard: if party expired with zero members, consider expired flow
        const totalCount = mems.length + 1;
        const isExpired = new Date(target.expires_at).getTime() <= Date.now();
        if (isExpired && totalCount === 1) {
          toast.info("Party expired (no one joined)");
          router.replace("/dashboard");
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user, params, router, supabase]);

  const initials = (name?: string | null) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((w) => w[0]?.toUpperCase())
      .slice(0, 2)
      .join("");
  };

  if (authLoading || loading) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground">Preparing live party…</p>
      </div>
    );
  }

  if (!party) return null;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <Button asChild variant="outline">
          <Link href="/current-party"><ArrowLeft className="h-4 w-4 mr-1" /> Back</Link>
        </Button>
        <h1 className="text-xl font-semibold">Live Party</h1>
        <div />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ride to {party.drop_off}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Map and route */}
          {party.start_coords && party.dest_coords ? (
            <div>
              <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
                <RouteIcon className="h-4 w-4" /> Route preview
              </div>
              <RideMap start={party.start_coords as any} dest={party.dest_coords as any} height={280} />
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">Map is unavailable for this party.</div>
          )}

          {/* Meetup info */}
          <div className="flex items-center gap-2 text-base">
            <MapPin className="h-5 w-5 text-muted-foreground" />
            <div>
              <span className="font-bold">{party.meetup_point}</span>
              <span className="text-muted-foreground"> (specify as much details)</span>
            </div>
          </div>

          {/* Contacts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Host */}
            <div className="p-3 rounded border">
              <div className="text-sm font-medium mb-2">Host</div>
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={hostProfile?.avatar_url || ""} />
                  <AvatarFallback>{initials(hostProfile?.nickname || hostProfile?.full_name)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="font-medium">{hostProfile?.nickname || hostProfile?.full_name || "Host"}</div>
                  {hostProfile?.show_university && hostProfile.university && (
                    <div className="text-xs text-muted-foreground">{hostProfile.university}</div>
                  )}
                </div>
                {hostProfile?.show_phone && hostProfile.phone_number && (
                  <div className="flex items-center gap-1 text-sm"><Phone className="h-4 w-4" /> <span className="font-medium">{hostProfile.phone_number}</span></div>
                )}
              </div>
            </div>

            {/* Members */}
            <div className="p-3 rounded border">
              <div className="text-sm font-medium mb-2 flex items-center gap-2"><Users className="h-4 w-4" /> Members</div>
              <div className="flex flex-col divide-y">
                {members.map((m) => (
                  <div key={m.id} className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={m.profile?.avatar_url || ""} />
                        <AvatarFallback>{initials(m.profile?.nickname || m.profile?.full_name)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{m.profile?.nickname || m.profile?.full_name || "User"}</div>
                        {m.profile?.show_university && m.profile.university && (
                          <div className="text-xs text-muted-foreground">{m.profile.university}</div>
                        )}
                      </div>
                    </div>
                    {m.profile?.show_phone && m.profile.phone_number && (
                      <div className="flex items-center gap-1 text-sm"><Phone className="h-4 w-4" /> <span className="font-medium">{m.profile.phone_number}</span></div>
                    )}
                  </div>
                ))}
                {members.length === 0 && (
                  <div className="text-sm text-muted-foreground py-2">No members joined.</div>
                )}
              </div>
            </div>
          </div>

          <div className="text-sm text-muted-foreground">
            This page is visible to the host and joined members once the party is full and the timer ends.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
