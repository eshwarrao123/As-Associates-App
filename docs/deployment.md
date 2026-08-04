# Deployment

What is real today, and what is planned.

**Real today:** running the app in Expo Go on an Android Pixel 7 emulator. That is the entire
deployment story.

**Not real:** there is no production build, no distributed APK, no backend, no hosting, no CI/CD,
and no `eas.json` in the repo. Every section below marked `[PLANNED]` describes intent only.

---

## 1. Current State (Real)

### What runs

Local development only. No build has been distributed to anyone.

```bash
npm install
```

```bash
npx expo start --android
```

This starts the Metro bundler and opens the app in Expo Go on a connected Android emulator.

### Verified target

| Item | Value |
|---|---|
| Platform | Android |
| Device | Pixel 7 emulator |
| Runtime | Expo Go |
| Expo SDK | ~57.0.7 |
| React Native | 0.86 |
| Orientation | Portrait, locked (`app.json`) |
| Color scheme | Light only (`userInterfaceStyle: "light"`) |

`npm run ios` and `npm run web` exist in `package.json` and are **untested**. `app.json` declares
an iOS bundle identifier (`com.asassociates.app`) and `supportsTablet: true`, so iOS is not ruled
out — but whether iOS is a target is an open question (`docs/todo-roadmap.md`).

### App identity, as configured

From `app.json`:

| Field | Value |
|---|---|
| `name` | AS Associates |
| `slug` | as-associates-app |
| `version` | 1.0.0 |
| `scheme` | as-associates |
| `android.package` | com.asassociates.app |
| `ios.bundleIdentifier` | com.asassociates.app |
| `android.adaptiveIcon.backgroundColor` | `#12385B` |
| `plugins` | expo-router, expo-font, expo-image-picker |
| `experiments.typedRoutes` | true |

Two notes on this config:

- `#12385B` is a navy that appears in neither `src/constants/tokens.ts` nor `DESIGN.md`. It should
  be reconciled during the Phase 1 token audit (ADR-013).
- `expo-image-picker` is registered as a plugin but no code calls it. Harmless, but it means the
  camera/photos permission prompts are already configured for a feature that does not exist yet.

### Environment configuration today

One variable is read anywhere in the app:

- `EXPO_PUBLIC_API_URL` — consumed by `src/services/api.ts`, falling back to
  `https://api.asassociates.com/v1`.

That URL does not resolve to anything. `apiClient` is never invoked, so the value is inert. There
is no `.env` file in the repo and no secret of any kind — appropriate, since `EXPO_PUBLIC_*`
variables are embedded in the client bundle and must never hold secrets.

### What has never been done

- No production or preview build of any kind
- No EAS configuration (`eas.json` absent)
- No app signing keystore
- No distribution to a real device
- No Play Store or internal-track submission
- No backend deployed
- No CI/CD pipeline
- No crash reporting or analytics
- No OTA update channel configured

---

## 2. Frontend Deployment `[PLANNED]`

Target: an installable Android app on company-owned devices. Phase 4 in
`docs/development-phases.md`.

### Build service

EAS Build. Requires creating `eas.json` at the project root — it does not exist yet — with three
profiles:

| Profile | Purpose | Output |
|---|---|---|
| `development` | Dev client with debugging | APK |
| `preview` | Internal testing on real devices | APK |
| `production` | Distribution build | AAB (Play Store) or APK (direct install) |

APK vs AAB depends on the distribution channel chosen below.

### Distribution options `[OPEN]`

| Option | Fit |
|---|---|
| **Direct APK install** | Simplest for 10–50 known devices. No store review, no account. Requires enabling install-from-unknown-sources on each device, and updates are manual |
| **Play Store internal testing track** | Up to 100 testers by email, automatic updates, no public listing. Requires a Google Play developer account and each employee having a Google account |
| **Play Store closed/production** | Unnecessary. There is no public audience (ADR-009) — a public listing for an internal tool is the wrong shape |
| **MDM / enterprise distribution** | Overkill unless the company already runs mobile device management |

Direct APK is likely correct at this headcount; the internal testing track becomes worthwhile
mainly for automatic updates.

### Signing

A production keystore must be generated and stored securely. EAS can manage it, or it can be
supplied manually. **Losing the keystore means the app can never be updated in place** — every
device would need a fresh install. Back it up somewhere durable and off the build machine.

### OTA updates

`expo-updates` is not currently configured. Once it is, JS-only changes — screen tweaks, copy,
logic — ship without a new binary. Native changes (a new native dependency, an `app.json` config
change) still require a rebuild. Worth setting up before the first real distribution, because it
is what makes iterating on a distributed app tolerable.

