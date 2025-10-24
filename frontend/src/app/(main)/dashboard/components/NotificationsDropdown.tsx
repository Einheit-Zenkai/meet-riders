"use client";

import { Bell } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useNotificationsStore } from "@/stores/notificationsStore";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

export default function NotificationsDropdown() {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const notifications = useNotificationsStore((s) => s.notifications);
  const unreadCount = useNotificationsStore((s) => s.unreadCount());
  const markRead = useNotificationsStore((s) => s.markRead);
  const markAllRead = useNotificationsStore((s) => s.markAllRead);
  const addNotification = useNotificationsStore((s) => s.add);
  const removeNotification = useNotificationsStore((s) => s.remove);
  const supabase = createClient();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
      // Mark all as read when opening the dropdown so the red dot disappears
      markAllRead();
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showDropdown, markAllRead]);

  const onClickNotification = (id: string, href?: string) => {
    markRead(id);
    if (href) router.push(href);
    setShowDropdown(false);
  };

  // Realtime: listen for join requests for hosts and acceptance/decline updates for requesters
  useEffect(() => {
    let isMounted = true;
    (async () => {
      const { data: auth } = await supabase.auth.getUser();
      const currentUser = auth?.user;
      if (!currentUser || !isMounted) return;

      // Helper: fetch display name for a user
      const getDisplayName = async (userId: string): Promise<string> => {
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, nickname')
          .eq('id', userId)
          .single();
        return profile?.nickname || profile?.full_name || 'Someone';
      };

      // Helper: fetch party host id and short name/destination
      const getPartyInfo = async (partyId: string) => {
        const { data: party } = await supabase
          .from('parties')
          .select('id, host_id, drop_off')
          .eq('id', partyId)
          .single();
        return party;
      };

      // Channel for party_requests changes
      const channel = supabase
        .channel('party-requests-notifs')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'party_requests' }, async (payload) => {
          // New request created; if I'm the host of that party, notify me
          const rec: any = payload.new;
          const party = await getPartyInfo(String(rec.party_id));
          if (!party || party.host_id !== currentUser.id) return;
          const requesterName = await getDisplayName(String(rec.user_id));
          const notifId = `join-request:${rec.id || rec.request_id || rec.user_id + ':' + rec.party_id}`;
          addNotification({
            id: notifId,
            message: `${requesterName} is trying to join your party`,
            timestamp: new Date(),
            read: false,
            type: 'join_request',
            meta: {
              requestId: rec.id || rec.request_id,
              partyId: String(rec.party_id),
              requesterId: String(rec.user_id),
              requesterName,
            }
          });
        })
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'party_requests' }, async (payload) => {
          // Request updated; if I'm the requester, notify me on acceptance
          const rec: any = payload.new;
          if (String(rec.user_id) !== currentUser.id) return;
          const party = await getPartyInfo(String(rec.party_id));
          if (!party) return;
          const hostName = await getDisplayName(String(party.host_id));
          if (rec.status === 'accepted') {
            addNotification({
              id: `join-accepted:${rec.id || rec.request_id}`,
              message: `You have joined ${hostName}'s party`,
              timestamp: new Date(),
              read: false,
              type: 'success',
              href: '/current-party',
              meta: { partyId: String(rec.party_id) }
            });
          } else if (rec.status === 'declined') {
            addNotification({
              id: `join-declined:${rec.id || rec.request_id}`,
              message: `${hostName} declined your join request`,
              timestamp: new Date(),
              read: false,
              type: 'error',
              meta: { partyId: String(rec.party_id) }
            });
          }
        })
        .subscribe();

      return () => {
        isMounted = false;
        supabase.removeChannel(channel);
      };
    })();
  }, [supabase, addNotification]);

  const handleAccept = async (notifId: string, meta?: Record<string, any>) => {
    if (!meta) return;
    const { partyId, requesterId, requestId } = meta as any;
    // Add requester as party member, then mark request accepted
    const { error: insertErr } = await supabase
      .from('party_members')
      .insert({
        party_id: partyId,
        user_id: requesterId,
        status: 'joined',
        pickup_notes: null,
        contact_shared: false,
      });
    if (insertErr) {
      console.error('Failed to add requester to party:', insertErr);
      return;
    }
    const updater = supabase.from('party_requests').update({ status: 'accepted' });
    const { error: updateErr } = requestId
      ? await updater.eq('id', requestId).select()
      : await updater.eq('party_id', partyId).eq('user_id', requesterId).select();
    if (updateErr) {
      console.error('Failed to update request status:', updateErr);
      return;
    }
    removeNotification(notifId);
  };

  const handleDecline = async (notifId: string, meta?: Record<string, any>) => {
    if (!meta) return;
    const { partyId, requesterId, requestId } = meta as any;
    const updater = supabase.from('party_requests').update({ status: 'declined' });
    const { error } = requestId
      ? await updater.eq('id', requestId)
      : await updater.eq('party_id', partyId).eq('user_id', requesterId);
    if (error) {
      console.error('Failed to decline request:', error);
      return;
    }
    removeNotification(notifId);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        className="p-2 rounded-full border hover:bg-accent hover:shadow-[0_0_20px_4px_rgba(255,43,99,0.35)] relative"
        title="Notifications"
        onClick={() => setShowDropdown(!showDropdown)}
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>
      
      {showDropdown && (
        <div className="absolute right-0 mt-2 w-80 rounded-md border bg-card/95 backdrop-blur shadow-lg z-50 max-h-96 overflow-y-auto">
          <div className="p-3 border-b">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm">Notifications</h3>
              {unreadCount > 0 && (
                <button className="text-xs text-primary hover:underline" onClick={() => markAllRead()}>Mark all read</button>
              )}
            </div>
          </div>
          
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              No notifications
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((n) => (
                <div
                  key={n.id}
                  className={`w-full text-left p-3 ${!n.read ? 'bg-accent/20' : ''}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <p className="text-sm">{n.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {n.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                    {n.type !== 'join_request' && (
                      <button
                        onClick={() => onClickNotification(n.id, n.href)}
                        className="text-xs text-primary hover:underline"
                      >
                        View
                      </button>
                    )}
                  </div>
                  {n.type === 'join_request' && (
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => handleAccept(n.id, n.meta)}
                        className="px-2 py-1 text-xs rounded border border-green-300 bg-green-100 text-green-800 hover:shadow-[0_0_12px_2px_rgba(16,185,129,0.45)]"
                        title="Accept"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleDecline(n.id, n.meta)}
                        className="px-2 py-1 text-xs rounded border border-red-300 bg-red-100 text-red-800 hover:shadow-[0_0_12px_2px_rgba(239,68,68,0.45)]"
                        title="Decline"
                      >
                        Decline
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
