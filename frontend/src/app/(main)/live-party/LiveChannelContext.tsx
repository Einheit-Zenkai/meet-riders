"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import useAuthStore from "@/stores/authStore";
import { toast } from "sonner";

type LocationPayload = { uid: string; lat: number; lng: number; ts: number };
type ChatPayload = { uid: string; text: string; ts: number };

interface LiveMessage extends ChatPayload { id: string }

interface LiveChannelValue {
  partyId: string;
  sendLocation: (loc: { lat: number; lng: number }) => void;
  sendChat: (text: string) => void;
  locations: Record<string, LocationPayload>;
  messages: LiveMessage[];
}

const LiveChannelCtx = createContext<LiveChannelValue | null>(null);

export function useLiveChannel() {
  const ctx = useContext(LiveChannelCtx);
  if (!ctx) throw new Error("useLiveChannel must be used within LiveChannelProvider");
  return ctx;
}

export function LiveChannelProvider({ partyId, children }: { partyId: string; children: React.ReactNode }) {
  const supabase = useMemo(() => createClient(), []);
  const user = useAuthStore(s => s.user);
  const [locations, setLocations] = useState<Record<string, LocationPayload>>({});
  const [messages, setMessages] = useState<LiveMessage[]>([]);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  useEffect(() => {
    if (!user) return;
    const channel = supabase.channel(`party:${partyId}`, {
      config: { broadcast: { self: true }, presence: { key: user.id } },
    });

    const sharers = new Set<string>();

    channel.on("broadcast", { event: "location" }, ({ payload }) => {
      const data = payload as LocationPayload;
      if (!data?.uid) return;
      if (!sharers.has(data.uid)) {
        sharers.add(data.uid);
        if (data.uid !== user.id) {
          toast.message("Location sharing", { description: `${data.uid.slice(0,6)}… started sharing` });
        }
      }
      setLocations(prev => ({ ...prev, [data.uid]: data }));
    });

    channel.on("broadcast", { event: "chat" }, ({ payload }) => {
      const data = payload as ChatPayload;
      if (!data?.uid || typeof data.text !== "string") return;
      const msg: LiveMessage = { id: `${data.uid}:${data.ts}`, ...data };
      setMessages(prev => (prev.find(m => m.id === msg.id) ? prev : [...prev, msg]));
      if (data.uid !== user.id) {
        // light notification
        toast.message("New message", { description: data.text });
      }
    });

    channel.subscribe(status => {
      if (status === "SUBSCRIBED") {
        // Optionally announce presence
      }
    });

    channelRef.current = channel;
    return () => {
      channel.unsubscribe();
      channelRef.current = null;
    };
  }, [supabase, partyId, user]);

  const sendLocation = useCallback((loc: { lat: number; lng: number }) => {
    if (!user || !channelRef.current) return;
    channelRef.current.send({
      type: "broadcast",
      event: "location",
      payload: { uid: user.id, lat: loc.lat, lng: loc.lng, ts: Date.now() },
    });
  }, [user]);

  const sendChat = useCallback((text: string) => {
    if (!user || !channelRef.current || !text.trim()) return;
    channelRef.current.send({
      type: "broadcast",
      event: "chat",
      payload: { uid: user.id, text: text.trim(), ts: Date.now() },
    });
  }, [user]);

  const value: LiveChannelValue = useMemo(
    () => ({ partyId, sendLocation, sendChat, locations, messages }),
    [partyId, sendLocation, sendChat, locations, messages]
  );

  return <LiveChannelCtx.Provider value={value}>{children}</LiveChannelCtx.Provider>;
}
