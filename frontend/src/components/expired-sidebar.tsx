'use client';

import { useEffect, useMemo, useState } from "react";
import { Clock, RotateCcw, ArchiveX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import useExpiredPartiesStore from "@/stores/expiredPartiesStore";
import { toast } from "sonner";

const TEN_MINUTES_MS = 10 * 60 * 1000;

const formatRelativeTime = (expiredAt: Date, now: number) => {
  const diffMs = now - expiredAt.getTime();

  if (diffMs < 0) {
    return "just now";
  }

  const minutes = Math.floor(diffMs / 1000 / 60);
  if (minutes <= 0) {
    return "just now";
  }
  if (minutes < 60) {
    return `${minutes} min${minutes === 1 ? "" : "s"} ago`;
  }

  const hours = Math.floor(minutes / 60);
  return `${hours} hr${hours === 1 ? "" : "s"} ago`;
};

export default function ExpiredSidebar() {
  const {
    expiredParties,
    refreshExpiredParties,
    markPartyRestored,
    pruneExpiredParties,
  } = useExpiredPartiesStore();

  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    refreshExpiredParties();
  }, [refreshExpiredParties]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setNow(Date.now());
      pruneExpiredParties();
    }, 30_000);

    return () => window.clearInterval(intervalId);
  }, [pruneExpiredParties]);

  const activeExpiredParties = useMemo(() => {
    const cutoff = now - TEN_MINUTES_MS;
    return expiredParties.filter((party) => party.expiredAt.getTime() >= cutoff);
  }, [expiredParties, now]);

  const handleRestore = (partyId: string) => {
    toast.info("Restore party", {
      description: "Supabase restore action will be wired up soon.",
    });
    markPartyRestored(partyId);
  };

  return (
    <aside className="fixed right-0 top-0 flex h-full flex-col bg-sidebar text-foreground shadow-lg transition-[width] duration-200 group group/expired-sidebar w-16 hover:w-80 z-50 pointer-events-auto">
      <header className="flex items-center gap-3 px-3 py-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent text-accent-foreground">
          <Clock className="h-5 w-5" strokeWidth={2.5} />
        </div>
        <div className="flex flex-col overflow-hidden">
          <span className="text-base font-semibold opacity-0 transition-opacity duration-200 group-hover/expired-sidebar:opacity-100">
            Expired Parties
          </span>
          <span className="text-xs text-muted-foreground opacity-0 transition-opacity duration-200 group-hover/expired-sidebar:opacity-100">
            Recently closed (last 10 min)
          </span>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-3 pb-6">
        {activeExpiredParties.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-muted-foreground/40 bg-background/30 px-4 py-8 opacity-0 transition-opacity duration-200 group-hover/expired-sidebar:opacity-100">
            <ArchiveX className="h-8 w-8 text-muted-foreground" strokeWidth={1.5} />
            <div className="text-sm text-muted-foreground text-center leading-relaxed">
              When a party ends, it will appear here for 10 minutes so hosts can bring it back online.
            </div>
          </div>
        ) : (
          <ul className="flex flex-col gap-4 opacity-0 transition-opacity duration-200 group-hover/expired-sidebar:opacity-100">
            {activeExpiredParties.map((party) => {
              const diffMs = now - party.expiredAt.getTime();
              const remainingMs = Math.max(TEN_MINUTES_MS - diffMs, 0);
              const remainingMinutes = Math.ceil(remainingMs / 1000 / 60);

              return (
                <li key={party.id} className="rounded-lg border border-border bg-background p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-card-foreground">
                        {party.title}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Expired {formatRelativeTime(party.expiredAt, now)}
                      </p>
                      {party.meetupPoint && (
                        <p className="mt-2 text-xs text-muted-foreground">
                          Meetup: {party.meetupPoint}
                        </p>
                      )}
                      {party.dropOff && (
                        <p className="mt-1 text-xs text-muted-foreground">
                          Drop-off: {party.dropOff}
                        </p>
                      )}
                      {party.hostName && (
                        <p className="mt-1 text-xs text-muted-foreground">
                          Host: {party.hostName}
                        </p>
                      )}
                      {(party.joinedCount ?? 0) > 0 && party.partySize ? (
                        <p className="mt-1 text-xs text-muted-foreground">
                          {party.joinedCount} / {party.partySize} riders joined
                        </p>
                      ) : null}
                    </div>
                    {party.canRestore ? (
                      <Button
                        size="sm"
                        variant="secondary"
                        className={cn(
                          "shrink-0 whitespace-nowrap",
                          remainingMinutes <= 2 && "border-destructive text-destructive"
                        )}
                        onClick={() => handleRestore(party.id)}
                      >
                        <RotateCcw className="mr-2 h-4 w-4" />
                        Restore
                      </Button>
                    ) : (
                      <span className="text-xs font-medium text-muted-foreground">
                        View only
                      </span>
                    )}
                  </div>

                  <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary transition-all"
                      style={{ width: `${Math.max((remainingMs / TEN_MINUTES_MS) * 100, 0)}%` }}
                    />
                  </div>

                  <div className="mt-2 text-xs text-muted-foreground">
                    {remainingMinutes > 0
                      ? `${remainingMinutes} min${remainingMinutes === 1 ? "" : "s"} left to restore`
                      : "Expired party will disappear shortly"}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </aside>
  );
}
