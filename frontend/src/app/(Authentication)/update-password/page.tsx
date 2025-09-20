"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/utils/supabase/client";

export default function UpdatePasswordPage() {
  const supabase = createClient();
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasSession, setHasSession] = useState(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setHasSession(true);
    });
    return () => subscription.unsubscribe();
  }, [supabase]);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    setError("");
    setMessage("");

    const { error } = await supabase.auth.updateUser({ password });

    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      setMessage("Your password has been updated successfully! You can now log in.");
      setTimeout(() => router.push('/login'), 2500);
    }
  };

  return (
    <div className="relative flex h-screen items-center justify-center bg-background">
      <div className="w-full max-w-md p-8 border rounded-2xl shadow-lg bg-card">
        <h2 className="text-3xl font-bold text-center mb-6 text-foreground">Set a New Password</h2>
        {hasSession ? (
          <form onSubmit={handleUpdatePassword}>
            <div className="mb-4">
              <label className="block text-foreground text-sm font-bold mb-2" htmlFor="password">
                New Password
              </label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <div className="mb-4">
              <label className="block text-foreground text-sm font-bold mb-2" htmlFor="confirmPassword">
                Confirm New Password
              </label>
              <Input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
            </div>
            {error && <p className="text-destructive text-center text-sm mb-4">{error}</p>}
            {message && <p className="text-green-600 text-center text-sm mb-4">{message}</p>}
            <Button className="w-full" type="submit" disabled={loading}>
              {loading ? "Updating..." : "Update Password"}
            </Button>
          </form>
        ) : (
          <p className="text-center text-muted-foreground">Please click the link in your email to get here.</p>
        )}
      </div>
    </div>
  );
}
