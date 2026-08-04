# Database Schema [PLANNED]

Prisma schema specification for Phase 2. **No database exists today.** Nothing here is
migrated or running.

PostgreSQL 16. All IDs are UUIDs (`@default(uuid())`, stored as `uuid`). All timestamps are
`timestamptz` (`DateTime` in Prisma) stored in UTC. Monetary and decimal fields: none needed.

## Model overview

| Model | Purpose | Phase |
|---|---|---|
| `User` | Admin and employee accounts | 2 |
| `Project` | A site / job | 2 |
| `Assignment` | Which employee works on which project | 2 |
| `AttendanceLog` | Daily check-in / check-out | 2 |
| `ProgressLog` | Daily work log against a project | 2 |
| `Upload` | Site photo or document | 2 |
| `RefreshToken` | Revocable session records | 2 |
| `Request` | Material / Issue / Support request | 2 |
| `Notification` | Push notification record | 4 [PLANNED] |

`Request` is not in the original model list but is required — `app/(employee)/requests.tsx` and
`app/(admin)/requests.tsx` are both built and both need it. `RefreshToken` is required by the
token-rotation policy in `docs/backend-architecture.md`.

---

## Enums

```prisma
enum Role {
  ADMIN
  EMPLOYEE
}

enum UserStatus {
  PENDING
  ACTIVE
  DEACTIVATED
}

enum ProjectStatus {
  ACTIVE
  COMPLETED
  ON_HOLD
}

enum AttendanceStatus {
  PRESENT
  LATE
  ABSENT
}

enum FileType {
  IMAGE
  PDF
}

enum RequestType {
  MATERIAL
  ISSUE
  SUPPORT
}

enum RequestPriority {
  LOW
  MEDIUM
  HIGH
}

enum RequestStatus {
  PENDING
  APPROVED
  REJECTED
}
```

### Note on `UserStatus`
`docs/user-roles-and-permissions.md` documents a four-state lifecycle:
`Pending → Approved → Active → Deactivated`. This schema collapses `Approved` and `Active` into
`ACTIVE`, because the two states are behaviourally identical — neither `Approved` nor `Pending`
can log in, and the only meaningful boundary is "can authenticate or not."

If admin needs to distinguish "reviewed but not yet enabled," add `APPROVED` to the enum and
keep the login gate as `status === 'ACTIVE'` only. Decide before the first migration.

Either way, the current frontend model is a two-value `active: boolean`
(`app/(admin)/employees/index.tsx`) and must be replaced with this enum — that reconciliation
is already tracked in `docs/todo-roadmap.md` as a Phase 2 HIGH task.

---

## User

Admin and employee accounts share one table, separated by `role`.

```prisma
model User {
  id                  String     @id @default(uuid()) @db.Uuid
  email               String     @unique @db.VarChar(255)
  passwordHash        String?    @db.VarChar(255)
  firstName           String     @db.VarChar(100)
  lastName            String     @db.VarChar(100)
  phone               String?    @db.VarChar(20)
  role                Role       @default(EMPLOYEE)
  status              UserStatus @default(PENDING)
  profilePhoto        String?    @db.VarChar(500)
  employeeCode        String?    @unique @db.VarChar(50)
  designation         String?    @db.VarChar(100)
  department          String?    @db.VarChar(100)
  mustChangePassword  Boolean    @default(true)
  setupTokenHash      String?    @db.VarChar(255)
  setupTokenExpiresAt DateTime?
  createdById         String?    @db.Uuid
  createdAt           DateTime   @default(now())
  updatedAt           DateTime   @updatedAt
  lastLoginAt         DateTime?

  createdBy       User?           @relation("UserCreatedBy", fields: [createdById], references: [id], onDelete: SetNull)
  createdUsers    User[]          @relation("UserCreatedBy")
  assignments     Assignment[]    @relation("AssignmentUser")
  assignmentsMade Assignment[]    @relation("AssignmentAssignedBy")
  attendanceLogs  AttendanceLog[]
  progressLogs    ProgressLog[]
  uploads         Upload[]
  requests        Request[]       @relation("RequestUser")
  requestsReviewed Request[]      @relation("RequestReviewedBy")
  refreshTokens   RefreshToken[]
  notifications   Notification[]

  @@index([status])
  @@index([role, status])
  @@map("users")
}
```

