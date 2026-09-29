# Dew — Build Plan

**Prepared by La Digital · September 2026**
*Locked decisions, architecture, and build order for the Dew MVP.*

---

## 1. Locked decisions

From Dew's answers to the blueprint gaps, plus platform decisions made by La Digital where the blueprint was silent.

### Messaging
Minimal in-app messaging, opened when a professional accepts and unlocks a client. Scope: text only, timestamps, notifications, report and block.

- Both sides can send, but **only a professional message starts the exchange clock**.
- A professional can mark "connected outside Dew", which closes the exchange as delivered.
- Report and block feed a moderation queue with an admin view.
- No attachments, voice notes, or read receipts in the MVP.

### Credits
- A decline after unlocking still costs the credit.
- The exception is material information that was not in the preview and genuinely prevents the service. Reason-coded, manually reviewed, restorable.
- To keep that exception narrow, **the preview carries all safety flags, service history, and category answers**. Only identity, contact details, free-text notes, and face photos are withheld until unlock.

### Timing
| Event | Rule |
|---|---|
| Preview reminder | 12 hours |
| Preview expiry | 24 hours |
| Contact deadline after acceptance | 24 hours, reminder at 12 |
| Client reminder | 24 hours after the professional's first message |
| Client ghost threshold | 72 hours after the professional's first message |
| Introduction lifecycle cap | 10 days, then force-closed |

