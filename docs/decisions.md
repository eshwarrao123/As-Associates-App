# Architecture Decision Records

Why the project is built the way it is. Each record states what was chosen, what was rejected,
and what it costs going forward.

`[DECIDED]` means locked — do not relitigate without a new ADR superseding it.
`[OPEN]` means the options are known but the choice has not been made, and something downstream
is blocked on it.

| ADR | Decision | Status |
|---|---|---|
| 001 | React Native + Expo | `[DECIDED]` |
| 002 | StyleSheet + tokens.ts, not NativeWind | `[DECIDED]` |
| 003 | Expo Router v3 | `[DECIDED]` |
| 004 | TanStack Query for server state | `[DECIDED]` |
| 005 | Zustand for local state | `[DECIDED]` |
| 006 | React Hook Form + Zod | `[DECIDED]` |
| 007 | NestJS over Express | `[DECIDED]` |
| 008 | PostgreSQL + Prisma | `[DECIDED]` |
| 009 | No open registration | `[DECIDED]` |
| 010 | Stitch AI for design, Stitch MCP in Antigravity IDE | `[DECIDED]` |
| 011 | File storage: Cloudinary vs S3 | `[OPEN]` |
| 012 | Auth token strategy | `[OPEN]` |
| 013 | Primary action color: amber vs navy | `[OPEN]` |
| 014 | Geolocation on attendance check-in | `[OPEN]` |

---

## ADR-001: React Native + Expo over Flutter or web-only

**Status:** `[DECIDED]`
**Date:** July 2026

**Context.** Site employees work at bank branch renovation sites, away from any office and
away from desktops. The tool has to be a phone app they can use one-handed on site — for
attendance, photos, and progress notes. A delivery platform had to be chosen before any screen
was built.

**Decision.** React Native 0.86 with Expo SDK 57, TypeScript 6.

**Rationale.** Expo removes the native build toolchain from day-to-day work: Expo Go on an
Android emulator gives an instant dev loop with no Android Studio build step, and EAS Build
produces a distributable APK later without a native CI setup. The managed workflow covers
everything the app actually needs — camera/gallery via `expo-image-picker`, fonts via
`expo-font`, storage via AsyncStorage. TypeScript across frontend and the planned NestJS
backend means one language for the whole stack.

**Alternatives considered.**
- *Flutter* — comparable capability, but adds Dart as a second language alongside the
  TypeScript backend, and the team's existing skill is React.
- *Web-only responsive app* — rejected on the core requirement. Attendance check-in and site
  photo capture want a native camera and (potentially) device location. A browser tab is also
  the wrong ergonomics for someone standing on a site.
- *Bare React Native* — rejected as unnecessary overhead. No custom native module is required
  by any documented feature.

**Consequences.**
- Bound to the Expo SDK release cadence and to what the managed workflow supports. If a future
  feature needs a custom native module, a prebuild/config-plugin step becomes necessary.
- Android Pixel 7 emulator is the only verified target. `npm run ios` and `npm run web` exist
  in `package.json` but are untested; `app.json` declares an iOS bundle identifier, so iOS is
  not ruled out.
- `AGENTS.md` requires reading the versioned Expo docs for SDK 57 before writing code — the
  API surface moves between releases.

---

## ADR-002: StyleSheet API + tokens.ts over NativeWind / Tailwind

**Status:** `[DECIDED]`
**Date:** July 2026

**Context.** The original stack plan included NativeWind so Tailwind utility classes could be
used in React Native. It was installed and configured — `nativewind`, `tailwindcss`,
`tailwind.config.js`, `global.css`, `nativewind-env.d.ts` — and `app/_layout.tsx:1` still
imports `../global.css`. Then, in practice, every screen was written with `StyleSheet.create()`
and design tokens instead. **No screen in the repo uses `className`.** The decision was made by
implementation before it was written down; this ADR records it.

**Decision.** Styling goes through `StyleSheet.create()` reading values from
`src/constants/tokens.ts`. NativeWind and Tailwind are to be removed.

**Rationale.**
- The design source is Stitch, which emits a token table (colors, type scale, spacing, radius,
  shadows) — not utility classes. A token module maps onto that one-to-one; Tailwind config
  would be a second translation layer over the same values.
