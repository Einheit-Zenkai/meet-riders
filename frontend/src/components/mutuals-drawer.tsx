"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import useAuthStore from "@/stores/authStore";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { ChevronLeft, Users } from "lucide-react";

type MiniProfile = {
  id: string;
  username: string | null;
  nickname: string | null;
  avatar_url: string | null;
};

export default function MutualsDrawer() {
  const supabase = createClient();
  const { user } = useAuthStore();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<MiniProfile[]>([]);
  const [q, setQ] = useState("");

  const toggle = () => setOpen((o) => !o);

  useEffect(() => {
    const load = async () => {
      if (!user) { setItems([]); return; }
      setLoading(true);
      try {
        // Get accepted connections for current user (IDs only)
        const { data: conns } = await supabase
          .from("connections")
          .select("requester_id, addressee_id, status")
          .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`)
          .eq("status", "accepted");

        const otherIds = new Set<string>();
        (conns || []).forEach((c: any) => {
          otherIds.add(c.requester_id === user.id ? c.addressee_id : c.requester_id);
        });
        if (otherIds.size === 0) { setItems([]); setLoading(false); return; }

        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, username, nickname, avatar_url")
          .in("id", Array.from(otherIds));

        setItems((profiles || []) as MiniProfile[]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [supabase, user]);

  const filtered = useMemo(() => {
    const k = q.trim().toLowerCase();
    if (!k) return items;
    return items.filter((p) =>
      (p.nickname || "").toLowerCase().includes(k) ||
      (p.username || "").toLowerCase().includes(k)
    );
  }, [items, q]);

  return (
    <>
      {/* Toggle handle */}
      <button
        aria-label="Open mutuals"
        onClick={toggle}
        className="fixed right-0 top-1/2 -translate-y-1/2 z-[65] bg-primary text-primary-foreground rounded-l-md px-2 py-3 shadow-lg hover:opacity-90"
      >
        <ChevronLeft className={cn("h-5 w-5 transition-transform", open ? "rotate-180" : "rotate-0")} />
      </button>

      {/* Drawer */}
      <aside
        className={cn(
          "fixed top-0 bottom-0 right-0 w-[380px] max-w-[85vw] z-[64] border-l bg-background/80 backdrop-blur shadow-2xl transition-transform duration-300",
          open ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="h-full flex flex-col">
          <div className="p-4 border-b flex items-center gap-2">
            <Users className="h-5 w-5" />
            <h3 className="font-semibold">Your Mutuals</h3>
          </div>
          <div className="p-4">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search mutuals..."
              className="w-full rounded-md bg-muted px-3 py-2 text-sm outline-none"
            />
          </div>
          <div className="flex-1 overflow-y-auto px-3 pb-24 space-y-2">
            {loading ? (
              <p className="text-sm text-muted-foreground px-1">Loading…</p>
            ) : filtered.length === 0 ? (
              <p className="text-sm text-muted-foreground px-1">No mutuals found.</p>
            ) : (
              filtered.map((m) => (
                <div key={m.id} className="flex items-center justify-between gap-3 rounded-md border bg-card/60 backdrop-blur px-3 py-2">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={m.avatar_url ?? undefined} />
                      <AvatarFallback>{(m.nickname || m.username || "?").slice(0,2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="text-sm">
                      <div className="font-medium">{m.nickname || m.username || "User"}</div>
                      {m.username && <div className="text-xs text-muted-foreground">@{m.username}</div>}
                    </div>
                  </div>
                  <Button asChild size="sm" variant="outline">
                    <Link href={user?.id === m.id ? "/profile" : `/profile/id/${m.id}`}>View</Link>
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
