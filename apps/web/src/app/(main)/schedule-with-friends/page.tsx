"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { toast } from "sonner";
import { CalendarCheck2, Clock3, MapPin, Send, Users } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNotificationsStore } from "@/stores/notificationsStore";

type CandidateProfile = {
  id: string;
  username: string | null;
  full_name: string | null;
  ideal_location: string | null;
  ideal_departure_time: string | null;
  source: "mutual" | "location_match";
};

type ScheduleStatus = "pending" | "accepted" | "declined" | "cancelled";

type ScheduleRow = {
  id: string;
  requester_id: string;
  invitee_id: string;
  proposed_day_of_week: number;
  proposed_time: string;
  location_note: string | null;
  request_message: string | null;
  status: ScheduleStatus;
  response_note: string | null;
  created_at: string;
  requester: { username: string | null; full_name: string | null } | null;
  invitee: { username: string | null; full_name: string | null } | null;
};

const DAY_OPTIONS = [
  { value: 0, label: "Sunday" },
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
];

const dayLabel = (day: number): string => DAY_OPTIONS.find((d) => d.value === day)?.label ?? "Unknown";

const displayName = (profile: { username: string | null; full_name: string | null } | null): string => {
  if (!profile) return "Unknown";
  return profile.full_name?.trim() || profile.username?.trim() || "User";
};