- `StyleSheet` is what React Native itself specifies, so behaviour on shadows, `elevation`, and
  platform quirks is predictable with no compile step in between.
- Two styling systems in one codebase is worse than either alone. Mixed `className` and
  `style=` would make the Phase 1 Stitch diff far harder to reason about.
- Named token imports (`Colors.primary`, `Spacing[4]`) are type-checked; Tailwind class strings
  are not.

**Alternatives considered.**
- *Keep NativeWind* — rejected: zero adoption after 16 screens is strong evidence it was not
  pulling its weight, and it would need a full rewrite to adopt now.
- *Both, per-screen* — rejected outright. See above.
- *styled-components / Restyle* — rejected as another dependency solving a problem
  `StyleSheet` + tokens already solves.

**Consequences.**
- **Rule 9 in `CLAUDE.md`:** no inline hex, no Tailwind classes. Do not add `className` usage
  to any screen.
- Five dead artifacts must be deleted, plus the `global.css` import at `app/_layout.tsx:1` and
  the `nativewind-env.d.ts` entry in `tsconfig.json`. Tracked in `docs/todo-roadmap.md` as a
  Phase 1 MED cleanup task.
- Header comments in `tokens.ts` still claim it "mirrors tailwind.config.js exactly" — stale
  and misleading once Tailwind is gone.
- The token module is now load-bearing, which makes its gaps expensive. `docs/design-system.md`
  §8 documents 20+ hardcoded values that escaped it.

---

## ADR-003: Expo Router v3 for navigation

**Status:** `[DECIDED]`
**Date:** July 2026

**Context.** The app has two mutually exclusive role surfaces — admin and employee — plus an
auth surface. The navigation structure needed to make that boundary hard to violate by accident.

**Decision.** Expo Router v3, file-based routing. Three route groups: `app/(auth)`,
`app/(employee)`, `app/(admin)`. `typedRoutes` enabled in `app.json`.

**Rationale.** Route groups express the role boundary as directory structure, so a file's
location *is* its access scope — reviewable at a glance. A single root `AuthGuard` in
`app/_layout.tsx` handles hydration and role redirects for every route at once. Typed routes
give compile-time checking on navigation targets.

**Alternatives considered.**
- *React Navigation directly* — the same primitives with hand-written navigator config. Rejected
  because Expo Router already wraps it and the file convention is self-documenting.
- *One flat navigator with runtime role checks* — rejected: role logic scattered across screens
  instead of enforced by structure.

**Consequences.**
- **Rule 10 in `CLAUDE.md`:** never place an employee screen under `(admin)` or vice versa.
- Client-side route grouping is **not** security. Every rule is enforced again server-side —
  see `docs/backend-architecture.md`.
- Known drift: bottom navigation is not implemented as a Tabs layout. Each screen renders
  `BottomNav` / `AdminBottomNav` manually with a literal `activeIndex`, so the nav remounts on
  every navigation and active state can desync from the route. Phase 1 HIGH fix.
- Second known drift: two coexisting header systems. Four admin screens set
  `headerShown: false` and draw custom headers; three employee screens use the shared `Stack`
  header.
- Missing route: `app/(employee)/project/[id].tsx`. Referenced by two `TODO` comments, does not
  exist — employees have no project detail view while admin does.

---

## ADR-004: TanStack Query for server state

**Status:** `[DECIDED]`
**Date:** July 2026

**Context.** Nearly every screen is a read of server-owned data — projects, attendance,
uploads, requests. That needs caching, refetching, and loading/error states. Choosing the
mechanism up front prevents a hand-rolled fetch layer from spreading across 16 screens.

**Decision.** TanStack Query v5. The `QueryClientProvider` is already mounted in
`app/_layout.tsx` with `retry: 2` and `staleTime: 5 minutes`.

**Rationale.** The app's data is server-owned and cacheable — exactly the problem TanStack
Query solves. It supplies the loading, error, and refetch states that all 16 screens currently
lack, and pull-to-refresh and stale-while-revalidate come free, which matters on flaky site
connectivity.

**Alternatives considered.**
- *Redux Toolkit Query* — capable, but drags in Redux for an app whose only global client state
  is the auth session. Disproportionate.
