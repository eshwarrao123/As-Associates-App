# API Contract [PLANNED]

REST contract for Phase 2. **No endpoint below exists today.** The frontend makes zero network
calls; `src/services/api.ts` is written but never invoked.

Base URL: `/api/v1`. All requests and responses are `application/json`, except
`POST /uploads` which is `multipart/form-data`.

## Access levels

| Tag | Meaning |
|---|---|
| `[PUBLIC]` | No token required. **Only `POST /auth/login`.** |
| `[ADMIN ONLY]` | Valid token with `role: ADMIN`. Employees get `403`. |
| `[EMPLOYEE ONLY]` | Valid token with `role: EMPLOYEE`. Admins get `403`. |
| `[AUTHENTICATED]` | Any valid token, either role. |
| `[ADMIN or ASSIGNED EMPLOYEE]` | Admin unconditionally; employee only with an active `Assignment`. |

There is **no registration endpoint** and none may be added (access-control rules 1–3).
Employee accounts exist only via `POST /users` called by an authenticated admin.

## Conventions

**Auth header** — `Authorization: Bearer <accessToken>` on every route except login.

**Employee scoping** — employee-facing reads use `/my` paths with no ID parameter. Scoping is
derived from the JWT `sub` claim; a client-supplied user ID is never trusted (rule 6).

**Pagination** — list endpoints accept `page` (default 1) and `limit` (default 20, max 100),
and return:
```json
{ "data": [], "meta": { "page": 1, "limit": 20, "total": 0, "totalPages": 0 } }
```

**Dates** — request and response dates are ISO 8601. Date-only fields use `YYYY-MM-DD`.

**Errors** — uniform shape from the global exception filter:
```json
{ "statusCode": 403, "message": "Account not active", "error": "Forbidden" }
```

Standard responses that apply to every authenticated endpoint and are not repeated below:

| Code | When |
|---|---|
| `401` | Missing, malformed, or expired access token |
| `403` | Wrong role, or account is `PENDING` / `DEACTIVATED`, or `mustChangePassword` is true |
| `404` | Resource does not exist, or an employee requested something outside their scope |
| `422` | Body failed validation — includes a per-field `errors` map |
| `429` | Rate limit exceeded |

`404` rather than `403` is returned when an employee requests another employee's resource by ID,
so the API does not confirm that the resource exists.

**User object** — the shape returned wherever a user is embedded:
```json
{
  "id": "uuid",
  "email": "rahul@asassociates.com",
  "role": "EMPLOYEE",
  "status": "ACTIVE",
  "firstName": "Rahul",
  "lastName": "Sharma",
  "phone": "+91...",
  "employeeCode": "ASA-2024-047",
  "designation": "Site Engineer",
  "department": "Engineering",
  "profilePhoto": null
}
```
`passwordHash`, `setupTokenHash`, and `setupTokenExpiresAt` are never serialized.

---

# Auth

### POST /auth/login
Access: `[PUBLIC]`
Request body: `{ email: string, password: string }`
Response 200: `{ accessToken: string, refreshToken: string, mustChangePassword: boolean, user: { id, email, role, status, firstName, lastName } }`
Response 401: `{ message: "Invalid credentials" }`
Response 403: `{ message: "Account not active" }`
Response 422: validation failure (malformed email, password under 8 chars)
Response 429: `{ message: "Too many login attempts" }`
Notes: Returns 403 if the account exists but status is `PENDING` or `DEACTIVATED`. Unknown email
and wrong password both return the same 401 with identical timing, so the endpoint cannot be used
to enumerate accounts. Rate limited to 5 attempts / 15 min per IP and 10 / hour per email. If
`mustChangePassword` is true the token is issued but every route except
`POST /auth/change-password` returns 403 until the password is set. Updates `lastLoginAt`.

### POST /auth/refresh
Access: `[PUBLIC]` — no access token, but a valid refresh token is required in the body
Request body: `{ refreshToken: string }`
Response 200: `{ accessToken: string, refreshToken: string }`
Response 401: `{ message: "Invalid or expired refresh token" }`
Response 403: `{ message: "Account not active" }`
Notes: Rotating. The presented token is consumed and a new one issued. Reuse of an already-consumed
token revokes the entire token family and returns 401. Account status is re-checked here, so a
deactivated user cannot refresh. Rate limited to 30 / hour per user.

