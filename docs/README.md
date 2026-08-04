# Documentation Index

Read `CLAUDE.md` at the project root before reading anything here.

14 files, grouped by purpose. Status tags used throughout: `[IMPLEMENTED]`, `[PARTIAL]`,
`[NEEDS STITCH ALIGNMENT]`, `[PLANNED]`, `[OPEN]`.

## What exists today

| File | What it covers | When to read it |
|---|---|---|
| [product-overview.md](product-overview.md) | The business, the problems the app solves, who uses it | Onboarding, or questioning whether a feature belongs |
| [user-roles-and-permissions.md](user-roles-and-permissions.md) | The 7 access-control rules, role matrix, employee lifecycle | **Before any auth, account, or data-scoping work** |
| [screens-and-features.md](screens-and-features.md) | All 19 route files with paths, roles, and status | Before touching any screen |
| [design-system.md](design-system.md) | Exact token values, component inventory, token gaps | **Before any UI change** — the styling authority |

## Process and planning

| File | What it covers | When to read it |
|---|---|---|
| [core-workflows.md](core-workflows.md) | 8 user journeys, step by step, with what is real vs stubbed | Tracing how a feature works end to end |
| [development-phases.md](development-phases.md) | Phase 0 done → Phase 4 planned, with Phase 1 blockers | Deciding what to work on next |
| [todo-roadmap.md](todo-roadmap.md) | Flat prioritized task list by phase and priority | Picking up a task |
| [decisions.md](decisions.md) | ADR-001…014 — why the stack is what it is; open decisions | Before changing a stack choice or reopening a settled question |

## Backend specification `[PLANNED]`

| File | What it covers | When to read it |
|---|---|---|
| [backend-architecture.md](backend-architecture.md) | NestJS layout, auth flow, guard order, security rules | Building any backend module |
| [database-schema.md](database-schema.md) | Prisma models, relations, enums, indexes | Writing a migration or query |
| [api-contract.md](api-contract.md) | Every endpoint: method, path, access tag, request, response | Building or consuming an endpoint |

## Operations

| File | What it covers | When to read it |
|---|---|---|
| [performance-and-scalability.md](performance-and-scalability.md) | Expected scale, practices to hold to, when to revisit | Before adding infrastructure — mostly a do-not-over-engineer guardrail |
| [deployment.md](deployment.md) | What runs today, planned hosting, pre-deployment checklist | Preparing a build or choosing hosting |
| [README.md](README.md) | This index | Now |

## Also at the project root

`CLAUDE.md` (project rules — read first), `AGENTS.md` (read the SDK 57 Expo docs before coding),
`DESIGN.md` (the Stitch design system), `COMPONENTS.md` (component inventory).
