"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import type { SoiParty } from "../types";
import { soiMemberService } from "../services/soiMemberService";
import { soiPartyService } from "../services/soiPartyService";
import { toast } from "sonner";

function formatCountdown(target?: Date | null) {
  if (!target) return "";
  const now = new Date().getTime();
  const diff = new Date(target).getTime() - now;
  if (diff <= 0) return "starting now";
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  const rem = mins % 60;
  return `${hrs}h ${rem}m`;
}

export default function SoiList() {
  const supabase = createClient();
  const [items, setItems] = useState<SoiParty[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [now, setNow] = useState(Date.now());
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id ?? null);
    })();
  }, [supabase]);

  const fetchSOIs = useCallback(async (options?: { silent?: boolean }) => {
    const silent = options?.silent ?? false;
    if (!silent) setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from("soi_parties")
        .select("*")
        .eq("is_active", true)
        .gte("start_time", new Date(Date.now() - 10 * 60 * 1000).toISOString())
        .order("start_time", { ascending: true });

      if (error) {
        setError(error.message);
        return;
      }

      const list: SoiParty[] = (data || []).map((r: any) => ({
        id: r.id,
        created_at: new Date(r.created_at),
        host_id: r.host_id,
        party_size: r.party_size,
        meetup_point: r.meetup_point,
        drop_off: r.drop_off,
        ride_options: r.ride_options || [],
        start_time: new Date(r.start_time),
        expiry_timestamp: r.expiry_timestamp ? new Date(r.expiry_timestamp) : null,
        host_university: r.host_university,
        display_university: Boolean(r.display_university),
        is_active: r.is_active,
      } as SoiParty));

      const soiIds = list.map((item) => String(item.id));
      const membershipSet = new Set<string>();
      const membersBySoi = new Map<string, Array<{ user_id: string; status: string }>>();

      if (soiIds.length) {
        const { data: memberRows, error: memberError } = await supabase
          .from("soi_members")
          .select("soi_id, user_id, status")
          .in("soi_id", soiIds);

        if (!memberError && memberRows) {
          for (const row of memberRows) {
            if (row.status === "left" || row.status === "kicked") continue;
            const soiId = String(row.soi_id);
            const bucket = membersBySoi.get(soiId) ?? [];
            bucket.push({ user_id: row.user_id, status: row.status });
            membersBySoi.set(soiId, bucket);
            if (userId && row.user_id === userId) {
              membershipSet.add(soiId);
            }
          }
        }
      }

      const decorated = list.map((item) => {
        const viewerIsHost = Boolean(userId && userId === item.host_id);
        const partyMembers = membersBySoi.get(String(item.id)) ?? [];
        const hostAlreadyMember = partyMembers.some((member) => member.user_id === item.host_id);
        const joinedCount = partyMembers.length;
        const base = hostAlreadyMember ? 0 : 1;
        return {
          ...item,
          current_member_count: Math.max(1, joinedCount + base),
          user_is_member: viewerIsHost || membershipSet.has(String(item.id)),
        } as SoiParty;
      });

      setItems(decorated);
    } finally {
      if (!silent) setLoading(false);
    }
  }, [supabase, userId]);

  useEffect(() => {
    fetchSOIs();
  }, [fetchSOIs]);

  const handleJoin = async (id: number) => {
    const idx = items.findIndex((x) => x.id === id);
    if (idx < 0) return;

    const current = items[idx];
    if (current.user_is_member || (userId && current.host_id === userId)) {
      toast.info("You're already in this SOI.");
      return;
    }

    if ((current.current_member_count || 0) >= current.party_size) {
      toast.error("This SOI is full.");
      return;
    }

    const res = await soiMemberService.join(id);
    if (!res.success) {
      if (res.error && res.error.toLowerCase().includes("already")) {
        toast.info(res.error);
        const updated = [...items];
        updated[idx] = { ...current, user_is_member: true };
        setItems(updated);
      } else {
        toast.error(res.error || "Failed to join");
      }
      return;
    }

    toast.success("Joined");
    const updated = [...items];
    updated[idx] = {
      ...current,
      current_member_count: Math.min(
        current.party_size,
        (current.current_member_count || 0) + 1
      ),
      user_is_member: true,
    };
    setItems(updated);
    fetchSOIs({ silent: true });
  };

  const handleLeave = async (id: number) => {
    const idx = items.findIndex((x) => x.id === id);
    if (idx < 0) return;

    const current = items[idx];
    if (!current.user_is_member) {
      toast.info("You're not part of this SOI.");
      return;
    }

    const res = await soiMemberService.leave(id);
    if (!res.success) {
      toast.error(res.error || "Failed to leave");
      return;
    }

    toast.success("Left");
    const updated = [...items];
    updated[idx] = {
      ...current,
      current_member_count: Math.max(1, (current.current_member_count || 1) - 1),
      user_is_member: false,
    };
    setItems(updated);
    fetchSOIs({ silent: true });
  };

  const handleCancel = async (id: number) => {
    if (!confirm('Cancel this SOI? This will close it for everyone.')) return;
    const res = await soiPartyService.cancel(id);
    if (!res.success) return toast.error(res.error || 'Failed to cancel SOI');
    toast.success('SOI canceled');
    setItems((prev) => prev.filter((x) => x.id !== id));
    fetchSOIs({ silent: true });
  };

  if (loading) return <div className="text-sm text-muted-foreground">Loading upcoming rides…</div>;
  if (error) return <div className="text-sm text-destructive">{error}</div>;
  if (!items.length) return <div className="text-sm text-muted-foreground">No upcoming rides.</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-6">
      {items.map((s) => {
        const full = (s.current_member_count || 0) >= s.party_size;
        const countdown = formatCountdown(s.start_time);
        const isHost = userId && userId === s.host_id;
        const isMember = Boolean(s.user_is_member);
        return (
          <div key={s.id} className="bg-card border rounded-lg p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="font-semibold text-card-foreground">{s.meetup_point}</div>
              <div className="text-xs text-muted-foreground">Starts in {countdown}</div>
            </div>
            <div className="text-sm text-muted-foreground">→ {s.drop_off}</div>
            <div className="text-xs text-muted-foreground">{(s.ride_options || []).join(", ")}</div>
            <div className="text-sm">{s.current_member_count}/{s.party_size} interested</div>
            <div className="mt-2 flex gap-3">
              {isHost ? (
                <button
                  className="px-4 py-2 rounded-md text-sm border border-destructive text-destructive hover:bg-destructive/10"
                  onClick={() => handleCancel(s.id)}
                >
                  Cancel SOI
                </button>
              ) : (
                <>
                  {!isMember ? (
                    <button
                      className={`px-4 py-2 rounded-md text-sm ${full ? "bg-muted text-muted-foreground cursor-not-allowed" : "bg-primary text-primary-foreground hover:bg-primary/90"}`}
                      disabled={full}
                      onClick={() => handleJoin(s.id)}
                    >
                      {full ? "SOI full" : "I'm in"}
                    </button>
                  ) : (
                    <button
                      className="px-4 py-2 rounded-md text-sm border border-destructive text-destructive hover:bg-destructive/10"
                      onClick={() => handleLeave(s.id)}
                    >
                      I've changed my mind
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