export default function ScheduleWithFriendsPage() {
  const supabase = createClient();
  const addNotification = useNotificationsStore((s) => s.add);
  const hasNotification = useNotificationsStore((s) => s.has);

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [candidates, setCandidates] = useState<CandidateProfile[]>([]);
  const [incoming, setIncoming] = useState<ScheduleRow[]>([]);
  const [outgoing, setOutgoing] = useState<ScheduleRow[]>([]);
  const [accepted, setAccepted] = useState<ScheduleRow[]>([]);

  const [myIdealLocation, setMyIdealLocation] = useState("");

  const [selectedCandidateId, setSelectedCandidateId] = useState("");
  const [proposedDay, setProposedDay] = useState<number>(new Date().getDay());
  const [proposedTime, setProposedTime] = useState("15:00");
  const [locationNote, setLocationNote] = useState("");
  const [requestMessage, setRequestMessage] = useState("");

  const loadData = useCallback(async () => {
    const { data: auth } = await supabase.auth.getUser();
    const currentUser = auth.user;
    setUser(currentUser ?? null);

    if (!currentUser) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const [profileRes, connRes, schedulesRes] = await Promise.all([
        supabase
          .from("profiles")
          .select("ideal_location, ideal_departure_time")
          .eq("id", currentUser.id)
          .maybeSingle(),
        supabase
          .from("connections")
          .select("requester_id, addressee_id")
          .or(`requester_id.eq.${currentUser.id},addressee_id.eq.${currentUser.id}`)
          .eq("status", "accepted"),
        supabase
          .from("friend_schedules")
          .select("id, requester_id, invitee_id, proposed_day_of_week, proposed_time, location_note, request_message, status, response_note, created_at, requester:requester_id(username, full_name), invitee:invitee_id(username, full_name)")
          .or(`requester_id.eq.${currentUser.id},invitee_id.eq.${currentUser.id}`)
          .order("created_at", { ascending: false }),
      ]);

      if (profileRes.error) throw profileRes.error;
      if (connRes.error) throw connRes.error;
      if (schedulesRes.error) throw schedulesRes.error;

      const me = profileRes.data;
      const idealLocation = me?.ideal_location ?? "";
      setMyIdealLocation(idealLocation);
      setLocationNote((prev) => prev || idealLocation || "");

      const connectedIds = Array.from(
        new Set(
          (connRes.data ?? []).map((c: any) =>
            c.requester_id === currentUser.id ? c.addressee_id : c.requester_id
          )
        )
      );

      const locationQuery = supabase
        .from("profiles")
        .select("id, username, full_name, ideal_location, ideal_departure_time")
        .neq("id", currentUser.id)
        .not("ideal_location", "is", null)
        .not("ideal_departure_time", "is", null)
        .limit(25);

      const locationScopedQuery = idealLocation
        ? locationQuery.ilike("ideal_location", idealLocation)
        : locationQuery;

      const [mutualProfilesRes, locationProfilesRes] = await Promise.all([
        connectedIds.length
          ? supabase
              .from("profiles")
              .select("id, username, full_name, ideal_location, ideal_departure_time")
              .in("id", connectedIds)
          : Promise.resolve({ data: [], error: null } as any),
        locationScopedQuery,
      ]);

      if (mutualProfilesRes.error) throw mutualProfilesRes.error;
      if (locationProfilesRes.error) throw locationProfilesRes.error;

      const dedup = new Map<string, CandidateProfile>();
      (mutualProfilesRes.data ?? []).forEach((p: any) => {
        dedup.set(p.id, { ...p, source: "mutual" });
      });
      (locationProfilesRes.data ?? []).forEach((p: any) => {
        if (p.id === currentUser.id) return;
        if (!dedup.has(p.id)) {
          dedup.set(p.id, { ...p, source: "location_match" });
        }
      });

      const allSchedules = (schedulesRes.data ?? []) as unknown as ScheduleRow[];
      setIncoming(allSchedules.filter((s) => s.invitee_id === currentUser.id && s.status === "pending"));
      setOutgoing(allSchedules.filter((s) => s.requester_id === currentUser.id && s.status === "pending"));
      setAccepted(allSchedules.filter((s) => s.status === "accepted"));
      setCandidates(Array.from(dedup.values()));
    } catch (error: any) {
      console.error("Failed to load schedule data", error);
      toast.error(error?.message || "Failed to load schedule data.");
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel("friend-schedules-notifications")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "friend_schedules" }, (payload) => {
        const row = payload.new as any;
        if (row.invitee_id !== user.id) return;
        const id = `schedule-incoming:${row.id}`;
        if (hasNotification(id)) return;
        addNotification({
          id,
          message: "You received a schedule request from a friend",
          timestamp: new Date(),
          read: false,
          type: "info",
          href: "/schedule-with-friends",
        });
      })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "friend_schedules" }, (payload) => {
        const row = payload.new as any;
        if (row.requester_id !== user.id) return;
        if (row.status !== "accepted" && row.status !== "declined") return;
        const id = `schedule-update:${row.id}:${row.status}`;
        if (hasNotification(id)) return;
        addNotification({
          id,
          message: row.status === "accepted" ? "Your schedule request was accepted" : "Your schedule request was declined",
          timestamp: new Date(),
          read: false,
          type: row.status === "accepted" ? "success" : "error",
          href: "/schedule-with-friends",
        });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [addNotification, hasNotification, supabase, user]);

  const sendRequest = async () => {
    if (!user) return;
    if (!selectedCandidateId) {
      toast.error("Pick a friend or location match first.");
      return;
    }

    const candidate = candidates.find((c) => c.id === selectedCandidateId);
    if (!candidate) {
      toast.error("Candidate not found.");
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase.from("friend_schedules").insert({
        requester_id: user.id,
        invitee_id: selectedCandidateId,
        candidate_source: candidate.source,
        proposed_day_of_week: proposedDay,
        proposed_time: proposedTime,
        location_note: locationNote.trim() || null,
        request_message: requestMessage.trim() || null,
        status: "pending",
      });

      if (error) throw error;
      toast.success("Schedule request sent.");
      setRequestMessage("");
      await loadData();
    } catch (error: any) {
      console.error("Failed to send schedule request", error);
      toast.error(error?.message || "Failed to send schedule request.");
    } finally {
      setSaving(false);
    }
  };

  const updateRequest = async (id: string, status: "accepted" | "declined", note?: string) => {
    try {
      const patch: any = {
        status,
        response_note: note?.trim() || null,
      };
      if (status === "accepted") {
        patch.accepted_at = new Date().toISOString();
      }

      const { error } = await supabase.from("friend_schedules").update(patch).eq("id", id);
      if (error) throw error;
      toast.success(status === "accepted" ? "Schedule accepted." : "Schedule declined.");
      await loadData();
    } catch (error: any) {
      console.error("Failed to update schedule", error);
      toast.error(error?.message || "Failed to update schedule.");
    }
  };

  const freeNowItems = useMemo(() => {
    const now = new Date();
    const nowDay = now.getDay();
    const nowMinutes = now.getHours() * 60 + now.getMinutes();

    return accepted.filter((item) => {
      if (item.proposed_day_of_week !== nowDay) return false;
      const [h, m] = String(item.proposed_time).split(":").map((x) => Number(x || 0));
      const scheduleMinutes = h * 60 + m;
      return Math.abs(scheduleMinutes - nowMinutes) <= 20;
    });
  }, [accepted]);

  if (loading) {
    return <div className="p-8 text-center">Loading scheduling...</div>;
  }

  if (!user) {
    return <div className="p-8 text-center">Please sign in to schedule with friends.</div>;
  }

  return (
    <div className="mx-auto max-w-6xl p-4 md:p-8 space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Schedule With Friends</h1>
          <p className="text-sm text-muted-foreground">
            Plan shared departure times with your mutuals or people who share your ideal stop.
          </p>
        </div>
      </div>

      {freeNowItems.length > 0 && (
        <Card className="border-emerald-400/50 bg-emerald-50/70">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div>
                <p className="font-semibold text-emerald-800">Your scheduled friend is free right now</p>
                <p className="text-sm text-emerald-700">
                  You can start a party now and invite them to ride together.
                </p>
              </div>
              <Button asChild>
                <a href="/hostparty">Host party now</a>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <Card className="xl:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg"><Users className="h-4 w-4" />Choose person</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 max-h-[420px] overflow-auto">
            {candidates.length === 0 ? (
              <p className="text-sm text-muted-foreground">No candidates available. Add connections or set your ideal location/time in settings.</p>
            ) : (
              candidates.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setSelectedCandidateId(c.id)}
                  className={`w-full rounded-md border px-3 py-2 text-left ${selectedCandidateId === c.id ? "border-primary bg-primary/10" : ""}`}
                >
                  <p className="font-medium">{c.full_name || c.username || "User"}</p>
                  <p className="text-xs text-muted-foreground">
                    {c.source === "mutual" ? "Mutual connection" : "Interested near your ideal stop"}
                  </p>
                  <p className="text-xs text-muted-foreground">{c.ideal_location || "Location not set"} | {c.ideal_departure_time || "No time"}</p>
                </button>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg"><CalendarCheck2 className="h-4 w-4" />Create request</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <label className="space-y-1 text-sm">
                <span className="font-medium">Day of week</span>
                <select
                  className="w-full rounded-md border bg-background px-3 py-2"
                  value={proposedDay}
                  onChange={(e) => setProposedDay(Number(e.target.value))}
                >
                  {DAY_OPTIONS.map((d) => (
                    <option key={d.value} value={d.value}>{d.label}</option>
                  ))}
                </select>
              </label>

              <label className="space-y-1 text-sm">
                <span className="font-medium">Time</span>
                <Input type="time" value={proposedTime} onChange={(e) => setProposedTime(e.target.value)} />
              </label>
            </div>

            <label className="space-y-1 text-sm block">
              <span className="font-medium flex items-center gap-2"><MapPin className="h-4 w-4" />Location note</span>
              <Input
                value={locationNote}
                onChange={(e) => setLocationNote(e.target.value)}
                placeholder="Pickup/drop area"
              />
              {myIdealLocation ? <span className="text-xs text-muted-foreground">Your ideal stop: {myIdealLocation}</span> : null}
            </label>

            <label className="space-y-1 text-sm block">
              <span className="font-medium">Message</span>
              <Textarea
                value={requestMessage}
                onChange={(e) => setRequestMessage(e.target.value)}
                placeholder="Saturday 3 PM works for me. Does this match your plan?"
              />
            </label>

            <Button onClick={sendRequest} disabled={saving || !selectedCandidateId} className="gap-2">
              <Send className="h-4 w-4" />
              {saving ? "Sending..." : "Send schedule request"}
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Incoming requests</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {incoming.length === 0 ? <p className="text-sm text-muted-foreground">No incoming requests.</p> : incoming.map((r) => (
              <div key={r.id} className="rounded-md border p-3 space-y-2">
                <p className="font-medium">{displayName(r.requester)}</p>
                <p className="text-sm text-muted-foreground flex items-center gap-2"><Clock3 className="h-4 w-4" />{dayLabel(r.proposed_day_of_week)} at {String(r.proposed_time).slice(0, 5)}</p>
                {r.location_note ? <p className="text-sm">Location: {r.location_note}</p> : null}
                {r.request_message ? <p className="text-sm">{r.request_message}</p> : null}
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => updateRequest(r.id, "accepted")}>Accept</Button>
                  <Button size="sm" variant="outline" onClick={() => {
                    const note = window.prompt("Reason (optional):", "Time did not match or location did not match");
                    updateRequest(r.id, "declined", note || undefined);
                  }}>Decline</Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Outgoing requests</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {outgoing.length === 0 ? <p className="text-sm text-muted-foreground">No pending outgoing requests.</p> : outgoing.map((r) => (
              <div key={r.id} className="rounded-md border p-3 space-y-1">
                <p className="font-medium">To: {displayName(r.invitee)}</p>
                <p className="text-sm text-muted-foreground">{dayLabel(r.proposed_day_of_week)} at {String(r.proposed_time).slice(0, 5)}</p>
                {r.location_note ? <p className="text-sm">Location: {r.location_note}</p> : null}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Accepted schedules</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {accepted.length === 0 ? <p className="text-sm text-muted-foreground">No accepted schedules yet.</p> : accepted.map((r) => {
            const other = r.requester_id === user.id ? r.invitee : r.requester;
            return (
              <div key={r.id} className="rounded-md border p-3">
                <p className="font-medium">{displayName(other)}</p>
                <p className="text-sm text-muted-foreground">{dayLabel(r.proposed_day_of_week)} at {String(r.proposed_time).slice(0, 5)}</p>
                {r.location_note ? <p className="text-sm">Location: {r.location_note}</p> : null}
                {r.response_note ? <p className="text-xs text-muted-foreground mt-1">Note: {r.response_note}</p> : null}
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