- *Raw axios in `useEffect`* — rejected: reimplements caching, dedup, and retry per screen.
- *SWR* — comparable; TanStack Query has stronger mutation and invalidation ergonomics for the
  write-heavy admin flows.

**Consequences.**
- **The provider is mounted but no query has been written.** Zero network calls exist in the
  app; `apiClient` in `src/services/api.ts` is never invoked.
- **Rule 11 in `CLAUDE.md`:** mock data is inline per-screen today. Replace it with Query hooks
  directly when the backend lands — do not build a second mock layer.
- Server state and client state are deliberately separated (see ADR-005). Auth lives in
  Zustand; everything fetched lives in Query.

---

## ADR-005: Zustand for local/UI state

**Status:** `[DECIDED]`
**Date:** July 2026

**Context.** The auth session — token, user, role, hydration flag — must be readable from the
root layout's `AuthGuard`, from screens, and from the axios interceptor outside React.

**Decision.** Zustand. One store: `src/store/auth.store.ts`, with AsyncStorage persistence.

**Rationale.** The store is reachable outside React via `useAuthStore.getState()`, which is
what makes the axios request interceptor able to inject the token and the response interceptor
able to trigger logout on 401 (`src/services/api.ts`). Context would not give that. It is also
minimal boilerplate for what is genuinely one small slice of state.

**Alternatives considered.**
- *React Context* — rejected: no out-of-React access, and re-render behaviour is worse.
- *Redux Toolkit* — rejected as heavy for a single auth slice.
- *`zustand/middleware` `persist`* — not used; hydration is hand-written in `hydrate()` because
  the guard needs an explicit `isHydrated` flag to avoid redirecting before AsyncStorage
  resolves.

**Consequences.**
- Everything non-auth stays in local `useState` or (once wired) TanStack Query. Zustand is not
  a general dumping ground.
- The `isHydrated` flag is load-bearing: `AuthGuard` must not redirect until both fonts and
  hydration complete, and not on the first render when `segments` is still empty — calling
  `router.replace` before the navigator mounts throws. Documented in the comments at
  `app/_layout.tsx:84-90`.
- The persisted token is currently a literal mock string.

---

## ADR-006: React Hook Form + Zod for forms and validation

**Status:** `[DECIDED]`
**Date:** July 2026

**Context.** Login, project creation, progress logging, uploads, and requests are all forms.
Validation rules should be declared once and shared with the backend contract where possible.

**Decision.** React Hook Form with `@hookform/resolvers` and Zod schemas. In use on
`app/(auth)/login.tsx`.

**Rationale.** Uncontrolled inputs mean fewer re-renders per keystroke, which matters on
lower-end Android devices. Zod schemas are the single source of truth for a form's shape and
infer their TypeScript types, so validation and types cannot drift. The same schema style can
later mirror backend DTO validation.

**Alternatives considered.**
- *Formik + Yup* — the older equivalent; Zod's type inference is better and RHF re-renders less.
- *Hand-rolled `useState` validation* — rejected: it is what the other screens do today, and
  they have no validation at all as a result.

**Consequences.**
- Only login uses this stack. `projects/new.tsx`, `progress.tsx`, `upload.tsx`, and
  `requests.tsx` are hand-rolled `useState` with no validation — inconsistent, and a Phase 3
  task as those forms get wired to real endpoints.
- The login schema enforces a 6-character minimum password. `docs/backend-architecture.md`
  specifies 8. The frontend must be raised to match at integration time.

---

## ADR-007: NestJS over Express for the backend

**Status:** `[DECIDED]`
**Date:** July 2026 — `[PLANNED]`, not started

**Context.** The access-control policy is the backend's main job: seven binding rules, two
roles, a four-state account lifecycle, and per-user data scoping. That structure has to be
enforced uniformly on every route, not remembered per handler.

**Decision.** NestJS, TypeScript, monolith. Module layout in `docs/backend-architecture.md`.

