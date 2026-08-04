# Product Overview — AS Associates Internal App

## What AS Associates does

AS Associates is a civil and interior design contracting firm. Its primary line of work is
bank branch renovation and fit-out — interior build-outs, electrical and civil work, and
site finishing for banking clients. Work is distributed across multiple simultaneous sites,
each staffed by engineers and site personnel who are rarely in a head office.

Project names visible in the current mock data reflect this domain: ICICI Bank HQ,
Axis Bank – Bandra, HDFC Bank – Powai, plus non-bank commercial sites.

## Why this app exists

Today the company coordinates site work manually — attendance over phone calls and messages,
site photos over WhatsApp, and progress updates verbally or on paper. That produces three
recurring problems:

1. Attendance is unverifiable and reconciled by hand at month end.
2. Site photos are scattered across chat threads with no project association.
3. Admin has no single view of what stage each site is actually at.

The app replaces those manual flows with structured, per-project, per-employee records that
admin can read in one place.

## Who uses it

**Admin** — company management. One authority for accounts, project creation, employee
assignment, request approval, and reporting. Sees everything.

**Employee** — site engineers and staff. Sees only their own account and their own
assignments. Cannot administer anything.

There are exactly two roles. No supervisor, manager, or client role exists or is planned for
this phase.

## Core features

| Feature | What it does | Current state |
|---|---|---|
| Attendance check-in | Employee marks daily presence; monthly calendar + present/absent/late summary | UI built, mock data, no persistence |
| Project assignment | Admin creates projects and assigns employees; employees see their list | UI built on both sides, not connected |
| Photo uploads | Employee uploads site photos tagged to a project and work stage | Screen built, picker not wired |
| Daily progress logs | Employee logs work stage and progress notes against a project | UI built, mock data |
| Requests | Employee raises Material / Issue / Support requests; admin approves or rejects | Both screens built, filters work, actions not wired |
| Admin dashboard | Aggregate counts, active projects, pending requests | UI built, mock data |
| Employee directory | Admin views employees with active/inactive status and stats | Read-only list, no actions |
| Reports | Admin-facing summary reporting | Static screen, no data source, no export |

## Out of scope for the current phase

The current phase is **frontend only**. The following are explicitly not being built yet:

- Backend API (NestJS + PostgreSQL + Prisma) — [PLANNED]
- Real authentication and JWT issuance — [PLANNED]; login uses two hardcoded users
- File/image storage (Cloudinary or S3) — [PLANNED], provider undecided
- Push notifications (Firebase Cloud Messaging) — [PLANNED]
- Geolocation or geofenced attendance verification — [PLANNED], not confirmed
- Offline sync — not confirmed, not designed
- iOS and web builds — scripts exist, untested; Android emulator is the only target
- Any client-facing or public surface — will not be built
