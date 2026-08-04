# Screens and Features

Every entry below maps to a file that exists in the repo. Paths are relative to the repo root.

**Route file count: 19** — 16 rendered screens + 3 layout files. Expo Router file-based
routing; the parenthesised segments are route groups, not URL segments.

## Status legend

| Tag | Meaning |
|---|---|
| `[IMPLEMENTED]` | Renders correctly and its interactions work as far as a mock-data frontend can. |
| `[PARTIAL]` | Renders, but a primary action is a no-op stub or a required control is missing. |
| `[NEEDS STITCH ALIGNMENT]` | Renders, but has not been diffed against the Stitch design in `DESIGN.md`. |

Every screen uses mock data. No screen makes a network call. `[IMPLEMENTED]` means
"complete as a frontend", not "feature-complete".

---

## Layouts (not screens)

| File | Role | What it does | Status |
|---|---|---|---|
| `app/_layout.tsx` | Both | Root layout: Inter font loading, error boundary, TanStack Query provider, SafeAreaProvider, and the `AuthGuard` that redirects on hydration + role. | `[IMPLEMENTED]` |
| `app/(admin)/_layout.tsx` | Admin | Expo Router `Stack` with navy header + Inter Bold title. | `[IMPLEMENTED]` |
| `app/(employee)/_layout.tsx` | Employee | Same `Stack` config as the admin layout. | `[IMPLEMENTED]` |

Note: several screens set `headerShown: false` and draw their own header, so the shared
layout header styling is inconsistently applied. See Known Issues.

---

## Auth screens (1)

| # | Screen | File path | Role | Status |
|---|---|---|---|---|
| 1 | Login | `app/(auth)/login.tsx` | Both | `[PARTIAL]` |

**Login** — Logo card, email + password inputs, error banner, Sign In button, "Forgot
password?" link, footer. React Hook Form + Zod validation. Authenticates against a
hardcoded `MOCK_USERS` map (`admin@asassociates.com` / `admin123`,
`rahul@asassociates.com` / `rahul123`), simulates an 800ms delay, then routes by role.

Why `[PARTIAL]`: no real auth; "Forgot password?" has no `onPress`; no account-status check,
so access-control rule 4 is unenforced.

There is **no registration or signup screen**, by design — see
`docs/user-roles-and-permissions.md`.

---

## Employee screens (7)

| # | Screen | File path | Role | Status |
|---|---|---|---|---|
| 2 | Employee Dashboard | `app/(employee)/index.tsx` | Employee | `[PARTIAL]` |
| 3 | My Projects | `app/(employee)/projects.tsx` | Employee | `[PARTIAL]` |
| 4 | Attendance | `app/(employee)/attendance.tsx` | Employee | `[PARTIAL]` |
| 5 | Upload Work Photos | `app/(employee)/upload.tsx` | Employee | `[PARTIAL]` |
| 6 | Daily Progress | `app/(employee)/progress.tsx` | Employee | `[PARTIAL]` |
| 7 | My Requests | `app/(employee)/requests.tsx` | Employee | `[PARTIAL]` |
| 8 | Profile | `app/(employee)/profile.tsx` | Employee | `[IMPLEMENTED]` |

**Employee Dashboard** (357 lines) — Greeting banner with project count and days-present
stats, quick-action grid, attendance summary card, active project cards, recent uploads list.
Uses `MOCK_PROJECTS`, `MOCK_ATTENDANCE`, `MOCK_UPLOADS`.
Why `[PARTIAL]`: **four of five quick actions are commented-out navigation stubs** —
attendance (line 153), upload (158), request (163), progress (168). Only "View all projects"
(line 181) actually navigates. Project-card and upload-item taps are `TODO` no-ops
(lines 93, 98).

**My Projects** — Filterable list of all projects with status chips. Filter logic works
against `MOCK_ALL_PROJECTS`.
Why `[PARTIAL]`: tapping a project is a `TODO` comment (line 110). There is no
`app/(employee)/project/[id].tsx` route, so employees have no project detail view at all.