| Field | Type | Constraints | Notes |
|---|---|---|---|
| `id` | `uuid` | PK | |
| `email` | `varchar(255)` | **unique**, not null | Login identifier. Store lowercased — the frontend already lowercases before lookup. |
| `passwordHash` | `varchar(255)` | **nullable** | Null while `PENDING` and no credential has been issued. A null hash can never match, so it cannot authenticate. |
| `firstName` | `varchar(100)` | not null | Frontend currently has a single `name` field; split at integration. |
| `lastName` | `varchar(100)` | not null | |
| `phone` | `varchar(20)` | nullable | |
| `role` | `Role` | not null, default `EMPLOYEE` | Admin-settable only. |
| `status` | `UserStatus` | not null, default `PENDING` | **Never client-settable on create** (rule 3). |
| `profilePhoto` | `varchar(500)` | nullable | Storage URL. Screens currently render initials only. |
| `employeeCode` | `varchar(50)` | **unique**, nullable | e.g. `ASA-2024-047`, already displayed in the employees list. Unique but nullable so admin can create an account before a code is assigned. |
| `designation` | `varchar(100)` | nullable | e.g. `Site Engineer`. |
| `department` | `varchar(100)` | nullable | Matches the existing `User.department` in `src/types/index.ts`. |
| `mustChangePassword` | `boolean` | not null, default `true` | Forces first-login password set. |
| `setupTokenHash` | `varchar(255)` | nullable | Hash of the one-time setup credential. Plaintext is returned once and never stored. |
| `setupTokenExpiresAt` | `timestamptz` | nullable | 24h window. |
| `createdById` | `uuid` | FK → `User.id`, nullable, `ON DELETE SET NULL` | The admin who created this account (rule 5 audit trail). Null for the seeded admin. |
| `lastLoginAt` | `timestamptz` | nullable | |

**Relations**
- Self-relation `createdBy` / `createdUsers` — audit of who created each account.
- One-to-many to `Assignment` (as the assigned employee), `AttendanceLog`, `ProgressLog`,
  `Upload`, `Request`, `RefreshToken`, `Notification`.
- Second relation to `Assignment` as `assignedBy`, and to `Request` as `reviewedBy` — both
  admin-side, which is why the named-relation disambiguation is required.

**Indexes**
- `email` unique (implicit index) — the login lookup.
- `employeeCode` unique.
- `@@index([status])` — the Active/Inactive filter chips on the employees screen.
- `@@index([role, status])` — listing active employees for the project team picker.

**Constraints not expressible in Prisma** (add via raw migration):
- `CHECK (status <> 'ACTIVE' OR password_hash IS NOT NULL OR setup_token_hash IS NOT NULL)` —
  an active account must have some usable credential.
- Partial unique index on `email` is unnecessary; hard-delete is used for `DELETE /users/:id`.

---

## Project

```prisma
model Project {
  id          String        @id @default(uuid()) @db.Uuid
  name        String        @db.VarChar(200)
  description String?       @db.Text
  clientName  String        @db.VarChar(200)
  location    String        @db.VarChar(300)
  status      ProjectStatus @default(ACTIVE)
  startDate   DateTime      @db.Date
  endDate     DateTime?     @db.Date
  createdById String?       @db.Uuid
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt

  assignments    Assignment[]
  attendanceLogs AttendanceLog[]
  progressLogs   ProgressLog[]
  uploads        Upload[]
  requests       Request[]

  @@index([status])
  @@index([clientName])
  @@map("projects")
}
```

| Field | Type | Constraints | Notes |
|---|---|---|---|
| `name` | `varchar(200)` | not null | e.g. `ICICI Bank HQ`. Not unique — the same client can have repeat jobs at different sites. |
| `description` | `text` | nullable | |
| `clientName` | `varchar(200)` | not null | Kept as a plain string. A `Client` table is over-engineering for this app; promote it later if client-level reporting is ever needed. |
| `location` | `varchar(300)` | not null | Free text. No geocoding in Phase 2. |
| `status` | `ProjectStatus` | not null, default `ACTIVE` | Maps to the existing `BadgeVariant` values `ongoing`/`completed`/`onhold`. |
| `startDate` | `date` | not null | |
| `endDate` | `date` | nullable | Null while open-ended. |
| `createdById` | `uuid` | FK → `User.id`, nullable | |

**No `progress` column.** Every `ProgressBar` value in the app is currently a hardcoded mock
number. Completion percentage is derived from `ProgressLog` data at read time, not stored — a
stored column would immediately drift from the logs. If aggregation proves slow, add a cached
column with a scheduled recompute, not a hand-maintained field.

**No `services` column.** `app/(admin)/projects/new.tsx` has a services multi-select. Store it
as `String[]` (`text[]`) on `Project` if the values stay free-form, or promote to a lookup table
if admin needs to manage the list. **Decision pending** — the current picker options are
hardcoded in the screen.

