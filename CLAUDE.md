@AGENTS.md

# AS Associates — Internal Mobile App

AS Associates is a civil and interior design contracting company that executes bank branch
renovations and fit-outs. This app is the company's private internal mobile tool: site
employees use it to mark attendance, view their assigned projects, upload site photos, log
daily progress, and raise material/issue/support requests. Admin uses it to manage employees,
create and assign projects, review requests, and read reports. There is no public-facing
surface. The app is currently a **frontend-only prototype** — every screen renders from
hardcoded mock data and there is no backend.

---

## Tech Stack

| Layer | Choice | Status |
|---|---|---|
| Runtime | React Native 0.86 | In use |
| Framework | Expo SDK 57, Expo Router v3 (file-based) | In use |
| Language | TypeScript 6 | In use |
| Styling | `StyleSheet` API + `src/constants/tokens.ts` | In use |
| Fonts | `@expo-google-fonts/inter` (400/500/700/800) | In use |
| Server state | TanStack Query v5 | Provider mounted, **no queries written yet** |
| Local state | Zustand (`src/store/auth.store.ts`) | In use |
| Forms | React Hook Form + Zod | In use (login only) |
| HTTP | Axios client w/ token + 401 interceptors (`src/services/api.ts`) | Written, **never called** |
| Persistence | AsyncStorage (auth token + user) | In use |
| Backend | NestJS + PostgreSQL + Prisma | [PLANNED] — not started |
| File storage | Cloudinary or S3 | [PLANNED] — undecided |
| Push notifications | Firebase Cloud Messaging | [PLANNED] — not started |
| Auth server | JWT issued by backend | [PLANNED] — currently mock users in `app/(auth)/login.tsx` |

### Known stack inconsistency
`nativewind`, `tailwindcss`, `tailwind.config.js`, `global.css`, and `nativewind-env.d.ts` are
still present, and `app/_layout.tsx` imports `../global.css`. No screen uses `className`.
Styling policy is **StyleSheet + tokens only**. The NativeWind dependency is dead weight and
should be removed in a dedicated cleanup task — do not add `className` usage to any screen.

---

## Key Rules

### Access control (non-negotiable)
1. This is a private internal app. Public registration is NOT allowed.
2. Employees cannot self-onboard or gain access on their own.
3. Any registration flow that exists must only create a pending request — not grant access.
4. Only admin-approved and active employees can log in.
5. Admin is the sole authority for: creating accounts, approving, activating, deactivating,
   assigning permissions, assigning projects.
6. Employees can only see data relevant to their own account and assignments.
7. Admin can see all employee data, uploads, attendance logs, progress logs, and assignments.

### Engineering rules
8. Do not add a signup/registration screen. There is none today, and rule 1 forbids one.
9. Styling goes through `src/constants/tokens.ts`. No inline hex, no Tailwind classes.
10. Route groups define the role boundary: `app/(auth)`, `app/(employee)`, `app/(admin)`.
    Never place an employee screen under `(admin)` or vice versa.
11. Mock data is inline per-screen today. When the backend lands, replace it with TanStack
    Query hooks — do not build a second mock layer.

---

## Current Implementation Status (what actually runs on the emulator)

Working today on Android (Pixel 7, Expo Go):
- App boots, loads Inter fonts, mounts error boundary + Query provider + SafeAreaProvider.
- Auth guard in `app/_layout.tsx` redirects by hydration state and role.
- Login against two hardcoded users in `app/(auth)/login.tsx`:
  - `admin@asassociates.com` / `admin123` → `(admin)`
  - `rahul@asassociates.com` / `rahul123` → `(employee)`
- Session persists across restarts via AsyncStorage; logout clears it.
- All 16 screens render with mock data and correct token-based styling.
- Filter chips, tab filters, and local `useState` interactions work in-screen.

Not working / not real:
- No network calls of any kind. `apiClient` is never invoked.
- No TanStack Query hooks exist despite the provider being mounted.
- Several navigation handlers are commented-out stubs (employee dashboard quick actions,
  project detail routes). See `docs/screens-and-features.md`.
- No employee approval/activation flow — admin employee list is read-only display.
- No image upload — the upload screen has no picker wired despite
  `expo-image-picker` / `expo-image-manipulator` being installed.
- No push notifications, no reports export, no settings actions.

---

## Running Locally

```bash
npm install
```

```bash
npx expo start --android
```

Target is an Android Pixel 7 emulator via Expo Go. `npm run ios` and `npm run web` exist but
are untested.

---

## Documentation

- `docs/product-overview.md` — what the business does and why this app exists
- `docs/user-roles-and-permissions.md` — role matrix, access policy, employee lifecycle
- `docs/screens-and-features.md` — every screen, its file path, role, and status
- `DESIGN.md` — the Stitch design system (colors, type, spacing, components)
- `COMPONENTS.md` — shared UI component inventory

> Before modifying any screen, read docs/design-system.md and compare the existing
> screen implementation against the Stitch design. List mismatches first. Fix only those issues.

Note: `docs/design-system.md` does not exist yet. The design system currently lives in
`DESIGN.md` at the repo root (sourced from Stitch project `7450523547241458564`) — read that
until `docs/design-system.md` is created.
