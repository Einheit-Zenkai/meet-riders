"use client";

import { useCallback, useEffect, useState } from "react";
import { MapPin } from "lucide-react";
import useAuthStore from "@/stores/authStore";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { partyMemberService } from "../services/partyMemberService";
import { useNotificationsStore } from "@/stores/notificationsStore";

interface RequestRow {
  id: string;
  party_id: string;
  user_id: string;
  created_at: Date;
  party?: {
    drop_off: string | null;
    meetup_point: string | null;
  } | null;
  userProfile?: {
    id: string;
    nickname: string | null;
    full_name: string | null;
    avatar_url: string | null;
    gender: string | null;
    university: string | null;
  } | null;
}

export default function CurrentPartySection() {
  const user = useAuthStore((s) => s.user);
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<RequestRow[]>([]);
  const [busyIds, setBusyIds] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const addNotification = useNotificationsStore((s) => s.add);
  const hasNotification = useNotificationsStore((s) => s.has);
  const removeNotification = useNotificationsStore((s) => s.remove);

  const pushNotificationsForRequests = useCallback((items: RequestRow[]) => {
    items.forEach((request) => {
      const notifId = `join-request:${request.id}`;
      if (hasNotification(notifId)) return;

      const riderName = request.userProfile?.nickname || request.userProfile?.full_name || "A rider";
      const destination = request.party?.drop_off ? ` to ${request.party.drop_off}` : "";

      addNotification({
        id: notifId,
        message: `${riderName} wants to join your party${destination}`,
        timestamp: request.created_at instanceof Date ? request.created_at : new Date(request.created_at),
        read: false,
        type: "join_request",
        meta: {
          requestId: request.id,
          partyId: request.party_id,
          requesterId: request.user_id,
          requesterName: riderName,
        },
      });
    });
  }, [addNotification, hasNotification]);

  const loadRequests = useCallback(async () => {
    if (!user) {
      setRequests([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    const result = await partyMemberService.getPendingRequestsForHost();
    if (!result.success) {
      setRequests([]);
      setError(result.error ?? "Failed to load requests");
    } else {
      const pending = result.requests ?? [];
      setRequests(pending);
      pushNotificationsForRequests(pending);
    }
    setLoading(false);
  }, [user, pushNotificationsForRequests]);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  const handleApprove = useCallback(async (request: RequestRow) => {
    setBusyIds((ids) => [...ids, request.id]);
    const result = await partyMemberService.approveRequest(request.id, request.party_id, request.user_id);
    if (!result.success) {
      setError(result.error ?? "Failed to approve request");
    }
    await loadRequests();
    setBusyIds((ids) => ids.filter((id) => id !== request.id));
    if (result.success) {
      removeNotification(`join-request:${request.id}`);
    }
  }, [loadRequests, removeNotification]);

  const handleDecline = useCallback(async (request: RequestRow) => {
    setBusyIds((ids) => [...ids, request.id]);
    const result = await partyMemberService.declineRequest(request.id);
    if (!result.success) {
      setError(result.error ?? "Failed to decline request");
    }
    await loadRequests();
    setBusyIds((ids) => ids.filter((id) => id !== request.id));
    if (result.success) {
      removeNotification(`join-request:${request.id}`);
    }
  }, [loadRequests, removeNotification]);

  const getInitials = (profile?: RequestRow["userProfile"]) => {
    const base = profile?.nickname || profile?.full_name || "?";
    return base
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  if (loading) {
    return null;
  }

  if (!error && requests.length === 0) {
    return null;
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold text-card-foreground mb-4">Current Party Requests</h2>
      {error ? (
        <Card><CardContent className="p-6 text-sm text-rose-600">{error}</CardContent></Card>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {requests.map((request) => {
            const partyDescription = request.party?.drop_off || "destination";
            const meetup = request.party?.meetup_point || "Meetup TBD";
            const profile = request.userProfile;
            const busy = busyIds.includes(request.id);

            return (
              <Card key={request.id}>
                <CardContent className="p-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start gap-3">
                    <Avatar className="h-10 w-10">
                      {profile?.avatar_url ? (
                        <AvatarImage src={profile.avatar_url} alt={profile?.nickname || profile?.full_name || "Rider"} />
                      ) : (
                        <AvatarFallback>{getInitials(profile)}</AvatarFallback>
                      )}
                    </Avatar>
                    <div className="space-y-1">
                      <div className="text-sm font-medium">
                        {profile?.nickname || profile?.full_name || "Rider"}
                      </div>
                      {profile?.university ? (
                        <div className="text-xs text-muted-foreground">{profile.university}</div>
                      ) : null}
                      <div className="text-xs text-muted-foreground flex items-center gap-2">
                        <MapPin className="h-3.5 w-3.5" /> {meetup}
                      </div>
                      <div className="text-xs text-muted-foreground">Heading to {partyDescription}</div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" disabled={busy} onClick={() => handleDecline(request)}>
                      Decline
                    </Button>
                    <Button size="sm" disabled={busy} onClick={() => handleApprove(request)}>
                      {busy ? "Processing…" : "Approve"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
