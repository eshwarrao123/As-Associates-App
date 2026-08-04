# Core Workflows

Step-by-step for each user journey. Every step is tagged with what exists today.

| Tag | Meaning |
|---|---|
| `[UI BUILT]` | Screen and control exist and respond to taps |
| `[PARTIAL]` | Screen exists, the action is a stub or local-only `useState` |
| `[NO UI]` | Nothing in the repo does this |
| `[NEEDS BACKEND]` | Cannot work until the NestJS API exists |

Baseline facts that apply to all eight workflows: there is no backend, no network call is made
anywhere in the app, and login matches two hardcoded users in `app/(auth)/login.tsx`. Nothing
any user does persists beyond component state.

---

## 1. Admin: Create and activate a new employee account

Access-control rules 2, 3, and 5 mean this flow is admin-only start to finish. There is no
self-signup path and none may be added.

| # | Step | Screen / file | Status |
|---|---|---|---|
| 1 | Admin logs in and lands on the dashboard | `app/(admin)/index.tsx` | `[UI BUILT]` |
| 2 | Admin opens the employee directory | `app/(admin)/employees/index.tsx` via `AdminBottomNav` tab 3 | `[UI BUILT]` |
| 3 | Admin taps "add employee" | button at `employees/index.tsx:61` | `[PARTIAL]` — button renders with **no `onPress` handler** |
| 4 | Admin enters name, email, employee ID, designation, department | — | `[NO UI]` — no create-employee form screen exists |
| 5 | System creates the account in `Pending` state | — | `[NEEDS BACKEND]` |
| 6 | Admin approves the account (`Pending` → `Approved`) | — | `[NO UI]` |
| 7 | Admin activates the account (`Approved` → `Active`) | — | `[NO UI]` |
| 8 | Credentials are issued to the employee | — | `[NEEDS BACKEND]` |
| 9 | Employee appears in the directory with an Active badge | `employees/index.tsx` | `[UI BUILT]` for display only |

**Current Status.** Only steps 1, 2, and 9 work. The directory renders five mock employees
with an Active/Inactive badge and All/Active/Inactive filter chips that filter correctly. Steps
3–8 do not exist. This is the largest single gap in the app against access-control rule 5 — the
admin cannot onboard anyone from the app today.

Two blockers before this can be built:
- The employee model in the directory is a two-value `active: boolean`, not the four-state
  `Pending → Approved → Active → Deactivated` lifecycle in
  `docs/user-roles-and-permissions.md`. The model must be reconciled first.
- Account creation and every state transition must be a server-side admin-guarded endpoint.
  Client-side route grouping is not security.

---

## 2. Admin: Assign a project to an employee

| # | Step | Screen / file | Status |
|---|---|---|---|
| 1 | Admin opens the projects list | `app/(admin)/projects/index.tsx` | `[UI BUILT]` |
| 2 | Admin taps "New project" | routes to `projects/new` (`index.tsx:91`) | `[UI BUILT]` |
| 3 | Admin fills name, client, location, start/end dates | `app/(admin)/projects/new.tsx` | `[UI BUILT]` |
| 4 | Admin multi-selects services | `projects/new.tsx:133` | `[UI BUILT]` — local state |
| 5 | Admin multi-selects team members | `projects/new.tsx:161` | `[UI BUILT]` — local state |
| 6 | Admin taps "Create Project" | `projects/new.tsx:191` | `[PARTIAL]` — calls `router.back()` and **saves nothing** |
| 7 | Assignment is written and scoped to those employees | — | `[NEEDS BACKEND]` |
| 8 | Assigned employee sees the project in My Projects | `app/(employee)/projects.tsx` | `[PARTIAL]` — reads its own `MOCK_ALL_PROJECTS`, unrelated to step 5 |
| 9 | Admin changes assignment on an existing project | `app/(admin)/projects/[id].tsx` | `[NO UI]` — detail view is read-only |

**Current Status.** The form is complete and the team-member picker works, but the two halves
of this workflow are not connected: what the admin selects in step 5 has no path to what the
employee sees in step 8. Both sides read separate hardcoded arrays. Editing an assignment after
creation is not possible at all.

---

## 3. Admin: View employee attendance and progress logs

Required by access-control rule 7 (admin sees all attendance logs, progress logs, and uploads).

| # | Step | Screen / file | Status |
|---|---|---|---|
| 1 | Admin opens the employee directory | `app/(admin)/employees/index.tsx` | `[UI BUILT]` |
| 2 | Admin sees a per-employee attendance percentage | same, in the mock row data | `[UI BUILT]` — static string, e.g. `'87%'` |
| 3 | Admin taps an employee to open a detail view | — | `[NO UI]` — no `app/(admin)/employees/[id].tsx` route exists |
| 4 | Admin reads that employee's attendance history | — | `[NO UI]` |
| 5 | Admin reads that employee's progress logs | — | `[NO UI]` |
| 6 | Admin reads that employee's photo uploads | — | `[NO UI]` |
| 7 | Admin filters logs by project or date range | — | `[NO UI]` |
| 8 | Admin generates a report over the logs | `app/(admin)/reports.tsx` | `[PARTIAL]` — type selector works, `Generate Report` is `onPress={() => {}}` at line 77 |