### Version management

`version` in `app.json` is `1.0.0` and `android.versionCode` is not set. Before the first build,
establish a convention: bump `version` for humans and increment `versionCode` on every build.
Play Store rejects a duplicate `versionCode`.

### Pre-build cleanup

`docs/todo-roadmap.md` has a Phase 1 task to remove NativeWind, `tailwindcss`,
`tailwind.config.js`, `global.css`, `nativewind-env.d.ts`, and the `global.css` import at
`app/_layout.tsx:1` (ADR-002). Doing this before the first production build keeps dead
dependencies out of the shipped bundle.

---

## 3. Backend Deployment `[PLANNED]`

**No backend code exists.** This section describes what will need deploying once Phase 2 is
built. Architecture is specified in `docs/backend-architecture.md`.

### What will need hosting

1. A NestJS Node process (single monolith — no microservices)
2. A PostgreSQL 16 instance
3. An object storage bucket for photo uploads (ADR-011, provider `[OPEN]`)

### Hosting `[OPEN]`

No hosting decision has been made. `docs/backend-architecture.md` lists it as TBD. The relevant
considerations:

| Option | Notes |
|---|---|
| **Railway / Render** | Managed Node + managed Postgres in one place, minimal ops. Good fit for a single small internal service |
| **Fly.io** | Similar, with region control. Postgres is more hands-on |
| **VPS (Hetzner, DigitalOcean)** | Cheapest and fully controlled. Means owning OS patching, TLS renewal, backups, and monitoring |
| **AWS (ECS/EC2 + RDS + S3)** | Most capable, most operational overhead. Only sensible if S3 wins ADR-011 and the company is already on AWS |
| **Supabase** | Managed Postgres with backups; the NestJS app would still need hosting elsewhere. Note ADR-008 rejected Supabase as an *application layer* replacement, not as a database host |
| **Serverless (Vercel/Lambda)** | Poor fit. Postgres connection exhaustion requires a pooler, and NestJS cold starts are noticeable. See `docs/performance-and-scalability.md` §3 |

**Requirements any option must satisfy:** HTTPS with a valid certificate, automated daily
Postgres backups with a tested restore, environment-variable secret management (no secrets in the
repo), and a reachable public hostname for the mobile app.

At 10–50 users the smallest tier of any managed option is sufficient. Choose for low operational
burden, not capacity.

### Database

- Managed Postgres 16 strongly preferred over self-hosted — the backup story alone justifies it
- Migrations via `prisma migrate deploy` in the release step, never `migrate dev` in production
- `prisma/seed.ts` seeds exactly one ADMIN account. Run once, then rotate that password
  immediately — a seeded credential is the app's only bootstrap path and its biggest single risk
- Automated daily backups with a **verified** restore. An untested backup is not a backup

### File storage

Blocked on ADR-011. Both providers sit behind `storage/storage.interface.ts` so the choice does
not leak into `uploads.service.ts`. Requirements either way: private objects, short-lived signed
read URLs, no public buckets, server-generated UUID keys.

### CI/CD `[PLANNED]`

Nothing exists. Minimum viable pipeline:

- On PR: typecheck, lint, backend unit tests
- On merge to main: run migrations, deploy the backend
- Frontend builds triggered manually via EAS — automatic mobile builds on every merge are not
  worth the cost at this cadence

One CI check is worth calling out specifically, from `docs/backend-architecture.md`: **a
controller method with no `@Roles` decorator should fail the build.** That turns "someone forgot a
guard" from a security incident into a red pipeline.

### Monitoring `[PLANNED]`

None configured. When the backend ships, the useful minimum is uptime checks on a health
endpoint, error tracking (Sentry or equivalent) on both backend and app, and log retention long
enough to investigate an incident. Nothing more elaborate is warranted at this scale.

---

## 4. Environment Strategy

### Planned environments

| Environment | Frontend | Backend | Database | Status |
|---|---|---|---|---|
| **Local** | Expo Go on emulator | NestJS on localhost | Local Postgres or Docker | Frontend real; backend `[PLANNED]` |
| **Staging** | EAS `preview` build | Deployed staging instance | Separate staging database | `[PLANNED]` |
| **Production** | EAS `production` build | Deployed production instance | Production database | `[PLANNED]` |

Staging is worth having for one specific reason: it is where a destructive migration gets caught
before it touches real attendance and project records.

### Variables

**Frontend** — only `EXPO_PUBLIC_*` variables, which are embedded in the client bundle:

| Variable | Purpose |
|---|---|
| `EXPO_PUBLIC_API_URL` | Backend base URL. Already read by `src/services/api.ts` |