**Rationale.** Nest's guard pipeline is a direct fit for the policy: `JwtAuthGuard` →
`AccountActiveGuard` → `MustChangePasswordGuard` → `RolesGuard` → `ProjectAccessGuard`,
registered globally so a route cannot silently opt out. `@Roles()` metadata makes each route's
access level declarative and greppable — and a route with no `@Roles` decorator becomes a CI
failure rather than a quiet hole. DTOs with `class-validator` give request validation at the
boundary. Module boundaries per domain keep the codebase navigable as it grows.

**Alternatives considered.**
- *Express* — would work, but auth/role/scoping enforcement becomes hand-wired middleware order
  per route. Given rule 5 and rule 6, "easy to forget one route" is the primary risk to design
  against.
- *Fastify* — faster, same structural gap as Express. Throughput is irrelevant at 10–50 users.
- *Firebase / Supabase backend-as-a-service* — see ADR-008.

**Consequences.**
- More ceremony than Express: modules, DTOs, decorators. Accepted deliberately, because the
  ceremony is what enforces the policy.
- One deployable process plus one Postgres instance. No microservices, no queue, no Redis
  unless rate limiting requires it.
- Guard order in `docs/backend-architecture.md` is normative — reordering changes security
  behaviour.

---

## ADR-008: PostgreSQL + Prisma over MongoDB or Firestore

**Status:** `[DECIDED]`
**Date:** July 2026 — `[PLANNED]`, not started

**Context.** The data model is a small set of entities with heavy relational structure: an
employee is assigned to many projects, attendance and progress and uploads all hang off both an
employee and a project, and admin reporting slices across all of it.

**Decision.** PostgreSQL 16 with Prisma. Full schema in `docs/database-schema.md`.

**Rationale.**
- The model is relational, not document-shaped. `Assignment` is a join table with its own audit
  fields and is the enforcement point for rule 6 — an employee's visibility resolves through an
  active row there. That is a foreign key, not an embedded document.
- Constraints do real work here: `@@unique([userId, date])` on `AttendanceLog` prevents the
  duplicate check-in the current UI cannot guard against, and `onDelete: Restrict` on project
  relations stops business records being erased with a project.
- Prisma generates types from the schema, so backend types derive from the database rather than
  being maintained alongside it.
- Admin reporting is aggregate queries across joins. SQL is the right tool.

**Alternatives considered.**
- *MongoDB* — rejected: no foreign keys or cross-collection constraints, so the integrity rules
  above become application code that can be bypassed.
- *Firebase Firestore* — rejected on two counts. Client-side security rules are the wrong place
  for rules 4–7 (a compromised client is inside the trust boundary), and relational queries for
  admin reporting are awkward and expensive. It would have removed the need for ADR-007
  entirely, which is precisely the tradeoff being declined.
- *Supabase* — Postgres with a hosted API layer. Still on the table as a *hosting* choice for
  the database (see `docs/deployment.md`); rejected as an application-layer replacement for the
  same client-side-rules reason as Firestore.
- *SQLite* — sufficient for the data volume, rejected for concurrent multi-device writes and
  managed-backup story.

**Consequences.**
- Postgres must be provisioned and backed up. Hosting choice is `[OPEN]`.
- `UserStatus` collapses the documented `Approved` and `Active` states into one `ACTIVE` value,
  because neither `Pending` nor `Approved` can authenticate and the only real boundary is
  "can log in or not." If admin needs the distinction, add `APPROVED` to the enum before the
  first migration and keep the login gate at `ACTIVE` only.
- The frontend's two-value `active: boolean` in `app/(admin)/employees/index.tsx` must be
  replaced with the enum. Phase 2 HIGH task.
- Two schema decisions must be settled before the first migration: whether `UserStatus` needs
  `APPROVED`, and whether `Project.services` is a `text[]` or a lookup table.

---

## ADR-009: No open registration — admin-controlled onboarding only

**Status:** `[DECIDED]`
**Date:** July 2026

A product decision recorded as an ADR because it constrains auth architecture, API design, and
every feature added from here.

**Context.** AS Associates is a contracting firm doing bank branch fit-outs. The app carries
site photos, attendance records, and client project data for banking clients. There is no
public-facing surface and no reason anyone outside the company should hold an account. Access
is a function of employment, and employment is decided by management — not by whoever reaches
the login screen.

**Decision.** Access is granted exclusively by admin. The full policy, verbatim, is rules 1–7
in `docs/user-roles-and-permissions.md`:

