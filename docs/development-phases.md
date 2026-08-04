# Development Phases

Honest phase breakdown based on what is actually in the repo. "Confirmed" means observed
running on the Android Pixel 7 emulator via Expo Go. "Unverified" means the code exists and
should render, but has not been visually confirmed screen by screen.

---

## Phase 0 — Completed

Frontend prototype. 19 route files (16 screens + 3 layouts), 18 shared components, all fed by
per-screen hardcoded mock data. No network call is made anywhere in the app.

### Confirmed working on the Pixel 7 emulator
- App boot: Inter font loading (400/500/700/800), error boundary, TanStack Query provider,
  SafeAreaProvider — `app/_layout.tsx`
- `AuthGuard` redirect by hydration state and role — `app/_layout.tsx:115-117`
- Login against two hardcoded users, with Zod validation and an 800ms simulated delay —
  `app/(auth)/login.tsx`
- Session persistence across app restart via AsyncStorage — `src/store/auth.store.ts`
- Logout clearing token and user — `(employee)/profile.tsx:103`, `(admin)/settings.tsx:119`
- Employee Home — `app/(employee)/index.tsx`
- My Projects, including status filter chips — `app/(employee)/projects.tsx`
- Employee Profile — `app/(employee)/profile.tsx`
- Admin Dashboard — `app/(admin)/index.tsx`
- Admin Projects list, with navigation to `new` and `[id]` — `app/(admin)/projects/index.tsx`
- Employees directory, with All/Active/Inactive filter chips —
  `app/(admin)/employees/index.tsx`
- Admin Settings — `app/(admin)/settings.tsx`

### Renders, unverified against a device walkthrough
- Attendance — `app/(employee)/attendance.tsx`
- Upload Work Photos — `app/(employee)/upload.tsx`
- Daily Progress — `app/(employee)/progress.tsx`
- My Requests — `app/(employee)/requests.tsx`
- New Project — `app/(admin)/projects/new.tsx`
- Project Detail — `app/(admin)/projects/[id].tsx`
- Admin Requests — `app/(admin)/requests.tsx`
- Reports — `app/(admin)/reports.tsx`

### Explicitly not done in Phase 0
- No backend, no API call — `src/services/api.ts` is written but `apiClient` is never invoked
- No TanStack Query hooks, despite the provider being mounted
- No real auth, no account-status check (access-control rule 4 unenforced)
- No write path: every data-writing CTA is a stub — `upload.tsx:103`, `progress.tsx:138`,
  `reports.tsx:77`, `projects/new.tsx:191`, `employees/index.tsx:61`
- No employee lifecycle UI (Pending and Approved states have no screen)
- No image picker call, despite `expo-image-picker` and `expo-image-manipulator` being installed
- No admin views of uploads, attendance logs, or progress logs (rule 7 unserved)
- No employee project detail route (`app/(employee)/project/[id].tsx` absent)
- No push notifications, no report export, no settings row actions
- Five built components imported by zero screens — `PhotoPickerGrid`, `WorkStagePicker`,
  `AttendanceCalendar`, `CategoryPicker`, `RequestControls`

---

## Phase 1 — In Progress (current)

**Goal.** Make all 19 route files pixel-accurate to the Stitch designs.

**Method.** Antigravity IDE with Stitch MCP connected, one screen at a time. For each screen:
read `docs/design-system.md`, diff the implementation against the Stitch design, list the
mismatches, then fix only those. No feature work, no new screens.

**Prerequisite.** All `docs/` files completed first. This document is part of that prerequisite.

**Status.** Documentation in progress. Stitch alignment not yet started — no screen has been
formally diffed.

### Documentation state
| File | Status |
|---|---|
| `CLAUDE.md` | Done |
| `docs/product-overview.md` | Done |
| `docs/user-roles-and-permissions.md` | Done |
| `docs/screens-and-features.md` | Done |
| `docs/design-system.md` | Done |
| `docs/core-workflows.md` | Done |
| `docs/development-phases.md` | This file |
| `docs/todo-roadmap.md` | Done |
| `docs/backend-architecture.md` | Done |
| `docs/database-schema.md` | Done |
| `docs/api-contract.md` | Done |
| `docs/decisions.md` | Done |
| `docs/performance-and-scalability.md` | Done |
| `docs/deployment.md` | Done |
| `docs/README.md` | Done |

All 14 `docs/` files are complete. The Phase 1 prerequisite is met — Stitch alignment can begin.

