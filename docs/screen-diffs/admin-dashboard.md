# Admin Dashboard — Visual Diff Document

> **Stitch Project:** `7450523547241458564`
> **Stitch Screen:** `90033664eaec4f35aa8ee2aac3935845`
> **Repo File:** `app/(admin)/index.tsx`
> **Generated:** 2026-08-05
> **Purpose:** Reference document for rebuild prompt — do not modify source files

---

## Stitch Design Spec

### Global / Screen

| Property | Stitch Value |
|---|---|
| Screen background | `#FCF8FB` (`Colors.background`) |
| Side padding | `16px` (`Spacing[4]`) |
| Section gap | `24px` (`Spacing[6]`) |
| Card inner padding | `16px` (`Spacing[4]`) |
| Card border-radius | `12px` (`BorderRadius.card`) |
| Card border | `1px solid #E5E7EB` (`Colors.border`) |
| Card shadow | subtle `elevation: 2`, `rgba(0,0,0,0.08)` |

---

### Section 1 — Header

| Property | Stitch Value |
|---|---|
| Background | `#FFFFFF` (`Colors.surface`) — white, NOT navy |
| Bottom border | `1px solid #E5E7EB` (`Colors.border`) |
| Height | ~56px |
| Left: Logo mark | Stylised "A" letterform inside a small grey circle; NOT a solid navy square |
| Left: App name text | "AS Associates" — `FontFamily.bold`, `FontSize.lg` (18px), `Colors.textPrimary` (#1B1B1D) |
| Right: Icon | Bell outline icon (`MaterialCommunityIcons: bell-outline`) — grey, ~22px — NO emoji |
| Right: No badge count | Bell has NO red badge in Stitch (count badge is absent) |

---

### Section 2 — Page Title Block

| Property | Stitch Value |
|---|---|
| Exists in Stitch | **YES** — separate text block below header |
| Title text | "Dashboard" |
| Title style | `FontFamily.bold`, `FontSize['2xl']` (24px), `Colors.textPrimary`, `lineHeight: 30` |
| Subtitle text | "Overview of operations and key metrics." |
| Subtitle style | `FontFamily.regular`, `FontSize.md` (14px), `Colors.textSecondary` (#43474E) |
| Layout | stacked, no card wrapper, sits on screen background |
| Top margin | `Spacing[4]` (16px) from header bottom |

---

### Section 3 — KPI Grid

| Property | Stitch Value |
|---|---|
| Layout | 2×2 grid, `flexWrap: 'wrap'`, gap `Spacing[3]` (12px) |
| Card width | ~48% (two per row) |
| Card background | `#FFFFFF` (`Colors.surface`) |
| Card border-radius | `12px` |
| Card border | `1px solid #E5E7EB` |
| Card shadow | `Shadow.card` |
| **No left accent border** | Stitch cards do NOT have a `borderLeftWidth: 4` colour stripe |
| Value typography | `FontFamily.bold`, `FontSize['2xl']` (24px), `Colors.textPrimary` — all four values same dark colour |
| Label typography | `FontFamily.regular`, `FontSize.sm` (12px), `Colors.textSecondary` |

**Per-card content and icon:**

| Card | Value | Label | Icon (MaterialCommunityIcons) | Icon bg |
|---|---|---|---|---|
| Total Projects | 24 | "Total Projects" | `briefcase-outline` | `Colors.background` tint |
| Ongoing | 11 | "Ongoing" | rotating arrows (`sync` / `refresh`) | amber subtle `#FFF7E6` |
| Total Employees | 18 | "Total Employees" | `account-group-outline` | `Colors.background` tint |
| Pending Requests | 6 | "Pending Requests" | `clipboard-list-outline` | danger subtle `#FEE2E2` |

> **KPI icons:** Each card shows a small icon in a rounded square container above the number — icon is ~20px, container is ~40×40px with status-coloured subtle bg. This is entirely absent from the current implementation.

> **No trend label** (e.g. "↑ 12%") exists in Stitch — only value + label + icon.

---

### Section 4 — Project Status

| Property | Stitch Value |
|---|---|
| Section title | "Project Status" — `FontFamily.bold`, `FontSize.lg` (18px), `Colors.textPrimary` |
| Right link | "View All" — `FontFamily.medium`, `FontSize.sm` (12px), `Colors.accent` (#F5A623) — amber, NOT navy |
| Wrapper | single white `Card` enclosing all rows |
| Row padding | `paddingVertical: Spacing[3]` (12px) |
| Row divider | `1px solid Colors.border` |

**Per-row content:**

| Row | Name | Subtitle | Progress | Bar color |
|---|---|---|---|---|
| 1 | City Center Plaza | "Commercial • Phase 2" | 75% | `Colors.primary` navy |
| 2 | Riverside Apartments | "Residential • Foundation" | 30% | `Colors.accent` amber |
| 3 | Tech Park Hub | "Industrial • Final Fit-out" | 92% | `Colors.primary` navy |

> **Key diff:** Row subtitle format is `"Category • Phase"` (client name is NOT shown). Current code shows `project.name` + `project.client` as separate lines. Stitch shows name + `"Category • Phase"` subtitle.

> **Progress bar colour:** Stitch varies between navy and amber per row, not a single uniform colour. The current `ProgressBar` default fills navy for all rows.

---

### Section 5 — Recent Activity

| Property | Stitch Value |
|---|---|
| Section title | "Recent Activity" — same title style as Project Status |
| Right element | **None** — no "Today" timestamp label |
| Wrapper | single white `Card` |
| Layout | **Vertical timeline** — thin vertical line on left, coloured bullet dots per row |
| Bullet dot size | ~8px circle |
| Bullet colours | navy (primary), amber (accent), danger (red) per item respectively |
| Row: time label | above item text — e.g. "10:45 AM • Today" — `FontFamily.regular`, `FontSize.xs`, `Colors.textMuted` |
| Row: event text | `FontFamily.regular`, `FontSize.md` (14px), `Colors.textPrimary` |
| Footer | "View Full History →" button — full-width, `BorderRadius.btn`, `borderWidth: 1`, `Colors.border`, text `Colors.textPrimary` |
| Avatar initials | **NOT present** in Stitch — current uses `<Avatar>` circles. Stitch uses bullet dots on a timeline line. |

**Activity entries:**

| Time | Text |
|---|---|
| 10:45 AM • Today | "Sarah Jenkins uploaded new site photos for City Center Plaza." |
| 09:15 AM • Today | "Mike Ross marked foundation stage complete on Riverside Apartments." |
| Yesterday | "Material delivery delayed for Tech Park Hub." |

---

### Section 6 — Action Required

| Property | Stitch Value |
|---|---|
| Section title | **"Action Required"** (NOT "Pending Requests") |
| Title icon | small red warning/alert icon to the LEFT of the title |
| Right badge | pill — text "6 New", bg `Colors.danger` (#BA1A1A), text `Colors.surface` (white), `BorderRadius.full` |
| Cards | individual white cards per request (NOT inside a single wrapper) |
| Card border-radius | `12px` |
| Card border | `1px solid Colors.border` |

**Per-card content:**

| # | Type | Detail | Time label |
|---|---|---|---|
| 1 | "Material Approval" | "Steel grade 500 requirement for structural reinforcement at Phase 2." | "2h ago" |
| 2 | "Leave Request" | "David Chen - Site Supervisor. Aug 12-14." | "4h ago" |
| 3 | "Expense Claim" | "Transportation and fuel - $145.00" | "1d ago" |

**Card layout per request:**
- Top row: `type` text (bold) left + time label (muted, xs) right — **no priority badge in Stitch**
- Body: detail text, `FontFamily.regular`, `FontSize.sm`, `Colors.textSecondary`
- Button row: **"Approve"** (navy bg `Colors.primary`, white text) + **"Review"** (white bg, `Colors.border` border, `Colors.textPrimary` text) — side-by-side, `height: 36`, `BorderRadius.btn`

> **Key diff (buttons):** Current has `Approve` (green bg) + `Reject` (danger border). Stitch has `Approve` (navy bg) + `Review` (outline). No Reject button.
> **Key diff (badge):** Current shows priority `<Badge>` (HIGH/MEDIUM). Stitch shows NO priority badge.

---

### Section 7 — Bottom Navigation

| Property | Stitch Value |
|---|---|
| Tab count | **5 tabs** |
| Tab labels (L→R) | Home, Projects, Upload, Attendance, Profile |
| Active tab | Home — `Colors.primary` icon + label |
| Inactive tabs | `Colors.textSecondary` icon + label |
| Icon style | Outlined Material icons |
| Background | `Colors.surface` white |
| Top border | `1px solid Colors.border` |

> **Key diff:** Current `AdminBottomNav` has **4 tabs** (Dashboard, Projects, Employees, Settings). Stitch admin nav shows the **same 5-tab layout as employee nav** (Home, Projects, Upload, Attendance, Profile). This is a significant structural mismatch — the Stitch admin nav is different from what would be expected for admin functionality. Flagged for confirmation before implementing.

---

## Current Implementation

### Hooks & State `[KEEP]`

| Symbol | Type | Location |
|---|---|---|
| `useRouter()` | hook | line 102 — provides `router.push` for navigation |
| `router.push('/(admin)/projects')` | nav call | line 136 — "View All" in Project Status |
| `router.push('/(admin)/requests')` | nav call | line 185 — tapping a pending request card |

### Mock Data `[KEEP]`

| Variable | Type | Contents |
|---|---|---|
| `KPIS: Kpi[]` | array | 4 KPI entries: Total Projects, Ongoing, Employees, Pending Requests |
| `STATUS_PROJECTS: StatusProject[]` | array | 3 projects with name, client, progress |
| `ACTIVITIES: Activity[]` | array | 5 activity entries with initials, text, time |
| `PENDING: PendingRequest[]` | array | 2 pending request entries with priority, type, person, detail |

### Current UI Sections `[EVALUATE]`

| Section | Rendered in current | Lines |
|---|---|---|
| Stack.Screen (headerShown: false) | yes | 106 |
| Navy header (dark bg + emoji bell) | yes | 108–117 |
| KPI 2×2 grid (no icons, left border stripe) | yes | 120–131 |
| "Project Status" section + "View All" | yes | 133–154 |
| "Recent Activity" section (avatar rows) | yes | 156–172 |
| "Pending Requests" section (priority badge + Approve/Reject) | yes | 174–197 |
| `<AdminBottomNav activeIndex={0} />` | yes | 200 |

### Sub-components `[KEEP]`

| Component | Note |
|---|---|
| `ActionButtons` (internal) | Will change button styles + labels — keep the component structure |

---

## Section Comparison Table

| Section | In Stitch | In Current | Action |
|---|---|---|---|
| Header (white bg, logo + app name, bell icon) | YES | NO — navy bg, no logo, emoji bell | **PATCH** |
| Page Title Block ("Dashboard" + subtitle) | YES | NO | **ADD** |
| KPI 2×2 grid (icon per card, no left border) | YES | YES (different styling) | **PATCH** |
| Project Status section | YES | YES (different data shape) | **PATCH** |
| Recent Activity (timeline, bullet dots) | YES | YES (avatar rows, different layout) | **PATCH** |
| Action Required (was "Pending Requests") | YES | YES (different title, badge, buttons) | **PATCH** |
| Admin Bottom Nav | YES (5 tabs, needs confirmation) | YES (4 tabs — Dashboard/Projects/Employees/Settings) | **PATCH** ⚠️ |

---

## Detailed Mismatch List

### PATCH — Header

| Element | Stitch | Current | Token |
|---|---|---|---|
| Background color | `#FFFFFF` white | `Colors.primary` (#1A3C5E) navy | `Colors.surface` |
| Bottom border | `1px solid #E5E7EB` | none | `Colors.border` |
| Left content | Logo mark + "AS Associates" text | Text only: "AS Associates" | N/A — add logo mark |
| App name color | `Colors.textPrimary` (#1B1B1D) dark | `Colors.surface` (#FFFFFF) white | `Colors.textPrimary` |
| Right icon | `bell-outline` MaterialCommunityIcon, ~22px, grey | 🔔 emoji | `Icon` component, `iconOutline: 'bell'` |
| Bell badge | **none** | red circle with "3" count | **REMOVE** |

---

### PATCH — KPI Cards

| Element | Stitch | Current | Token |
|---|---|---|---|
| Left accent border | **none** | `borderLeftWidth: 4` coloured stripe | **REMOVE** `borderLeftColor` and `borderLeftWidth` |
| Icon per card | YES — `~40×40` icon container above value | **none** | Add icon sub-component |
| Value color | `Colors.textPrimary` for all 4 | 3× `Colors.primary`, 1× `Colors.danger` | `Colors.textPrimary` uniform |
| "Pending Requests" value color | `Colors.textPrimary` | `Colors.danger` (#BA1A1A) | `Colors.textPrimary` |
| Trend label "↑ 12%" | **none** | present for "Total Projects" | **REMOVE** `kpi.trend` |
| Card icon backgrounds | tinted subtle bg per status | **none** | `Colors.background`, `Colors.warningSubtle`, `Colors.dangerSubtle` |

---

### ADD — Page Title Block

| Element | Stitch Value | Token |
|---|---|---|
| Title text | "Dashboard" | N/A (static string) |
| Title style | `FontFamily.bold`, `FontSize['2xl']`, `Colors.textPrimary` | `TextStyles.h1` |
| Subtitle text | "Overview of operations and key metrics." | N/A (static string) |
| Subtitle style | `FontFamily.regular`, `FontSize.md`, `Colors.textSecondary` | `TextStyles.bodySmall` |
| Margin below header | `Spacing[4]` (16px) from header, `Spacing[3]` (12px) to KPI grid | `Spacing[4]`, `Spacing[3]` |

---

### PATCH — Project Status

| Element | Stitch | Current | Token |
|---|---|---|---|
| "View All" color | `Colors.accent` (#F5A623) amber | `Colors.primary` (#1A3C5E) navy | `Colors.accent` |
| Row subtitle format | "Category • Phase" | `project.client` only | data shape change needed |
| Progress bar color | varies (navy / amber per row) | all navy (`Colors.primary`) | `Colors.primary` / `Colors.accent` |
| Row: project name size | `FontSize.base` (16px), bold | `FontSize.base` bold ✅ | — |

---

### PATCH — Recent Activity

| Element | Stitch | Current | Token |
|---|---|---|---|
| Row left element | Bullet dot (8px circle) on a vertical timeline line | `<Avatar>` (32px initials circle) | Replace Avatar with dot + line |
| Timeline vertical line | YES — thin line connecting dots | **none** | `Colors.border`, `width: 1` |
| Bullet colors | navy / amber / danger per item | uniform Avatar bg (`Colors.primary`) | `Colors.primary`, `Colors.accent`, `Colors.danger` |
| Time label position | above event text, separate line | in-line on the right (`activityTime`) | restructure row layout |
| Time label format | "10:45 AM • Today" | "2m ago" (relative) | format change |
| Right timestamp | none | "Today" label on section header | **REMOVE** |
| Footer button | "View Full History →" full-width outline | **none** | **ADD** — `BorderRadius.btn`, `Colors.border` |

---

### PATCH — Action Required (Pending Requests)

| Element | Stitch | Current | Token |
|---|---|---|---|
| Section title | "Action Required" | "Pending Requests" | Static string change |
| Title left icon | `alert-circle-outline` icon (red, ~20px) | **none** | `Icon` component, `Colors.danger` |
| Right badge text | "6 New" | "6" (plain number) | string change |
| Right badge bg | `Colors.danger` (#BA1A1A) | `${Colors.accent}22` (amber tint) | `Colors.danger` |
| Right badge text color | `Colors.surface` (white) | `#92400E` (amber-dark) | `Colors.surface` |
| Card top: priority `<Badge>` | **none** | YES (HIGH/MEDIUM badge) | **REMOVE** `<Badge>` |
| Card top: type text | bold, left; time label right | type text only | Add time label on right |
| Approve button bg | `Colors.primary` (#1A3C5E) navy | `Colors.success` (#16A34A) green | `Colors.primary` |
| Second button label | "Review" | "Reject" | string change |
| Second button style | outline (`Colors.border`), `Colors.textPrimary` text | outline (`Colors.danger`), `Colors.danger` text | `Colors.border`, `Colors.textPrimary` |

---

### PATCH — Admin Bottom Nav

| Element | Stitch | Current | Token / Note |
|---|---|---|---|
| Tab count | 5 (Home, Projects, Upload, Attendance, Profile) | 4 (Dashboard, Projects, Employees, Settings) | ⚠️ Major structural change — needs product confirmation |
| Active tab label | "Home" | "Dashboard" | label change if nav structure changes |
| Tab icon set | Outlined Material icons | Outlined Material icons ✅ | — |

> [!WARNING]
> The Stitch Admin nav shows the same tabs as the Employee nav (Home / Projects / Upload / Attendance / Profile). This is likely a Stitch prototype artefact where the same nav component was reused for both roles. Before rebuilding, **confirm with stakeholder** whether admin nav should stay as Dashboard/Projects/Employees/Settings or change to the Stitch 5-tab layout.

---

## Logic to Preserve

The following must be left completely unchanged during rebuild:

| Symbol | Type | Notes |
|---|---|---|
| `useRouter()` | hook | powers all navigation |
| `router.push('/(admin)/projects')` | nav call | "View All" in Project Status |
| `router.push('/(admin)/requests')` | nav call | tapping pending/action request cards |
| `KPIS: Kpi[]` | mock data | 4 entries — value/label strings will stay |
| `STATUS_PROJECTS: StatusProject[]` | mock data | 3 entries — name/client/progress intact |
| `ACTIVITIES: Activity[]` | mock data | 5 entries — initials/text/time intact |
| `PENDING: PendingRequest[]` | mock data | 2 entries — type/person/detail intact |
| `<Stack.Screen options={{ headerShown: false }} />` | navigation | must remain so layout controls its own header |
| `<AdminBottomNav activeIndex={0} />` | component | keep unless nav structure is changed |

---

## Priority Order for Rebuild

1. **Header** — highest visual impact; the navy→white change is the most jarring mismatch
2. **Add Page Title Block** — simple ADD, no logic
3. **KPI Cards** — remove left border stripe, add icons, fix value color
4. **Action Required** — title rename, badge fix, button style fix
5. **Recent Activity** — timeline layout is the most complex structural change
6. **Project Status** — minor; "View All" color + progress bar color variation
7. **Admin Bottom Nav** — pending product confirmation on tab structure