### POST /auth/logout
Access: `[AUTHENTICATED]`
Request body: `{ refreshToken: string }`
Response 204: no content
Response 401: invalid access token
Notes: Revokes the presented refresh token and its family. Idempotent — logging out twice still
returns 204.

### POST /auth/change-password
Access: `[AUTHENTICATED]`
Request body: `{ currentPassword: string, newPassword: string }`
Response 200: `{ message: "Password updated" }`
Response 401: `{ message: "Current password is incorrect" }`
Response 422: new password fails policy (min 8 chars, must differ from current)
Notes: Reachable while `mustChangePassword` is true — this is the only such route. On success,
clears `mustChangePassword`, clears `setupTokenHash`, and revokes all refresh tokens except the
current session. For the first-login case `currentPassword` is the temp credential.

---

# Users

### GET /users/me
Access: `[AUTHENTICATED]`
Response 200: the full user object (see Conventions)
Notes: Reads from the JWT `sub` claim. No ID parameter, so an employee cannot read another
account. Backs `app/(employee)/profile.tsx`.

### PUT /users/me
Access: `[AUTHENTICATED]`
Request body: `{ phone?: string, profilePhoto?: string }`
Response 200: the updated user object
Response 422: validation failure
Notes: **Deliberately narrow.** `email`, `role`, `status`, `firstName`, `lastName`,
`employeeCode`, `designation`, and `department` are admin-controlled (rule 5) and are silently
stripped by the whitelist validation pipe rather than accepted. An employee cannot escalate
their own role or reactivate their own account.

### GET /users
Access: `[ADMIN ONLY]`
Query params: `status` (`PENDING`|`ACTIVE`|`DEACTIVATED`), `role`, `search` (name, email, or
employeeCode), `page`, `limit`
Response 200: paginated list of user objects, each with `{ activeProjectCount: number, attendanceRate: number }`
Response 403: caller is an employee
Notes: Backs `app/(admin)/employees/index.tsx`, including its All/Active/Inactive filter chips.
`attendanceRate` is computed over the trailing 30 days — the screen currently shows it as a
hardcoded string such as `'87%'`.

### POST /users
Access: `[ADMIN ONLY]`
Request body:
```json
{
  "email": "string",
  "firstName": "string",
  "lastName": "string",
  "phone": "string?",
  "role": "EMPLOYEE | ADMIN",
  "employeeCode": "string?",
  "designation": "string?",
  "department": "string?"
}
```
Response 201: `{ user: { ...userObject } }`
Response 409: `{ message: "Email already registered" }` or `{ message: "Employee code already in use" }`
Response 422: validation failure
Notes: **The only way an employee account is created** (rules 1–3). The server forces
`status: 'PENDING'` and `mustChangePassword: true`; both are ignored if sent by the client. No
password is accepted or set here, so the account cannot authenticate yet. `createdById` is
recorded from the caller's token for audit. Backs the currently handler-less add-employee button
at `app/(admin)/employees/index.tsx:61`.

### GET /users/:id
Access: `[ADMIN ONLY]`
Response 200: user object plus `{ assignments: [...], activeProjectCount, attendanceRate, lastLoginAt }`
Response 403 / 404
Notes: Backs the admin employee detail route, which does not exist in the app yet.

### PUT /users/:id
Access: `[ADMIN ONLY]`
Request body: `{ firstName?, lastName?, phone?, email?, employeeCode?, designation?, department?, role? }`
Response 200: the updated user object
Response 409: email or employeeCode collision
Response 403 / 404 / 422
Notes: Does **not** change `status` — that is a separate endpoint so every lifecycle transition is
independently auditable. Changing `email` does not invalidate existing sessions.

### PATCH /users/:id/status
Access: `[ADMIN ONLY]`
Request body: `{ status: "PENDING" | "ACTIVE" | "DEACTIVATED", reason?: string }`
Response 200: `{ user: { ...userObject }, temporaryCredential?: { value: string, expiresAt: string } }`
Response 403 / 404
Response 409: `{ message: "Invalid status transition" }`
Response 422: unknown status value
Notes: The single control point for the employee lifecycle (rule 5). Behaviour per transition:
- **→ ACTIVE** on an account with no `passwordHash`: generates a one-time setup credential,
  stores only its hash with a 24h expiry, and returns the plaintext **once** in
  `temporaryCredential` for the admin to hand over. It is never retrievable again.
