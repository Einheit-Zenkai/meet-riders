"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import useAuthStore from "@/stores/authStore";
import { partyMemberService } from "../dashboard/services/partyMemberService";
import type { Party, PartyMember, Profile } from "../dashboard/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MapPin, Phone, Users, ArrowLeft, Route as RouteIcon, Crown, Flag, Share2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import dynamic from "next/dynamic";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { LiveChannelProvider, useLiveChannel } from "./LiveChannelContext";
import GenderBadge from "@/components/GenderBadge";

// Dynamically import RideMap to avoid SSR issues
const RideMap = dynamic(() => import("@/components/RideMap"), { ssr: false });

// Lightweight single-point map for meetup-only display (imports Leaflet CSS statically inside component)
const SinglePointMap = dynamic(() => import("@/components/SinglePointMap"), { ssr: false });

function LivePartyInner() {
  const user = useAuthStore((s) => s.user);
  const authLoading = useAuthStore((s) => s.loading);
  const router = useRouter();
  const params = useSearchParams();
  const supabase = useMemo(() => createClient(), []);

  const [loading, setLoading] = useState(true);
  const [party, setParty] = useState<Party | null>(null);
  const [members, setMembers] = useState<PartyMember[]>([]);
  const [hostProfile, setHostProfile] = useState<Profile | null>(null);
  const [endOpen, setEndOpen] = useState(false);
  const [endReason, setEndReason] = useState<"connected" | "difficulties" | null>(null);
  const [ending, setEnding] = useState(false);
  const [shareOn, setShareOn] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) router.replace("/login");
  }, [authLoading, user, router]);

  useEffect(() => {
    const load = async () => {
      if (!user) return;
      setLoading(true);
      try {
  const idParam = params?.get?.("id");

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
            username: profile.username,
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

        // Guard: if party expired and no non-host members joined, do not enter live view
        const nonHost = mems.filter((m: any) => m.user_id !== target.host_id);
        const isExpired = new Date(target.expires_at).getTime() <= Date.now();
        if (isExpired && nonHost.length === 0) {
          toast.info("Live party is available only after at least one member joins.");
          router.replace("/current-party");
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
    <LiveChannelProvider partyId={party.id}>
      <LivePartyUI
        party={party}
        members={members}
        hostId={party.host_id}
        hostProfile={hostProfile}
  shareOn={shareOn}
  setShareOn={setShareOn}
        endOpen={endOpen}
        setEndOpen={setEndOpen}
        endReason={endReason}
        setEndReason={setEndReason}
        ending={ending}
        setEnding={setEnding}
      />
    </LiveChannelProvider>
  );
}

function LivePartyUI({
  party,
  members,
  hostId,
  hostProfile,
  shareOn,
  setShareOn,
  endOpen,
  setEndOpen,
  endReason,
  setEndReason,
  ending,
  setEnding,
}: {
  party: any;
  members: any[];
  hostId: string;
  hostProfile: any;
  shareOn: boolean;
  setShareOn: (v: boolean) => void;
  endOpen: boolean;
  setEndOpen: (v: boolean) => void;
  endReason: "connected" | "difficulties" | null;
  setEndReason: (v: "connected" | "difficulties" | null) => void;
  ending: boolean;
  setEnding: (v: boolean) => void;
}) {
  const user = useAuthStore(s => s.user);
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const { sendLocation, locations, messages, sendChat, sendStatus, statuses } = useLiveChannel();
  const [myStatus, setMyStatus] = useState<"on_my_way" | "at_meetup" | null>(null);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportTarget, setReportTarget] = useState<{ userId: string; name: string } | null>(null);
  const [reportReason, setReportReason] = useState<string>("");
  const [reportText, setReportText] = useState<string>("");
  const [reporting, setReporting] = useState(false);

  const initials = (name?: string | null) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((w) => w[0]?.toUpperCase())
      .slice(0, 2)
      .join("");
  };

  // Start/stop location sharing
  useEffect(() => {
    if (!shareOn) return;
    if (!("geolocation" in navigator)) {
      toast.error("Geolocation not supported");
      setShareOn(false);
      return;
    }
    const id = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        sendLocation({ lat: latitude, lng: longitude });
      },
      (err) => {
        toast.error("Permission denied for location");
        setShareOn(false);
      },
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 15000 }
    );
    return () => {
      navigator.geolocation.clearWatch(id);
    };
  }, [shareOn, sendLocation, setShareOn]);

  const statusLabel = (s?: string) =>
    s === 'on_my_way' ? 'On my way' : s === 'at_meetup' ? 'At meetup' : undefined;

  const handleShareMeetup = async () => {
    const title = `Ride to ${party.drop_off}`;
    const details = party.meetup_point ? `Meetup: ${party.meetup_point}` : '';
    const coords = party.start_coords && typeof (party.start_coords as any).lat !== 'undefined' && typeof (party.start_coords as any).lng !== 'undefined'
      ? `\nMap: https://www.openstreetmap.org/?mlat=${(party.start_coords as any).lat}&mlon=${(party.start_coords as any).lng}#map=16/${(party.start_coords as any).lat}/${(party.start_coords as any).lng}`
      : '';
    const text = `${title}\n${details}${coords}`.trim();
    try {
      if (typeof navigator !== 'undefined' && (navigator as any).share) {
        await (navigator as any).share({ title, text });
      } else {
        await navigator.clipboard.writeText(text);
        toast.success('Meetup info copied');
      }
    } catch (e) {
      await navigator.clipboard.writeText(text);
      toast.success('Meetup info copied');
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <Button asChild variant="outline">
          <Link href="/current-party"><ArrowLeft className="h-4 w-4 mr-1" /> Back</Link>
        </Button>
        <h1 className="text-xl font-semibold">Live Party</h1>
        {/* Host-only End Party action */}
        {user?.id === party.host_id ? (
          <Dialog open={endOpen} onOpenChange={setEndOpen}>
            <DialogTrigger asChild>
              <Button variant="destructive">End Party</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>End this party?</DialogTitle>
                <DialogDescription>
                  End the party only if you have successfully connected the users. If you faced any difficulties, you can indicate that below.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-3 py-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="end-reason"
                    className="h-4 w-4"
                    checked={endReason === "connected"}
                    onChange={() => setEndReason("connected")}
                  />
                  <span className="text-sm">Successfully connected</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="end-reason"
                    className="h-4 w-4"
                    checked={endReason === "difficulties"}
                    onChange={() => setEndReason("difficulties")}
                  />
                  <span className="text-sm">Faced difficulties</span>
                </label>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setEndOpen(false)} disabled={ending}>Cancel</Button>
                <Button
                  variant="destructive"
                  disabled={ending || !endReason}
                  onClick={async () => {
                    if (!party || !user) return;
                    setEnding(true);
                    try {
                      // Deactivate the party (host-only)
                      const { error } = await supabase
                        .from("parties")
                        .update({ is_active: false })
                        .eq("id", party.id)
                        .eq("host_id", user.id);
                      if (error) {
                        toast.error("Failed to end party");
                      } else {
                        // Optional: award points if successfully connected (gamification)
                        if (endReason === "connected") {
                          try {
                            // This RPC should be created in Supabase (see SQL in chat)
                            const { error: rpcErr } = await supabase.rpc("award_points_for_party", {
                              p_party_id: party.id,
                              p_reason: "connected",
                            });
                            if (rpcErr) {
                              console.info("award_points_for_party not configured", rpcErr);
                              toast.message("Party ended. Points will be enabled once gamification is configured.");
                            } else {
                              toast.success("Party ended and points awarded");
                            }
                          } catch (e) {
                            console.info("award_points_for_party missing", e);
                            toast.message("Party ended. Gamification pending setup.");
                          }
                        }
                        toast.success("Party ended");
                        setEndOpen(false);
                        // Optional: you can persist endReason somewhere later
                        router.replace("/dashboard");
                      }
                    } finally {
                      setEnding(false);
                    }
                  }}
                >
                  {ending ? "Ending…" : "End Party"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        ) : (
          <div />
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ride to {party.drop_off}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Meetup point map on top */}
          {party.start_coords && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" /> Meetup point map
              </div>
              <SinglePointMap point={party.start_coords} height={180} />
            </div>
          )}

          {/* Live location toggle */}
          <div className="flex items-center justify-between p-3 rounded border bg-muted/20">
            <div className="text-sm">Share my live location (only visible to party)</div>
            <Button size="sm" variant={shareOn ? "default" : "outline"} onClick={() => setShareOn(!shareOn)}>
              {shareOn ? "Sharing" : "Start"}
            </Button>
          </div>

          {/* Map and route */}
          {party.start_coords && party.dest_coords &&
           typeof (party.start_coords as any).lat !== 'undefined' &&
           typeof (party.start_coords as any).lng !== 'undefined' &&
           typeof (party.dest_coords as any).lat !== 'undefined' &&
           typeof (party.dest_coords as any).lng !== 'undefined' ? (
            <div>
              <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
                <RouteIcon className="h-4 w-4" /> Route preview
              </div>
              <div className="relative">
                <RideMap start={party.start_coords as any} dest={party.dest_coords as any} height={280} />
                {/* Simple overlay of live markers using absolute-positioned badges */}
                {/* For a deeper integration, we could extend RideMap to accept extra dynamic markers */}
                <div className="absolute top-2 right-2 bg-background/80 rounded p-2 border text-xs max-w-[60%] space-y-1">
                  <div className="font-medium">Live positions</div>
                  {Object.values(locations).length === 0 && (
                    <div className="text-muted-foreground">No one sharing yet</div>
                  )}
                  {Object.values(locations).map((loc) => (
                    <div key={`${loc.uid}`} className="flex items-center gap-2">
                      <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
                      <span>{loc.uid.slice(0, 6)}…</span>
                      <span className="text-muted-foreground">({loc.lat.toFixed(4)}, {loc.lng.toFixed(4)})</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">Map is unavailable for this party.</div>
          )}

          {/* Meetup info */}
          <div className="flex items-start md:items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-base">
              <MapPin className="h-5 w-5 text-muted-foreground" />
              <div>
                <span className="font-bold">{party.meetup_point}</span>
                <span className="text-muted-foreground"> (specify as much details)</span>
              </div>
            </div>
            <Button size="sm" variant="outline" onClick={handleShareMeetup}>
              <Share2 className="h-4 w-4 mr-1" /> Share meetup
            </Button>
          </div>

          {/* My live status quick actions */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-muted-foreground">My status:</span>
            {[
              { key: 'on_my_way', label: 'On my way' },
              { key: 'at_meetup', label: 'At meetup' },
            ].map((opt) => (
              <Button
                key={opt.key}
                size="sm"
                variant={myStatus === (opt.key as any) ? 'default' : 'outline'}
                onClick={() => { setMyStatus(opt.key as any); sendStatus(opt.key as any); }}
              >
                {opt.label}
              </Button>
            ))}
          </div>

          {/* Contacts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Host */}
            <div className="p-3 rounded border">
              <div className="text-sm font-medium mb-2">Host</div>
              <div className="flex items-center gap-3">
                <Link href={`/profile/id/${hostId}`} className="flex items-center">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={hostProfile?.avatar_url || ""} />
                    <AvatarFallback>{initials(hostProfile?.nickname || hostProfile?.full_name)}</AvatarFallback>
                  </Avatar>
                </Link>
                <div className="flex-1">
                  <div className="font-medium flex items-center gap-2">
                    <Link href={`/profile/id/${hostId}`} className="hover:underline">
                      {hostProfile?.nickname || hostProfile?.full_name || "Host"}
                    </Link>
                    <Crown className="h-4 w-4 text-yellow-500" />
                    {hostProfile?.gender && (
                      <GenderBadge gender={hostProfile.gender} />
                    )}
                  </div>
                  {statuses?.[hostId]?.status && (
                    <div className="mt-1 inline-flex items-center px-2 py-0.5 rounded bg-primary/10 text-primary text-xs">
                      {statusLabel(statuses?.[hostId]?.status)}
                    </div>
                  )}
                  {hostProfile?.show_university && hostProfile.university && (
                    <div className="text-xs text-muted-foreground">{hostProfile.university}</div>
                  )}
                </div>
                {hostProfile?.show_phone && hostProfile.phone_number && (
                  <div className="flex items-center gap-1 text-sm"><Phone className="h-4 w-4" /> <span className="font-medium">{hostProfile.phone_number}</span></div>
                )}
                {/* Report host (if viewer is not host) */}
                {user?.id !== hostId && (
                  <Button size="sm" variant="outline" onClick={() => { setReportTarget({ userId: hostId, name: hostProfile?.nickname || hostProfile?.full_name || 'Host' }); setReportOpen(true); }}>
                    <Flag className="h-4 w-4 mr-1" /> Report
                  </Button>
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
                      <Link href={`/profile/id/${m.user_id}`} className="flex items-center">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={m.profile?.avatar_url || ""} />
                          <AvatarFallback>{initials(m.profile?.nickname || m.profile?.full_name)}</AvatarFallback>
                        </Avatar>
                      </Link>
                      <div>
                        <div className="font-medium flex items-center gap-2">
                          <Link href={`/profile/id/${m.user_id}`} className="hover:underline">
                            {m.profile?.nickname || m.profile?.full_name || "User"}
                          </Link>
                          {m.user_id === hostId && <Crown className="h-3 w-3 text-yellow-500" />}
                          {m.profile?.gender && (
                            <GenderBadge gender={m.profile.gender} />
                          )}
                          {statuses?.[m.user_id]?.status && (
                            <span className="ml-1 inline-flex items-center px-2 py-0.5 rounded bg-primary/10 text-primary text-[11px]">
                              {statusLabel(statuses?.[m.user_id]?.status)}
                            </span>
                          )}
                        </div>
                        {m.profile?.show_university && m.profile.university && (
                          <div className="text-xs text-muted-foreground">{m.profile.university}</div>
                        )}
                      </div>
                    </div>
                    {m.profile?.show_phone && m.profile.phone_number && (
                      <div className="flex items-center gap-1 text-sm"><Phone className="h-4 w-4" /> <span className="font-medium">{m.profile.phone_number}</span></div>
                    )}
                    {user?.id !== m.user_id && (
                      <Button size="sm" variant="outline" onClick={() => { setReportTarget({ userId: m.user_id, name: m.profile?.nickname || m.profile?.full_name || 'User' }); setReportOpen(true); }}>
                        <Flag className="h-4 w-4 mr-1" /> Report
                      </Button>
                    )}
                  </div>
                ))}
                {members.length === 0 && (
                  <div className="text-sm text-muted-foreground py-2">No members joined.</div>
                )}
              </div>
            </div>
          </div>

          {/* Simple chat */}
          <div className="p-3 rounded border bg-muted/10">
            <div className="text-sm font-medium mb-2">Party chat</div>
            <div className="h-40 overflow-y-auto border rounded p-2 bg-background/60 space-y-1">
              {messages.length === 0 && (
                <div className="text-sm text-muted-foreground">No messages yet</div>
              )}
              {messages.map(m => (
                <div key={m.id} className="text-sm">
                  <span className="font-medium">{m.uid === user?.id ? 'You' : m.uid.slice(0,6)+'…'}</span>: {m.text}
                </div>
              ))}
            </div>
            <ChatInput onSend={sendChat} />
          </div>

          <div className="text-sm text-muted-foreground">
            This page is visible to the host and joined members once the party is full and the timer ends.
          </div>
        </CardContent>
      </Card>

      {/* Report dialog */}
      <Dialog open={reportOpen} onOpenChange={setReportOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Report {reportTarget?.name || 'user'}</DialogTitle>
            <DialogDescription>Please tell us what went wrong. Your report helps keep the community safe.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-2">
                <input type="radio" name="report-reason" className="h-4 w-4" checked={reportReason === 'spam'} onChange={() => setReportReason('spam')} />
                <span className="text-sm">Spam or self promotion</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="radio" name="report-reason" className="h-4 w-4" checked={reportReason === 'harassment'} onChange={() => setReportReason('harassment')} />
                <span className="text-sm">Harassment or inappropriate behavior</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="radio" name="report-reason" className="h-4 w-4" checked={reportReason === 'other'} onChange={() => setReportReason('other')} />
                <span className="text-sm">Other</span>
              </label>
            </div>
            <textarea className="w-full p-2 rounded border bg-background" rows={3} placeholder="Add details (optional)" value={reportText} onChange={(e) => setReportText(e.target.value)} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReportOpen(false)}>Cancel</Button>
            <Button
              disabled={reporting || !reportTarget || !reportReason}
              onClick={async () => {
                setReporting(true);
                try {
                  // TODO: Persist to Supabase if you add a reports table
                  toast.success('Report submitted');
                  setReportOpen(false);
                  setReportTarget(null);
                  setReportReason('');
                  setReportText('');
                } finally {
                  setReporting(false);
                }
              }}
            >
              {reporting ? 'Submitting…' : 'Submit report'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ChatInput({ onSend }: { onSend: (text: string) => void }) {
  const [text, setText] = useState("");
  return (
    <form
      className="mt-2 flex items-center gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        if (!text.trim()) return;
        onSend(text);
        setText("");
      }}
    >
      <input
        className="flex-1 px-3 py-2 rounded border bg-background"
        placeholder="Type a message"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <Button type="submit" size="sm">Send</Button>
    </form>
  );
}

export default function LivePartyPage() {
  return (
    <Suspense fallback={<div className="p-6 text-muted-foreground">Loading live party…</div>}>
      <LivePartyInner />
    </Suspense>
  );
}
