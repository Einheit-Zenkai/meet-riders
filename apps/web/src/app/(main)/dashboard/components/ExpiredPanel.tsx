"use client";

/**
 * Backwards-compatible shim: previous dashboard views imported `ExpiredPanel`.
 * The renewed sidebar now lives at `@/components/expired-sidebar` and is rendered
 * globally via the main layout. We re-export it here so any legacy imports
 * continue to show the refreshed UI without additional call-site changes.
 */

export { default } from "@/components/expired-sidebar";