**Attendance** — Monthly `AttendanceCalendar`, `AttendanceSummaryCard`, check-in button.
Why `[PARTIAL]`: check-in only flips local `useState` (`setMarked(true)`, line 60). Nothing
persists; state resets on unmount.

**Upload Work Photos** — Project picker, category picker, `PhotoPickerGrid`, notes field,
Submit button.
Why `[PARTIAL]`: `Submit Upload` is `onPress={() => {}}` (line 103). No `expo-image-picker`
call anywhere despite the dependency being installed — the photo grid does not open a picker.

**Daily Progress** — Project selector, `WorkStagePicker`, hours stepper (±0.5), progress
notes, Save button.
Why `[PARTIAL]`: `Save Progress` is `onPress={() => {}}` (line 138). Stage selection and the
hours stepper work locally.

**My Requests** (292 lines) — Employee's own Material/Issue/Support requests with status
filters, plus `RequestControls` for composing a new one.
Why `[PARTIAL]`: no submit handler; requests are not created.

**Profile** — Avatar, name, employee metadata, and a working Logout button that calls
`useAuthStore().logout()` (line 103).
`[IMPLEMENTED]` as a frontend. No edit-profile capability exists (correctly — that is
admin-controlled per rule 5).

---

## Admin screens (8)

| # | Screen | File path | Role | Status |
|---|---|---|---|---|
| 9 | Admin Dashboard | `app/(admin)/index.tsx` | Admin | `[PARTIAL]` |
| 10 | Employees | `app/(admin)/employees/index.tsx` | Admin | `[PARTIAL]` |
| 11 | Projects | `app/(admin)/projects/index.tsx` | Admin | `[IMPLEMENTED]` |
| 12 | New Project | `app/(admin)/projects/new.tsx` | Admin | `[PARTIAL]` |
| 13 | Project Detail | `app/(admin)/projects/[id].tsx` | Admin | `[PARTIAL]` |
| 14 | Requests | `app/(admin)/requests.tsx` | Admin | `[PARTIAL]` |
| 15 | Reports | `app/(admin)/reports.tsx` | Admin | `[PARTIAL]` |
| 16 | Settings | `app/(admin)/settings.tsx` | Admin | `[PARTIAL]` |

**Admin Dashboard** (314 lines) — Stat cards, active projects preview, pending requests
preview. Navigates to `/(admin)/projects` (line 136) and `/(admin)/requests` (line 185).
Why `[PARTIAL]`: all stats are hardcoded; no employees or attendance entry point.

**Employees** — Employee list with initials avatars, employee ID, designation, project count,
attendance percentage, Active/Inactive badge, and All/Active/Inactive filter chips.
Why `[PARTIAL]`: read-only. The add-employee button (line 61) has **no `onPress` handler**.
No approve, activate, deactivate, assign-permission, or detail view. This is the single
biggest gap against access-control rule 5. The model is a two-value `active: boolean`, not the
four-state Pending → Approved → Active → Deactivated lifecycle.

**Projects** — Project list with status badges and progress bars. "New project" button routes
to `projects/new` (line 91); rows route to `projects/[id]` (line 136). Both destinations
exist. `[IMPLEMENTED]` as a frontend.

**New Project** (314 lines) — Full creation form: name, client, location, dates, services
multi-select (line 133), team-member multi-select (line 161).
Why `[PARTIAL]`: `Create Project` calls `router.back()` (line 191) without saving. Nothing is
created and no employee assignment is persisted.

**Project Detail** (275 lines) — Tabbed detail view (line 121) over mock project data, custom
header with back button.
Why `[PARTIAL]`: read-only; no edit, no delete, no assignment change. No admin view of the
uploads, attendance, or progress logs belonging to the project.

**Requests** — All employees' Material/Issue/Support requests with type colors, priority
colors, and All/Pending/Approved/Rejected filters. Filters work.
Why `[PARTIAL]`: **no approve or reject action.** Status is display-only, so the admin's core
job on this screen cannot be performed.

