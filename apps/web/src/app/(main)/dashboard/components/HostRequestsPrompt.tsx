"use client";

import { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { partyMemberService } from "../services/partyMemberService";
import useAuthStore from "@/stores/authStore";
import { toast } from "sonner";

export default function HostRequestsPrompt() {
  const user = useAuthStore((s) => s.user);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<any[]>([]);
  const [busy, setBusy] = useState(false);

  const initials = (name?: string | null) => {
    if (!name) return "U";
    return name.split(" ").map(w => w[0]?.toUpperCase()).slice(0,2).join("");
  };

  const load = useMemo(() => async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await partyMemberService.getPendingRequestsForHost();
      if (res.success) {
        setRequests(res.requests || []);
        setOpen((res.requests || []).length > 0);
      } else {
        setRequests([]);
      }
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { load(); }, [load]);

  if (!user) return null;

  const current = requests[0];
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Join request</DialogTitle>
          <DialogDescription>
            Approve or ignore join requests for your parties.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="p-3 text-sm text-muted-foreground">Loading requests…</div>
        ) : !current ? (
          <div className="p-3 text-sm text-muted-foreground">No requests right now.</div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={current.userProfile?.avatar_url || ""} />
                <AvatarFallback>{initials(current.userProfile?.nickname || current.userProfile?.full_name)}</AvatarFallback>
              </Avatar>
              <div>
                <div className="font-medium">{current.userProfile?.nickname || current.userProfile?.full_name || 'User'}</div>
                <div className="text-sm text-muted-foreground">wants to join your ride to <span className="font-medium">{current.party?.drop_off || 'destination'}</span></div>
              </div>
            </div>
            <div className="text-xs text-muted-foreground">Requested {current.created_at.toLocaleString()}</div>
          </div>
        )}

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              // Not now: hide for this session but keep pending
              setOpen(false);
            }}
            disabled={busy || loading || !current}
          >
            Not now
          </Button>
          <Button
            variant="ghost"
            onClick={async () => {
              if (!current) return;
              setBusy(true);
              try {
                const res = await partyMemberService.declineRequest(current.id);
                if (!res.success) toast.error(res.error || 'Failed to ignore');
                setRequests(prev => prev.slice(1));
                if (requests.length <= 1) setOpen(false);
              } finally {
                setBusy(false);
              }
            }}
            disabled={busy || loading || !current}
          >
            Ignore
          </Button>
          <Button
            onClick={async () => {
              if (!current) return;
              setBusy(true);
              try {
                const res = await partyMemberService.approveRequest(current.id, current.party_id, current.user_id);
                if (!res.success) {
                  toast.error(res.error || 'Failed to approve');
                } else {
                  toast.success('Request approved');
                }
                setRequests(prev => prev.slice(1));
                if (requests.length <= 1) setOpen(false);
              } finally {
                setBusy(false);
              }
            }}
            disabled={busy || loading || !current}
          >
            Approve
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