- **Genuine exchange** = the client replies in the conversation. Opening it is not enough. A single reply counts.
- All timers pause during quiet hours (9pm–8am in the professional's local timezone).
- A professional who accepts and never makes contact keeps the credit spent, the client is rematched, and a reliability event is recorded. Two events inside 90 days auto-pause the professional's capacity pending review.

### Consent and rematch
- Consent copy: *"Share this consultation and selected photos with [Professional], and with any professional Dew matches you with if this doesn't work out."*
- On a rematch the consultation passes forward unchanged, with no second consent step. The client's home card names the new recipient as a notice.
- Every disclosure is recorded separately: consultation version, recipient, timestamp.
- Decline reasons feed the matching logic only. They are never shown to the next professional.

### Age
18+ for the MVP, with an age attestation at signup. Prom and Graduation are removed from makeup event types until minor consent flows exist.

### Platform
The blueprint never states a platform. It assumes a phone (safe areas, push, one-thumb actions) without saying native or web, so this is La Digital's call and is flagged back to Dew.

**The MVP is a PWA.** One responsive Next.js application covering the public site, the client journey, and the professional workspace. Installable to the home screen, no app stores, no store fees on credits, shipped whenever it's ready. Native apps follow once the product is validated, reusing the same backend.

### Deferred
Data retention periods, health-data handling, AI processing disclosure, and licensing rules are pending legal and technical confirmation. Each is built as an interface, not an assumption.

---

## 2. Stack

| Layer | Choice | Notes |
|---|---|---|
| Backend | Convex | Database, functions, scheduling, file storage, real-time |
| Frontend | Next.js (App Router) + Tailwind | One app: marketing, client, professional |
| Auth | Better Auth via the Convex component | Users and sessions live in Convex; no external sync |
| Email | Resend or Postmark + react-email | Primary notification channel |
| Payments | Stripe, behind an internal interface | No store fees while the MVP is web-only |
| Tooling | pnpm, TypeScript strict, Biome | |

**Why Convex.** Messaging needs real-time subscriptions, which are native. Every timer is a scheduled function. The credit ledger needs atomic writes, and mutations are transactional by default.

**Why Better Auth over Clerk.** The user record stays in Convex, so there is no webhook-synced replica that can drift. The blueprint's non-negotiable session merge (attach the anonymous discovery session to an account, losing nothing) becomes a single mutation. Convex Auth itself is still beta with experimental Next.js support, so it isn't the right choice yet.

**Why not Expo yet.** A PWA covers the phone-first requirements the blueprint describes. Keeping all business logic in Convex means the native app later is a new UI layer, not a rewrite.

```
app/                 Next.js App Router — (marketing) (client) (pro) (admin)
components/          shared UI
packages/tokens/     design tokens, single source
packages/validation/ Zod schemas shared by client and server
convex/              schema, queries, mutations, actions, crons, components
```

---

## 3. Design tokens

Single source in `packages/tokens`, exported as a Tailwind preset. No hex codes anywhere else in the codebase.

### Colour

| Token | Hex | Use |
|---|---|---|
| `foundation` | `#F7F0E6` | Warm cream. Main background |
| `surface` | `#FFFCF7` | Ivory. Cards, sheets, text areas |
| `lavender` | `#D9D0F3` | Discovery, guidance, select states |
| `butter` | `#F6E6A8` | Highlights, progress |
| `sage` | `#CFE5CC` | Fit, completion, accepted |
| `powder` | `#CFE3F4` | Information, system feedback |
| `navy` | `#18263D` | Primary text and structure |
| `coral` | `#EF7F73` | Primary action only |

Accessibility rule from the blueprint: pastel colour never carries state alone. Every state also has a label or an icon.

### Type
- **Display and headings:** Fraunces
- **Body and controls:** Inter
- Navy text, generous line height, two weights only

Both are variable fonts, self-hosted, subset, preloaded. No runtime font request.

### Other tokens
Spacing on a 4pt scale, three radius steps, two shadow steps, and a motion scale with `prefers-reduced-motion` honoured.

---

## 4. Notifications and deadlines

### Deadlines are rows, not scheduled jobs
A `deadlines` table (`kind`, `introductionId`, `dueAt`, `state`) with a Convex cron sweeping every five minutes for anything due and pending.

- Quiet hours and window lengths stay editable after launch; scheduled jobs would already be booked.
- Pending work is inspectable in a table, so "why didn't this fire" is a query.
- A failed send stays pending and retries on the next sweep.

Deadlines are created and cancelled by state transitions only: acceptance cancels the preview expiry and creates the contact deadline; the professional's first message cancels that and creates the client reminder plus the ghost threshold; the client's reply cancels both.

All deadline maths goes through one utility taking a start time plus the professional's quiet hours. Nothing computes a deadline inline.

### One notify layer, three channels
Everything sends through `notify(recipientId, templateKey, payload)`, which resolves channels from recipient preferences and writes a delivery record. A unique key per `(introductionId, templateKey)` prevents double sends on overlapping sweeps.

1. **Email now.** Dedicated sending subdomain with SPF, DKIM and DMARC. Preview emails deep-link to the inquiry with a short-lived signed token, so a professional goes from inbox to accept in one tap. Deliverability is a revenue issue: a missed preview is a lost lead and a lost credit.
2. **Web push second.** VAPID and a service worker. The permission prompt appears after the first accepted introduction, paired with the install prompt, since iOS only allows push once the PWA is installed.
3. **Native later.** A new device-token channel. Nothing else changes.

---

## 5. Engineering standards

### Simple over clever
- No abstraction until the third repetition.
- No state library. Convex subscriptions are the state.
- No custom hooks wrapping a single Convex call.
- Descriptive names: `introductionExpiresAt`, not `expiry`. `hasClientReplied`, not `flag`.
- One component, one job. Screens compose; they don't contain logic.

### Nothing legacy
Current, maintained packages only. No `moment`, no `axios`, no `styled-components`, no class components, no Pages Router. Every dependency justifies its weight against the platform API it replaces.

### Data and payloads
- Queries return only the fields the screen renders.
- Anything scrolling is paginated.
- Photos go to Convex file storage and are served resized. No base64 in documents.
- Denormalize deliberately where it avoids a round trip, with a comment saying why.
- **The professional preview is its own query**, so unlockable fields never reach a client that hasn't paid. This is a security boundary, not an optimization.

### Performance
- Server components by default; client components only where interaction requires them.
- `next/image` everywhere, with the dewy bubble forms as SVG or CSS rather than raster.
- Lists virtualized above ~50 rows.
- Optimistic updates on messaging only.
- Budget: sub-2.5s LCP on the marketing pages over 4G, interactive discovery within 1s of tap.

### SEO
- Static generation for marketing and legal pages, with metadata per route.
- Semantic headings, one `h1` per page, real anchor tags.
- `LocalBusiness` and `FAQPage` structured data.
- Sitemap and robots generated at build time.
- Professional claim pages are the SEO priority, since supply is the launch constraint.
- Client journey, consultation and workspace routes are `noindex`.

### PWA
- Manifest with `display: standalone`, maskable icons, and the cream theme colour.
- Service worker for the app shell and offline fallback only. Never cache consultation or introduction data.
- `env(safe-area-inset-*)` on every fixed element, which is what the blueprint's safe-area rule means on the web.
- Camera capture through a file input with `capture`, with client-side compression before upload.

### Testing and quality
- TypeScript strict, no `any`.
- Zod schemas shared between client and server; validate once, infer types from the same definition.
- Unit tests where money and time live: credit ledger, eligibility rules, deadline maths.
- No snapshot tests of UI.

---

## 6. Data model additions

Beyond the blueprint's objects:

**New introduction statuses:** `contact_pending`, `contact_made`, `client_unresponsive`, `expired_no_contact`, `connected_off_platform`.

**Conversation** — introduction ID, participants, created at, first professional message at, first client reply at, closed at, closure reason.

**Message** — conversation ID, sender, body, sent at, moderation state.

**Reliability event** — professional ID, type, introduction ID, occurred at, resolved at.

**Disclosure record** — consultation ID, version, recipient professional, disclosed at.

**Deadline** — kind, introduction ID, due at, state, created at, fired at.

**Notification** — recipient, template key, introduction ID, channel, unique key, sent at, delivery state.

**Business hours** — timezone and working window per professional.

**Users** — `role` (client or professional) lives on Dew's own user row, not in auth-provider metadata. Matching queries it constantly.

---

## 7. Build order

1. **Foundations** — repo, tokens, Convex schema, Better Auth, roles, event tracking, deadline utility, notify layer.
2. **Professional supply** — claim flow, minimal profile, services, fit rules, capacity, booking link.
3. **Client discovery** — landing, branching questions, anonymous session, summary.
4. **Auth and merge** — signup gate, lossless session merge, age attestation.
5. **Matching v1** — eligibility gates, ranking, explanations, weak-supply states.
6. **Profile and consultation** — personalized profile, consultation, structured output, consent.
7. **Introductions** — preview, accept/decline, four response paths, deadlines, rematch.
8. **Messaging** — conversation, exchange detection, report and block.
9. **Credits** — free counter, Stripe purchase, deduction, restoration, ledger, disputes.
10. **Handoff and homes** — booking-ready screen, both homes, status history.
11. **Admin** — moderation queue, dispute review, credit restoration, match inspection.
12. **Polish** — PWA install flow, web push, accessibility pass, performance budgets.

Steps 1 and 2 are the critical path. Matching can't be tested without professionals in the system, so supply onboarding comes before client-side work.

---

## 8. Still open

| Item | Blocks |
|---|---|
| Retention periods per data type | Privacy policy, launch |
| AI provider and disclosure wording | Discovery free-text features |
| Licensing rules per service | Eligibility rules in step 5 |
| Launch city and supply targets | Step 2 scheduling |
| Budget bands per category | Discovery Q7 |
| Platform confirmation (PWA) | Nothing — proceeding, flagged to Dew |

None of these block steps 1 through 4.

---

## 9. Progress log

*Living record. Updated after every completed step or sub-step.*

### Decisions locked (2026-09-28)
- **Matching = broadcast, uncapped multi-unlock.** A consultation is broadcast to N ranked professionals as previews; any professional can unlock independently. **Each unlock spends its own credit and spawns its own conversation.** A client may be contacted by several professionals concurrently; each conversation has its own exchange clock and lifecycle.
- **Professional vetting = invite-only, manual** for the launch city, gated by an admin `approvalState`. A pro is eligible to receive previews only after approval.
- **Analytics = Convex-native `events` table** + typed `emit()`. No external vendor.
- **Tooling aligned to plan:** npm → pnpm (workspace), ESLint → Biome.
- **⚠ Consent copy must be rewritten** for concurrent sharing (current copy reads sequential: "…if this doesn't work out"). Needed before step 6 (consultation/consent). Flagged to Dew.

### Cross-cutting standards adopted
- Introduction is an explicit **FSM**; one `transitionIntroduction` mutation is the sole status writer and the only creator/canceller of deadlines.
- **Authz guards** (`requireUser/requireRole/requireOwnsIntroduction/requireAdmin`) at the top of every non-public function; preview query is the unlock security boundary.
- **`eraseClient`** cascade-delete path designed from day one (ledger anonymized, not deleted).
- Testing: unit (ledger/eligibility/deadline math) + `convex-test` FSM integration (mocked time) + Playwright happy-path smoke.

### Build Order status
| Step | Status |
|---|---|
| 1. Foundations | 🔧 In progress — 4/7 phases done (see below) |
| 2. Professional supply | ⬜ Not started |
| 3. Client discovery | ⬜ Not started |
| 4. Auth and merge | ⬜ Not started |
| 5. Matching v1 | ⬜ Not started |
| 6. Profile and consultation | ⬜ Not started |
| 7. Introductions | ⬜ Not started |
| 8. Messaging | ⬜ Not started |
| 9. Credits | ⬜ Not started |
| 10. Handoff and homes | ⬜ Not started |
| 11. Admin | ⬜ Not started |
| 12. Polish | ⬜ Not started |

**Step 1 — Foundations phases**
- ✅ Phase 1 — Tooling migration. npm→pnpm workspace (`pnpm-workspace.yaml`, `packages/{tokens,validation}`), ESLint→Biome 2.5.14 (`biome.json`, tailwind CSS directives on, `public/` excluded), zod 4 direct dep. Gates green: install clean, `biome check` clean, `tsc --noEmit` OK, `pnpm dev` → HTTP 200, both workspace pkgs resolve.
- ✅ Phase 2 — Convex + Better Auth + roles + session merge. Convex 1.46, `@convex-dev/better-auth` 0.12.5, `better-auth` 1.6.33 (pinned to the component's peer range). Dev deployment provisioned: team `ladigital`, project `dew-f5fa4`, deployment `blessed-ibis-901`. Files: `convex/{convex.config,auth.config,auth,http,schema,users}.ts`, `convex/lib/auth.ts` (guards `requireUser/requireRole/requireAdmin`), `lib/{auth-client,auth-server}.ts`, `app/ConvexClientProvider.tsx`, `app/api/auth/[...all]/route.ts`, provider wired in `app/layout.tsx`. Deployment env: `BETTER_AUTH_SECRET`, `SITE_URL`. Roles on Dew `users` row (default `client`); `mergeAnonymousSession` = lossless single mutation over `discoverySessions`. Tests (Vitest 3 + convex-test, edge-runtime): 4 pass — merge lossless + idempotent, guard accept/reject, unauth reject. Live HTTP round-trip verified: sign-up/get-session/sign-in all 200. Known: `ConvexBetterAuthProvider` generic quirk narrowed via package's `AuthClient` type (commented, no `any`). Middleware→`proxy.ts` (Next 16) deferred to route-protection work.
- ⬜ Phase 3 — Full Convex schema
- ✅ Phase 3 — Full Convex schema. `convex/schema.ts` now defines all 14 model tables (+ `discoverySessions`): users, professionals (with `approvalState` invite gate + businessHours), consultations (preview-visible vs unlock-only fields grouped), matches (broadcast candidate set), introductions (per consultation×professional pair, FSM status), conversations, messages, deadlines, notifications, reliabilityEvents, disclosureRecords, creditLedger (append-only), events, moderationQueue. Shared validators exported (roles, approvalState, introductionStatus, deadlineKind/state, channel, deliveryState, creditReason, moderationState). Hot-path indexes: `introductions.by_professional_status`, `deadlines.by_state_dueAt`, `creditLedger.by_professionalId`, plus by_consultationId/by_introductionId/by_uniqueKey etc. Gates green: schema pushed clean, convex-test seed inserts one valid row per table (counts asserted), root tsc + convex typecheck + biome + 5 tests all pass. Note: `categoryAnswers`/`fitRules`/`answers`/`props` left as `v.any()` placeholders (validators, not TS any) pending steps 3/5/6.
- ✅ Phase 4 — Introduction FSM + deadline utility + cron. `convex/lib/deadlines.ts` (pure, DST-aware `computeDueAt` consuming only active time + `DEADLINE_WINDOWS_MS`), `convex/lib/fsm.ts` (pure `TRANSITIONS` table + `assertTransition` + `DEADLINE_EVENT` map), `convex/introductions.ts` (`applyTransition` = sole status/deadline writer; `transitionIntroduction` internal; `createIntroductionForPreview`; `unlock` public — atomic credit spend + capacity + approval checks), `convex/deadlines.ts` (`sweepDeadlines`), `convex/crons.ts` (5-min sweep). Decisions applied: unlock = accept (previewed→contact_pending, collapsing transient `unlocked`); decline-after-unlock keeps the credit; broadcast multi-unlock needs no lock (per-pair intros). Gates green: 21 tests pass — deadline math incl. quiet-hours pause across a DST spring-forward, full FSM happy path, decline/ghost/both-expiry paths via the sweep, illegal-transition rejection, capacity + no-credits guards, stale-deadline no-op. root tsc + convex typecheck + biome all clean. Note `unlocked` literal retained in the status union but unused (never a resting state).
- ⬜ Phase 5 — Notify layer + analytics emit + deletion path
- ⬜ Phase 6 — Design tokens
- ⬜ Phase 7 — App shell