1. This is a private internal app. Public registration is NOT allowed.
2. Employees cannot self-onboard or gain access on their own.
3. Any registration flow that exists must only create a pending request — not grant access.
4. Only admin-approved and active employees can log in.
5. Admin is the sole authority for: creating accounts, approving, activating, deactivating,
   assigning permissions, assigning projects.
6. Employees can only see data relevant to their own account and assignments.
7. Admin can see all employee data, uploads, attendance logs, progress logs, and assignments.

**Rationale.** The population of legitimate users is exactly the set of current employees —
known, finite, and already managed by someone. A self-service flow would add an attack surface
and an approval queue to solve a problem that does not exist. Making admin the sole authority
also gives a single, auditable place where access is granted and revoked, which is what a
company handling client site data needs.

**Alternatives considered.**
- *Open signup with admin approval* — rejected: a public endpoint plus a queue, when the invite
  direction is already known. Rule 3 permits a pending-request record but it must never grant
  access.
- *Email-domain allowlist self-signup* — rejected: domain membership does not imply current
  employment, and it silently readmits former employees.
- *SSO / Google Workspace* — plausible later if the company standardises on Workspace. Rejected
  now as an external dependency for a two-role app, and it would not by itself satisfy rule 4's
  account-status gate.

**Consequences.**
- **Rule 8 in `CLAUDE.md`:** do not add a signup or registration screen. There is none today,
  and rule 1 forbids one. `app/(auth)/` contains `login.tsx` only.
- No `POST /auth/register` exists in `docs/api-contract.md`. `POST /auth/login` is the only
  `[PUBLIC]` endpoint in the entire API.
- Account creation is `POST /users` — `[ADMIN ONLY]`. `status` and `mustChangePassword` are
  server-forced and never client-settable.
- `prisma/seed.ts` creates exactly one admin. No code path anywhere creates an employee account
  without an authenticated admin.
- The lifecycle needs real UI that does not exist: create employee, approve, activate,
  deactivate, employee detail. `app/(admin)/employees/index.tsx` is a read-only list whose
  add-employee button at line 61 has no `onPress` handler. **This is the largest single gap in
  the app against rule 5.**
- Rule 4 is currently unenforced — login matches two hardcoded users with no status check.
- Rule 7 is the least-served rule: there is no admin view of uploads, attendance logs, or
  progress logs anywhere in the app.
- Password recovery is admin-mediated in Phase 2. Self-service email reset is deferred; the
  "Forgot password?" link on the login screen is inert.

---

## ADR-010: Stitch AI for UI design, Stitch MCP in Antigravity IDE for implementation

**Status:** `[DECIDED]`
**Date:** July 2026

**Context.** The 16 screens were built to a Stitch design system — "Architectural Utility
Framework", Stitch project `7450523547241458564` — captured in `DESIGN.md` at the repo root.
No screen has been formally diffed against that design, so all 16 carry unknown drift. Phase 1
exists to close that gap, and the tooling for it had to be settled.

**Decision.** Stitch AI is the design source of truth. Pixel-accurate alignment is done in
**Antigravity IDE with Stitch MCP connected**, one screen at a time — not in Claude Desktop.

**Rationale.** Stitch MCP can read the live design directly, so the diff is against the actual
design rather than a transcription of it. Working one screen at a time keeps each change
reviewable. Claude Desktop has no Stitch MCP connection, which is why it owns the
documentation phase and not the alignment phase — hence this docs/ folder existing before any
screen is touched.

**Per-screen procedure.** Read `docs/design-system.md` → diff the implementation against the
Stitch design → **list the mismatches first** → fix only those. No feature work, no new
screens, no refactors of unrelated code.

This is the note carried at the bottom of `CLAUDE.md`: *"Before modifying any screen, read
docs/design-system.md and compare the existing screen implementation against the Stitch design.
List mismatches first. Fix only those issues."*

**Alternatives considered.**
- *Hand-transcribe Stitch values into tokens and eyeball each screen* — rejected: that is
  effectively what produced the current drift.
- *Do alignment in Claude Desktop* — rejected: no Stitch MCP access, so it would be diffing
  against `DESIGN.md` rather than the design itself.
