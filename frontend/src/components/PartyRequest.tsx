import React, { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";

interface PartyRequestProps {
  partyId: number;
  userId: number;
  hostId: number;
}

const supabase = createClient();

const PartyRequest: React.FC<PartyRequestProps> = ({ partyId, userId, hostId }) => {
  const [status, setStatus] = useState<"idle" | "pending" | "accepted" | "declined">("idle");

  const sendRequest = async () => {
    try {
      const { error } = await supabase.from("party_requests").insert({
        party_id: partyId,
        user_id: userId,
        status: 'pending',
      });
      if (error) throw error;
      setStatus("pending");
    } catch (error) {
      console.error("Failed to send request:", error);
    }
  };

  const updateRequest = async (requestId: number, newStatus: "accepted" | "declined") => {
    try {
      const { error } = await supabase
        .from("party_requests")
        .update({ status: newStatus })
        .or(`id.eq.${requestId},request_id.eq.${requestId}`);
      if (error) throw error;
      setStatus(newStatus);
    } catch (error) {
      console.error("Failed to update request:", error);
    }
  };

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const { data, error } = await supabase
          .from("party_requests")
          .select("*")
          .eq("party_id", partyId)
          .eq("user_id", userId);
        if (error) throw error;
        if (data && data.length > 0) {
          const s = (data[0].status || '').toLowerCase();
          if (s === 'accepted' || s === 'declined' || s === 'pending') {
            setStatus(s as any);
          }
        }
      } catch (error) {
        console.error("Failed to fetch requests:", error);
      }
    };

    fetchRequests();
  }, [partyId, userId]);

  return (
    <div>
      {status === "idle" && (
        <button onClick={sendRequest} className="px-3 py-1 rounded border bg-accent/30 hover:bg-accent/50">
          Send Join Request
        </button>
      )}
      {status === "pending" && <p className="text-sm text-muted-foreground">Request pending…</p>}
      {status === "accepted" && <p className="text-sm text-green-600">You are in the party!</p>}
      {status === "declined" && <p className="text-sm text-red-600">Host declined your request.</p>}
    </div>
  );
};

export default PartyRequest;