- **→ ACTIVE** on a previously deactivated account: re-enables login, no new credential issued.
- **→ DEACTIVATED**: revokes every refresh token for the user immediately. The next request on
  any surviving access token returns 403 because `AccountActiveGuard` re-reads status from the
  database.
- An admin cannot deactivate their own account (409), which prevents locking the company out.

This endpoint is what `app/(admin)/employees/index.tsx` needs to become writable — it is
read-only today, the single biggest gap against rule 5.

### DELETE /users/:id
Access: `[ADMIN ONLY]`
Response 204: no content
Response 403 / 404
Response 409: `{ message: "Cannot delete an admin account" }`
Notes: Hard delete, cascading to the user's attendance logs, progress logs, uploads, requests, and
assignments. **Prefer `PATCH /users/:id/status` with `DEACTIVATED`** for anyone with work history —
deactivation preserves records, deletion destroys them. An admin cannot delete themselves or
another admin. Rows where the user was `assignedBy` are `RESTRICT`-protected, so deletion fails
with 409 if they ever assigned a project.

---

# Projects

### GET /projects
Access: `[ADMIN ONLY]`
Query params: `status` (`ACTIVE`|`COMPLETED`|`ON_HOLD`), `clientName`, `search`, `page`, `limit`
Response 200: paginated projects, each with `{ progressPercent: number, assignedCount: number }`
Response 403
Notes: Backs `app/(admin)/projects/index.tsx`. `progressPercent` is **derived** from
`ProgressLog` data at read time — there is no stored progress column, since a hand-maintained one
would drift from the logs. Every `ProgressBar` in the app currently renders a hardcoded number.

### POST /projects
Access: `[ADMIN ONLY]`
Request body:
```json
{
  "name": "string",
  "clientName": "string",
  "location": "string",
  "description": "string?",
  "startDate": "YYYY-MM-DD",
  "endDate": "YYYY-MM-DD?",
  "assignedUserIds": ["uuid"]
}
```
Response 201: `{ project: { ...projectObject, assignments: [...] } }`
Response 403 / 422
Notes: `assignedUserIds` creates the `Assignment` rows in the same transaction, so the team
picker on `app/(admin)/projects/new.tsx:161` finally persists. Any ID that is not an `ACTIVE`
employee is rejected with 422 — a `PENDING` or `DEACTIVATED` account cannot be assigned work.
`endDate` must be on or after `startDate`. Today the Create Project button calls `router.back()`
and saves nothing.

### GET /projects/:id
Access: `[ADMIN or ASSIGNED EMPLOYEE]`
Response 200: `{ ...projectObject, progressPercent, team: [...], recentProgressLogs: [...], recentUploads: [...] }`
Response 403: employee has no active assignment to this project
Response 404
Notes: Enforced by `ProjectAccessGuard` — admin passes unconditionally, an employee passes only
with an `Assignment` where `isActive = true` (rule 6). Backs `app/(admin)/projects/[id].tsx` and
the missing `app/(employee)/project/[id].tsx` route. Employee responses omit `team` contact
details and other employees' logs.

### PUT /projects/:id
Access: `[ADMIN ONLY]`
Request body: `{ name?, clientName?, location?, description?, startDate?, endDate? }`
Response 200: the updated project
Response 403 / 404 / 422
Notes: Does not change `status` or assignments — separate endpoints. No edit UI exists today.

### PATCH /projects/:id/status
Access: `[ADMIN ONLY]`
Request body: `{ status: "ACTIVE" | "COMPLETED" | "ON_HOLD" }`
Response 200: the updated project
Response 403 / 404 / 422
Notes: Setting `COMPLETED` does not deactivate assignments — historical records stay attributable.
There is no `DELETE /projects/:id`: project deletion is `RESTRICT`-blocked once any attendance
log, progress log, upload, or request exists. Use `COMPLETED` instead.

