## Overview
- Meet-Riders runs as a monorepo. The web app lives in `frontend` (Next.js 15 + React 19) and the new Expo-powered mobile client sits in `apps/mobile`. Both rely on Supabase for auth, storage, and RPC.
- UX divides unauthenticated flows under `frontend/src/app/(Authentication)` and the signed-in product under `frontend/src/app/(main)` with shared scaffolding in `MainLayout` and the global providers in `frontend/src/app/layout.tsx`.
- Supabase schema, RLS policies, and helper SQL helpers live in `backend/sql`; keep these scripts aligned with Supabase migrations instead of baking SQL into client code.
- Shared types and constants are published from `packages/shared`; import from `@meet-riders/shared` rather than duplicating shapes in each client.

## Data Access & Auth
- Use the prebuilt helpers: `@/utils/supabase/client` for browser components/hooks, `@/utils/supabase/server` for server components/routes, and `@/lib/supabaseClient` only for legacy usage.
- Gate everything behind the Zustand-driven `authStore`: call `useAuthStore.getState().init()` (already triggered in `StoreInitializer`) before reading `user`.
- Middleware in `frontend/middleware.ts` refreshes Supabase sessions and enforces route access; respect its protected/public route lists when adding pages.
- When touching dashboard data pipelines, reuse `useDashboard`, `useDashboardDataStore`, and `useDashboardParties` from `src/app/(main)/dashboard`; they already enforce onboarding, periodic refresh, friend-only visibility, and party ordering.
- RPC/helpers defined in SQL (`get_party_member_count`, `can_user_join_party`, `kick_party_member`, etc.) are consumed via Supabase client calls—prefer calling them instead of replicating logic client-side.
- The mobile client creates its Supabase instance in `apps/mobile/src/lib/supabase.ts` using AsyncStorage-backed session persistence. Mobile environment variables MUST use the `EXPO_PUBLIC_` prefix.

## State & UI Patterns
- Global state lives in `src/stores` (Zustand). `authStore` handles session changes, `dashboardDataStore` manages party/profile caches, `expiredPartiesStore` polls expiring parties with a 5-minute restore window, and `partyStore` keeps lightweight host-created parties.
- Any code that needs these stores should import the existing hooks; do not reimplement polling, pruning, or Supabase lookups.
- Forms follow the shadcn + React Hook Form + Zod pattern (`login/page.tsx` is the reference). Copy that stack for new forms, including schema-driven validation and `toast` messaging from `@/components/ui/sonner`.
- UI components under `src/components/ui` wrap shadcn primitives; favor these over raw Radix components for visual consistency.
- Map experiences rely on `react-leaflet` with assets in `public/`; remember to import `leaflet/dist/leaflet.css` in any new map client component just like `components/map.tsx`.
- On mobile, keep screens lean: `App.tsx` handles auth + party listing with Expo primitives and shared types; extract shared transformers into `packages/shared` before duplicating logic.

## Routing & Layouts
- Layout composition: `MainLayout` renders sidebar, mobile tab bar, and optional mutuals drawer based on `usePathname`; include new auth-required pages under `(main)` to inherit it.
- `StoreInitializer` in `src/app/layout.tsx` primes auth and party cleanup; do not remove this from the root tree.
- API routes (e.g., `src/app/api/delete-account/route.ts`) assume environment variables `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY`; keep secrets server-side and require `Authorization: Bearer <access_token>`.
- Expo navigation currently uses a single-screen layout. When expanding, reach for `expo-router` or React Navigation, but keep shared auth state in a dedicated hook that wraps the existing Supabase session utilities.

## Developer Workflow
- Install dependencies from the repo root via `pnpm install`; workspaces cover `frontend`, `apps/mobile`, and `packages/*`.
- Web: `pnpm dev:web` (or `pnpm --filter frontend dev`) runs the Next.js app with Turbopack; `pnpm --filter frontend build` and `pnpm --filter frontend lint` cover CI steps.
- Mobile: `pnpm dev:mobile` proxies to `expo start`; ensure `EXPO_PUBLIC_SUPABASE_URL`/`EXPO_PUBLIC_SUPABASE_ANON_KEY` are set in `apps/mobile/.env`. Use the Expo CLI prompts for platform-specific runs.
- Environment setup needs a Supabase project with tables from `backend/sql/*.sql`; keep web secrets in `frontend/.env.local` and mobile secrets in `apps/mobile/.env` (Expo automatically exposes `EXPO_PUBLIC_*`).
- Docs in `docs/srs` and `docs/diagrams/er.html` capture product context and DB relationships—review them before modifying schema or data flows.

## Conventions
- Type imports resolve via the `@/*` alias configured in `tsconfig.json`; keep new source under `frontend/src` to leverage it.
- Use `@meet-riders/shared` for cross-platform types/constants. Update `frontend/next.config.ts` (`transpilePackages`) and Expo Babel aliases when adding exports.
- Keep dates/times as `Date` objects client-side but persist ISO strings through Supabase, mirroring `dashboardDataStore` transforms.
- Respect the friend/visibility rules implemented in `dashboardDataStore.refreshParties`; new queries should extend those filters instead of bypassing them.
- Tailwind styling applies only to the web client. Mobile sticks to React Native `StyleSheet` or theming libraries; mirror naming and spacing tokens where possible for brand consistency.
- Stick to ASCII in code and follow existing Tailwind utility-first styling; shared gradients and theming live in `globals.css` and theming providers.
