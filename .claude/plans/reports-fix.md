# Reports Fix Plan

## Audit Summary

### Current State

| Feature | Status |
|---------|--------|
| Attendance Report | PARTIALLY WORKING — fetches real data from `GET /attendance` admin endpoint, but date range filter is ignored; `LATE` status referenced but doesn't exist in schema; uses `r.name` as React key (duplicate risk); absent count wrong (only counted if status === 'ABSENT', but backend never creates ABSENT records — it only creates PRESENT/HALF_DAY on clock-in) |
| Projects Report | NOT IMPLEMENTED — shows "Report preview not yet available" |
| Requests Report | NOT IMPLEMENTED — shows "Report preview not yet available" |
| Financial Report | PLACEHOLDER — no financial subsystem exists at all |
| Date Range Filter | PLACEHOLDER — UI exists but `onPress={() => {}}` on Generate, range value never sent to API |
| Project Filter | PARTIALLY WORKING — dropdown loads real projects, uses unique IDs as keys, but value is never sent to API |
| Generate Report button | NOT IMPLEMENTED — `onPress={() => {}}` |
| Export PDF button | NOT IMPLEMENTED — no PDF library installed, no handler |
| Export Excel button | NOT IMPLEMENTED — no XLSX/CSV library installed, no handler |

### Root Causes

1. **Attendance date filtering** — `useAdminAttendance()` is called with no params; the `range` state is never used to compute `startDate`/`endDate` query params.
2. **Attendance absent calculation** — Backend only records PRESENT/HALF_DAY. There are no ABSENT records. The calculation checks `status === 'ABSENT'` which always yields 0. Absent should be computed as `workingDaysInRange - presentDays`.
3. **Attendance `LATE` status** — The AttendanceStatus enum is `PRESENT | ABSENT | HALF_DAY`. There is no `LATE`. The check for `LATE` is dead code.
4. **Projects/Requests reports** — No rendering code exists at all; the else branch shows a placeholder.
5. **Financial tab** — No expense/budget table exists in the Prisma schema. Pure fiction.
6. **Export buttons** — No `expo-sharing`, `expo-file-system`, `expo-print` installed. No handlers attached.
7. **Generate Report** — No-op.
8. **Duplicate key** — `key={r.name}` used for attendance rows. Two employees with the same name would collide.

## Plan

### 1. Remove Financial tab
Remove `'Financial'` from `REPORT_TYPES`. No data model exists.

### 2. Wire date filtering
- Compute `startDate` / `endDate` from the selected range option.
- Pass them to the attendance/requests API calls.
- "Generate Report" triggers a refetch with the current filters.

### 3. Wire project filtering
- For attendance: not applicable (attendance has no project filter in admin endpoint — leave unfiltered or skip).
- For projects: filter on the `project` dropdown value.
- For requests: pass `projectId` to the requests API.

### 4. Implement Generate Report
- Set a `generated` flag so the preview only appears after the user taps Generate.
- Trigger the correct refetch based on report type and filters.

### 5. Implement Attendance Report (fix)
- Pass `startDate`/`endDate` to `getAdminAttendance()`.
- Remove `LATE` check.
- Count HALF_DAY as 0.5 present.
- Use `userId` as React key instead of `r.name`.
- Compute absent = working days in range - present days (but this requires knowing working days, which is complex without a calendar). Simpler: show columns as Employee | Present | Half Day | % based on actual records. Drop "Absent" column since we can't reliably compute it without a full working-day calendar. Or: keep it simple — total records is the denominator.

### 6. Implement Projects Report
- Reuse `useAllProjects` data.
- Table: Project | Client | Location | Status | Progress | Team Size.
- Team size from `assignments.length`.
- Use `project.id` as key.

### 7. Implement Requests Report
- Add `useAdminRequests` hook calling `getAllRequests` with filters.
- Table: Subject | Type | Project | Employee | Priority | Status | Date.
- Use `request.id` as key.

### 8. Export — CSV via expo-sharing + expo-file-system
Neither `expo-sharing` nor `expo-file-system` is installed. Installing them would require additional native dependencies.

**Alternative**: Use `Linking` (already installed) with a `data:` URI — doesn't work on all platforms.

**Simplest safe option**: Skip export for now. Label buttons as "Coming Soon" or remove them, since no safe export mechanism is available without installing new packages.

Actually — `expo-sharing` and `expo-file-system` are part of Expo SDK 57 and can be installed as Expo modules without native rebuilds in Expo Go. Let me install them and implement CSV export.

### 9. Fix duplicate keys
Use `userId` for attendance rows, `project.id` for project rows, `request.id` for request rows.

### 10. TypeScript
Run checks, fix only report-related errors.