**Indexes**
- `@@index([status])` — the project list status filter.
- `@@index([clientName])` — client-grouped reporting.

---

## Assignment

Join table between `User` and `Project`, carrying its own audit fields.

```prisma
model Assignment {
  id           String   @id @default(uuid()) @db.Uuid
  userId       String   @db.Uuid
  projectId    String   @db.Uuid
  assignedById String   @db.Uuid
  assignedAt   DateTime @default(now())
  isActive     Boolean  @default(true)
  unassignedAt DateTime?

  user       User    @relation("AssignmentUser", fields: [userId], references: [id], onDelete: Cascade)
  project    Project @relation(fields: [projectId], references: [id], onDelete: Cascade)
  assignedBy User    @relation("AssignmentAssignedBy", fields: [assignedById], references: [id], onDelete: Restrict)

  @@unique([userId, projectId])
  @@index([userId, isActive])
  @@index([projectId, isActive])
  @@map("assignments")
}
```

| Field | Type | Constraints | Notes |
|---|---|---|---|
| `userId` | `uuid` | FK → `User.id`, `ON DELETE CASCADE` | The assigned employee. |
| `projectId` | `uuid` | FK → `Project.id`, `ON DELETE CASCADE` | |
| `assignedById` | `uuid` | FK → `User.id`, not null, `ON DELETE RESTRICT` | Must be an admin. Restrict prevents losing the audit trail by deleting an admin. |
| `isActive` | `boolean` | not null, default `true` | Unassignment sets false rather than deleting, so historical attendance and logs stay explainable. |
| `unassignedAt` | `timestamptz` | nullable | Set when `isActive` flips to false. |

**Unique constraint** `@@unique([userId, projectId])` — one assignment row per employee-project
pair. Re-assigning flips `isActive` back to true on the existing row; it does not insert a
duplicate. `DELETE /assignments/:id` is therefore a soft unassign.

**Indexes**
- `@@index([userId, isActive])` — drives `GET /projects/my` and `ProjectAccessGuard`. This is
  the hottest query in the app.
- `@@index([projectId, isActive])` — the project detail team roster.

This table is the enforcement point for access-control rule 6. An employee's visibility into
projects, and into anything hanging off a project, resolves through an active row here.

---

## AttendanceLog

```prisma
model AttendanceLog {
  id               String           @id @default(uuid()) @db.Uuid
  userId           String           @db.Uuid
  projectId        String           @db.Uuid
  date             DateTime         @db.Date
  checkInTime      DateTime
  checkOutTime     DateTime?
  checkInLocation  String?          @db.VarChar(300)
  checkInLatitude  Decimal?         @db.Decimal(9, 6)
  checkInLongitude Decimal?         @db.Decimal(9, 6)
  status           AttendanceStatus @default(PRESENT)
  createdAt        DateTime         @default(now())

  user    User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  project Project @relation(fields: [projectId], references: [id], onDelete: Restrict)

  @@unique([userId, date])
  @@index([userId, date])
  @@index([projectId, date])
  @@index([date])
  @@map("attendance_logs")
}
```

| Field | Type | Constraints | Notes |
|---|---|---|---|
| `date` | `date` | not null | The working day, separate from `checkInTime`, so the unique constraint and calendar queries are clean across timezones. |
| `checkInTime` | `timestamptz` | not null | |
| `checkOutTime` | `timestamptz` | nullable | Null until `PATCH /attendance/:id/check-out`. |
| `checkInLocation` | `varchar(300)` | nullable | Human-readable or free text. |
| `checkInLatitude` / `checkInLongitude` | `decimal(9,6)` | nullable | ~10cm precision. **Nullable and optional** because geofencing is an open decision — no location dependency is installed in the app today. |
| `status` | `AttendanceStatus` | not null, default `PRESENT` | `LATE` derived server-side from a configurable cutoff. `ABSENT` is inferred by the absence of a row, so it is rarely stored. |

**Unique constraint** `@@unique([userId, date])` — one check-in per employee per day. This is
the guard against the double-submit that the current UI cannot prevent (check-in only flips
local `useState`).

**`onDelete: Restrict` on project** — attendance is a business record; deleting a project must
not silently erase it.

**Indexes**
- `@@index([userId, date])` — the employee monthly calendar.
- `@@index([projectId, date])` — per-site attendance for admin.
- `@@index([date])` — the company-wide daily view.

---

## ProgressLog

