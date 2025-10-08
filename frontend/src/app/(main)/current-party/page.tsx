"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import useAuthStore from "@/stores/authStore";
import { partyMemberService } from "../dashboard/services/partyMemberService";
import type { Party, PartyMember, Profile } from "../dashboard/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Crown, LogOut, UserX, Phone, Users, MapPin } from "lucide-react";
import { toast } from "sonner";
import { useNotificationsStore } from "@/stores/notificationsStore";
import NotificationsDropdown from "../dashboard/components/NotificationsDropdown";

export default function CurrentPartyPage() {
  const user = useAuthStore(state => state.user);
  const authLoading = useAuthStore(state => state.loading);
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const addNotification = useNotificationsStore((s) => s.add);
  const hasNotification = useNotificationsStore((s) => s.has);

  const [loading, setLoading] = useState(true);
  const [parties, setParties] = useState<Party[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [members, setMembers] = useState<PartyMember[]>([]);
  const [hostProfile, setHostProfile] = useState<Profile | null>(null);
  const [busy, setBusy] = useState(false);

  const selectedParty = useMemo(
    () => (selectedId ? parties.find(p => p.id === selectedId) || null : null),
    [parties, selectedId]
  );

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login");
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    const load = async () => {
      if (!user) return;
      setLoading(true);
      try {
        // hosting party
        const partyFields = `id, created_at, updated_at, host_id, party_size, duration_minutes, expires_at, meetup_point, drop_off, is_friends_only, is_gender_only, ride_options, host_comments, host_university, display_university, is_active`;

        const { data: hosting, error: hostErr } = await supabase
          .from('parties')
          .select(partyFields)
          .eq('host_id', user.id)
          .eq('is_active', true);

        if (hostErr) console.warn('host fetch error', hostErr);

        // joined parties: get ids then fetch
        const { data: myMemberRows, error: memErr } = await supabase
          .from('party_members')
          .select('party_id')
          .eq('user_id', user.id)
          .eq('status', 'joined');
        if (memErr) console.warn('membership fetch error', memErr);

        let joined: any[] = [];
        const ids = (myMemberRows || []).map(r => r.party_id);
        if (ids.length) {
          const { data: joinedParties, error: joinedErr } = await supabase
            .from('parties')
            .select(partyFields)
            .in('id', ids)
            .eq('is_active', true);
          if (joinedErr) console.warn('joined fetch error', joinedErr);
          joined = joinedParties || [];
        }

        // merge unique by id
        const merged = [...(hosting || []), ...joined]
          .reduce((acc: any[], p: any) => acc.find(x => x.id === p.id) ? acc : acc.concat(p), []);

        // map to Party shape (dates)
        const casted: Party[] = merged.map((p: any) => ({
          ...p,
          created_at: new Date(p.created_at),
          updated_at: p.updated_at ? new Date(p.updated_at) : new Date(p.created_at),
          expires_at: new Date(p.expires_at),
          ride_options: Array.isArray(p.ride_options) ? p.ride_options : [],
          duration_minutes: typeof p.duration_minutes === 'number' ? p.duration_minutes : 0,
          display_university: p.display_university,
          is_active: p.is_active,
        }));

        setParties(casted);
        setSelectedId((casted[0]?.id) ?? null);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [user, supabase]);

  useEffect(() => {
    const loadDetails = async () => {
      if (!selectedParty) return;
      // Load members via service (RLS-safe) and compute excluding host
      const res = await partyMemberService.getPartyMembers(selectedParty.id);
      const memberList = res.success && res.members ? res.members : [];
      setMembers(memberList);

      // If party has reached time 0 and has at least 1 member (besides host), create a notification (no auto-redirect)
  const now = Date.now();
  // Add a small buffer to avoid client/DB clock skew
  const expired = selectedParty.expires_at.getTime() <= (now - 2000);
      const nonHostCount = memberList.filter(m => m.user_id !== selectedParty.host_id).length;
      if (expired && nonHostCount > 0) {
        const id = `live-start:${selectedParty.id}`;
        if (!hasNotification(id)) {
          addNotification({
            id,
            message: `${hostProfile?.nickname || hostProfile?.full_name || 'Host'}'s party has started for ${selectedParty.drop_off}. Click to open.`,
            timestamp: new Date(),
            read: false,
            href: `/live-party?id=${selectedParty.id}`,
          });
          toast.info("Party started! Check the notification bell.");
        }
      }
      // load host profile for contact/university
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', selectedParty.host_id)
        .maybeSingle();
      if (profile) {
        // normalize to Profile type
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
    };
    loadDetails();
  }, [selectedParty, supabase, router, addNotification, hasNotification, hostProfile]);

  // Schedule a one-shot check right when the countdown reaches 0 to push a notification
  useEffect(() => {
    if (!selectedParty) return;
  const msUntilExpiry = selectedParty.expires_at.getTime() - Date.now();
    if (msUntilExpiry <= 0) return; // already handled by loadDetails above
    const timer = setTimeout(async () => {
      // Re-check members right at expiry time and exclude host explicitly
      const res = await partyMemberService.getPartyMembers(selectedParty.id);
      const memberList = res.success && res.members ? res.members : [];
      const nonHostCount = memberList.filter(m => m.user_id !== selectedParty.host_id).length;
      if (nonHostCount > 0) {
        const id = `live-start:${selectedParty.id}`;
        if (!hasNotification(id)) {
          addNotification({
            id,
            message: `${hostProfile?.nickname || hostProfile?.full_name || 'Host'}'s party has started for ${selectedParty.drop_off}. Click to open.`,
            timestamp: new Date(),
            read: false,
            href: `/live-party?id=${selectedParty.id}`,
          });
          toast.info("Party started! Check the notification bell.");
        }
      }
      // else: stay on current party per requirement
    }, Math.min(msUntilExpiry + 100, 2_147_483_647)); // slight buffer, clamp to max setTimeout
    return () => clearTimeout(timer);
  }, [selectedParty, router, addNotification, hasNotification, hostProfile]);

  const isHost = selectedParty && user && selectedParty.host_id === user.id;

  const handleLeave = async () => {
    if (!selectedParty || !user) return;
    if (!confirm('Leave this party?')) return;
    setBusy(true);
    const res = await partyMemberService.leaveParty(selectedParty.id);
    if (!res.success) toast.error(res.error || 'Failed to leave');
    else {
      toast.success('Left the party');
      setParties(prev => prev.filter(p => p.id !== selectedParty.id));
      setSelectedId(null);
    }
    setBusy(false);
  };

  const handleCancel = async () => {
    if (!selectedParty || !isHost) return;
    if (!confirm('Cancel this party for everyone?')) return;
    setBusy(true);
    const { error } = await supabase
      .from('parties')
      .update({ is_active: false })
      .eq('id', selectedParty.id)
      .eq('host_id', user!.id);
    if (error) toast.error('Failed to cancel'); else {
      toast.success('Party canceled');
      setParties(prev => prev.filter(p => p.id !== selectedParty.id));
      setSelectedId(null);
    }
    setBusy(false);
  };

  const handleKick = async (member: PartyMember) => {
    if (!isHost) return;
    const ok = confirm(`Kick ${member.profile?.nickname || member.profile?.full_name || 'this user'}?`);
    if (!ok) return;
    try {
      setBusy(true);
      const res = await partyMemberService.kickMember(selectedParty!.id, member.user_id);
      if (!res.success) return toast.error(res.error || 'Failed to kick');
      toast.success('Member removed');
      setMembers(prev => prev.filter(m => m.user_id !== member.user_id));
    } finally {
      setBusy(false);
    }
  };

  const initials = (name?: string | null) => {
    if (!name) return 'U';
    return name.split(' ').map(w => w[0]?.toUpperCase()).slice(0,2).join('');
  };

  if (authLoading || loading) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground">Loading current parties…</p>
      </div>
    );
  }

  if (parties.length === 0) {
    return (
      <div className="p-6 space-y-6">
        <Button asChild variant="outline"><Link href="/dashboard">← Back</Link></Button>
        <Card>
          <CardContent className="py-12 text-center space-y-3">
            <h1 className="text-xl font-semibold">No party in progress</h1>
            <p className="text-muted-foreground">You aren’t in any party right now.</p>
            <Button asChild>
              <Link href="/dashboard">Browse parties</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <Button asChild variant="outline"><Link href="/dashboard">← Back</Link></Button>
        <h1 className="text-xl font-semibold">Current Parties</h1>
        <NotificationsDropdown />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[320px_1fr] gap-6 items-start">
        <Card>
          <CardHeader>
            <CardTitle>Your Active Parties</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {parties.length === 0 && (
              <p className="text-sm text-muted-foreground">You haven’t joined any parties yet.</p>
            )}
            {parties.map(p => (
              <button
                key={p.id}
                onClick={() => setSelectedId(p.id)}
                className={`w-full text-left p-3 rounded border transition ${selectedId === p.id ? 'bg-accent border-accent-foreground/20' : 'bg-background border-input hover:border-foreground/30'}`}
              >
                <div className="flex items-center justify-between">
                  <div className="font-medium">{p.drop_off}</div>
                  <div className="text-xs text-muted-foreground">{p.expires_at.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                </div>
                <div className="text-xs text-muted-foreground">Meet: {p.meetup_point}</div>
              </button>
            ))}
          </CardContent>
        </Card>

        <div>
          {!selectedParty ? (
            <Card>
              <CardContent className="py-10 text-center text-muted-foreground">Select a party to see details</CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Ride to {selectedParty.drop_off}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* If expired and has non-host members, show a soft prompt instead of auto-redirect */}
                {(() => {
                  const expired = selectedParty.expires_at.getTime() <= (Date.now() - 2000);
                  const nonHostCount = members.filter(m => m.user_id !== selectedParty.host_id).length;
                  if (expired && nonHostCount > 0) {
                    return (
                      <div className="p-3 rounded border bg-amber-500/10 text-amber-200 text-sm flex items-center justify-between">
                        <span>Party has started. Open the live page from the notification bell.</span>
                        <Button size="sm" variant="secondary" onClick={() => router.push(`/live-party?id=${selectedParty.id}`)}>Open Live Party</Button>
                      </div>
                    );
                  }
                  return null;
                })()}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3"><MapPin size={18} /><span className="font-medium">Meetup:</span> {selectedParty.meetup_point}</div>
                  <div className="flex items-center gap-3"><Users size={18} /><span className="font-medium">Size:</span> {members.length}/{selectedParty.party_size}</div>
                </div>

                {selectedParty.host_comments && (
                  <div className="p-3 rounded border bg-muted/30">
                    <div className="text-sm font-medium mb-1">Host notes</div>
                    <div className="text-sm text-muted-foreground whitespace-pre-wrap">{selectedParty.host_comments}</div>
                  </div>
                )}

                <div>
                  <div className="mb-2 text-sm font-medium">Members</div>
                  <div className="flex flex-col divide-y border rounded">
                    {members.map(m => (
                      <div key={m.id} className="flex items-center justify-between p-3">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={m.profile?.avatar_url || ''} />
                            <AvatarFallback>{initials(m.profile?.nickname || m.profile?.full_name)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{m.profile?.nickname || m.profile?.full_name || 'User'}</span>
                              {m.user_id === selectedParty.host_id && <Crown size={14} className="text-yellow-500" />}
                              {/* TODO: mutual friends button placeholder */}
                            </div>
                            {m.profile?.show_university && m.profile.university && (
                              <div className="text-xs text-muted-foreground">{m.profile.university}</div>
                            )}
                          </div>
                        </div>
                        {isHost && m.user_id !== user!.id && (
                          <Button size="sm" variant="outline" onClick={() => handleKick(m)} disabled={busy}>
                            <UserX className="h-4 w-4 mr-1" /> Kick
                          </Button>
                        )}
                      </div>
                    ))}
                    {members.length === 0 && <div className="p-3 text-sm text-muted-foreground">No members yet.</div>}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  {!isHost ? (
                    <Button variant="destructive" onClick={handleLeave} disabled={busy}><LogOut className="h-4 w-4 mr-1" /> Exit party</Button>
                  ) : (
                    <Button variant="destructive" onClick={handleCancel} disabled={busy}>Cancel party</Button>
                  )}
                </div>

                {/* Host contact at bottom if enabled */}
                {hostProfile?.show_phone && hostProfile.phone_number && (
                  <div className="mt-6 flex items-center gap-2 text-sm p-3 rounded border bg-muted/20">
                    <Phone size={16} /> Host contact: <span className="font-medium">{hostProfile.phone_number}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
