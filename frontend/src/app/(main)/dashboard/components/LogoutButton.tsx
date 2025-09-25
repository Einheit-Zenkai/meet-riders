"use client";

import { LogOut } from "lucide-react";
import { useState } from "react";
import { createClient } from "@/utils/supabase/client";

export default function LogoutButton() {
  const [showDialog, setShowDialog] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout error:', error);
      setIsLoggingOut(false);
    }
  };

  return (
    <>
      <button
        className="p-2 rounded-md border hover:bg-accent flex items-center gap-2 transition-colors"
        title="Log out"
        onClick={() => setShowDialog(true)}
      >
        <LogOut className="w-5 h-5" />
        <span className="hidden sm:inline">Log out</span>
      </button>

      {/* Confirm dialog */}
      {showDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-card border rounded-lg shadow-lg w-full max-w-sm p-5">
            <h2 className="text-lg font-semibold mb-2">Sign out</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Are you sure you want to log out?
            </p>
            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 rounded-md border hover:bg-accent transition-colors"
                onClick={() => setShowDialog(false)}
                disabled={isLoggingOut}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 rounded-md bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors disabled:opacity-50"
                onClick={handleLogout}
                disabled={isLoggingOut}
              >
                {isLoggingOut ? 'Logging out...' : 'Yes, log out'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