```prisma
model ProgressLog {
  id          String   @id @default(uuid()) @db.Uuid
  userId      String   @db.Uuid
  projectId   String   @db.Uuid
  title       String   @db.VarChar(200)
  description String   @db.Text
  workStage   String?  @db.VarChar(100)
  hoursWorked Decimal? @db.Decimal(4, 2)
  date        DateTime @db.Date
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  user    User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  project Project  @relation(fields: [projectId], references: [id], onDelete: Restrict)
  uploads Upload[]

  @@index([userId, date])
  @@index([projectId, date])
  @@index([date])
  @@map("progress_logs")
}
```

| Field | Type | Constraints | Notes |
|---|---|---|---|
| `title` | `varchar(200)` | not null | |
| `description` | `text` | not null | The notes field on `app/(employee)/progress.tsx`. |
| `workStage` | `varchar(100)` | nullable | Matches `WORK_STAGES` in `src/components/employee/WorkStagePicker.tsx`. Kept as a string, not an enum, so admin can add stages without a migration. |
| `hoursWorked` | `decimal(4,2)` | nullable, `0 <= x <= 24` | The ±0.5 stepper on the progress screen. `decimal(4,2)` covers `0.00`–`99.99`. |
| `date` | `date` | not null | The work day being reported. |

**No unique constraint on `[userId, date]`** — an employee may log progress more than once a
day, and may work more than one project in a day. Deliberately looser than `AttendanceLog`.

**Constraint via raw migration:** `CHECK (hours_worked IS NULL OR (hours_worked >= 0 AND hours_worked <= 24))`.

**Relation** one-to-many to `Upload` — photos can attach to a specific log.

---

## Upload

```prisma
model Upload {
  id            String   @id @default(uuid()) @db.Uuid
  userId        String   @db.Uuid
  projectId     String   @db.Uuid
  progressLogId String?  @db.Uuid
  storageKey    String   @unique @db.VarChar(500)
  fileUrl       String   @db.VarChar(1000)
  fileType      FileType
  mimeType      String   @db.VarChar(100)
  fileName      String   @db.VarChar(255)
  fileSizeBytes Int
  category      String?  @db.VarChar(100)
  caption       String?  @db.Text
  uploadedAt    DateTime @default(now())

  user        User         @relation(fields: [userId], references: [id], onDelete: Cascade)
  project     Project      @relation(fields: [projectId], references: [id], onDelete: Restrict)
  progressLog ProgressLog? @relation(fields: [progressLogId], references: [id], onDelete: SetNull)

  @@index([userId, uploadedAt])
  @@index([projectId, uploadedAt])
  @@index([progressLogId])
  @@map("uploads")
}
```

| Field | Type | Constraints | Notes |
|---|---|---|---|
| `progressLogId` | `uuid` | FK → `ProgressLog.id`, nullable, `ON DELETE SET NULL` | Optional — a photo can stand alone or belong to a log. |
| `storageKey` | `varchar(500)` | **unique**, not null | Server-generated UUID key in Cloudinary/S3. Never derived from `fileName`. |
| `fileUrl` | `varchar(1000)` | not null | Canonical object URL. Objects are private; clients receive short-lived signed URLs, so this is not itself publicly fetchable. |
| `fileType` | `FileType` | not null | Coarse bucket for UI icon selection. |
| `mimeType` | `varchar(100)` | not null | The sniffed type, whitelist-validated. |
| `fileName` | `varchar(255)` | not null | Original name, sanitized, for display only. |
| `fileSizeBytes` | `int` | not null, `> 0`, `<= 10485760` | 10 MB cap per `docs/backend-architecture.md`. `int` is sufficient. |
| `category` | `varchar(100)` | nullable | Matches `WORK_CATEGORIES` in `CategoryPicker.tsx`. |
| `caption` | `text` | nullable | The notes field on the upload screen. |

**Constraint via raw migration:** `CHECK (file_size_bytes > 0 AND file_size_bytes <= 10485760)`.

**Indexes**
- `@@index([userId, uploadedAt])` — the "Recent Uploads" list on the employee dashboard.
- `@@index([projectId, uploadedAt])` — the per-project gallery for admin (rule 7).
- `@@index([progressLogId])` — resolving a log's attachments.

---

## Request

Backs the two request screens that already exist. Material / Issue / Support.

```prisma
model Request {
  id           String          @id @default(uuid()) @db.Uuid
  userId       String          @db.Uuid
  projectId    String          @db.Uuid
  type         RequestType
  priority     RequestPriority @default(MEDIUM)
  status       RequestStatus   @default(PENDING)
  subject      String          @db.VarChar(200)
  description  String?         @db.Text
  reviewedById String?         @db.Uuid
  reviewedAt   DateTime?
  reviewNote   String?         @db.Text
  createdAt    DateTime        @default(now())
  updatedAt    DateTime        @updatedAt

  user       User    @relation("RequestUser", fields: [userId], references: [id], onDelete: Cascade)
  project    Project @relation(fields: [projectId], references: [id], onDelete: Restrict)
  reviewedBy User?   @relation("RequestReviewedBy", fields: [reviewedById], references: [id], onDelete: SetNull)

  @@index([userId, createdAt])
  @@index([status, priority])
  @@index([projectId])
  @@map("requests")
}
```

