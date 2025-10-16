"use client";

import Link from "next/link";
import { useEffect } from "react";
import useExpiredPartiesStore from "@/stores/expiredPartiesStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, RefreshCcw } from "lucide-react";

export default function ExpiredPartiesPage() {
  const { expiredParties, isRefreshing, refreshExpiredParties } = useExpiredPartiesStore();

  useEffect(() => {
    // initial prune/refresh
    refreshExpiredParties();
  }, [refreshExpiredParties]);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-4 flex items-center justify-between">
        <Button asChild variant="outline"><Link href="/dashboard">← Back</Link></Button>
        <h1 className="text-xl font-semibold flex items-center gap-2"><Clock className="h-5 w-5" /> Expired Parties</h1>
        <Button onClick={refreshExpiredParties} disabled={isRefreshing} variant="secondary">
          <RefreshCcw className="h-4 w-4 mr-2" /> {isRefreshing ? "Refreshing…" : "Refresh"}
        </Button>
      </div>

      {expiredParties.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No expired parties in the last 10 minutes.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {expiredParties.map(p => (
            <Card key={p.id} className="border bg-card/70">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">
                  {p.title || p.dropOff || "Party"}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div><span className="font-medium text-foreground">Expired:</span> {p.expiredAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                  {p.meetupPoint && <div><span className="font-medium text-foreground">Meetup:</span> {p.meetupPoint}</div>}
                  {p.dropOff && <div><span className="font-medium text-foreground">Drop-off:</span> {p.dropOff}</div>}
                  {p.hostName && <div><span className="font-medium text-foreground">Host:</span> {p.hostName}</div>}
                  {(p.partySize || p.joinedCount) && (
                    <div><span className="font-medium text-foreground">Party size:</span> {p.joinedCount ?? 0}/{p.partySize ?? '-'} </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
