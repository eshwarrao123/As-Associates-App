# Performance and Scalability

This is an internal tool for one contracting company. The scale is deliberately small, and this
document exists to keep it from being over-engineered as much as to plan for growth.

The honest summary: **no performance problem exists today, and none is expected at the projected
scale.** What follows is the set of practices that keep it that way, plus the thresholds at which
any of it would need revisiting.

---

## 1. Current Scale Expectations

| Dimension | Expected | Notes |
|---|---|---|
| Admin users | 1 | Possibly 2–3 if office staff are added |
| Employee users | 10–50 | The realistic ceiling for a firm of this size |
| Concurrent users | 5–15 | Peak at morning check-in and end-of-day logging |
| Active projects | 5–20 | Bank branch fit-outs, weeks to months each |
| Attendance records | ~1 per employee per working day → ~1,000/month at 50 employees | Bounded by headcount × calendar |
| Progress logs | 1–3 per employee per day → ~3,000/month at peak | Bounded the same way |
| Photo uploads | 3–10 per employee per day, ~2–5 MB each | The only dimension with real storage growth |
| Requests | A handful per week company-wide | Negligible |
| Annual row growth | Low tens of thousands across all tables | A single Postgres instance handles this indefinitely |

**Traffic shape.** Two pronounced daily spikes — check-in in the morning, progress and photo
uploads at end of day. Between those, near-idle. There is no overnight batch load and no
external traffic at all, since there is no public surface.

**What this scale means.** 50 users generating tens of thousands of rows a year is small enough
that a single Node process and a single Postgres instance are correct, not a compromise. Caching
layers, read replicas, queues, and horizontal scaling are all solving problems this app does not
have. `docs/backend-architecture.md` lists them as deliberately out of scope.

The only dimension that grows unboundedly is **photo storage** — roughly 50 employees × 5 photos
× 3 MB × 250 working days ≈ 190 GB/year at the top of the range. That is a storage-cost question
(ADR-011), not a performance question.

---

## 2. Frontend Performance

### Current state

No performance issue has been observed. Every screen renders from an inline mock array of fewer
than a dozen items, so there is nothing yet to be slow. The list rendering, image handling, and
loading states below are all things to get right **as** screens are connected in Phase 3 — not
existing problems to fix.

Two things are genuinely known today:

- **Font loading gates the first render.** `app/_layout.tsx` returns `null` until `useFonts`
  resolves all four Inter weights. That is a brief blank frame on cold start. Correct behaviour —
  it prevents a font-swap flash — but it is the app's one real startup cost.
- **Bottom nav remounts on every navigation.** `BottomNav` / `AdminBottomNav` are rendered
  per-screen with a literal `activeIndex` rather than being a Tabs layout, so the whole nav
  unmounts and remounts on each route change. Minor at this size, but it is wasted work and it is
  already a Phase 1 HIGH fix in `docs/todo-roadmap.md` for correctness reasons anyway.

### Practices to hold to

**Lists.** Use `FlatList` (or `FlashList` if a list ever misbehaves) for anything server-driven,
not `.map()` inside a `ScrollView`. At current mock sizes `.map()` is fine; at 50 employees or a
month of attendance rows it is not. Set `keyExtractor` from a stable ID. Do not reach for
virtualization tuning props speculatively.

**Pagination.** Any list that grows with time gets a paginated endpoint from day one — attendance
history, progress logs, uploads, requests. `docs/api-contract.md` already specifies cursor
pagination on these. Unbounded list endpoints are the one scaling mistake that is expensive to
retrofit, because the client has to change too.

**Images.** This is where the real frontend risk sits, since photos are 2–5 MB from a phone
camera.
- Compress and resize client-side before upload. `expo-image-manipulator` is already installed
  for exactly this and has never been called.
- Never render a full-resolution original in a list. Thumbnails only; full size on tap. Both
  storage options in ADR-011 can serve a derived thumbnail — with Cloudinary it is a URL
  parameter, with S3 it is something to build.
- Cap dimensions and quality at pick time, not at display time.

**Re-renders.** The existing choices already handle this: React Hook Form keeps inputs
uncontrolled so typing does not re-render the form, and Zustand selectors subscribe to slices
rather than the whole store. Keep both. Add `React.memo` only where a profiler shows a problem —
not preemptively.

**Query configuration.** `staleTime: 5 minutes` and `retry: 2` are already set on the
`QueryClient`. Five minutes suits this data: attendance and project status do not change
minute-to-minute, and the setting avoids refetching on every screen focus. Override per-query
only where staleness actually matters.

**Loading and error states.** No screen has one today, because no screen fetches anything. Every
screen needs all three — loading, empty, error — as it is connected. Already a Phase 3 HIGH task.
This is a perceived-performance issue as much as a correctness one: a blank screen reads as
"broken," a skeleton reads as "loading."

**Offline.** Site connectivity is unreliable, which is a real operational risk for a tool used on
active construction sites. Offline sync is **not designed and not confirmed as a requirement** —
it is an open question in `docs/todo-roadmap.md`. If it becomes a requirement, the write-heavy
flows (check-in, progress log, photo upload) are the ones that need queuing, and that is a
significant piece of work. Do not half-build it.

