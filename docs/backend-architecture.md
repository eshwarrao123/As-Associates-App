# Backend Architecture [PLANNED]

Specification for Phase 2. **No backend code exists today.** Every statement in this document
describes intent, not current reality. The frontend currently makes zero network calls;
`src/services/api.ts` is written but never invoked.

This spec is binding on the access-control policy in `docs/user-roles-and-permissions.md`.
Any endpoint or guard that contradicts rules 1–7 is a defect.

---

## Stack

| Concern | Choice | Status |
|---|---|---|
| Runtime | Node.js (LTS, 22.x) | [PLANNED] |
| Framework | NestJS | [PLANNED] |
| Language | TypeScript | [PLANNED] |
| Database | PostgreSQL 16 | [PLANNED] |
| ORM | Prisma | [PLANNED] |
| Auth | JWT — access token + refresh token | [PLANNED] |
| Password hashing | argon2id (bcrypt acceptable fallback) | [PLANNED] |
| Validation | `class-validator` + `ValidationPipe` (whitelist mode) | [PLANNED] |
| File storage | Cloudinary (primary) or S3 (fallback) | **Decision pending** |
| Push notifications | Firebase Cloud Messaging | [PLANNED] — Phase 4 |
| Hosting | TBD | Undecided |

Single monolith. No microservices, no message queue, no Redis unless rate limiting demands it.
This is an internal app for one company with a handful of concurrent users — the deployment
target is one Node process and one Postgres instance.

### Auth model summary
- Admin creates an employee account. The account starts at `PENDING`.
- Admin activates the account and a temporary credential is issued — either a one-time setup
  link (preferred) or a temp password handed over out of band.
- The employee sets their own password on first login. Until then `mustChangePassword` is true
  and the session is restricted to `POST /auth/change-password` only.
- A JWT is issued **only** when `status === 'ACTIVE'`.
- Middleware rejects any request carrying a valid JWT whose account is now `PENDING` or
  `DEACTIVATED`, so deactivation takes effect before the access token expires.

### Token policy
| Token | Lifetime | Storage | Contents |
|---|---|---|---|
| Access | 15 minutes | client memory + AsyncStorage (existing pattern) | `sub`, `role`, `status`, `mustChangePassword`, `jti`, `iat`, `exp` |
| Refresh | 7 days, rotating | AsyncStorage | `sub`, `jti`, `iat`, `exp` |

Refresh tokens are stored server-side as hashes so they can be revoked. Rotation on every
refresh; reuse of a consumed refresh token revokes the whole family.

**Status is re-read from the database on every request.** The `status` claim in the JWT is a
fast-path hint, never the authority — otherwise a deactivated employee would keep access until
their token expired.

---

## Folder Structure

NestJS monolith. One module per domain, thin controllers, business logic in services.

```
src/
  main.ts                     # bootstrap, global pipes, helmet, CORS
  app.module.ts               # root module wiring

  auth/
    auth.module.ts
    auth.controller.ts        # login, refresh, logout, change-password
    auth.service.ts           # credential verification, token issue/rotate
    strategies/
      jwt.strategy.ts         # validates access token, re-reads user status
      jwt-refresh.strategy.ts
    dto/
      login.dto.ts
      refresh.dto.ts
      change-password.dto.ts

  users/                      # admin manages employees here
    users.module.ts
    users.controller.ts       # /users/me + admin CRUD + status transitions
    users.service.ts
    dto/
      create-user.dto.ts      # admin-only; no public equivalent exists
      update-user.dto.ts
      update-me.dto.ts        # narrow: phone + profilePhoto only
      update-status.dto.ts

  projects/
    projects.module.ts
    projects.controller.ts
    projects.service.ts
    dto/

  assignments/
    assignments.module.ts
    assignments.controller.ts
    assignments.service.ts
    dto/

  attendance/
    attendance.module.ts
    attendance.controller.ts
    attendance.service.ts
    dto/

  progress-logs/
    progress-logs.module.ts
    progress-logs.controller.ts
    progress-logs.service.ts
    dto/

  uploads/
    uploads.module.ts
    uploads.controller.ts
    uploads.service.ts
    storage/
      storage.interface.ts    # provider-agnostic contract
      cloudinary.provider.ts
      s3.provider.ts          # fallback impl behind the same interface
    dto/

  notifications/              # [PLANNED] Phase 4
    notifications.module.ts
    notifications.service.ts  # FCM send
    devices.service.ts        # device token registration

  common/
    guards/
      jwt-auth.guard.ts       # global — applied via APP_GUARD
      roles.guard.ts          # ADMIN vs EMPLOYEE
      account-active.guard.ts # blocks PENDING / DEACTIVATED
      must-change-password.guard.ts
      project-access.guard.ts # admin OR employee with active assignment
    decorators/
      roles.decorator.ts      # @Roles('ADMIN')
      public.decorator.ts     # @Public() — used on login only
      current-user.decorator.ts
    interceptors/
      logging.interceptor.ts
    filters/
      http-exception.filter.ts # uniform { statusCode, message, error } shape
    pipes/

  prisma/
    prisma.module.ts
    prisma.service.ts
    schema.prisma
    migrations/
    seed.ts                   # seeds exactly one ADMIN account
```

The storage provider sits behind `storage.interface.ts` specifically because the
Cloudinary-vs-S3 decision is still open — the choice must not leak into `uploads.service.ts`.

