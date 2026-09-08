# Project Progress Definition

## Field: `progressPercent`

**Type:** Integer (0–100)  
**Default:** 0 (for new projects)  
**Owner:** Admin only

---

## Meaning

`progressPercent` represents **Admin's current assessment of overall physical project completion**, expressed as a percentage from 0% to 100%.

This is a **manually set value** that reflects the Admin's judgment of how much of the project's physical work has been completed on-site.

---

## What it is NOT

- **NOT** derived from elapsed calendar time (e.g., 30 days into a 60-day project ≠ 50% progress)
- **NOT** calculated from the number of daily progress logs submitted by employees
- **NOT** an automatic formula based on milestones or tasks

---

## How it is set

1. **Admin Project Create:** Admin can set an initial progress value when creating a project (defaults to 0%).
2. **Admin Project Edit:** Admin can update progress at any time from the Project Detail screen.

---

## Where it is displayed

1. **Admin Dashboard:** Project cards show progress bars with the stored `progressPercent` value.
2. **Admin Project Detail:** Header shows an inline progress bar; Overview tab has an editable section for Admin to update progress.
3. **Employee Project Detail:** Timeline card displays the stored progress as read-only.

---

## Validation

- Must be an integer between 0 and 100 (inclusive)
- Validated on both frontend (input) and backend (DTO)

---

## Database

**Table:** `projects`  
**Column:** `progressPercent INT NOT NULL DEFAULT 0`  
**Comment:** Admin's assessment of overall physical completion (0-100%)

**Prisma Schema:**
```prisma
progressPercent Int @default(0) // Admin's assessment of overall physical completion (0-100%)
```

---

## Backend API

**DTOs:**
- `CreateProjectDto`: `progressPercent?: number` (optional, defaults to 0)
- `UpdateProjectDto`: `progressPercent?: number` (optional, 0–100 validation)

**Endpoints:**
- `POST /projects` — accepts `progressPercent` in request body
- `PATCH /projects/:id` — accepts `progressPercent` in request body
- `GET /projects/:id` — returns `progressPercent` in response
- `GET /projects` — returns `progressPercent` for each project in the list

---

## Frontend

**Service:** `src/services/projects/projectsService.ts`  
**Mapping:** API `progressPercent` → UI `progress`

**Screens:**
- `app/(admin)/projects/new.tsx` — Input field for initial progress
- `app/(admin)/projects/[id].tsx` — Editable progress section with inline editor
- `app/(admin)/index.tsx` — Dashboard cards display progress bars
- `app/(employee)/project/[id].tsx` — Read-only progress display in Timeline card

---

## Example Workflow

1. Admin creates "ICICI Bank HQ - Andheri" project with initial progress = 0%
2. After site visit, Admin updates progress to 25%
3. Employee views the project and sees "Overall Progress: 25%"
4. Admin reloads the dashboard and sees the updated 25% progress bar
5. After another visit, Admin updates to 50%
6. All screens now reflect 50%

---

## Migration

If schema changes were needed, run:

```bash
cd backend
npx prisma migrate dev --name add-progress-percent-to-projects
```

However, the `progressPercent` field was added in a previous migration and is already present in the schema.
