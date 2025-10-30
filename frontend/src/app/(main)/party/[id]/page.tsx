"use client";

import { type ReactNode, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MapPin, Users, Clock, Share2, ShieldAlert, Phone, Lock, UserRound, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import useAuthStore from "@/stores/authStore";
import useDashboardDataStore from "@/stores/dashboardDataStore";
import { partyMemberService } from "@/app/(main)/dashboard/services/partyMemberService";
import type { Party, PartyMember } from "@/app/(main)/dashboard/types";
import { createClient } from "@/utils/supabase/client";

const formatTimeLeft = (expiresAt?: Date) => {
    if (!expiresAt) return "--:--";
    const diff = expiresAt.getTime() - Date.now();
    if (diff <= 0) return "Expired";
    const totalSeconds = Math.floor(diff / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
};

const formatDateTime = (date?: Date) =>
    date ? date.toLocaleString(undefined, { hour: "2-digit", minute: "2-digit" }) : "--";

const restrictionBadge = (label: string) => (
    <span className="inline-flex items-center gap-1 rounded-full border border-border bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
        <Lock className="h-3 w-3" />
        {label}
    </span>
);

export default function PartyDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const id = useMemo(() => String(params?.id || ""), [params]);

    const { user, loading: authLoading } = useAuthStore();
    const parties = useDashboardDataStore((state) => state.parties);
    const refreshParties = useDashboardDataStore((state) => state.refreshParties);
    const partiesLoading = useDashboardDataStore((state) => state.partiesLoading);

    const [members, setMembers] = useState<PartyMember[]>([]);
    const [membersLoading, setMembersLoading] = useState(false);
    const [actionBusy, setActionBusy] = useState(false);
    const [requestedPartyId, setRequestedPartyId] = useState<string | null>(null);

    useEffect(() => {
        if (!authLoading && !user) {
            router.replace("/login");
        }
    }, [authLoading, user, router]);

    const party = useMemo<Party | undefined>(() => parties.find((p) => p.id === id), [parties, id]);

    useEffect(() => {
        if (!id || authLoading || !user) return;
        if (party) return;
        if (requestedPartyId === id) return;

        setRequestedPartyId(id);
        refreshParties().catch((error) => {
            console.error("Failed to refresh parties", error);
            toast.error("Unable to load party details");
            setRequestedPartyId(null);
        });
    }, [id, party, refreshParties, requestedPartyId, authLoading, user]);

    useEffect(() => {
        if (!party) return;
        let isMounted = true;
        setMembersLoading(true);

        partyMemberService
            .getPartyMembers(party.id)
            .then((result) => {
                if (!isMounted) return;
                if (result.success && result.members) {
                    setMembers(result.members);
                } else if (result.error) {
                    toast.error(result.error);
                }
            })
            .finally(() => {
                if (isMounted) setMembersLoading(false);
            });

        return () => {
            isMounted = false;
        };
    }, [party]);

    useEffect(() => {
        if (party) return;
        setMembers([]);
        setMembersLoading(false);
    }, [party]);

    const isHost = Boolean(party && user && party.host_id === user.id);
    const isMember = useMemo(() => {
        if (!party) return false;
        if (isHost) return true;
        if (party.user_is_member) return true;
        const currentUserId = user?.id;
        return Boolean(currentUserId && members.some((member) => member.user_id === currentUserId));
    }, [party, isHost, user?.id, members]);

    const openSeats = useMemo(() => {
        if (!party) return 0;
        const currentCount = party.current_member_count ?? members.length;
        return Math.max(0, party.party_size - currentCount);
    }, [party, members.length]);

    const handleJoinParty = async () => {
        if (!party || !user || isHost || isMember) return;
        setActionBusy(true);
        try {
            const supabase = createClient();
            const { data: existing } = await supabase
              .from('party_requests')
              .select('id, status')
              .eq('party_id', party.id)
              .eq('user_id', user.id)
              .order('created_at', { ascending: false })
              .limit(1);
            if (existing && existing.length && existing[0].status === 'pending') {
                toast.info('Join request already pending');
                return;
            }
            const { error } = await supabase
                .rpc('create_join_request', { p_party_id: party.id });
            if (error) {
                const anyErr: any = error as any;
                const code = anyErr?.code || anyErr?.details || '';
                if (code?.toString?.().includes('23505') || (anyErr?.message || '').toLowerCase().includes('duplicate')) {
                    toast.info('Join request already pending');
                    return;
                }
                const errMsg = anyErr?.message || anyErr?.hint || anyErr?.details || 'Unknown error';
                console.error('Error creating party request:', errMsg, anyErr);
                toast.error('Failed to send join request');
            } else {
                toast.success('Request sent to host');
            }
        } finally {
            setActionBusy(false);
        }
    };

    const handleLeaveParty = async () => {
        if (!party || !user || isHost || !isMember) return;
        const confirmed = window.confirm("Leave this party?");
        if (!confirmed) return;
        setActionBusy(true);
        const result = await partyMemberService.leaveParty(party.id);
        if (result.success) {
            toast.success("Left the party");
            setMembers((prev) => prev.filter((member) => member.user_id !== user.id));
            await refreshParties();
        } else if (result.error) {
            toast.error(result.error);
        }
        setActionBusy(false);
    };

    const handleShareParty = async () => {
        if (!party) return;
        const shareUrl = `${window.location.origin}/party/${party.id}`;
        const shareText = `Join this ride to ${party.drop_off}!`;
        if (navigator.share) {
            try {
                await navigator.share({ title: "Meet Riders", text: shareText, url: shareUrl });
            } catch (error) {
                console.warn("Share cancelled", error);
            }
            return;
        }
        if (navigator.clipboard) {
            try {
                await navigator.clipboard.writeText(shareUrl);
                toast.success("Link copied to clipboard");
                return;
            } catch (error) {
                console.warn("Clipboard write failed", error);
            }
        }
        window.prompt("Copy this link", shareUrl);
    };

    const renderMembers = () => {
        if (membersLoading) {
            return <p className="text-sm text-muted-foreground">Loading members…</p>;
        }
        if (members.length === 0) {
            return <p className="text-sm text-muted-foreground">No riders joined yet.</p>;
        }
        return (
            <div className="flex flex-col divide-y rounded border">
                {members.map((member) => {
                    const displayName = member.profile?.nickname || member.profile?.full_name || "Rider";
                    const initials = displayName
                        .split(" ")
                        .map((word) => word[0])
                        .filter(Boolean)
                        .slice(0, 2)
                        .join("")
                        .toUpperCase();
                    return (
                        <div key={member.id} className="flex items-center justify-between px-4 py-3">
                            <div className="flex items-center gap-3">
                                <Avatar className="h-10 w-10">
                                    <AvatarImage src={member.profile?.avatar_url || undefined} alt={displayName} />
                                    <AvatarFallback>{initials || "R"}</AvatarFallback>
                                </Avatar>
                                <div className="space-y-0.5">
                                    <p className="text-sm font-medium leading-none">{displayName}</p>
                                    {member.profile?.show_university && member.profile.university && (
                                        <p className="text-xs text-muted-foreground">{member.profile.university}</p>
                                    )}
                                </div>
                            </div>
                            {member.user_id === party?.host_id && (
                                <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                                    Host
                                </span>
                            )}
                        </div>
                    );
                })}
            </div>
        );
    };

    if (!id) {
        return (
            <div className="p-6">
                <p className="text-destructive">Missing party id.</p>
            </div>
        );
    }

    if (authLoading || partiesLoading) {
        return (
            <div className="p-6">
                <p className="text-muted-foreground">Loading party…</p>
                <p>authLoading: {authLoading ? "true" : "false"}</p>
                <p>partiesLoading: {partiesLoading ? "true" : "false"}</p>
            </div>
        );
    }

    if (!party) {
        return (
            <div className="p-6 space-y-4">
                <Button asChild variant="outline">
                    <Link href="/dashboard">← Back to dashboard</Link>
                </Button>
                <Card>
                    <CardContent className="flex flex-col items-center gap-4 py-12">
                        <AlertTriangle className="h-10 w-10 text-destructive" />
                        <p className="text-center text-sm text-muted-foreground">
                            That party isn’t available anymore. It may have expired or been cancelled.
                        </p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const hostName = party.host_profile?.nickname || party.host_profile?.full_name || "Anonymous host";
    const hostInitials = hostName
        .split(" ")
        .map((word) => word[0])
        .filter(Boolean)
        .slice(0, 2)
        .join("")
        .toUpperCase();

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between gap-4">
                <Button asChild variant="outline">
                    <Link href="/dashboard">← Back</Link>
                </Button>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    Expires in
                    <span className="font-semibold text-foreground">{formatTimeLeft(party.expires_at)}</span>
                </div>
                <Button variant="secondary" onClick={handleShareParty} className="flex items-center gap-2">
                    <Share2 className="h-4 w-4" /> Share
                </Button>
            </div>

            <Card className="border-border/70">
                <CardHeader className="flex flex-col gap-4">
                    <div className="flex items-center gap-4">
                        <Avatar className="h-14 w-14">
                            <AvatarImage src={party.host_profile?.avatar_url || undefined} alt={hostName} />
                            <AvatarFallback>{isHost ? "ME" : hostInitials || "H"}</AvatarFallback>
                        </Avatar>
                        <div>
                            <CardTitle className="text-2xl">Ride to {party.drop_off}</CardTitle>
                            <p className="text-sm text-muted-foreground">Hosted by {isHost ? "you" : hostName}</p>
                        </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        {party.is_friends_only && restrictionBadge("Connections only")}
                        {party.is_gender_only && restrictionBadge("Gender restricted")}
                        {!party.is_active && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-destructive/10 px-3 py-1 text-xs font-semibold text-destructive">
                                <ShieldAlert className="h-3 w-3" /> Inactive
                            </span>
                        )}
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <DetailRow icon={<MapPin className="h-4 w-4" />} label="Meetup point" value={party.meetup_point} />
                        <DetailRow icon={<MapPin className="h-4 w-4" />} label="Drop-off" value={party.drop_off} />
                        <DetailRow icon={<Users className="h-4 w-4" />} label="Capacity" value={`${party.party_size} riders`} />
                        <DetailRow
                            icon={<Users className="h-4 w-4" />}
                            label="Open seats"
                            value={`${openSeats} spot${openSeats === 1 ? "" : "s"}`}
                        />
                        <DetailRow icon={<Clock className="h-4 w-4" />} label="Created" value={formatDateTime(party.created_at)} />
                        <DetailRow icon={<Clock className="h-4 w-4" />} label="Expires" value={formatDateTime(party.expires_at)} />
                    </div>

                    <div className="space-y-2">
                        <p className="text-sm font-medium text-muted-foreground">Ride options</p>
                        <div className="flex flex-wrap gap-2">
                            {(party.ride_options?.length ? party.ride_options : ["Any ride"]).map((option) => (
                                <span
                                    key={option}
                                    className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary"
                                >
                                    {option}
                                </span>
                            ))}
                        </div>
                    </div>

                    {(party.user_is_member || isHost) && party.host_comments && (
                        <div className="rounded-lg border bg-muted/40 p-4">
                            <p className="text-sm font-semibold text-muted-foreground">Host notes</p>
                            <p className="mt-2 text-sm text-foreground whitespace-pre-wrap">{party.host_comments}</p>
                        </div>
                    )}

                    {party.host_profile?.show_phone && party.host_profile.phone_number && (
                        <div className="flex items-center gap-2 rounded-lg border bg-muted/30 p-3 text-sm">
                            <Phone className="h-4 w-4" /> Contact: <span className="font-medium">{party.host_profile.phone_number}</span>
                        </div>
                    )}

                    <div className="flex flex-wrap gap-3">
                        {!isHost && !isMember && (
                            <Button onClick={handleJoinParty} disabled={actionBusy || !party.is_active} className="flex items-center gap-2">
                                <Users className="h-4 w-4" /> Join party
                            </Button>
                        )}
                        {!isHost && isMember && (
                            <Button variant="outline" onClick={handleLeaveParty} disabled={actionBusy} className="flex items-center gap-2">
                                <UserRound className="h-4 w-4" /> Leave party
                            </Button>
                        )}
                        {isHost && (
                            <span className="inline-flex items-center gap-2 rounded-full bg-secondary px-4 py-2 text-xs font-semibold text-secondary-foreground">
                                You are hosting this ride
                            </span>
                        )}
                    </div>
                </CardContent>
            </Card>

            <Card className="border-border/70">
                <CardHeader>
                    <CardTitle>Members</CardTitle>
                </CardHeader>
                <CardContent>{renderMembers()}</CardContent>
            </Card>

            {(!party.is_active || formatTimeLeft(party.expires_at) === "Expired") && (
                <div className="flex items-center gap-3 rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
                    <ShieldAlert className="h-5 w-5" />
                    This party is no longer active.
                </div>
            )}
        </div>
    );
}

function DetailRow({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
    return (
        <div className="flex items-start gap-2 rounded border border-border/60 bg-muted/20 p-3">
            <span className="mt-0.5 text-muted-foreground">{icon}</span>
            <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
                <p className="text-sm font-medium text-foreground">{value}</p>
            </div>
        </div>
    );
}