`reviewedById` / `reviewedAt` / `reviewNote` are the audit trail for the approve-reject action
that `app/(admin)/requests.tsx` currently cannot perform. `@@index([status, priority])` serves
the admin All/Pending/Approved/Rejected filter chips.

---

## RefreshToken

Required for the revocable rotating-refresh policy.

```prisma
model RefreshToken {
  id         String   @id @default(uuid()) @db.Uuid
  userId     String   @db.Uuid
  tokenHash  String   @unique @db.VarChar(255)
  familyId   String   @db.Uuid
  expiresAt  DateTime
  revokedAt  DateTime?
  createdAt  DateTime @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, revokedAt])
  @@index([familyId])
  @@index([expiresAt])
  @@map("refresh_tokens")
}
```

Only the hash is stored. `familyId` groups a rotation chain so that reuse of a consumed token
revokes the whole family. Deactivating a user revokes every row for that `userId`.
`@@index([expiresAt])` supports a periodic cleanup job.

---

## Notification [PLANNED — Phase 4]

Not built in Phase 2. Listed so the schema is not reshaped later.

```prisma
model Notification {
  id        String   @id @default(uuid()) @db.Uuid
  userId    String   @db.Uuid
  title     String   @db.VarChar(200)
  body      String   @db.Text
  data      Json?
  isRead    Boolean  @default(false)
  readAt    DateTime?
  createdAt DateTime @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, isRead])
  @@index([userId, createdAt])
  @@map("notifications")
}
```

A `DeviceToken` model (userId, FCM token, platform, lastSeenAt) will also be needed for FCM
delivery — specify it when Phase 4 starts.

---

## Relationship summary

```
User ──┬──< Assignment >──┬── Project
       │  (userId)        │  (projectId)
       ├──< AttendanceLog >┤
       ├──< ProgressLog >──┤
       │        │          │
       │        └──< Upload >
       ├──< Request >──────┤
       ├──< RefreshToken
       ├──< Notification            [Phase 4]
       └──< User (createdBy self-relation)
```

Admin-side relations: `Assignment.assignedBy`, `Request.reviewedBy`, `User.createdBy`,
`Project.createdBy` — all point back to `User` and all exist to satisfy rule 5's audit
requirement.

---

## Delete behaviour

| Relation | On delete | Why |
|---|---|---|
| `User` → `AttendanceLog`, `ProgressLog`, `Upload`, `Request`, `Assignment` | `Cascade` | `DELETE /users/:id` removes the person's records. Prefer `DEACTIVATED` over deletion for anyone with history. |
| `Project` → `AttendanceLog`, `ProgressLog`, `Upload`, `Request` | `Restrict` | A project with business records cannot be deleted. Set `COMPLETED` instead. |
| `Project` → `Assignment` | `Cascade` | Assignments carry no independent value. |
| `User` as `assignedBy` | `Restrict` | Preserves the audit trail. |
| `User` as `createdBy` / `reviewedBy` | `SetNull` | Audit degrades gracefully. |
| `ProgressLog` → `Upload` | `SetNull` | The photo survives; it just detaches from the log. |

Deleting a project is effectively impossible once work is logged against it — intentional.
`DELETE /projects/:id` is not in the API contract for this reason.

---

## Seed

`prisma/seed.ts` creates exactly one record: an `ADMIN` user with `status: ACTIVE` and
`mustChangePassword: true`, credentials supplied via environment variables. No employee accounts
and no demo data are seeded. There is no code path in the seed or anywhere else that creates an
employee account without an authenticated admin (rules 1–2).

The two mock users currently hardcoded in `app/(auth)/login.tsx` are not carried over.

---

## Migration notes

1. Enums first, then `User`, then `Project`, then the dependent tables — FK order matters.
2. Apply the raw `CHECK` constraints listed per model in a follow-up migration; Prisma cannot
   express them.
3. Resolve two open decisions before the first migration: whether `UserStatus` needs a separate
   `APPROVED` state, and whether `Project.services` is a `text[]` or a lookup table.
4. Confirm the geolocation decision before shipping `AttendanceLog` — the lat/lng columns are
   nullable so a later "yes" needs no schema change, but a "yes, and it is mandatory" would.