**Current Status.** Effectively unbuilt. Step 2's percentage is a hardcoded string, not a
computed value. There is no admin-facing view of any attendance record, progress log, or
upload anywhere in the app, and no employee detail route to hang them off. `reports.tsx`
renders a selector and a button with no data source behind either. Rule 7 is the least-served
access-control rule in the current build.

---

## 4. Employee: Log in (after admin approval)

| # | Step | Screen / file | Status |
|---|---|---|---|
| 1 | App boots, loads Inter fonts, mounts providers | `app/_layout.tsx` | `[UI BUILT]` |
| 2 | `AuthGuard` hydrates the session from AsyncStorage | `app/_layout.tsx`, `src/store/auth.store.ts` | `[UI BUILT]` |
| 3 | Unauthenticated user is redirected to login | `_layout.tsx:115` | `[UI BUILT]` |
| 4 | Employee enters email and password | `app/(auth)/login.tsx` | `[UI BUILT]` |
| 5 | Zod validates email format and 6-char minimum password | `login.tsx` schema | `[UI BUILT]` |
| 6 | Credentials are verified against the server | — | `[PARTIAL]` — matches `MOCK_USERS`, simulates an 800ms delay |
| 7 | Server rejects any account not in `Active` state | — | `[NEEDS BACKEND]` — **rule 4 is unenforced today** |
| 8 | Token and user are persisted | `auth.store.ts` → AsyncStorage | `[UI BUILT]` — persists a fake token string |
| 9 | User is routed by role | `login.tsx:91-93` → `(admin)` or `(employee)` | `[UI BUILT]` |
| 10 | Session survives app restart | AsyncStorage hydration | `[UI BUILT]` |
| 11 | Logout clears token and user | `profile.tsx:103`, `settings.tsx:119` | `[UI BUILT]` |
| 12 | Employee recovers a forgotten password | `login.tsx` "Forgot password?" link | `[PARTIAL]` — link renders with no `onPress` |

**Current Status.** The mechanical flow works end to end on the emulator, including
persistence and role routing. What is not real: the credential check (two hardcoded users),
the token (a literal string), and step 7 — there is no account-status gate, so an account in
any lifecycle state would be admitted. Password recovery is a dead link.

Working test credentials: `admin@asassociates.com` / `admin123` and
`rahul@asassociates.com` / `rahul123`.

---

## 5. Employee: Mark attendance / check in at a site

| # | Step | Screen / file | Status |
|---|---|---|---|
| 1 | Employee taps Attendance in the bottom nav | `BottomNav` → `app/(employee)/attendance.tsx` | `[UI BUILT]` |
| 1a | (alternative) Employee taps the Attendance quick action on the dashboard | `app/(employee)/index.tsx:153` | `[PARTIAL]` — handler is **commented out**, tap does nothing |
| 2 | Screen shows the monthly calendar and a present/absent/late summary | `attendance.tsx` (inline calendar) | `[UI BUILT]` — mock data |
| 3 | Employee taps "Check in" | `attendance.tsx:60` | `[PARTIAL]` — `setMarked(true)` only |
| 4 | Device location is captured and validated against the site | — | `[NO UI]` — no geolocation dependency is installed; geofencing is unconfirmed |
| 5 | Timestamp and project are recorded | — | `[NEEDS BACKEND]` |
| 6 | Calendar and summary reflect the new record | `attendance.tsx` | `[PARTIAL]` — mock arrays do not update |
| 7 | Admin can see the check-in | — | `[NO UI]` — see workflow 3 |

**Current Status.** Check-in flips a local boolean and resets on unmount. Nothing is timestamped
or stored. Note the calendar drift: `attendance.tsx` renders its own inline calendar while a
built `src/components/employee/AttendanceCalendar.tsx` sits imported by no screen — see
`docs/design-system.md` §6.

---

## 6. Employee: Upload a site photo

| # | Step | Screen / file | Status |
|---|---|---|---|
| 1 | Employee opens the upload screen | `app/(employee)/upload.tsx` | `[UI BUILT]` |
| 1a | (alternative) via dashboard quick action | `app/(employee)/index.tsx:158` | `[PARTIAL]` — commented-out handler |
| 2 | Employee selects the project | `Dropdown` on `upload.tsx` | `[UI BUILT]` |
| 3 | Employee selects a work category | picker on `upload.tsx` | `[UI BUILT]` |
| 4 | Employee taps add-photo and the OS picker opens | — | `[PARTIAL]` — **no `expo-image-picker` call exists anywhere in the repo** despite the dependency being installed |
| 5 | Photo is compressed / resized | — | `[NO UI]` — `expo-image-manipulator` installed, never called |
| 6 | Thumbnails render in a removable grid | `src/components/employee/PhotoPickerGrid.tsx` | `[PARTIAL]` — component is built but **imported by no screen** |
| 7 | Employee adds notes | notes field on `upload.tsx` | `[UI BUILT]` |
| 8 | Employee taps "Submit Upload" | `upload.tsx:103` | `[PARTIAL]` — `onPress={() => {}}` |
| 9 | File is uploaded to Cloudinary or S3 | — | `[NEEDS BACKEND]` / `[PLANNED]` — provider undecided |
| 10 | Upload appears in Recent Uploads on the dashboard | `RecentUploadItem` on `(employee)/index.tsx` | `[PARTIAL]` — mock list, tap is a `TODO` at line 98 |
| 11 | Admin can see the upload | — | `[NO UI]` |

