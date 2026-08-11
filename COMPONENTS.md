# COMPONENTS.md — AS Associates Internal Ops App
> Derived from Stitch project `7450523547241458564` — 18 screens analyzed

---

## 1. Button

**Purpose:** Primary interaction trigger across all screens.

| Variant | Background | Text | Border | Usage |
|---|---|---|---|---|
| `primary` | `#F5A623` | `#FFFFFF` | none | Submit, Save, Confirm |
| `outline` | transparent | `#1A3C5E` | 1px `#1A3C5E` | Secondary actions |
| `ghost` | transparent | `#1A3C5E` | none | Forgot password, Cancel, View All |
| `danger` | `#BA1A1A` | `#FFFFFF` | none | Delete, Reject |
| `disabled` | `#E4E2E4` | `#73777F` | none | Inactive state |

**States:** `default` · `pressed` (darken fill) · `loading` (spinner replaces label) · `disabled`

**Structure:**
```tsx
<Button
  variant="primary" | "outline" | "ghost" | "danger"
  label="string"
  onPress={fn}
  loading={boolean}
  disabled={boolean}
  fullWidth={boolean}
/>
// TouchableOpacity → View (48px height, 8px radius) → Text | ActivityIndicator
```

---

## 2. Input

**Purpose:** Form data entry across Login, Add Project, Raise Request, Settings.

| Variant | Description |
|---|---|
| `text` | Default single-line (email, name, location) |
| `password` | Secure text with toggle icon |
| `multiline` | Text area (notes, descriptions) — min 120px |
| `dropdown` | Select with trailing chevron icon |
| `date` | Date picker trigger input |
| `file` | Upload trigger (Upload Screen) |

**States:** `default` · `focused` (border → `#1A3C5E`) · `error` (border → `#BA1A1A`) · `disabled` · `filled`

**Structure:**
```tsx
<Input
  label="string"
  placeholder="string"
  variant="text" | "password" | "multiline" | "dropdown" | "date"
  value={string}
  onChangeText={fn}
  error="string | undefined"
  disabled={boolean}
/>
// View → Text (label) → TextInput (48px, 8px radius, #FFF bg, 1px #E5E7EB border)
//       → Text (error, label-sm, #BA1A1A)
```

---

## 3. Badge / Status Pill

**Purpose:** Project status, request status, attendance status across all list screens.

| Variant | Label | Background | Text |
|---|---|---|---|
| `ongoing` | Ongoing | `#16A34A` 15% | `#16A34A` |
| `completed` | Completed | `#16A34A` 15% | `#166534` |
| `on-hold` | On Hold | `#F59E0B` 15% | `#92400E` |
| `pending` | Pending | `#F59E0B` 15% | `#92400E` |
| `approved` | Approved | `#16A34A` 15% | `#166534` |
| `rejected` | Rejected | `#BA1A1A` 15% | `#BA1A1A` |
| `present` | Present | `#16A34A` 15% | `#16A34A` |
| `absent` | Absent | `#BA1A1A` 15% | `#BA1A1A` |
| `late` | Late | `#F59E0B` 15% | `#92400E` |

**Structure:**
```tsx
<Badge variant="ongoing" | "completed" | "on-hold" | "pending" | "approved" | "rejected" />
// View (pill radius 9999px, horizontal padding 10px, vertical 4px) → Text (label-sm 12px/500)
```

---

## 4. Card (Base)

**Purpose:** Primary content container used across every screen.

| Variant | Description | Seen On |
|---|---|---|
| `default` | White card, soft shadow | All screens |
| `navy-header` | Navy bg, white text (greeting banner) | Employee Home, Admin Dashboard |
| `stat` | 2-col grid, large number + caption | Admin Dashboard |
| `flat` | No shadow, border only | Settings sections |
| `pressable` | Navigates on tap | Project lists, Employee lists |

**Structure:**
```tsx
<Card
  variant="default" | "navy-header" | "stat" | "flat" | "pressable"
  onPress={fn}        // only for pressable
  style={StyleProp}
>
  {children}
</Card>
// TouchableOpacity (pressable) or View → View (#FFF, 12px radius, 16px padding, shadow)
```

---

## 5. Project Card (Employee)

**Purpose:** Displays assigned project summary on Employee Home and My Projects screen.

**Contains:**
- Project name — `headline-sm`
- Client / location — `body-md` / `#43474E`
- Status badge — top-right
- Progress bar — bottom
- Progress label — `label-sm`