Seeding creates one admin account only. There is no code path anywhere that creates an
employee account without an authenticated admin (rules 1–2).

---

## Auth Flow (detailed)

### 1. Admin logs in
`POST /auth/login` with admin credentials. Server verifies the password hash, confirms
`role === 'ADMIN'` and `status === 'ACTIVE'`, then issues an access token carrying
`role: 'ADMIN'` plus a refresh token.

### 2. Admin creates an employee record
`POST /users` with name, email, phone, role. The service forces `status: 'PENDING'` and
`mustChangePassword: true` — neither is client-settable. No password is set yet. The account
cannot authenticate in this state.

This is the **only** way an employee account comes into existence. There is no
`POST /auth/register` and none may be added (rules 1–3).

### 3. Admin reviews and activates
`PATCH /users/:id/status` with `{ status: 'ACTIVE' }`. On this transition the server:
- generates a temporary credential — a single-use, time-boxed setup token (24h) or a temp
  password, depending on the delivery mechanism chosen at build time
- stores only its hash
- returns the plaintext credential **once** in the response for the admin to hand over

### 4. Employee logs in with the temp credential
`POST /auth/login`. The server checks, in this order:
1. account exists → else `401 Invalid credentials`
2. password matches → else `401 Invalid credentials`
3. `status === 'ACTIVE'` → else `403 Account not active`

Only then is a JWT issued. If `mustChangePassword` is true the access token still issues, but
`MustChangePasswordGuard` rejects every route except `POST /auth/change-password` with
`403 Password change required`. After a successful change the flag clears and full access opens.

Steps 1 and 2 must be indistinguishable in timing and message so the endpoint cannot be used
to enumerate registered emails.

### 5. Requests from non-active accounts
`AccountActiveGuard` runs on every authenticated request, after `JwtAuthGuard`. It loads the
user's current `status` from the database and returns `403` immediately for `PENDING` or
`DEACTIVATED`. Deactivation is therefore effective on the next request, not on token
expiry. The user's refresh-token family is revoked at the moment of deactivation.

### 6. Every route is guarded
`JwtAuthGuard` is registered globally via `APP_GUARD`. The only route carrying `@Public()` is
`POST /auth/login`. `RolesGuard` reads `@Roles(...)` metadata and every controller method
declares one — a route with no `@Roles` decorator is a defect, and CI should fail on it.

Guard execution order: `JwtAuthGuard` → `AccountActiveGuard` → `MustChangePasswordGuard` →
`RolesGuard` → `ProjectAccessGuard` (route-specific).

---

## Security Rules

**Authentication**
- Every route except `POST /auth/login` requires a valid access token. No exceptions.
- `RolesGuard` enforces the ADMIN/EMPLOYEE split on every route.
- Employees cannot reach any admin-scoped route. Attempts return `403`, never `404`-by-accident
  or a filtered empty list.
- Client-side route grouping (`app/(admin)` vs `app/(employee)`) is **not** security. Every rule
  is enforced server-side independently.

**Data scoping (rule 6)**
- Every employee-scoped read is filtered by the user ID taken from the JWT `sub` claim.
- A client-supplied `userId` in a body, query, or path is never trusted for scoping. Employee
  endpoints use `/my` paths with no ID parameter at all, which removes the class of bug.
- `ProjectAccessGuard` gates `GET /projects/:id`: admin passes unconditionally, an employee
  passes only with an `Assignment` where `isActive = true`.

**Rate limiting**
- `POST /auth/login` — 5 attempts per 15 minutes per IP, and 10 per hour per email.
- `POST /auth/refresh` — 30 per hour per user.
- Global default — 100 requests per minute per authenticated user.
- Progressive lockout on repeated login failure, with the attempt recorded for admin review.

**Password policy**
- Minimum 8 characters. The frontend's current Zod schema enforces 6
  (`app/(auth)/login.tsx`) — that must be raised to match at integration time.
- Hashed with argon2id. Plaintext is never logged or persisted.
- Changing a password revokes all refresh tokens for that user except the current session.

**File upload validation**
- MIME type whitelist: `image/jpeg`, `image/png`, `application/pdf`. Rejected by sniffed
  content type, not by file extension or the client-supplied header.
- Max size 10 MB per file, max 10 files per request.
- Filenames are sanitized and never used as storage keys — a server-generated UUID is the key.
- Uploads are scoped to a project the employee is actively assigned to; anything else is `403`.
- Stored objects are private. Reads go through short-lived signed URLs, not public buckets.

**Transport and headers**
- HTTPS only. `helmet` enabled. CORS restricted to the app's origins.
- No secrets in the repo — all config via environment variables.

**Auditing**
- `Assignment.assignedBy` and every status transition record the acting admin's ID.
- Login attempts, status changes, and deactivations are logged with actor, target, and timestamp.

---

## Deliberately out of scope

Kept out to avoid over-engineering a small internal tool:

- Multi-tenancy, organizations, or workspaces — one company, one database
- Granular per-resource permissions — the two-role model in
  `docs/user-roles-and-permissions.md` is sufficient
- Public API, API keys, or third-party OAuth
- Event sourcing, CQRS, message queues, Redis caching
- Soft-delete infrastructure beyond what `status` and `Assignment.isActive` already give
- GraphQL — the contract is REST (`docs/api-contract.md`)
- Self-service password reset by email in Phase 2. Password recovery is admin-mediated at
  first; the frontend's "Forgot password?" link is currently inert anyway.