- *Rebuild screens from Stitch output* — rejected: 16 working screens exist; targeted diffs are
  cheaper and lower-risk.

**Consequences.**
- Documentation had to be finished first. That prerequisite is what this docs/ folder is.
- `docs/design-system.md` is the reconciliation surface between `tokens.ts` and Stitch, and its
  §9 is a placeholder awaiting pasted Stitch tokens.
- Known blockers to resolve *before* per-screen work, or the work gets redone: the
  primary/surface role inversion between `DESIGN.md` and `tokens.ts`, the unresolved primary
  action color (ADR-013), the two header systems, the non-Tabs bottom nav, and the absence of
  an icon system (Stitch specifies Material symbols; the app uses emoji and text glyphs).
- `app.json` sets an Android adaptive-icon background of `#12385B` — a third navy that appears
  in neither `tokens.ts` nor `DESIGN.md`. Reconcile during the token audit.
- Five built components are imported by zero screens — `PhotoPickerGrid`, `WorkStagePicker`,
  `AttendanceCalendar`, `CategoryPicker`, `RequestControls` — because screens reimplemented them
  inline. Reconnecting them is pure frontend work and belongs in Phase 1.

---

## ADR-011: File storage — Cloudinary vs S3

**Status:** `[OPEN]`
**Date:** raised July 2026

**Context.** Site photo upload is a core employee workflow and needs object storage. Nothing is
built: `expo-image-picker` and `expo-image-manipulator` are installed but never called, and
`app/(employee)/upload.tsx:103` is `onPress={() => {}}`. The decision is not blocking Phase 1 or
Phase 2 — it blocks Phase 4.

**Options.**

*Cloudinary*
- On-the-fly transformation and CDN delivery out of the box — thumbnails for list views come
  free, which suits the dashboard's recent-uploads strip and per-project galleries.
- Faster to integrate; less infrastructure to own.
- Cost scales with transformation and bandwidth, not just storage.
- More vendor lock-in around the transformation URL scheme.

*S3*
- Cheaper at rest and effectively unbounded.
- Standard tooling, easy lifecycle policies and backups.
- Needs CloudFront (or equivalent) for CDN delivery, and thumbnail generation becomes something
  to build — a resize step, or a Lambda.
- More infrastructure to configure and secure.

**Current lean.** Cloudinary as primary, S3 as fallback — the volume is small (10–50 employees
posting a handful of photos a day) so transformation convenience outweighs storage cost at this
scale.

**Not blocking, by design.** `docs/backend-architecture.md` puts both behind
`storage/storage.interface.ts` specifically so the choice cannot leak into
`uploads.service.ts`. Either provider drops in behind the same contract.

**Constraints either provider must satisfy** (from `docs/backend-architecture.md`):
MIME whitelist `image/jpeg`, `image/png`, `application/pdf` validated by sniffed content type;
10 MB per file, 10 files per request; server-generated UUID storage keys, never client
filenames; private objects served via short-lived signed URLs, never public buckets.

**Decide by.** Start of Phase 4.

---

## ADR-012: Auth token strategy — JWT only vs JWT + refresh token rotation

**Status:** `[OPEN]` — rotation strongly preferred, not finalized
**Date:** raised July 2026

**Context.** Rule 4 says only active employees can log in, and rule 5 gives admin sole
authority to deactivate. Those two together mean deactivation has to take effect *promptly* —
a long-lived bearer token that outlives a deactivation is a direct policy violation.

**Options.**

*JWT only, long-lived access token*
- Simplest: no server-side session state, no refresh endpoint, no rotation bookkeeping.
- A deactivated employee keeps access until the token expires, unless status is re-checked per
  request anyway.
- Longer lifetime means a leaked token is useful for longer, with no revocation path.

*JWT access + rotating refresh token (preferred)*
- 15-minute access token, 7-day rotating refresh token.
- Refresh tokens stored server-side as hashes, so they are revocable. `familyId` groups a
  rotation chain; reuse of a consumed token revokes the whole family.
- Deactivating a user revokes every refresh row for that user immediately.
- Costs a `RefreshToken` table, a rotation endpoint, and a cleanup job for expired rows.