**Variants:** `compact` (Home screen, 2 items max) · `full` (My Projects list)

**Structure:**
```tsx
<ProjectCard
  projectName="string"
  client="string"
  location="string"
  status="ongoing" | "completed" | "on-hold"
  progress={0-100}
  onPress={fn}
/>
// Card (pressable) → Row[Badge] → Text (name) → Text (client) → ProgressBar → Label
```

---

## 6. Project Card (Admin)

**Purpose:** Displays project overview on Admin Projects screen and Admin Dashboard.

**Contains:**
- Project name — `headline-sm`
- Assigned engineers count — `body-md`
- Start / end date — `label-sm` / `#73777F`
- Status badge
- Progress bar
- FAB or arrow to detail

**Variants:** `list-item` (Projects Screen) · `dashboard-summary` (Admin Dashboard)

**Structure:**
```tsx
<AdminProjectCard
  projectName="string"
  engineerCount={number}
  startDate="string"
  endDate="string"
  status="string"
  progress={number}
  onPress={fn}
/>
```

---

## 7. Employee Card

**Purpose:** Displays employee in the Employees Screen and Assign Engineers screen.

**Contains:**
- Avatar (40px circle, initials or photo)
- Employee name — `body-lg`
- Role / designation — `body-md` / `#43474E`
- Department — `label-sm` / `#73777F`
- Trailing: chevron or checkbox (Assign mode)

**Variants:** `list` (Employees Screen) · `selectable` (Assign Engineers — with checkbox)

**Structure:**
```tsx
<EmployeeCard
  name="string"
  role="string"
  department="string"
  avatarUri="string | undefined"
  selectable={boolean}
  selected={boolean}
  onPress={fn}
/>
// Card (pressable) → Row[Avatar, Col[name, role, dept], Trailing]
```

---

## 8. Attendance Card

**Purpose:** Shows daily attendance record on Attendance Screen.

**Contains:**
- Date — `label-md`
- Day — `label-sm` / `#73777F`
- Check-in time — `body-md`
- Check-out time — `body-md`
- Status badge (`present` / `absent` / `late`)
- Work hours — `label-sm`

**Variants:** `daily` (single record) · `summary-header` (monthly stats banner)

**Structure:**
```tsx
<AttendanceCard
  date="string"
  day="string"
  checkIn="string | null"
  checkOut="string | null"
  status="present" | "absent" | "late"
  hours="string"
/>
// Card → Row[Col[date, day], Col[times], Badge]
```

---

## 9. Request Card

**Purpose:** Shows employee-raised requests on Raise Request (employee) and Requests Management (admin).

**Contains:**
- Request type — `headline-sm`
- Date submitted — `label-sm` / `#73777F`
- Description — `body-md` (truncated to 2 lines)
- Status badge
- Admin view: Approve / Reject action buttons

**Variants:** `employee-view` (read-only status) · `admin-view` (approve/reject actions)

**Structure:**
```tsx
<RequestCard
  type="string"
  date="string"
  description="string"
  status="pending" | "approved" | "rejected"
  adminView={boolean}
  onApprove={fn}
  onReject={fn}
/>
// Card → Text[type] → Text[date] → Text[desc] → Row[Badge, Actions?]
```

---

## 10. Dashboard Widget (Admin)

**Purpose:** KPI summary tiles on Admin Dashboard.

**Contains:**
- Metric value — `headline-lg` / `#1A3C5E`
- Metric label — `label-sm` / `#73777F`
- Optional delta — `label-sm` with up/down arrow icon

**Variants:** `stat-tile` (2-col grid) · `chart-card` (full-width, Reports Screen)

**Structure:**
```tsx
<StatWidget
  value="string"
  label="string"
  delta="string | undefined"
  deltaDirection="up" | "down"
/>
// Card (stat variant) → Text[value] → Text[label] → Row[Icon, Text[delta]]?
```

---

## 11. Avatar

**Purpose:** User identity across Profile, Employee Cards, Top Bar, Assignment screens.

| Size | Diameter | Font |
|---|---|---|
| `sm` | 32px | label-sm |
| `md` | 44px | label-md |
| `lg` | 60px | headline-sm |

**States:** `initials` (no photo) · `image` (with photo) · `placeholder` (grey)

**Structure:**
```tsx
<Avatar
  name="string"
  uri="string | undefined"
  size="sm" | "md" | "lg"
/>
// View (circle, #1A3C5E bg) → Text(initials) | Image(cover)
```

---

## 12. Progress Bar