**Reports** — Report-type selector (line 61) and a Generate Report button.
Why `[PARTIAL]`: `Generate Report` is `onPress={() => {}}` (line 77). No data source, no
export, no rendered report.

**Settings** — Company info card, and section groups for Company Management, Notifications,
and App Info. Logout works via `useAuthStore().logout()` (line 119).
Why `[PARTIAL]`: every settings row renders a chevron but has **no `onPress`** — all
navigation rows are inert. Only Logout functions.

---

## Shared components in use

Reused across the screens above; see `COMPONENTS.md` for the full inventory.

- `src/components/ui/` — `Avatar`, `Badge`, `BottomNav`, `AdminBottomNav`, `Button`, `Card`,
  `Dropdown`, `Input`, `ProgressBar`
- `src/components/employee/` — `AttendanceCalendar`, `AttendanceSummaryCard`,
  `CategoryPicker`, `PhotoPickerGrid`, `ProjectCard`, `QuickActionButton`,
  `RecentUploadItem`, `RequestControls`, `WorkStagePicker`

`BottomNav` / `AdminBottomNav` are rendered per-screen with a hardcoded `activeIndex` rather
than being hoisted into a Tabs layout.

---

## Known Issues

### Stitch alignment — unverified across all 16 screens
No screen has been formally diffed against the Stitch design system in `DESIGN.md`. Treat
every screen as `[NEEDS STITCH ALIGNMENT]` until a diff is done. Concrete discrepancies
already visible in the code:

1. **Token drift.** `DESIGN.md` specifies `surface: #FCF8FB`, `primary: #002645`,
   `primary-container: #1A3C5E`, `secondary: #F5A623`. Screens consume
   `Colors.primary` / `Colors.surface` from `src/constants/tokens.ts`, which has not been
   verified against that table. The Stitch amber secondary (`#F5A623`) does not appear as a
   primary action color on any screen — `Colors.primary` navy is used for primary buttons
   instead.
2. **Header inconsistency.** `(admin)/index`, `(admin)/reports`, `(admin)/projects/new`, and
   `(admin)/projects/[id]` set `headerShown: false` and draw custom headers, while
   `(employee)/attendance`, `(employee)/upload`, and `(employee)/progress` use the shared
   `Stack` header. Two visual header systems coexist.
3. **Bottom nav is not a Tabs navigator.** Each screen renders `BottomNav` /
   `AdminBottomNav` manually with a literal `activeIndex`, so the nav remounts on every
   navigation and active state can desync from the actual route.
4. **Emoji glyphs as icons.** `(admin)/settings.tsx` uses text glyphs for row icons and `›`
   for chevrons instead of an icon set. Stitch specifies Material symbols.

### Dead navigation
`app/(employee)/index.tsx` lines 153, 158, 163, 168 and lines 93, 98; and
`app/(employee)/projects.tsx` line 110 — commented-out or `TODO` handlers. The employee
dashboard's quick-action grid is largely non-functional even though every destination screen
exists.

### Missing routes
- `app/(employee)/project/[id].tsx` — employee project detail. Referenced in two `TODO`
  comments; does not exist.
- No pending-access-request queue for admin (lifecycle states Pending and Approved have no UI).
- No admin views for uploads, attendance logs, or progress logs — required by rule 7.

### Stubbed primary actions
`onPress={() => {}}` on the main CTA of: `(employee)/upload.tsx:103`,
`(employee)/progress.tsx:138`, `(admin)/reports.tsx:77`. `(admin)/projects/new.tsx:191`
navigates back without saving. `(admin)/employees/index.tsx:61` has no handler at all.

### Styling stack leftovers
`nativewind`, `tailwindcss`, `tailwind.config.js`, `global.css`, and `nativewind-env.d.ts`
remain in the project and `app/_layout.tsx:1` imports `../global.css`, but no screen uses
`className`. Should be removed in a dedicated cleanup task.
