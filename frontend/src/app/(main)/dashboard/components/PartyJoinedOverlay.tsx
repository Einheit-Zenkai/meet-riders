"use client";

import { useEffect, useState } from "react";
import { X, Crown, Users, MapPin, UserX } from "lucide-react";
import { Party, PartyMember } from "../types";
import { partyMemberService } from "../services/partyMemberService";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import useAuthStore from "@/stores/authStore";

interface PartyJoinedOverlayProps {
  party: Party;
  onClose: () => void;
  onAfterLeave?: () => void; // optional refresher
}

export default function PartyJoinedOverlay({ party, onClose, onAfterLeave }: PartyJoinedOverlayProps) {
  const [members, setMembers] = useState<PartyMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [leaving, setLeaving] = useState(false);
  const { user } = useAuthStore();
  const isHost = user?.id === party.host_id;

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      const res = await partyMemberService.getPartyMembers(party.id);
      if (mounted) {
        if (res.success && res.members) setMembers(res.members);
        setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [party.id]);

  const getHostDisplay = () => party.host_profile?.nickname || party.host_profile?.full_name || "Host";
  const getInitials = (name?: string | null) => {
    if (!name) return "U";
    return name.split(" ").map(w => w[0]?.toUpperCase()).slice(0,2).join("");
  };

  const handleLeave = async () => {
    const ok = confirm("Are you sure you want to leave this party?");
    if (!ok) return;
    setLeaving(true);
    const res = await partyMemberService.leaveParty(party.id);
    if (!res.success) {
      toast.error(res.error || "Failed to leave party");
      setLeaving(false);
      return;
    }
    toast.success("Left the party");
    setLeaving(false);
    onClose();
    onAfterLeave?.();
  };

  const handleKick = async (member: PartyMember) => {
    if (!isHost) return;
    const ok = confirm(`Kick ${member.profile?.nickname || member.profile?.full_name || 'this user'} from the party?`);
    if (!ok) return;
    try {
      const res = await partyMemberService.kickMember(party.id, member.user_id);
      if (!res.success) return toast.error(res.error || 'Failed to kick');
      toast.success('Member removed');
      setMembers(prev => prev.filter(m => m.user_id !== member.user_id));
    } catch (e) {
      toast.error('Failed to kick');
    }
  };

  return (
    <div className="fixed inset-0 z-[70]">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Sheet */}
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-3xl rounded-xl border bg-card shadow-2xl overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-xl font-semibold">You joined a party</h2>
            <button aria-label="Close" className="p-2 hover:bg-muted rounded-md" onClick={onClose}>
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Route + host */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Avatar className="w-12 h-12">
                  {party.host_profile?.avatar_url ? (
                    <img src={party.host_profile.avatar_url} alt="Host avatar" className="w-full h-full object-cover rounded-full" />
                  ) : (
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                      {getInitials(party.host_profile?.nickname || party.host_profile?.full_name)}
                    </AvatarFallback>
                  )}
                </Avatar>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-lg truncate">{getHostDisplay()}</span>
                    <Crown className="w-4 h-4 text-primary" />
                  </div>
                  <div className="text-sm text-muted-foreground">Host</div>
                </div>
              </div>

              <div className="space-y-2 p-3 rounded-lg bg-muted/40">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 mt-0.5 text-muted-foreground" />
                  <div className="text-sm">
                    <div><span className="text-muted-foreground">From:</span> <span className="font-medium">{party.meetup_point}</span></div>
                    <div><span className="text-muted-foreground">To:</span> <span className="font-medium">{party.drop_off}</span></div>
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">
                  {party.ride_options && party.ride_options.length > 0 ? party.ride_options.join(", ") : "Any ride"}
                </div>
              </div>

              <div className="pt-2 space-y-3">
                {party.host_profile?.show_phone && party.host_profile?.phone_number && (
                  <div className="text-sm p-3 rounded-md bg-muted/40">
                    <div className="text-muted-foreground">Host contact</div>
                    <div className="font-semibold">{party.host_profile.phone_number}</div>
                  </div>
                )}
                <Button variant="destructive" onClick={handleLeave} disabled={leaving} className="w-full">
                  {leaving ? "Leaving…" : "Leave Party"}
                </Button>
              </div>
            </div>

            {/* Members */}
            <div className="space-y-3">
              <div className="flex items-center gap-2"><Users className="w-4 h-4" /><span className="font-medium">Current members</span></div>
              {loading ? (
                <div className="space-y-2">
                  {[...Array(3)].map((_,i)=> (
                    <div key={i} className="flex items-center gap-3 p-2 animate-pulse">
                      <div className="w-8 h-8 rounded-full bg-muted" />
                      <div className="h-3 w-28 rounded bg-muted" />
                    </div>
                  ))}
                </div>
              ) : members.length === 0 ? (
                <div className="text-sm text-muted-foreground">No other members yet</div>
              ) : (
                <div className="space-y-2 max-h-72 overflow-auto pr-1">
                  {members.map(m => (
                    <div key={m.id} className="flex items-center gap-3 p-2 rounded hover:bg-muted/40 justify-between">
                      <Avatar className="w-8 h-8">
                        {m.profile?.avatar_url ? (
                          <img src={m.profile.avatar_url} className="w-full h-full object-cover rounded-full" alt="avatar" />
                        ) : (
                          <AvatarFallback className="bg-secondary/20 text-secondary-foreground font-semibold">
                            {getInitials(m.profile?.nickname || m.profile?.full_name)}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <div className="truncate text-sm font-medium flex-1">{m.profile?.nickname || m.profile?.full_name || "Member"}</div>
                      {isHost && m.user_id !== party.host_id && (
                        <button
                          className="inline-flex items-center gap-1 text-xs px-2 py-1 border rounded hover:bg-accent"
                          onClick={() => handleKick(m)}
                          title="Kick"
                        >
                          <UserX className="w-3 h-3" /> Kick
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