### GET /projects/my
Access: `[EMPLOYEE ONLY]`
Query params: `status`, `page`, `limit`
Response 200: paginated projects the caller is actively assigned to, each with `progressPercent`
Response 403: caller is an admin — admins use `GET /projects`
Notes: Scoped from the JWT `sub` claim through `Assignment.isActive = true`. No user ID parameter
exists on this route, which structurally removes the rule-6 scoping bug. Backs
`app/(employee)/projects.tsx` and the project cards on the employee dashboard, both of which read
local mock arrays today.

---

# Assignments

### GET /assignments
Access: `[ADMIN ONLY]`
Query params: `userId`, `projectId`, `isActive` (default `true`), `page`, `limit`
Response 200: paginated assignments, each embedding a summary `user` and `project`, plus
`{ assignedAt, assignedBy: { id, firstName, lastName }, isActive }`
Response 403
Notes: The audit view of who works where.

### POST /assignments
Access: `[ADMIN ONLY]`
Request body: `{ userId: "uuid", projectId: "uuid" }`
Response 201: `{ assignment: { ...assignmentObject } }`
Response 403 / 404
Response 409: `{ message: "Employee is already assigned to this project" }`
Response 422: target user is not an `ACTIVE` employee
Notes: `assignedById` is taken from the caller's token, never the body (rule 5 audit). Because
`[userId, projectId]` is unique, re-assigning a previously unassigned employee flips the existing
row's `isActive` back to true and returns 200 rather than inserting a duplicate. Assigning a
`PENDING` or `DEACTIVATED` account is rejected.

### DELETE /assignments/:id
Access: `[ADMIN ONLY]`
Response 204: no content
Response 403 / 404
Notes: **Soft unassign** — sets `isActive = false` and stamps `unassignedAt`. The row is retained
so existing attendance logs, progress logs, and uploads for that project stay explainable. The
employee immediately loses read access to the project via `ProjectAccessGuard`, but their past
records are untouched.

---

# Attendance

### POST /attendance/check-in
Access: `[EMPLOYEE ONLY]`
Request body: `{ projectId: "uuid", checkInLocation?: string, latitude?: number, longitude?: number }`
Response 201: `{ id, projectId, date, checkInTime, checkOutTime: null, status: "PRESENT" | "LATE" }`
Response 403: no active assignment to `projectId`
Response 409: `{ message: "Already checked in today" }`
Response 422: validation failure
Notes: `userId` and `checkInTime` are server-set — the client cannot backdate attendance.
`[userId, date]` is unique, so the double-submit the current UI cannot prevent is blocked here.
`status` is derived server-side from a configurable cutoff time, not client-supplied. Latitude and
longitude are optional because geofencing is still an open decision and no location dependency is
installed in the app. Backs `app/(employee)/attendance.tsx:60`, which today only flips a local
`useState`.

### PATCH /attendance/:id/check-out
Access: `[EMPLOYEE ONLY]`
Request body: `{ checkOutLocation?: string, latitude?: number, longitude?: number }`
Response 200: the updated attendance record with `checkOutTime` set
Response 403: the record belongs to another employee
Response 404
Response 409: `{ message: "Already checked out" }` or the record is not from today
Notes: `checkOutTime` is server-set. An employee can only check out of their own record.

### GET /attendance/my
Access: `[EMPLOYEE ONLY]`
Query params: `month` (`YYYY-MM`), `from`, `to`, `projectId`, `page`, `limit`
Response 200: `{ data: [...logs], meta: {...}, summary: { present, absent, late, totalWorkingDays } }`
Response 403: caller is an admin
Notes: The `summary` block matches the existing `AttendanceSummary` type in
`src/types/employee.ts` and feeds both the monthly calendar and `AttendanceSummaryCard`. Scoped
from the token.

### GET /attendance
Access: `[ADMIN ONLY]`
Query params: `date`, `from`, `to`, `projectId`, `userId`, `status`, `page`, `limit`
Response 200: paginated logs, each embedding a summary `user` and `project`
Response 403
Notes: Required by rule 7 (admin sees all attendance logs). **No admin UI exists for this today** —
this is one of the three unserved rule-7 endpoints.