**Startup.** Nothing to optimize yet. If cold start becomes slow later, the levers are font
subsetting and deferring non-critical providers — not code splitting, which buys little in a
React Native bundle.

---

## 3. Backend Performance `[PLANNED]`

No backend exists. This section is what to build in, not what to fix.

**Indexes.** The most important item here, and the cheapest. `docs/database-schema.md` already
specifies them; they must land with the first migration rather than being added after a slow
query appears:
- `AttendanceLog` — `@@unique([userId, date])`, which serves both the duplicate-check-in
  constraint and the "my attendance this month" query
- `Assignment` — indexed on `userId` and `projectId`; this is the join every employee-scoped read
  passes through, so it is the hottest path in the app
- `ProgressLog`, `Upload` — indexed on `projectId` and `createdAt` for chronological reads
- `RefreshToken` — indexed on `tokenHash` for lookup and `expiresAt` for cleanup
- `User` — unique on `email`

**N+1 queries.** The likeliest real performance bug at this scale, and it will show up in admin
list views: a project list that fetches assignments per project, or an employee list that fetches
each employee's assignment count separately. Use Prisma `include` / `select` to fetch relations
in one query. Log queries in development so an N+1 is visible while writing the endpoint rather
than after.

**Select narrowly.** Prefer `select` over returning whole rows. This matters less for speed than
for safety — it is how `passwordHash` and `mustChangePassword` avoid leaking into a response by
accident.

**Aggregates for reports.** Admin reporting is the one genuinely query-heavy surface. Compute
totals with SQL aggregates (`groupBy`, `_count`, `_sum`), not by pulling rows into Node and
reducing. `app/(admin)/reports.tsx` is entirely mock today, so the query shape is still free to
choose.

**Derived project progress.** Progress percentages are hardcoded in the UI today.
`docs/database-schema.md` chose to derive them from logs rather than store a column, which avoids
a denormalized value drifting out of sync. If that aggregate ever gets slow — it will not at 20
projects — a cached column with recomputation on log write is the escape hatch.

**Connection pooling.** Prisma pools by default. The default size is ample for 15 concurrent
users. The one caveat: if the app is ever deployed to a serverless platform, connection
exhaustion becomes a real failure mode and a pooler (PgBouncer, or the platform's own) is
required. Relevant to the hosting decision in `docs/deployment.md`.

**Pagination server-side.** Enforce a maximum page size at the DTO level. A client asking for
10,000 rows should get a validation error, not 10,000 rows.

**Rate limiting.** Already specified in `docs/backend-architecture.md` — 5 login attempts per 15
minutes per IP, 100 requests/minute per authenticated user. This is a security control that
happens to also cap load. It is the only place Redis might eventually be justified, and only if
the app outgrows a single process.

**Uploads.** Stream to the storage provider; do not buffer whole files in Node memory. 10 files
× 10 MB per request is 100 MB — enough to matter on a small instance. Signed direct-upload URLs
would keep the file bytes out of the API process entirely, which is the better shape if the
chosen provider supports it.

**Response caching.** Not needed. Almost every response is user-scoped and freshness matters
more than latency here. TanStack Query's client cache is sufficient.

---

## 4. Scalability Ceiling and When to Revisit

The current architecture — one Node process, one Postgres instance, one storage bucket — is
sufficient well past the projected scale. Concrete triggers for reconsidering, so the decision is
data-driven rather than anxiety-driven:

| Trigger | Response |
|---|---|
| Employees exceed ~200 | Review admin list queries and indexes; still one instance |
| Concurrent users exceed ~100 | Consider a second app instance behind a load balancer; the app is stateless apart from refresh-token rows, so this is straightforward |
| Any endpoint p95 exceeds ~500 ms | Profile that query specifically. Almost certainly a missing index or an N+1 — not an architecture problem |
| Photo storage exceeds ~500 GB | Revisit ADR-011 on cost grounds; add lifecycle rules to move old project photos to colder storage |
| Report queries exceed a few seconds | Add materialized views or a nightly rollup table. Do not introduce a warehouse |
| Postgres CPU sustained above ~70% | Vertical scale first — it is a single cheap step and buys a lot at this size |
| Multiple companies need isolated data | A genuine re-architecture. Multi-tenancy is explicitly out of scope today and adding it is not incremental |

**What not to do preemptively.** Redis, read replicas, message queues, microservices, CQRS,
GraphQL, a CDN in front of the API, horizontal autoscaling. Each is listed as out of scope in
`docs/backend-architecture.md`. At 50 users each adds operational surface and no measurable
benefit.

**The order of operations if something is ever slow.** Measure first. Then: add the missing
index, fix the N+1, add pagination, vertically scale. Those four steps cover essentially every
performance problem an app at this scale will have. Architecture changes come after all four are
exhausted, not before.

---

## Related

- `docs/backend-architecture.md` — guard pipeline, rate limits, upload constraints, out-of-scope list
- `docs/database-schema.md` — index definitions and the derived-progress decision
- `docs/api-contract.md` — pagination contracts
- `docs/decisions.md` — ADR-011 (storage provider), ADR-008 (Postgres choice)
- `docs/deployment.md` — hosting, which determines whether connection pooling matters
