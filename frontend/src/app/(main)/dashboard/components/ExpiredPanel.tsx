"use client";

import { useEffect, useState } from "react";
import { expiredPartyService } from "../services/expiredPartyService";
import type { ExpiredParty } from "../types";
import { RotateCcw } from "lucide-react";
import { toast } from "sonner";

export default function ExpiredPanel() {
  const [items, setItems] = useState<ExpiredParty[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    const res = await expiredPartyService.listRecent();
    if (res.error) setError(res.error);
    setItems(res.items);
    setLoading(false);
  };

  useEffect(() => {
    load();
    const id = setInterval(load, 60_000); // refresh every minute
    return () => clearInterval(id);
  }, []);

  const restore = async (expiredId: number) => {
    const res = await expiredPartyService.restore(expiredId);
    if (!res.success) return toast.error(res.error || 'Failed to restore');
    toast.success('Party restored');
    setItems(prev => prev.filter(i => i.id !== expiredId));
  };

  return (
    <aside className="hidden xl:flex flex-col w-80 shrink-0 border-l pl-4 sticky top-0 h-[calc(100vh-80px)]">
      <h3 className="text-lg font-semibold text-card-foreground mb-3">Expired recently</h3>
      <div className="flex-1 overflow-auto space-y-3 pr-2">
        {loading && <div className="text-sm text-muted-foreground">Loading…</div>}
        {error && (
          <div className="text-sm text-destructive">
            {error.includes('expired_parties') || error.toLowerCase().includes('relation')
              ? 'Expired table not found. Run the SQL to create public.expired_parties to enable this panel.'
              : error}
          </div>
        )}
        {!loading && !error && items.length === 0 && null}
        {items.map(item => (
          <div key={item.id} className="border rounded-lg p-3 bg-card">
            <div className="text-xs text-muted-foreground truncate">{item.host_profile?.nickname || item.host_profile?.full_name || 'Host'}</div>
            <div className="text-sm font-medium truncate">{item.meetup_point}</div>
            <div className="text-xs text-muted-foreground truncate">→ {item.drop_off}</div>
            <div className="mt-2 flex justify-between items-center">
              <span className="text-xs text-muted-foreground">Expired {timeAgo(item.expired_at)}</span>
              <button
                className="inline-flex items-center gap-1 text-xs px-2 py-1 border rounded hover:bg-accent"
                onClick={() => restore(item.id)}
                title="Restore"
              >
                <RotateCcw className="w-3 h-3" /> Restore
              </button>
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}

function timeAgo(date: Date) {
  const diff = Math.floor((Date.now() - date.getTime()) / 60000);
  if (diff <= 0) return 'now';
  if (diff < 60) return `${diff}m ago`;
  const h = Math.floor(diff / 60);
  const m = diff % 60;
  return `${h}h ${m}m ago`;
}
