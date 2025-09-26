"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

function Report() {
  const router = useRouter();
  const params = useSearchParams();
  const targetId = params.get("id");
  const targetType = params.get("type") || "item"; // general purpose, defaults to item

  const [reason, setReason] = useState<string>("harassment");
  const [details, setDetails] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [submitted, setSubmitted] = useState<boolean>(false);

  const backHref = useMemo(() => {
    if (targetType === "user" && targetId) return `/profile/${targetId}`;
    return "/dashboard";
  }, [targetType, targetId]);

  useEffect(() => {
    if (submitted) {
      const t = setTimeout(() => router.replace(backHref), 1500);
      return () => clearTimeout(t);
    }
  }, [submitted, router, backHref]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    // Dummy submit – simulate a short delay
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
    }, 800);
  };

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Report {targetType === "user" ? "User" : "Content"}</CardTitle>
        </CardHeader>
        <CardContent>
          {!submitted ? (
            <form onSubmit={onSubmit} className="space-y-6">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Tell us what happened. This is a demo-only form — your report will not be
                  submitted to moderators, but it helps us design the flow.
                </p>
                {targetId && (
                  <p className="text-xs text-muted-foreground">Target ID: {targetId}</p>
                )}
              </div>

              <div className="space-y-3">
                <Label className="text-sm">Reason</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    { key: "harassment", label: "Harassment" },
                    { key: "bad_behavior", label: "Bad behavior" },
                    { key: "spam", label: "Spam or advertising" },
                    { key: "inappropriate", label: "Inappropriate content" },
                    { key: "safety", label: "Safety concern" },
                    { key: "other", label: "Other" },
                  ].map((opt) => (
                    <label
                      key={opt.key}
                      className={`flex items-center gap-2 rounded-md border p-3 cursor-pointer hover:bg-accent ${
                        reason === opt.key ? "border-primary" : "border-border"
                      }`}
                    >
                      <input
                        type="radio"
                        name="reason"
                        value={opt.key}
                        checked={reason === opt.key}
                        onChange={() => setReason(opt.key)}
                      />
                      <span className="text-sm">{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="details" className="text-sm">Details (optional)</Label>
                <Textarea
                  id="details"
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  placeholder="Add any context you want to share…"
                  className="min-h-28"
                />
              </div>

              <div className="flex items-center gap-3">
                <Button type="submit" disabled={submitting}>
                  {submitting ? "Submitting…" : "Submit report"}
                </Button>
                <Button type="button" variant="outline" onClick={() => router.back()}>
                  Cancel
                </Button>
              </div>
            </form>
          ) : (
            <div className="space-y-4 text-center">
              <p className="text-lg font-semibold">Thanks — your report has been noted.</p>
              <p className="text-sm text-muted-foreground">
                This is a demo. In a real app, our team would review it. You’ll be redirected shortly.
              </p>
              <div className="pt-2">
                <Button onClick={() => router.replace(backHref)}>Back now</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function ReportPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Report />
    </Suspense>
  );
}