**Purpose:** Visual project completion indicator. Appears in all project cards.

**Structure:**
```tsx
<ProgressBar value={0-100} showLabel={boolean} />
// View (track: #E4E2E4, 6px, full radius)
//   → View (fill: #1A3C5E, width = value%)
// + optional Text (label-sm, right-aligned, "#value%")
```

---

## 13. Top App Bar

**Purpose:** Screen header with navigation and actions. Present on all inner screens.

| Variant | Description |
|---|---|
| `back` | Back arrow + title |
| `back-action` | Back arrow + title + trailing icon(s) |
| `plain` | Title only (Admin Dashboard, Home) |

**Structure:**
```tsx
<TopAppBar
  title="string"
  variant="back" | "back-action" | "plain"
  onBack={fn}
  actions={[{ icon, onPress }]}
/>
// View (56px, #1A3C5E bg) → Row[BackIcon?, Text[title], Actions?]
```

---

## 14. Bottom Navigation

**Purpose:** Primary navigation between sections. Fixed at screen bottom.

| Role | Tabs |
|---|---|
| Employee | Home · My Projects · Attendance · Profile |
| Admin | Dashboard · Projects · Employees · Settings |

**Structure:**
```tsx
<BottomNav role="employee" | "admin" activeRoute="string" />
// View (64px, #FFF, border-top 1px #E5E7EB)
//   → [NavTab × 4] → Icon (24px) + Text (label-sm)
//   active: #1A3C5E · inactive: #73777F
```

---

## 15. Section Header

**Purpose:** Labels content sections with optional "View All" link.

```tsx
<SectionHeader title="string" onViewAll={fn | undefined} />
// Row → Text[headline-sm] + TouchableOpacity[Text "View All", ghost style]
```

---

## 16. Upload Item

**Purpose:** Displays uploaded file/photo entries on Upload Screen. Shows recent uploads on Employee Home.

**Contains:** File thumbnail/icon · filename · upload date · file size

```tsx
<UploadItem
  filename="string"
  date="string"
  size="string"
  thumbnailUri="string | undefined"
  onPress={fn}
/>
// Card (flat) → Row[Thumbnail|Icon, Col[name, date+size], ChevronIcon]
```

---

## 17. Empty State

**Purpose:** Shown when lists have no data.

```tsx
<EmptyState
  icon={IconComponent}
  title="string"
  message="string"
  action={{ label: "string", onPress: fn }}
/>
// View (centered) → Icon(48px,#C3C6CF) → Text[headline-sm] → Text[body-md] → Button?
```

---

## 18. List Divider

**Purpose:** Separates list items inside cards.

```tsx
<Divider />
// View (height: 1px, backgroundColor: #E5E7EB, marginHorizontal: 0)
```

---

## 19. Chip

**Purpose:** Filter selectors on Projects Screen, Reports Screen.

| Variant | State |
|---|---|
| `filter` | unselected: `#E4E2E4` bg / selected: `#1A3C5E` bg + `#FFF` text |
| `tag` | Read-only label (project type, department) |

```tsx
<Chip label="string" selected={boolean} onPress={fn} />
// TouchableOpacity (pill, 32px height, 12px h-padding) → Text (label-sm)
```

---

## 20. FAB (Floating Action Button)

**Purpose:** Create new project/employee. Admin-only. Visible on Projects and Employees screens.

```tsx
<FAB icon="plus" onPress={fn} />
// TouchableOpacity (56px circle, #F5A623 bg, shadow)
//   → Icon (24px, #FFF)
// Position: absolute, bottom: 80px (above bottom nav), right: 16px
```

---

## Component Naming Convention

| Pattern | Example |
|---|---|
| Feature + Type | `ProjectCard`, `AttendanceCard` |
| UI Primitive | `Button`, `Input`, `Badge`, `Avatar` |
| Layout | `TopAppBar`, `BottomNav`, `SectionHeader` |
| Feedback | `EmptyState`, `LoadingSpinner` |

**File locations (recommended):**
```
src/components/ui/          ← Primitives (Button, Input, Badge, Card, Avatar…)
src/components/employee/    ← ProjectCard, AttendanceCard, UploadItem
src/components/admin/       ← AdminProjectCard, EmployeeCard, StatWidget, RequestCard
src/components/shared/      ← TopAppBar, BottomNav, SectionHeader, EmptyState, FAB
```

---

*Source: Stitch MCP `projects/7450523547241458564` · 18 screens · No HTML downloaded*