**Why rotation is preferred.** It is the option that makes revocation real. `AccountActiveGuard`
re-reads `status` from the database on every request regardless — so the JWT `status` claim is
only ever a fast-path hint — but without revocable refresh tokens there is no way to end a
session, only to wait it out.

**Already specified on the rotation assumption.** `docs/backend-architecture.md` documents the
15min/7day lifetimes and the guard order; `docs/database-schema.md` includes the `RefreshToken`
model with `tokenHash`, `familyId`, `revokedAt`, and an `expiresAt` index for cleanup;
`docs/api-contract.md` includes `POST /auth/refresh` and `POST /auth/logout`.

**What is actually still open.** Not *whether* to rotate, but the details: exact lifetimes,
whether logout revokes one session or the whole family, and whether refresh tokens are
device-scoped. These get settled when the auth module is written.

**Reality check.** Neither option exists today. Login matches two hardcoded users in
`app/(auth)/login.tsx`, "issues" a literal string as a token, and never checks account status.
`src/services/api.ts` has request and response interceptors written for real tokens — inject
`Authorization: Bearer`, logout on 401 — that have never executed.

**Decide by.** Start of the Phase 2 auth module.

---

## ADR-013: Primary action color — Stitch amber vs current navy

**Status:** `[OPEN]`
**Date:** raised July 2026

**Context.** `DESIGN.md` specifies a `secondary` / amber `#F5A623` as the primary action color.
`src/constants/tokens.ts` carries it as `Colors.accent`, and `Button.tsx` uses it for the
`primary` variant — but screens across the app use navy `Colors.primary` for their main
actions instead. So the design's intended action color is present in the token file and largely
absent from the screens.

This sits alongside a related discrepancy: `DESIGN.md` specifies `primary #002645` and
`primary-container #1A3C5E`, while `tokens.ts` has those two roles inverted
(`primary: #1A3C5E`, `primaryDark: #002645`). And `DESIGN.md`'s `surface #FCF8FB` is
`background` in tokens, with `surface` set to pure white.

**Options.**
- *Amber, per Stitch* — matches the design source. Touches every screen's main CTA.
- *Navy, per current implementation* — matches what is built. Requires amending `DESIGN.md` and
  accepting divergence from the Stitch source.

**Why it is open.** This is a global visual decision, not a per-screen fix. Aligning screens
one at a time before settling it would mean revisiting each one.

**Blocks.** Phase 1 per-screen alignment. Listed as a Phase 1 HIGH blocker in
`docs/development-phases.md` and as a HIGH task in `docs/todo-roadmap.md`.

**Decide by.** Before the first screen is aligned — together with the primary/surface role
inversion, since both are token-level.

---

## ADR-014: Geolocation on attendance check-in

**Status:** `[OPEN]`
**Date:** raised July 2026

**Context.** Attendance verification is one of the three problems the app exists to solve —
`docs/product-overview.md` notes attendance is currently "unverifiable and reconciled by hand at
month end." Whether *verifiable* means geofenced to the site was never confirmed. No location
dependency is installed, and check-in at `app/(employee)/attendance.tsx:60` only flips a local
`useState`.

**Options.**
- *No location* — simplest, and the employee is trusted. Does not fully solve the verifiability
  problem that motivated the feature.
- *Location captured, advisory* — record lat/lng with the check-in for admin to review, but do
  not block on it. Middle path.
- *Geofenced, enforced* — reject a check-in outside a radius of the site. Requires a location
  per project (`Project.location` is free text today, not coordinates), plus handling for GPS
  drift indoors — a real concern for people working inside bank branches.

**Schema is already hedged for this.** `AttendanceLog` in `docs/database-schema.md` has
`checkInLocation`, `checkInLatitude`, and `checkInLongitude` all nullable, so a later "yes,
advisory" needs no migration. A "yes, and mandatory and enforced" would — it needs coordinates
on `Project` and a `NOT NULL` constraint.

**Decide by.** Before the `AttendanceLog` migration ships in Phase 2.

---

## Superseded or reversed

Nothing has been superseded yet. ADR-002 is the closest — it reverses an earlier stack plan that
included NativeWind, but that plan predates this record and was never itself written up as an
ADR.