### Known blockers to resolve before per-screen work
Fixing screens before these are settled means redoing the work.

1. **`tokens.ts` contradicts `DESIGN.md` on primary and surface.** Stitch specifies
   `primary #002645` / `primary-container #1A3C5E`; `tokens.ts` has those roles inverted.
   Stitch `surface #FCF8FB` is used as `background` in tokens while `surface` is pure white.
   See `docs/design-system.md` §9.
2. **The Stitch amber secondary (`#F5A623`) is not the primary action color on any screen** —
   navy `Colors.primary` is used instead. A global decision, not a per-screen fix.
3. **Two coexisting header systems.** Four admin screens set `headerShown: false` and draw
   custom headers; three employee screens use the shared `Stack` header.
4. **Bottom nav is not a Tabs navigator.** Each screen renders `BottomNav` / `AdminBottomNav`
   manually with a literal `activeIndex`, so it remounts on every navigation.
5. **No icon system.** Nav tabs and settings rows use emoji and text glyphs; Stitch specifies
   Material symbols.
6. **NativeWind is dead weight.** `nativewind`, `tailwindcss`, `tailwind.config.js`,
   `global.css`, `nativewind-env.d.ts` remain and `app/_layout.tsx:1` imports `../global.css`,
   but no screen uses `className`. Remove in a dedicated cleanup task.

### Out of scope for Phase 1
Wiring stubbed CTAs, adding missing routes, and building lifecycle UI are all Phase 3 work —
they need a backend to be meaningful. The two exceptions worth doing in Phase 1 because they
are pure frontend: reconnecting the five orphaned components, and restoring the four
commented-out dashboard quick-action handlers.

---

## Phase 2 — Planned

**Goal.** Backend foundation: NestJS + PostgreSQL + Prisma, with auth built around the
admin-approval flow.

**Dependencies.** Phase 1 complete. API contract finalized and written down before any
controller is coded.

Scope:
- Design docs first — `docs/backend-architecture.md`, `docs/database-schema.md`,
  `docs/api-contract.md`
- Scaffold the NestJS project, Prisma schema, and migrations
- Model the four-state employee lifecycle (`Pending → Approved → Active → Deactivated`) as a
  real enum. The current frontend uses a two-value `active: boolean` — reconcile at schema
  design time.
- JWT issuance, refresh, and revocation
- **No public `POST /auth/register`.** Account creation is an admin-only endpoint (rule 1–3).
- Login must reject any account not in `Active` state, with a distinct reason per state (rule 4)
- Role guards on every admin capability, server-side (rule 5)
- Every employee-scoped read filtered by the authenticated user's ID and assignments, derived
  from the token — never from a client-supplied parameter (rule 6)
- Entities: User, Project, Assignment, Attendance, ProgressLog, Upload, Request

---

## Phase 3 — Planned

**Goal.** Connect the frontend to the real backend and delete all mock data.

**Dependencies.** Phase 2 API deployed and reachable from the emulator.

Scope:
- Write TanStack Query hooks per resource. The provider is already mounted; there is no second
  mock layer to build — replace the inline arrays directly.
- Point `apiClient` at the real base URL and actually invoke it (`src/services/api.ts` is
  written and unused today)
- Real login: remove `MOCK_USERS`, enforce the account-status gate
- Build the missing admin UI required by rule 5: create employee, approve, activate,
  deactivate, employee detail route
- Build the missing admin UI required by rule 7: views of uploads, attendance logs, progress logs
- Add `app/(employee)/project/[id].tsx`
- Wire every stubbed CTA: attendance check-in, progress save, request submit, request
  approve/reject, project create with persisted assignment
- Real project progress percentages derived from logs, not hardcoded
- Error, empty, and loading states per screen — none exist today

---

## Phase 4 — Planned

**Goal.** File uploads, push notifications, production build.

**Dependencies.** Phase 3 complete.

Scope:
- Choose the storage provider (Cloudinary or S3 — still undecided) and implement signed uploads
- Wire `expo-image-picker` and `expo-image-manipulator`, and reconnect `PhotoPickerGrid`
- Firebase Cloud Messaging: device registration, notification handling, admin-triggered sends
- Notification preferences UI (currently a static settings section)
- Report generation and export
- EAS production build, app signing, distribution to company devices
- iOS support if required — `npm run ios` and `npm run web` exist but are untested
