"use client";

import { useEffect } from "react";
import useAuthStore from "@/stores/authStore";
import usePartyStore from "@/stores/partyStore";

export function StoreInitializer() {
  useEffect(() => {
    useAuthStore.getState().init();
    const cleanupParties = usePartyStore.getState().startCleanup();

    return () => {
      cleanupParties();
    };
  }, []);

  return null;
}
