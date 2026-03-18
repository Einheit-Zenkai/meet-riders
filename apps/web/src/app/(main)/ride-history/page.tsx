"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { partyMemberService } from "../dashboard/services/partyMemberService";
import type { RideHistoryItem } from "../dashboard/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Clock3, MapPin, RefreshCcw, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

const formatReason = (reason: string | null): string => {
  if (!reason) return "Completed";
  return reason
    .replaceAll("_", " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
};

const initials = (name?: string | null): string => {
  if (!name) return "U";
  return name
    .split(" ")
    .map((part) => part[0]?.toUpperCase())
    .slice(0, 2)
    .join("");
};

export default function RideHistoryPage() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [deletingAll, setDeletingAll] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [history, setHistory] = useState<RideHistoryItem[]>([]);

  const load = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const res = await partyMemberService.getRideHistory();
      if (!res.success) {
        toast.error(res.error || "Failed to load ride history");
        return;
      }
      setHistory(res.history || []);
    } finally {
      if (isRefresh) setRefreshing(false);
      else setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleDeleteOne = async (rideId: string) => {
    const shouldDelete = window.confirm("Delete this ride history entry forever from your account?");
    if (!shouldDelete) return;

    setDeletingId(rideId);
    try {
      const res = await partyMemberService.deleteMyRideHistory(rideId);
      if (!res.success) {
        toast.error(res.error || "Failed to delete ride history entry");
        return;
      }

      setHistory((prev) => prev.filter((item) => item.id !== rideId));
      toast.success("Ride history entry deleted");
    } finally {
      setDeletingId(null);
    }
  };

  const handleDeleteAll = async () => {
    const shouldDelete = window.confirm("Delete ALL your ride history forever? This cannot be undone.");
    if (!shouldDelete) return;

    setDeletingAll(true);
    try {
      const res = await partyMemberService.deleteMyRideHistory();
      if (!res.success) {
        toast.error(res.error || "Failed to delete ride history");
        return;
      }

      setHistory([]);
      toast.success("All your ride history has been deleted");
    } finally {
      setDeletingAll(false);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-4">
      <div className="flex items-center justify-between gap-2">
        <Button asChild variant="outline">
          <Link href="/dashboard">Back</Link>
        </Button>
        <h1 className="text-xl font-semibold flex items-center gap-2">
          <Clock3 className="h-5 w-5" /> Ride History
        </h1>
        <Button variant="secondary" onClick={() => load(true)} disabled={refreshing}>
          <RefreshCcw className="h-4 w-4 mr-1" /> {refreshing ? "Refreshing..." : "Refresh"}
        </Button>
      </div>

      <div className="flex justify-end">
        <Button variant="destructive" onClick={handleDeleteAll} disabled={deletingAll || loading || history.length === 0}>
          {deletingAll ? "Deleting..." : "Delete all my history"}
        </Button>
      </div>

      {loading ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">Loading ride history...</CardContent>
        </Card>
      ) : history.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No completed rides yet.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {history.map((ride) => (
            <Card key={ride.id} className="border bg-card/70">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center justify-between gap-2">
                  <span className="truncate">Ride to {ride.drop_off}</span>
                  <span className="text-xs text-muted-foreground font-normal">
                    {ride.completed_at.toLocaleString()}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Meetup:</span>
                    <span className="font-medium text-foreground truncate">{ride.meetup_point}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Result:</span>{" "}
                    <span className="font-medium text-foreground">{formatReason(ride.end_reason)}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Riders:</span>{" "}
                    <span className="font-medium text-foreground">{ride.participants.length}</span>
                  </div>
                </div>

                <div className="rounded border p-3 space-y-2">
                  <div className="text-sm font-medium">Who you rode with</div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {ride.participants.map((participant) => {
                      const displayName =
                        participant.profile?.nickname ||
                        participant.profile?.full_name ||
                        participant.profile?.username ||
                        "Rider";

                      return (
                        <div key={`${ride.id}-${participant.user_id}`} className="flex items-center justify-between rounded border px-3 py-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <Avatar className="h-7 w-7">
                              <AvatarImage src={participant.profile?.avatar_url || ""} />
                              <AvatarFallback>{initials(displayName)}</AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                              <div className="text-sm font-medium truncate">{displayName}</div>
                              <div className="text-xs text-muted-foreground">
                                {participant.role === "host" ? "Host" : "Member"}
                              </div>
                            </div>
                          </div>
                          <div className="text-xs flex items-center gap-1 text-muted-foreground">
                            <CheckCircle2 className={`h-4 w-4 ${participant.reached_stop_at ? "text-green-500" : "text-muted-foreground"}`} />
                            <span>{participant.reached_stop_at ? "Reached" : "Not marked"}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteOne(ride.id)}
                    disabled={deletingId === ride.id}
                  >
                    {deletingId === ride.id ? "Deleting..." : "Delete this entry"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