Never put a secret in an `EXPO_PUBLIC_*` variable. It ships inside the app and is readable by
anyone who has the APK.

**Backend `[PLANNED]`** — server-side only, never in the repo:

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | Postgres connection string |
| `JWT_ACCESS_SECRET` | Access token signing key |
| `JWT_REFRESH_SECRET` | Refresh token signing key |
| `JWT_ACCESS_EXPIRY` | 15m per ADR-012 |
| `JWT_REFRESH_EXPIRY` | 7d per ADR-012 |
| `STORAGE_PROVIDER` | `cloudinary` or `s3` (ADR-011) |
| Provider credentials | Cloudinary keys or AWS keys, depending |
| `CORS_ORIGINS` | Allowed origins |
| `PORT` | Listen port |
| `NODE_ENV` | `development` / `production` |

Rules: distinct secrets per environment, never share a production secret with staging, `.env`
files git-ignored, rotation possible without a code change.

### Emulator-to-localhost note

An Android emulator cannot reach the host machine at `localhost`. During Phase 3 integration,
`EXPO_PUBLIC_API_URL` must point at `10.0.2.2` (the emulator's alias for the host loopback) or a
LAN IP — not `127.0.0.1`. This will be the first thing that appears broken when the backend is
wired up.

---

## 5. Pre-deployment Checklist

Nothing here is checked. This gates the first real distribution, not the current emulator work.

**Frontend**
- [ ] All 19 route files aligned to Stitch designs (Phase 1 complete)
- [ ] NativeWind and Tailwind artifacts removed (ADR-002)
- [ ] `tokens.ts` reconciled with Stitch, primary action color decided (ADR-013)
- [ ] Loading, empty, and error states present on every screen
- [ ] All mock data removed — `MOCK_USERS` deleted, every inline array replaced
- [ ] No stubbed CTAs remaining (`upload.tsx:103`, `progress.tsx:138`, `reports.tsx:77`,
      `projects/new.tsx:191`, `employees/index.tsx:61`)
- [ ] `app.json` `version` and `android.versionCode` set correctly
- [ ] App icon and splash screen finalized; the `#12385B` adaptive-icon background reconciled
- [ ] `eas.json` created with development / preview / production profiles
- [ ] Production keystore generated and backed up off the build machine
- [ ] `EXPO_PUBLIC_API_URL` pointing at the production backend, with no secret in any
      `EXPO_PUBLIC_*` variable
- [ ] `npx tsc --noEmit` clean under `strict`
- [ ] Tested on a real Android device, not only the emulator
- [ ] Decision recorded on whether iOS is in scope

**Backend**
- [ ] All API endpoints implemented and tested against `docs/api-contract.md`
- [ ] Database migrations tested against a production-like dataset
- [ ] Automated backups configured **and a restore verified**
- [ ] Seeded admin password rotated
- [ ] HTTPS enforced, `helmet` enabled, CORS restricted to the app's origins
- [ ] All environment variables set; no secret in the repo
- [ ] Rate limiting active on `/auth/login` and `/auth/refresh`
- [ ] Error tracking and uptime monitoring wired up
- [ ] Log retention sufficient to investigate an incident

**Access control — verify each rule against a running system, not against the code**
- [ ] Rule 1/3: no public registration endpoint exists anywhere in the API
- [ ] Rule 2: no code path creates an employee account without an authenticated admin
- [ ] Rule 4: login rejected for `PENDING` and `DEACTIVATED` accounts
- [ ] Rule 4: deactivation takes effect on the next request, not on token expiry
- [ ] Rule 5: every admin capability rejects an employee token with `403`
- [ ] Rule 6: every employee read scoped by the token's `sub` claim, never a client-supplied ID
- [ ] Rule 6: an employee cannot read a project they are not actively assigned to
- [ ] Rule 7: admin can read all employee data, uploads, attendance, progress, and assignments
- [ ] Every controller method carries a `@Roles` decorator; CI fails if one does not
- [ ] Password minimum raised to 8 characters on the frontend to match the backend policy
- [ ] Upload MIME whitelist enforced by sniffed content type, not file extension
- [ ] Stored files private, served only via short-lived signed URLs

---

## Related

- `docs/backend-architecture.md` — what is being deployed, and its security requirements
- `docs/development-phases.md` — Phase 4 covers production build and distribution
- `docs/decisions.md` — ADR-011 (storage), ADR-012 (tokens), ADR-013 (color)
- `docs/performance-and-scalability.md` — why hosting size is not a concern, and the serverless caveat
- `docs/user-roles-and-permissions.md` — the seven rules the checklist above verifies
