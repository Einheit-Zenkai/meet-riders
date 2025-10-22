import React, { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";

interface PartyRequestProps {
  partyId: number;
  userId: number;
  hostId: number;
}

const supabase = createClient();

const PartyRequest: React.FC<PartyRequestProps> = ({ partyId, userId, hostId }) => {
  const [status, setStatus] = useState("pending");

  const sendRequest = async () => {
    try {
      const { error } = await supabase.from("party_requests").insert({
        party_id: partyId,
        user_id: userId,
      });
      if (error) throw error;
      setStatus("sent");
    } catch (error) {
      console.error("Failed to send request:", error);
    }
  };

  const updateRequest = async (requestId: number, newStatus: string) => {
    try {
      const { error } = await supabase.from("party_requests").update({ status: newStatus }).eq("request_id", requestId);
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
          setStatus(data[0].status);
        }
      } catch (error) {
        console.error("Failed to fetch requests:", error);
      }
    };

    fetchRequests();
  }, [partyId, userId]);

  return (
    <div>
      {status === "pending" && <button onClick={sendRequest}>Send Request</button>}
      {status === "sent" && <p>Request has been sent.</p>}
      {status === "accepted" && <p>You are in the party!</p>}
      {status === "declined" && <p>Host declined your request.</p>}
    </div>
  );
};

export default PartyRequest;