### GET /attendance/user/:id
Access: `[ADMIN ONLY]`
Query params: `month`, `from`, `to`, `projectId`, `page`, `limit`
Response 200: `{ user: {...}, data: [...logs], meta: {...}, summary: { present, absent, late, totalWorkingDays } }`
Response 403 / 404
Notes: The per-employee attendance history behind the admin employee detail view. Backs the
`attendanceRate` figure that `app/(admin)/employees/index.tsx` currently hardcodes.

---

# Progress Logs

### POST /progress-logs
Access: `[EMPLOYEE ONLY]`
Request body:
```json
{
  "projectId": "uuid",
  "title": "string",
  "description": "string",
  "workStage": "string?",
  "hoursWorked": 8.5,
  "date": "YYYY-MM-DD",
  "uploadIds": ["uuid"]
}
```
Response 201: `{ ...progressLogObject, uploads: [...] }`
Response 403: no active assignment to `projectId`
Response 422: `hoursWorked` outside 0–24, or `date` in the future
Notes: `userId` is server-set from the token. `uploadIds` attaches already-uploaded files to this
log; each must belong to the caller and the same project. Multiple logs per day are allowed —
unlike attendance, there is no unique constraint. Backs `app/(employee)/progress.tsx:138`, which
is `onPress={() => {}}` today.

### GET /progress-logs/my
Access: `[EMPLOYEE ONLY]`
Query params: `projectId`, `from`, `to`, `page`, `limit`
Response 200: paginated logs with their uploads embedded
Response 403: caller is an admin
Notes: Scoped from the token.

### GET /progress-logs
Access: `[ADMIN ONLY]`
Query params: `projectId`, `userId`, `from`, `to`, `workStage`, `page`, `limit`
Response 200: paginated logs, each embedding a summary `user` and `project`
Response 403
Notes: Required by rule 7. No admin UI exists for this today.

### GET /progress-logs/user/:id
Access: `[ADMIN ONLY]`
Query params: `projectId`, `from`, `to`, `page`, `limit`
Response 200: `{ user: {...}, data: [...logs], meta: {...} }`
Response 403 / 404

---

# Uploads

### POST /uploads
Access: `[EMPLOYEE ONLY]`
Content-Type: `multipart/form-data`
Form fields: `files` (1–10 files), `projectId` (uuid), `category?` (string),
`caption?` (string), `progressLogId?` (uuid)
Response 201: `{ uploads: [{ id, fileUrl, fileName, fileType, mimeType, fileSizeBytes, uploadedAt }] }`
Response 403: no active assignment to `projectId`
Response 413: `{ message: "File exceeds 10MB limit" }`
Response 415: `{ message: "Unsupported file type" }`
Response 422: no files provided, or more than 10
Notes: MIME whitelist `image/jpeg`, `image/png`, `application/pdf`, validated by sniffed content
type rather than extension or the client-supplied header. Max 10 MB per file, 10 files per
request. The storage key is a server-generated UUID; the original filename is sanitized and kept
for display only. Objects are stored private. `userId` comes from the token.

Storage provider is still undecided — Cloudinary primary, S3 fallback — but it sits behind a
provider interface, so this contract does not change with the decision.

Backs `app/(employee)/upload.tsx:103`, which is `onPress={() => {}}` today. Note that **no
`expo-image-picker` call exists anywhere in the app**, so the client half of this flow is
entirely unbuilt despite the dependency being installed.

### GET /uploads/my
Access: `[EMPLOYEE ONLY]`
Query params: `projectId`, `fileType`, `category`, `from`, `to`, `page`, `limit`
Response 200: paginated uploads, each with a short-lived signed `fileUrl`
Response 403: caller is an admin
Notes: Ordered by `uploadedAt` descending. Backs the Recent Uploads list on the employee
dashboard, which reads `MOCK_UPLOADS` today. Signed URLs expire in 15 minutes.

### GET /uploads
Access: `[ADMIN ONLY]`
Query params: `projectId`, `userId`, `fileType`, `category`, `from`, `to`, `page`, `limit`
Response 200: paginated uploads, each embedding a summary `user` and `project`
Response 403
Notes: Required by rule 7. No admin UI exists for this today.

### GET /uploads/user/:id
Access: `[ADMIN ONLY]`
Query params: `projectId`, `fileType`, `from`, `to`, `page`, `limit`
Response 200: `{ user: {...}, data: [...uploads], meta: {...} }`
Response 403 / 404

---

