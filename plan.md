# Dew — Build Plan (living doc)

> **Transferable source of truth.** Keep this file in the repo and update the
> **Status** checklist whenever a feature or phase is finished. It captures the
> stack, architecture, decisions, and how to run everything, so any station can
> pick the project up.

## What Dew is
A curated **beauty-guidance marketplace**: everyday users are matched with vetted
beauty experts, with AI tools (scanner, shade-match) supporting — never replacing
— the experts. Full product spec: `DEW_In_Depth_App_Experience_Blueprint.pdf`
(33 sections). Design feel: soft lavender gradients, frosted-glass UI, deeper
purple/fuchsia accents, soft glows, floating elements, smooth motion. **Mobile-first.**
Never generic booking-app / corporate-SaaS.

## Stack (all current — no legacy)
- **Next.js 16.2.10** (App Router, Turbopack builds; Middleware is renamed **Proxy** → `proxy.ts`)
- **React 19.2** · **TypeScript 5** (strict)
- **Tailwind CSS v4** (CSS-first `@theme`; no `tailwind.config.js`)
- **Convex** (backend/DB) · **Clerk** (auth) · **PWA** (Serwist, in `apps/app` only)
- **Radix UI** primitives + custom Dew components · **motion** · **lucide-react**
- **Turborepo + npm workspaces** (pnpm can't be put on PATH in this env)

## Architecture — monorepo, 3 subdomains
| Subdomain | App | Purpose |
|---|---|---|
| `domain.com` | `apps/web` | Landing / marketing / app-tour. Static, public, **no auth/Convex** → stays lean. |
| `app.domain.com` | `apps/app` | The product: **clients + experts** (split by Clerk role), onboarding, sign-in/up. **This is the PWA.** |
| `admin.domain.com` | `apps/admin` | Admin: approvals, users, reports, announcements. **Admin-role gate.** |

**Auth:** one Clerk instance shared by all apps; session shared across subdomains
automatically (cookie on `.domain.com`). Wiring lives in `packages/auth`. Sign-in
UI lives in `apps/app`; `apps/admin` has its own admin-only gate; `apps/web` is
public with CTAs deep-linking to the app.

### Layout
```
dew/
  turbo.json · package.json (npm workspaces) · .mcp.json
  apps/
    web/     → domain.com        (port 3001)
    app/     → app.domain.com     (port 3000, PWA)
    admin/   → admin.domain.com   (port 3002)
  packages/
    ui/       design system: Tailwind @theme tokens + Radix components + cn()
    auth/      Clerk provider + proxy helper + role utils + Convex bridge
    backend/   Convex: schema, functions, _generated, auth.config.ts
    config/    shared tsconfig / eslint / tailwind / postcss presets
```
Internal packages: `@dew/ui`, `@dew/auth`, `@dew/backend`, `@dew/config`
(referenced as `"*"`; apps set `transpilePackages` for the TS ones).

## Design tokens
All design tokens live in **`packages/ui/src/styles/theme.css`** (single `@theme`
block + gradients + `@utility glass/glow/bg-primary-gradient`). Change a value
there and it propagates to every app. Base element styles:
`packages/ui/src/styles/globals.css`. Each app's `app/globals.css` does
`@import "tailwindcss"; @import "@dew/ui/styles/globals.css";` + two `@source`
lines (its own tree + `packages/ui/src`).

## Design import workflow (Claude Design MCP)
- MCP registered in `.mcp.json` as `claude_design` (`https://api.anthropic.com/v1/design/mcp`).
- **Authenticate once:** run `/design-login` in Claude Code.
- Source project: `a8d6e458-247c-4d82-95e0-fd337d42633e`; first file to implement: **`Dew Onboarding.dc.html`** (into `apps/app`).

## Running locally
```bash
npm install                 # from repo root (workspaces)
npm run backend             # convex dev (packages/backend) — run in its own terminal
npm run dev                 # turbo: all three apps (web:3001, app:3000, admin:3002)
# or a single app:
npm run dev --workspace @dew/app
```
Build / checks: `npm run build` · `npm run lint` · `npm run typecheck` (all via turbo).
Bundle check: `ANALYZE=true npm run build --workspace @dew/app`.

**Local subdomains (optional):** map `app.localhost` / `admin.localhost` or use
distinct ports as above. Production separation is by DNS.

## Environment variables
- `packages/backend/.env.local` → `CONVEX_DEPLOYMENT`, `NEXT_PUBLIC_CONVEX_URL` (present).
- `apps/app/.env.local` & `apps/admin/.env.local` → `NEXT_PUBLIC_CONVEX_URL` +
  `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` + `CLERK_SECRET_KEY` (all present).
- Convex deployment env: `CLERK_JWT_ISSUER_DOMAIN` set. Still to do in Clerk dashboard:
  a **JWT template named `convex`** (required for Convex-authenticated queries/mutations).

## Status
- [x] **Phase 0** — `claude_design` MCP registered + authenticated (`/design-login`). Design project `a8d6e458…` ("Dew beauty tech marketplace") has all screens (Landing, Home, Experts, Booking, Onboarding, Client Onboarding, expert screens, 404).
- [x] **Phase 1** — Monorepo scaffold + tooling (Turborepo + npm workspaces; scaffold migrated to `apps/app`; Convex → `packages/backend`; 3 apps build clean).
- [x] **Phase 2** — Tailwind v4 `@theme` design-token system in `packages/ui`.
- [x] **Phase 3** — Core component library (`packages/ui`, Radix-based): Button, GlassCard, ProgressPill, Radio/Checkbox option cards, Chip, Input, Badge, BottomNav, Dialog, Tabs, Avatar, Skeleton, Empty/Error states, motion (Glow/FloatingCard/FadeIn), PagePlaceholder.
- [x] **Phase 4** — App shells + route skeletons. web (landing + tour), app (all client + `/expert/*` routes, auth, onboarding, loading/error/not-found), admin ((admin) group + nav). All three build/lint/typecheck clean.
- [x] **Phase 5** — Auth + backend wiring. Convex schema (`users`, `clientProfiles`) + functions deployed to dev; `@dew/auth` Clerk+Convex provider; per-app `proxy.ts`; PWA manifest + manual service worker in `apps/app`. **Clerk keys added; `CLERK_JWT_ISSUER_DOMAIN` set to `funny-buffalo-16.clerk.accounts.dev`.** Auth is live: protected routes redirect to Clerk sign-in.
- [x] **Phase 6** — `Dew Onboarding.dc.html` implemented at `apps/app/app/welcome` — faithful 6-screen carousel (Hero → Chaos → Mismatch → Clarity → How-it-works → Final CTA) with swipe/keyboard/dots + sign-up sheet routing to Clerk. Design tokens + fonts (Cormorant Garamond + Manrope) reconciled to the imported design. `/` → `/welcome`.
- [x] **Phase 7** — This file kept updated each phase (ongoing rule).

- [x] **Phase 8** — **All** desktop designs implemented from the Claude Design desktop files. Responsive `AppShell` (248px sidebar desktop / bottom-nav mobile) + faithful ports of **Home, Experts, Booking, Client Profile, Client Onboarding, Expert Dashboard, Expert Calendar, Expert Profile Builder, Landing, 404, Coming Soon**. `/welcome` is now **responsive**: mobile phone-carousel below `lg`, desktop two-panel above (shared state + sign-up sheet). Placeholder image slots use `/makeup.jpg` (unoptimized 17 MB CSS background — swap for optimized/`next/image` assets before launch). All apps build/lint/typecheck green.

- [x] **Phase 9** — **Custom auth UX + real role gating.** Replaced Clerk's prebuilt `<SignIn>/<SignUp>` with Dew-styled flows (this Clerk build uses the new **Signals/Future API** — `useSignIn/useSignUp` return `{ signIn/signUp }` with `.password()/.sso()/.finalize()`, not the classic `isLoaded`). Shared `AuthChooser` (`@dew/ui`) drives the get-started CTA **and** the app's sign-in/sign-up landings (3-button chooser → "Continue with email" reveals the form); SSO auto-fires from marketing (`?sso=`), email opens via `?method=email`. Photo brand panel (left on desktop / background on mobile). Logout on client + expert profiles. **Role gating is now real:** `@dew/auth/role#getUserRole()` reads the role from the Convex `users` table (source of truth), provisioning the row on first authed visit from Clerk `unsafeMetadata.role`; `(client)` layout redirects experts → `/expert/dashboard`, `expert/*` layout redirects non-experts → `/home`, admin `(admin)` layout 404s non-admins. **The login client/expert toggle is only a routing hint — server gating (real DB role) overrides it.**

- [x] **Phase 10** — **Dual client+expert accounts.** Dropped the single-role model for **capabilities**: every user is a client; `users.expertStatus` (none→pending→approved) is an add-on they apply for and an admin approves; `isAdmin` is separate; `activeMode` remembers a dual user's current view. `@dew/auth/role` now exposes `getUserAccess()`. Gating: client area open to all; `/expert/*` requires **approved**; admin requires `isAdmin`. Expert application moved out of the gated area to **`/become-expert`** (under the client shell) with a real `applyAsExpert` mutation. A **mode switcher** (`ModeSwitchButton`, persists `activeMode` via `setActiveMode`) on both profile pages lets dual users flip views; app root `/` lands them on their remembered view. Sign-up "expert" now = client account + `expertStatus: pending`. (Schema pushed via `convex codegen`; `users` table was empty so no migration.)

### Auth status — DONE for dev
Clerk `convex` **JWT template created**, and **Google + Apple** social connections enabled (dev). Authenticated Convex calls work; SSO completes. `getUserRole()` needs `users.current` + `users.ensureUser` deployed to the Convex dev deployment (`npm run backend`). **Before launch:** recreate the JWT template + social connections in the Clerk **production** instance; admins are provisioned by setting `role: "admin"` on their Convex `users` row manually.

## Not in this phase (mapped for later)
Expert discovery, expert profile, booking + Stripe payments, messaging, appointments,
routine builder, product scanner, shade match, cart, community, expert dashboard/
calendar/services/earnings, admin moderation, subscriptions/feature-gating,
notifications. See the blueprint's MVP priority (§31).
