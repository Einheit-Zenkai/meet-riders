"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import useAuthStore from "@/stores/authStore";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Users } from "lucide-react";

interface SimpleParty {
  id: string;
  drop_off: string | null;
  meetup_point: string | null;
  expires_at: Date;
}

export default function CurrentPartySection() {
  const user = useAuthStore((s) => s.user);
  const supabase = useMemo(() => createClient(), []);
  const [loading, setLoading] = useState(true);
  const [parties, setParties] = useState<SimpleParty[]>([]);

  useEffect(() => {
    const load = async () => {
      if (!user) { setParties([]); setLoading(false); return; }
      setLoading(true);
      try {
        const nowIso = new Date().toISOString();
        const fields = "id, drop_off, meetup_point, expires_at";

        // Parties you host
        const { data: hosting } = await supabase
          .from("parties")
          .select(fields)
          .eq("host_id", user.id)
          .eq("is_active", true)
          .gt("expires_at", nowIso)
          .order("expires_at", { ascending: true });

        // Parties you joined
        const { data: pm } = await supabase
          .from("party_members")
          .select("party_id")
          .eq("user_id", user.id)
          .eq("status", "joined");
        const joinedIds = (pm || []).map((r: any) => r.party_id);

        let joined: any[] = [];
        if (joinedIds.length) {
          const { data } = await supabase
            .from("parties")
            .select(fields)
            .in("id", joinedIds)
            .eq("is_active", true)
            .gt("expires_at", nowIso)
            .order("expires_at", { ascending: true });
          joined = data || [];
        }

        // Merge unique by id
        const map = new Map<string, any>();
        [...(hosting || []), ...joined].forEach((p: any) => map.set(p.id, p));
        const merged = Array.from(map.values()).map((p: any) => ({
          id: p.id,
          drop_off: p.drop_off ?? null,
          meetup_point: p.meetup_point ?? null,
          expires_at: new Date(p.expires_at),
        }));
        setParties(merged);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [supabase, user]);

  return (
    <div>
      <h2 className="text-2xl font-semibold text-card-foreground mb-4">Current Party</h2>
      {loading ? (
        <Card><CardContent className="p-6 text-sm text-muted-foreground">Checking your current party…</CardContent></Card>
      ) : parties.length === 0 ? (
        <Card><CardContent className="p-6 text-sm text-muted-foreground">Youre not in a party right now.</CardContent></Card>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {parties.map((p) => (
            <Card key={p.id}>
              <CardContent className="p-4 flex items-center justify-between">
                <div className="space-y-1">
                  <div className="text-base font-medium">Ride to {p.drop_off || "destination"}</div>
                  <div className="text-sm text-muted-foreground flex items-center gap-2">
                    <MapPin className="h-4 w-4" /> {p.meetup_point || "Meetup TBD"}
                  </div>
                </div>
                <Button asChild>
                  <Link href="/current-party">Open</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