**Current Status.** This is the least functional employee workflow — the core capability, image
selection, has no code path. Both required dependencies are installed and `PhotoPickerGrid` is
already written; wiring the existing component into `upload.tsx` and adding the picker call is
the cheapest route to a working flow.

---

## 7. Employee: Submit a daily progress log

| # | Step | Screen / file | Status |
|---|---|---|---|
| 1 | Employee opens the progress screen | `app/(employee)/progress.tsx` | `[UI BUILT]` |
| 1a | (alternative) via dashboard quick action | `app/(employee)/index.tsx:168` | `[PARTIAL]` — commented-out handler |
| 2 | Employee selects the project | `Dropdown` on `progress.tsx` | `[UI BUILT]` |
| 3 | Employee selects the work stage | `Dropdown` on `progress.tsx` | `[UI BUILT]` — but uses a generic `Dropdown`; the purpose-built `WorkStagePicker.tsx` is imported by no screen |
| 4 | Employee adjusts hours worked with the ±0.5 stepper | `progress.tsx` | `[UI BUILT]` — local state |
| 5 | Employee writes progress notes | `progress.tsx` | `[UI BUILT]` |
| 6 | Employee taps "Save Progress" | `progress.tsx:138` | `[PARTIAL]` — `onPress={() => {}}` |
| 7 | Log is written against employee + project + date | — | `[NEEDS BACKEND]` |
| 8 | Project completion percentage recalculates | — | `[NEEDS BACKEND]` — `ProgressBar` values are hardcoded |
| 9 | Admin reads the log | — | `[NO UI]` |

**Current Status.** Every input works locally; the save button discards everything. Project
progress percentages shown across the app are static mock numbers, not derived from logs.

---

## 8. Employee: View assigned projects

| # | Step | Screen / file | Status |
|---|---|---|---|
| 1 | Employee opens My Projects from the bottom nav | `app/(employee)/projects.tsx` | `[UI BUILT]` |
| 1a | (alternative) "View all projects" on the dashboard | `(employee)/index.tsx:181` | `[UI BUILT]` — the one dashboard action that navigates |
| 2 | List renders the employee's projects with status and progress | `ProjectCard` | `[UI BUILT]` — reads `MOCK_ALL_PROJECTS` |
| 3 | List is scoped to the authenticated employee's assignments | — | `[NEEDS BACKEND]` — rule 6 is cosmetically true only, no scoping mechanism exists |
| 4 | Employee filters by status | filter chips on `projects.tsx` | `[UI BUILT]` — works |
| 5 | Employee taps a project to open detail | `projects.tsx:110` | `[PARTIAL]` — `TODO` comment; **`app/(employee)/project/[id].tsx` does not exist** |
| 6 | Detail shows tasks, timeline, team, and site photos | — | `[NO UI]` |

**Current Status.** Browsing and filtering work well as a frontend. The workflow dead-ends at
step 5: employees have no project detail view at all, while admin does
(`app/(admin)/projects/[id].tsx`). The missing employee route is referenced by two `TODO`
comments and is the highest-value missing screen.

---

## Cross-cutting gaps

These block more than one workflow:

1. **Dashboard quick actions are dead.** Four of five handlers in `(employee)/index.tsx` are
   commented out (lines 153, 158, 163, 168) even though every destination screen exists. This
   breaks the entry point for workflows 5, 6, and 7. Cheapest high-impact fix in the app.
2. **No employee project detail route.** Blocks workflow 8, referenced by workflows 6 and 7.
3. **No admin log views.** Blocks workflow 3 entirely and the final step of 5, 6, and 7.
4. **Five built components are wired to nothing** — `PhotoPickerGrid`, `WorkStagePicker`,
   `AttendanceCalendar`, `CategoryPicker`, `RequestControls`. Screens reimplement inline
   versions instead. See `docs/design-system.md` §6.
5. **No employee lifecycle UI.** Blocks workflow 1 and leaves rule 4 unenforceable.
6. **Every primary CTA that writes data is a stub.** `upload.tsx:103`, `progress.tsx:138`,
   `reports.tsx:77`, `projects/new.tsx:191`, plus the request-submit and request-approve
   actions. No write path exists anywhere in the app.
