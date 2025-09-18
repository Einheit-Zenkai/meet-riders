"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { createClient } from "@/utils/supabase/client";

type Profile = {
  id: string;
  email: string | null;
  full_name?: string | null;
};

export default function ProfilePage() {
  const supabase = createClient();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      setError(null);
      setMessage(null);
      setLoading(true);
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.replace("/login");
        return;
      }

      const user = session.user;
      const email = user.email ?? null;
      if (isMounted) {
        setProfile({ id: user.id, email });
      }

      // Optional: load an existing profile row if you have a `profiles` table
      // const { data: rows } = await supabase
      //   .from("profiles")
      //   .select("full_name")
      //   .eq("id", user.id)
      //   .maybeSingle();
      // if (rows && isMounted) setFullName(rows.full_name ?? "");

      if (isMounted) setLoading(false);
    })();
    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.replace("/");
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    if (!profile) return;

    // Placeholder: upsert to your profiles table if available
    // const { error } = await supabase
    //   .from("profiles")
    //   .upsert({ id: profile.id, full_name: fullName })
    //   .select()
    //   .single();

    // For now, just show a success message to confirm UI works
    setMessage("Saved (demo)");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-muted-foreground">Loading profile…</p>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="container max-w-2xl mx-auto p-6">
      <div className="mb-4 flex items-center justify-between">
        <Button asChild variant="outline">
          <Link href="/">Home</Link>
        </Button>
        <Button variant="secondary" onClick={handleSignOut}>
          Sign out
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-muted-foreground mb-1">Email</label>
              <Input value={profile.email ?? ""} disabled readOnly />
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm text-muted-foreground mb-1">Full name</label>
                <Input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Your name"
                />
              </div>

              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}
              {message && (
                <p className="text-sm text-green-600">{message}</p>
              )}

              <Button type="submit">Save</Button>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
