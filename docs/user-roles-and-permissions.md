# User Roles and Permissions

## Roles

Exactly two roles exist. The `UserRole` type in `src/types/index.ts` is the source of truth,
and route groups enforce the boundary: `app/(admin)` vs `app/(employee)`.

| Role | Who | Scope |
|---|---|---|
| **Admin** | Company management | Full visibility and full authority across all data |
| **Employee** | Site engineers and site staff | Own account and own assignments only |

No supervisor, manager, client, or guest role exists or is planned for this phase.

---

## Access Control Policy

These rules are binding. Any feature, screen, or backend endpoint that contradicts them is a
defect.

1. This is a private internal app. Public registration is NOT allowed.
2. Employees cannot self-onboard or gain access on their own.
3. Any registration flow that exists must only create a pending request — not grant access.
4. Only admin-approved and active employees can log in.
5. Admin is the sole authority for: creating accounts, approving, activating, deactivating,
   assigning permissions, assigning projects.
6. Employees can only see data relevant to their own account and assignments.
7. Admin can see all employee data, uploads, attendance logs, progress logs, and assignments.

### Current state against this policy
- Rules 1–3: satisfied by omission. There is no registration or signup screen in the repo.
  `app/(auth)/` contains `login.tsx` only.
- Rule 4: **not enforced.** Login matches against two hardcoded users in
  `app/(auth)/login.tsx` with no account-status check. Enforcement requires the backend.
- Rule 5: **UI absent.** Admin cannot create, approve, activate, or deactivate an account
  from the app. `app/(admin)/employees/index.tsx` is a read-only list. Admin can assign
  employees to a project in `app/(admin)/projects/new.tsx`, but the assignment is not persisted.
- Rule 6: **cosmetically true, not enforced.** Employee screens read from local mock arrays,
  so no cross-employee data is exposed — but there is no scoping mechanism to enforce it once
  a real API exists.
- Rule 7: partially built. Admin has dashboard, employee list, project list/detail, requests,
  and reports screens. There is no admin view of uploads, attendance logs, or progress logs.

---

## Permission Matrix

`—` = not applicable to that role. Bracketed tags describe whether UI exists today.

### Accounts and employees
| Capability | Admin | Employee |
|---|---|---|
| Create employee account | Yes [NO UI] | No |
| Self-register | No (forbidden) | No (forbidden) |
| View all employees | Yes [IMPLEMENTED, read-only] | No |
| View own profile | Yes | Yes [IMPLEMENTED] |
| Edit own profile | Yes [NO UI] | No [PLANNED] |
| Approve pending employee | Yes [NO UI] | No |
| Activate / deactivate employee | Yes [NO UI] | No |
| Assign permissions | Yes [NO UI] | No |
| Delete employee | Yes [NO UI] | No |

### Projects
| Capability | Admin | Employee |
|---|---|---|
| Create project | Yes [IMPLEMENTED, not persisted] | No |
| View all projects | Yes [IMPLEMENTED] | No |
| View assigned projects | Yes | Yes [IMPLEMENTED] |
| View project detail | Yes [IMPLEMENTED] | No [NO UI — stub only] |
| Edit project | Yes [NO UI] | No |
| Assign employees to project | Yes [PARTIAL — picker exists, no persistence] | No |
| Delete project | Yes [NO UI] | No |

### Attendance
| Capability | Admin | Employee |
|---|---|---|
| Check in / mark attendance | — | Yes [PARTIAL — no persistence] |
| View own attendance history | — | Yes [IMPLEMENTED, mock] |
| View all employees' attendance | Yes [NO UI] | No |
| Edit or override attendance | Yes [NO UI] | No |

### Uploads and progress logs
| Capability | Admin | Employee |
|---|---|---|
| Upload site photos | No | Yes [PARTIAL — picker not wired] |
| View own uploads | No | Yes [IMPLEMENTED, mock] |
| View all uploads | Yes [NO UI] | No |
| Delete an upload | Yes [NO UI] | Own only [NO UI] |
| Create daily progress log | No | Yes [PARTIAL — no persistence] |
| View own progress logs | No | Yes [IMPLEMENTED, mock] |
| View all progress logs | Yes [NO UI] | No |

### Requests (Material / Issue / Support)
| Capability | Admin | Employee |
|---|---|---|
| Raise a request | No | Yes [PARTIAL — form UI, no submit] |
| View own requests | No | Yes [IMPLEMENTED, mock] |
| View all requests | Yes [IMPLEMENTED, mock] | No |
| Approve / reject a request | Yes [NO UI — display only] | No |

### Reports and settings
| Capability | Admin | Employee |
|---|---|---|
| View reports | Yes [PARTIAL — static screen] | No |
| Export reports | Yes [PLANNED] | No |
| Company settings | Yes [PARTIAL — rows are non-functional] | No |
| Notification preferences | Yes [PLANNED] | [PLANNED] |
| Logout | Yes [IMPLEMENTED] | Yes [IMPLEMENTED] |

---

## Employee Lifecycle

```
Pending  →  Approved  →  Active  →  Deactivated
                                         │
                                         └─→ (re-Activated by admin)
```

| State | Meaning | Can log in? | Set by |
|---|---|---|---|
| **Pending** | A request for access exists. No account credentials are usable. | No | Admin-initiated invite or a pending-request record (rule 3) |
| **Approved** | Admin has accepted the person, account created, not yet enabled. | No | Admin |
| **Active** | Account enabled, assignable to projects, full employee access. | Yes | Admin |
| **Deactivated** | Access revoked. Historical records retained. | No | Admin |

Transitions are admin-only in every direction (rule 5). An employee can never move their own
state.

### Which lifecycle states have UI today

| State | UI present? | Where |
|---|---|---|
| Pending | **No** | No pending-request screen or queue exists. `app/(admin)/requests.tsx` is for material/issue/support requests, **not** access requests. |
| Approved | **No** | No approval action anywhere in the app. |
| Active | **Partial** | `app/(admin)/employees/index.tsx` renders an `active: boolean` per employee as an Active/Inactive badge, with All/Active/Inactive filter chips. Display only — no toggle. |
| Deactivated | **Partial** | Same screen; shown as the `Inactive` badge. No action to set it. |

Notes:
- The underlying model in the employee list is a two-value `active: boolean`, not the
  four-state lifecycle above. Aligning that model is required before any lifecycle UI is built.
- An "add employee" button exists at `app/(admin)/employees/index.tsx:61` with no `onPress`
  handler.

---

## Enforcement Notes for the Backend [PLANNED]

When the NestJS API is built, these must hold server-side — client-side route grouping is not
security:

- No public `POST /auth/register`. Account creation is an admin-only endpoint.
- Login must reject any account not in `Active` state, with a distinct reason per state.
- Every employee-scoped read must be filtered by the authenticated user's own ID and their
  project assignments, derived from the token — never from a client-supplied parameter.
- Every admin capability must be guarded by a role check on the server.
