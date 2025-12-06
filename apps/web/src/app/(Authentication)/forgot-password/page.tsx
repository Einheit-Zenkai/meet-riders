"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/utils/supabase/client";

export default function ForgotPasswordPage() {
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/update-password`,
    });

    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      setMessage(
        "If an account with that email exists, a password reset link has been sent."
      );
    }
  };

  return (
    <div className="relative flex h-screen items-center justify-center bg-background">
      <div className="absolute top-4 left-4">
        <Button asChild variant="outline">
          <Link href="/login">Back to Login</Link>
        </Button>
      </div>
      <div className="w-full max-w-md p-8 border rounded-2xl shadow-lg bg-card">
        <h2 className="text-3xl font-bold text-center mb-6 text-foreground">
          Forgot Password
        </h2>
        <p className="text-center text-sm text-muted-foreground mb-6">
          Enter your email address and we will send you a link to reset your
          password.
        </p>
        <form onSubmit={handlePasswordReset}>
          <div className="mb-4">
            <label
              className="block text-foreground text-sm font-bold mb-2"
              htmlFor="email"
            >
              Email Address
            </label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          {error && (
            <p className="text-destructive text-center text-sm mb-4">{error}</p>
          )}
          {message && (
            <p className="text-green-600 text-center text-sm mb-4">{message}</p>
          )}
          <Button className="w-full" type="submit" disabled={loading}>
            {loading ? "Sending..." : "Send Reset Link"}
          </Button>
        </form>
      </div>
    </div>
  );
}
