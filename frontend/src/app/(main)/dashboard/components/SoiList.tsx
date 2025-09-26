"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import type { SoiParty, SoiMember } from "../types";
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

  useEffect(() => {
    const fetchSOIs = async () => {
      setLoading(true);
      setError(null);
      // active SOIs that haven't started more than 10 minutes ago
      const { data, error } = await supabase
        .from("soi_parties")
        .select("*")
        .eq("is_active", true)
        .gte("start_time", new Date(Date.now() - 10 * 60 * 1000).toISOString())
        .order("start_time", { ascending: true });

      if (error) {
        setError(error.message);
        setLoading(false);
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
        display_university: r.display_university,
        is_active: r.is_active,
      } as SoiParty));

      // fetch member counts via RPC and add +1 for host
      const withCounts = await Promise.all(
        list.map(async (item) => {
          try {
            const { data: countData, error: countErr } = await supabase.rpc('get_soi_member_count', { p_soi_id: item.id });
            const count = typeof countData === 'number' ? countData : (countData?.count ?? 0);
            return { ...item, current_member_count: (count || 0) + 1 } as SoiParty;
          } catch {
            return { ...item, current_member_count: 1 } as SoiParty;
          }
        })
      );

      setItems(withCounts);
      setLoading(false);
    };
    fetchSOIs();
  }, [supabase]);

  const handleJoin = async (id: number) => {
    const res = await soiMemberService.join(id);
  if (!res.success) return toast.error(res.error || 'Failed to join');
  toast.success('Joined');
    // refresh list
    const idx = items.findIndex(x => x.id === id);
    if (idx >= 0) {
      const updated = [...items];
      updated[idx] = { ...updated[idx], current_member_count: (updated[idx].current_member_count || 0) + 1 };
      setItems(updated);
    }
  };

  const handleLeave = async (id: number) => {
    const res = await soiMemberService.leave(id);
  if (!res.success) return toast.error(res.error || 'Failed to leave');
  toast.success('Left');
    const idx = items.findIndex(x => x.id === id);
    if (idx >= 0) {
      const updated = [...items];
      updated[idx] = { ...updated[idx], current_member_count: Math.max(0, (updated[idx].current_member_count || 0) - 1) };
      setItems(updated);
    }
  };

  const handleCancel = async (id: number) => {
    if (!confirm('Cancel this SOI? This will close it for everyone.')) return;
    const res = await soiPartyService.cancel(id);
  if (!res.success) return toast.error(res.error || 'Failed to cancel SOI');
  toast.success('SOI canceled');
    setItems(prev => prev.filter(x => x.id !== id));
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
                  <button
                    className={`px-4 py-2 rounded-md text-sm ${full ? 'bg-muted text-muted-foreground cursor-not-allowed' : 'bg-primary text-primary-foreground hover:bg-primary/90'}`}
                    disabled={full}
                    onClick={() => handleJoin(s.id)}
                  >
                    I'm in
                  </button>
                  <button
                    className="px-4 py-2 rounded-md text-sm border hover:bg-accent"
                    onClick={() => handleLeave(s.id)}
                  >
                    Change my mind
                  </button>
                </>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
