# Project Progress Field

## Definition

**`progressPercent` (Integer, 0–100)**

The `progressPercent` field represents the **Admin's current assessment of overall physical project completion**, expressed as a percentage from 0 to 100.

## Key Properties

- **Manual only**: This field is set exclusively by Admin users through the Admin Project Detail interface
- **Not automatic**: Progress is NOT calculated from dates, daily logs, or any other automated metric
- **Subjective assessment**: The value reflects the Admin's expert judgment of physical work completed
- **Persistent**: Value is stored in the database and survives across sessions
- **Default**: New projects start at 0%

## Usage

### Admin
- Navigate to Admin → Projects → [Select Project] → Overview tab
- Click the edit icon next to "PROJECT PROGRESS"
- Enter a value between 0-100
- Click "Save" to persist the change

### Employee
- Employees see the Admin-set progress value in:
  - Employee Home dashboard (recent projects)
  - Employee Projects list
  - Employee Project Detail → Overview tab → Timeline section

## Technical Implementation

### Database Schema
```prisma
model Project {
  progressPercent Int @default(0) // Admin's assessment of overall physical completion (0-100%)
  // ... other fields
}
```

### Validation
- **Type**: Integer
- **Range**: 0 to 100 (inclusive)
- **Validation**: Enforced at DTO level (`@IsInt()`, `@Min(0)`, `@Max(100)`)

### Backend
- **Update endpoint**: `PATCH /projects/:id`
- **DTO field**: `progressPercent?: number` in `UpdateProjectDto`
- **Service**: `ProjectsService.updateProject()` handles persistence

### Frontend
- **Admin UI**: Text input with Save/Cancel controls in Project Detail Overview
- **Display**: ProgressBar component used throughout app
- **Type**: `progress: number` in Project TypeScript interfaces

## Migration

**Migration**: `20260907185948_add_project_progress_percent`

Applied on: 2026-09-07

Adds `progress_percent` column to `projects` table with default value 0.

## Notes

- This field does NOT track daily progress logs (those are separate entries)
- This field does NOT auto-increment based on completion dates
- Setting to 100% does NOT automatically change project status to "COMPLETED"
- Project status (`ONGOING`, `COMPLETED`, etc.) and progress percentage are independent