# Requests [Material / Issue / Support]

Not in the original endpoint list, but both request screens are already built
(`app/(employee)/requests.tsx`, `app/(admin)/requests.tsx`) and neither can function without
these. Specified here so the contract is complete.

### POST /requests
Access: `[EMPLOYEE ONLY]`
Request body: `{ projectId: "uuid", type: "MATERIAL" | "ISSUE" | "SUPPORT", priority: "LOW" | "MEDIUM" | "HIGH", subject: "string", description: "string?" }`
Response 201: `{ ...requestObject, status: "PENDING" }`
Response 403: no active assignment to `projectId`
Response 422: validation failure
Notes: `status` is forced to `PENDING`; an employee cannot self-approve.

### GET /requests/my
Access: `[EMPLOYEE ONLY]`
Query params: `status`, `type`, `projectId`, `page`, `limit`
Response 200: paginated requests
Response 403: caller is an admin

### GET /requests
Access: `[ADMIN ONLY]`
Query params: `status`, `type`, `priority`, `projectId`, `userId`, `page`, `limit`
Response 200: paginated requests, each embedding a summary `user` and `project`
Response 403
Notes: Backs the All/Pending/Approved/Rejected filter chips on `app/(admin)/requests.tsx`.

### PATCH /requests/:id/status
Access: `[ADMIN ONLY]`
Request body: `{ status: "APPROVED" | "REJECTED", reviewNote?: string }`
Response 200: the updated request with `reviewedBy` and `reviewedAt` set
Response 403 / 404
Response 409: `{ message: "Request already reviewed" }`
Notes: Records the acting admin from the token. This is the approve-reject action the admin
requests screen cannot perform today — status is display-only there, so the admin's core job on
that screen is blocked.

---

# Reports [PLANNED — deferred]

`app/(admin)/reports.tsx` exists with a type selector and a `Generate Report` button that is
`onPress={() => {}}`. Report endpoints are deliberately **not specified** in Phase 2: the report
types and output format have not been decided, and every figure a report would contain is
already reachable through the filtered list endpoints above.

Revisit after Phase 3, when real data exists to report on. Export (PDF/XLSX) is Phase 4.

---

# Notifications [PLANNED — Phase 4]

Not specified. Will require `POST /devices` for FCM token registration, `GET /notifications`,
and `PATCH /notifications/:id/read`. Specify when Phase 4 starts.

---

## Coverage against the access-control rules

| Rule | Enforcement |
|---|---|
| 1. No public registration | Only `POST /auth/login` is `[PUBLIC]`. No register endpoint exists. |
| 2. No self-onboarding | Account creation is `POST /users` `[ADMIN ONLY]`. |
| 3. Registration only creates a pending request | `POST /users` forces `status: PENDING`; the field is not client-settable. |
| 4. Only approved + active can log in | `POST /auth/login` returns 403 unless `status === ACTIVE`. `AccountActiveGuard` re-reads status per request. |
| 5. Admin is sole authority | `POST /users`, `PATCH /users/:id/status`, `POST /assignments`, `PATCH /requests/:id/status` are all `[ADMIN ONLY]`, and each records the acting admin. |
| 6. Employees see only their own data | Employee reads use `/my` paths with no ID parameter; scoping comes from the JWT. `ProjectAccessGuard` gates project reads on an active assignment. |
| 7. Admin sees everything | `GET /attendance`, `/progress-logs`, `/uploads`, `/requests` plus their `/user/:id` variants. **All four currently lack any admin UI** — the biggest Phase 3 build-out. |

## Frontend integration notes

- `src/services/api.ts` already has the token-injection request interceptor and a 401 handler
  that calls `logout()`. The 401 handler should be changed to attempt `POST /auth/refresh` once
  before logging out, otherwise every 15-minute access-token expiry will eject the user.
- The login form's Zod schema enforces a 6-character minimum password; the server requires 8.
  Raise the client to match.
- The frontend `User` type has a single `name` field; the API returns `firstName` / `lastName`.
- `BadgeVariant` in `src/types/index.ts` uses lowercase (`ongoing`, `onhold`, `pending`); the API
  returns uppercase enums. Map at the query-hook boundary, not in components.
- No screen has loading, empty, or error states today. Every endpoint above needs all three.
