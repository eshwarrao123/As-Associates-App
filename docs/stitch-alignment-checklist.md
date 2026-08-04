# Stitch Alignment Checklist

> Generated: 2026-07-29
> Stitch Project: `AS Associates Internal Ops App` — ID `7450523547241458564`
> Device: Mobile (390×884) | Design System: `assets/fef45803b48e4943a3879252a55efceb`

---

## Step 1 — Stitch Screen List (Verified ✅)

| # | Stitch Screen Name | Screen ID |
|---|---|---|
| 1 | Splash Screen | `b86dd3751f8348aba12dea99359ebd03` |
| 2 | Login Screen | `25dbce082eba4689855a3c5a1146d3a0` |
| 3 | Employee Home | `8f61e085ab254727817bd803952923d5` |
| 4 | My Projects (Employee) | `31645368469b4c34a7ca629631e4d5f6` |
| 5 | Project Detail (Employee) | `0257445eeb1a4ab890d06bcc5c28749d` |
| 6 | Attendance Screen (Employee) | `ce93025379b14833b8550b0cb0555ebb` |
| 7 | Daily Work Progress (Employee) | `f948bb4b07404545bb651d4c9748ac8a` |
| 8 | Upload Screen (Employee) | `132af8ac83c1402181a7c39ea7a18767` |
| 9 | Raise Request (Employee) | `08b91d9a848d44898e294fbabf00dc6d` |
| 10 | Employee Profile | `7486f09058314a83962d1ec60855ba15` |
| 11 | Admin Dashboard | `90033664eaec4f35aa8ee2aac3935845` |
| 12 | Projects Screen (Admin) | `54c0f349a1634ce1838fe297c3c97658` |
| 13 | Add New Project (Admin) | `d2d4b1e9d7c548a98fba7c557d5756cc` |
| 14 | Admin Project Detail | `69e8817a49084cd8b89669f26259320b` |
| 15 | Assign Engineers (Admin) | `29eac48e7d064c1fadbb1be259f47bdf` |
| 16 | Employees Screen (Admin) | `07173d634a2444dbb7ed9b422b83d668` |
| 17 | Requests Management (Admin) | `dbbcbfed1e6143ce876903d582e596cb` |
| 18 | Reports Screen (Admin) | `3fc194c318c74e74800c31ce652517b4` |
| 19 | Admin Settings | `d8e2fa50f14541a69861accdf9d971b1` |

---

## Step 2 — Repo Screen List

| # | File Path | Screen Name | Role |
|---|---|---|---|
| 1 | `app/_layout.tsx` | Root Layout | [SHARED] |
| 2 | `app/(admin)/_layout.tsx` | Admin Layout | [ADMIN] |
| 3 | `app/(employee)/_layout.tsx` | Employee Layout | [EMPLOYEE] |
| 4 | `app/(auth)/login.tsx` | Login Screen | [AUTH] |
| 5 | `app/(employee)/index.tsx` | Employee Home | [EMPLOYEE] |
| 6 | `app/(employee)/projects.tsx` | My Projects | [EMPLOYEE] |
| 7 | `app/(employee)/attendance.tsx` | Attendance | [EMPLOYEE] |
| 8 | `app/(employee)/progress.tsx` | Daily Progress | [EMPLOYEE] |
| 9 | `app/(employee)/upload.tsx` | Upload Work Photos | [EMPLOYEE] |
| 10 | `app/(employee)/requests.tsx` | Raise Request | [EMPLOYEE] |
| 11 | `app/(employee)/profile.tsx` | Employee Profile | [EMPLOYEE] |
| 12 | `app/(admin)/index.tsx` | Admin Dashboard | [ADMIN] |
| 13 | `app/(admin)/projects/index.tsx` | Projects List | [ADMIN] |
| 14 | `app/(admin)/projects/new.tsx` | New Project | [ADMIN] |
| 15 | `app/(admin)/projects/[id].tsx` | Project Detail | [ADMIN] |
| 16 | `app/(admin)/employees/index.tsx` | Employees | [ADMIN] |
| 17 | `app/(admin)/requests.tsx` | Requests Management | [ADMIN] |
| 18 | `app/(admin)/reports.tsx` | Reports | [ADMIN] |
| 19 | `app/(admin)/settings.tsx` | Settings | [ADMIN] |

**Shared UI Components:**

| File | Component |
|---|---|
| `src/components/ui/BottomNav.tsx` | Employee Bottom Navigation |
| `src/components/ui/AdminBottomNav.tsx` | Admin Bottom Navigation |
| `src/components/ui/Card.tsx` | Card Container |
| `src/components/ui/Badge.tsx` | Status Badge |
| `src/components/ui/Button.tsx` | Button |
| `src/components/ui/Input.tsx` | Text Input |
| `src/components/ui/Dropdown.tsx` | Dropdown Selector |
| `src/components/ui/Avatar.tsx` | Avatar Circle |
| `src/components/ui/ProgressBar.tsx` | Progress Bar |

---

## Step 3 — Mapping Table

| Stitch Screen Name | Repo File Path | Match Confidence |
|---|---|---|
| Splash Screen | *(none)* | **[MISSING]** |
| Login Screen | `app/(auth)/login.tsx` | [EXACT] |
| Employee Home | `app/(employee)/index.tsx` | [EXACT] |
| My Projects (Employee) | `app/(employee)/projects.tsx` | [EXACT] |
| Project Detail (Employee) | *(none)* | **[MISSING]** |
| Attendance Screen (Employee) | `app/(employee)/attendance.tsx` | [EXACT] |
| Daily Work Progress (Employee) | `app/(employee)/progress.tsx` | [EXACT] |
| Upload Screen (Employee) | `app/(employee)/upload.tsx` | [EXACT] |
| Raise Request (Employee) | `app/(employee)/requests.tsx` | [EXACT] |
| Employee Profile | `app/(employee)/profile.tsx` | [EXACT] |
| Admin Dashboard | `app/(admin)/index.tsx` | [EXACT] |
| Projects Screen (Admin) | `app/(admin)/projects/index.tsx` | [EXACT] |
| Add New Project (Admin) | `app/(admin)/projects/new.tsx` | [EXACT] |
| Admin Project Detail | `app/(admin)/projects/[id].tsx` | [EXACT] |
| Assign Engineers (Admin) | *(none)* | **[MISSING]** |
| Employees Screen (Admin) | `app/(admin)/employees/index.tsx` | [EXACT] |
| Requests Management (Admin) | `app/(admin)/requests.tsx` | [EXACT] |
| Reports Screen (Admin) | `app/(admin)/reports.tsx` | [EXACT] |
| Admin Settings | `app/(admin)/settings.tsx` | [EXACT] |

> [!WARNING]
> ### MISSING screens — 3 Stitch screens have no repo file:
> 1. **Splash Screen** — needs to be built (`app/splash.tsx` or `app/index.tsx`)
> 2. **Project Detail (Employee)** — planned but not implemented (`app/(employee)/project/[id].tsx`)
> 3. **Assign Engineers (Admin)** — separate Stitch screen, currently embedded as a section within `app/(admin)/projects/new.tsx`

**EXTRA repo files (no dedicated Stitch screen):**
- `app/_layout.tsx` — root layout (infrastructure, no Stitch equivalent expected)
- `app/(admin)/_layout.tsx` — admin layout (infrastructure)
- `app/(employee)/_layout.tsx` — employee layout (infrastructure)

---

## Step 4 — Per-Screen Mismatch Scan

> [!NOTE]
> Stitch design system tokens from DESIGN.md:
> - Background: `#FCF8FB` | Surface: `#FFFFFF` | Primary: `#002645` / `#1A3C5E`
> - Accent/Secondary: `#F5A623` (amber) | Text: `#1B1B1D` | Secondary text: `#43474E`
> - Card: 12px radius, 0 2px 8px shadow, white bg, 16px padding
> - Button: 48px height, amber bg, white text, 8px radius
> - Input: 48px height, white bg, 1px `#E5E7EB` border, 8px radius
> - Badge: pill shape (999px radius), 15% opacity bg, label-sm, ALL CAPS
> - Icons: Material Symbols (outline), not emoji glyphs
> - Bottom Nav: 5 tabs in Stitch (Home, Projects, Upload, Attendance, Profile) vs 4 in repo

---

### Login Screen
**Stitch:** `Login Screen` | **Repo:** `app/(auth)/login.tsx`

Mismatches:
- [ ] **Icons** — Stitch: Material Symbols icons for email/password fields | Current: no icons on inputs | Fix: add leading icons to Input component
- [ ] **Heading text** — Stitch: "Sign in to your account" | Current: "Welcome Back" + "Sign in to continue to your workspace" | Fix: match Stitch copy
- [ ] **Logo** — Stitch: styled logo mark with "AS Associates" text | Current: navy square with "A" letter | Fix: align logo treatment to Stitch spec
- [ ] **Button text** — Stitch: "Sign In" (matches) ✅
- [ ] **Button style** — Stitch: amber #F5A623 bg | Current: Uses `Colors.accent` which IS amber ✅
- [ ] **Card shadow** — Stitch: card centered on screen | Current: card centered ✅ (broadly aligned)
- [ ] **Background** — Stitch: `#FCF8FB` | Current: `Colors.background` = `#FCF8FB` ✅
- [ ] **Footer** — Stitch: no visible footer | Current: "© 2024 AS Associates" | Fix: remove or hide footer text

**Severity: LOW** — Mostly copy text differences, overall layout structure aligns well.

---

### Employee Home
**Stitch:** `Employee Home` | **Repo:** `app/(employee)/index.tsx`

Mismatches:
- [ ] **Bottom nav tab count** — Stitch: 5 tabs (Home, Projects, Upload, Attendance, Profile) | Current: 4 tabs (Home, My Projects, Attendance, Profile) | Fix: add Upload tab to BottomNav
- [ ] **Bottom nav icons** — Stitch: Material Symbols (`home`, `business_center`, `cloud_upload`, `fact_check`, `person`) | Current: emoji glyphs (⌂, 📁, 📅, 👤) | Fix: replace with Material Symbols
- [ ] **Quick action icons** — Stitch: likely Material Symbols | Current: emoji (📍, 📷, 📋, 📊) | Fix: replace with Material Symbols
- [ ] **Header style** — Stitch: custom navy header with avatar | Current: uses Expo Stack.Screen header + avatar | Fix: compare Stitch header height/layout
- [ ] **Banner stats row** — Stitch may show different stat layout | Current: 2-stat split with divider | Fix: verify stat count and labels match Stitch
- [ ] **Section spacing** — Stitch: 12px card padding, 16px between sections | Current: `Spacing[4]` (16px) padding, `Spacing[3]` (12px) gap | Fix: minor; mostly aligned ✅

**Severity: HIGH** — Bottom nav mismatch affects every employee screen. Icon system needs full replacement.

---

### My Projects (Employee)
**Stitch:** `My Projects (Employee)` | **Repo:** `app/(employee)/projects.tsx`

Mismatches:
- [ ] **Bottom nav** — same as Employee Home (5 tabs vs 4, emoji vs Material Symbols)
- [ ] **Filter chip shape** — Stitch: pill chips | Current: uses `BorderRadius.badge` (999px) ✅ (aligned)
- [ ] **Project card border** — Stitch: may have left border accent | Current: no left border on employee cards | Fix: check Stitch spec, may need colored left border
- [ ] **Progress bar in card** — Stitch: may show progress bar per project | Current: uses `ProjectCard` component with ProgressBar ✅

**Severity: MEDIUM** — Primarily inherits bottom nav issues.

---

### Attendance Screen (Employee)
**Stitch:** `Attendance Screen (Employee)` | **Repo:** `app/(employee)/attendance.tsx`

Mismatches:
- [ ] **Bottom nav** — same as all employee screens (5 vs 4 tabs, emoji icons)
- [ ] **Calendar day circle size** — Stitch: may differ | Current: 36px circles | Fix: verify against Stitch spec
- [ ] **Stats card layout** — Stitch: may have different stat labels | Current: Present/Absent/Days with colored values | Fix: verify labels
- [ ] **Mark Present button** — Stitch: may use amber instead of green | Current: `Colors.success` (green) | Fix: check Stitch button color
- [ ] **Calendar navigation arrows** — Stitch: Material icon arrows | Current: text "‹" and "›" characters | Fix: replace with icons

**Severity: MEDIUM** — Calendar renders correctly, bottom nav is the main issue.

---

### Daily Work Progress (Employee)
**Stitch:** `Daily Work Progress (Employee)` | **Repo:** `app/(employee)/progress.tsx`

Mismatches:
- [ ] **Bottom nav** — same as all employee screens
- [ ] **Work stage chip styling** — Stitch: may use different colors for active/inactive | Current: navy active, white inactive with border | Fix: verify against Stitch
- [ ] **Stepper button style** — Stitch: may have different −/+ button styling | Current: 36px circle with background color | Fix: verify
- [ ] **Dropzone border** — Stitch: may differ | Current: dashed 2px border | Fix: check Stitch spec

**Severity: MEDIUM** — Inherits bottom nav issues.

---

### Upload Screen (Employee)
**Stitch:** `Upload Screen (Employee)` | **Repo:** `app/(employee)/upload.tsx`

Mismatches:
- [ ] **Bottom nav** — same as all employee screens
- [ ] **Photo upload area** — Stitch: may have different dropzone height/style | Current: 160px dashed border area | Fix: verify
- [ ] **Thumbnail placeholder colors** — Stitch: may use different bg | Current: `Colors.primary` (navy) bg | Fix: check if should be lighter
- [ ] **Section labels** — Stitch: may use different label pattern | Current: "PROJECT INFO", "PHOTOS", "NOTES" uppercase labels | Fix: verify casing matches

**Severity: MEDIUM** — Inherits bottom nav issues.

---

### Raise Request (Employee)
**Stitch:** `Raise Request (Employee)` | **Repo:** `app/(employee)/requests.tsx`

Mismatches:
- [ ] **Bottom nav** — same as all employee screens
- [ ] **Segmented control height** — Stitch: may differ | Current: 48px segments | Fix: verify
- [ ] **Priority chips** — Stitch: may have different border/fill styling | Current: colored border + fill when active | Fix: verify
- [ ] **Recent requests section** — Stitch: may layout differently | Current: card list below form | Fix: verify Stitch structure

**Severity: MEDIUM** — Inherits bottom nav issues.

---

### Employee Profile
**Stitch:** `Employee Profile` | **Repo:** `app/(employee)/profile.tsx`

Mismatches:
- [ ] **Bottom nav** — same as all employee screens
- [ ] **Header avatar size** — Stitch: may differ | Current: 72px | Fix: verify
- [ ] **Stats card overlap** — Stitch: may have different margin-top offset | Current: `marginTop: -Spacing[5]` (-20px) | Fix: verify
- [ ] **Row icons** — Stitch: Material Symbols | Current: emoji (📞, ✉, 🔒, ℹ) | Fix: replace
- [ ] **Logout button color** — Stitch: may be different | Current: outline with danger border | Fix: verify

**Severity: MEDIUM** — Inherits bottom nav + icon issues.

---

### Admin Dashboard
**Stitch:** `Admin Dashboard` | **Repo:** `app/(admin)/index.tsx`

Mismatches:
- [ ] **Admin bottom nav tab count** — Stitch: may have 5 tabs | Current: 4 tabs (Dashboard, Projects, Employees, Settings) | Fix: verify Stitch nav structure
- [ ] **Admin bottom nav icons** — Stitch: Material Symbols (`home`, `business_center`, `cloud_upload`, `fact_check`, `person`) visible in dashboard HTML | Current: emoji (▦, 📁, 👥, ⚙) | Fix: replace with Material Symbols
- [ ] **KPI card content** — Stitch: "Total Projects" with value display | Current: matches conceptually but verify exact values/labels
- [ ] **Notification bell** — Stitch: Material icon | Current: emoji 🔔 | Fix: replace
- [ ] **Activity section** — Stitch: different activity text and formatting | Current: uses Avatar + text + time | Fix: verify exact Stitch layout
- [ ] **Pending Requests** — Stitch: "Action Required" section with different cards | Current: "Pending Requests" with approve/reject buttons | Fix: verify section name and card layout
- [ ] **Bottom nav for admin** — Stitch admin dashboard shows employee-style 5-tab nav in the HTML dump — this is likely a Stitch screen spec issue vs the actual admin flow. Needs manual confirmation.

**Severity: HIGH** — Bottom nav mismatch, icon system, section naming differences.

---

### Projects Screen (Admin)
**Stitch:** `Projects Screen (Admin)` | **Repo:** `app/(admin)/projects/index.tsx`

Mismatches:
- [ ] **Admin bottom nav** — same as admin dashboard issues
- [ ] **Filter tab underline color** — Stitch: may use primary instead of accent | Current: accent (amber) underline | Fix: verify
- [ ] **Project card left border** — Current: 3px left border with status color ✅ (likely aligned)
- [ ] **Avatar stack** — Current: overlapping avatars with -8px margin | Fix: verify sizing
- [ ] **Add button style** — Stitch: may differ | Current: amber bg, "+" text | Fix: verify

**Severity: MEDIUM** — Inherits admin nav issues.

---

### Add New Project (Admin)
**Stitch:** `Add New Project (Admin)` | **Repo:** `app/(admin)/projects/new.tsx`

Mismatches:
- [ ] **No bottom nav** — Current: no bottom nav on this screen ✅ (intentional — it's a form page)
- [ ] **Back arrow** — Stitch: Material back arrow icon | Current: text "‹" character | Fix: replace with icon
- [ ] **Checkbox style** — Stitch: may use different checkbox design | Current: 22px square with amber fill on check | Fix: verify
- [ ] **Engineer selection** — Stitch: may show as separate screen (Assign Engineers) | Current: inline within new project form | Fix: check if Stitch has this as separate or inline
- [ ] **Date picker** — Stitch: may have a different date field style | Current: touchable with calendar emoji | Fix: replace emoji with icon

**Severity: MEDIUM** — Mostly icon replacements.

---

### Admin Project Detail
**Stitch:** `Admin Project Detail` | **Repo:** `app/(admin)/projects/[id].tsx`

Mismatches:
- [ ] **Tab underline color** — Same issue as projects screen (accent vs primary)
- [ ] **Back arrow** — Stitch: Material back arrow | Current: text "‹" | Fix: replace
- [ ] **Photo grid placeholder** — Stitch: may show actual thumbnails | Current: emoji 🏗 | Fix: use proper placeholder
- [ ] **No bottom nav** — Current: no bottom nav ✅ (detail page)

**Severity: MEDIUM** — Inherits icon issues.

---

### Employees Screen (Admin)
**Stitch:** `Employees Screen (Admin)` | **Repo:** `app/(admin)/employees/index.tsx`

Mismatches:
- [ ] **Admin bottom nav** — same issues as all admin screens
- [ ] **Search input height** — Stitch: 48px | Current: 44px | Fix: change to 48px
- [ ] **Employee card stat chips** — Stitch: may have different bg | Current: `Colors.background` (#FCF8FB) | Fix: verify
- [ ] **Add Employee button** — Stitch: may have icon | Current: text "+ Add Employee" in amber | Fix: verify

**Severity: MEDIUM** — Inherits admin nav issues + minor height tweak.

---

### Requests Management (Admin)
**Stitch:** `Requests Management (Admin)` | **Repo:** `app/(admin)/requests.tsx`

Mismatches:
- [ ] **Admin bottom nav** — same issues as all admin screens
- [ ] **Action button icons** — Stitch: may use Material check/close | Current: text "✓ Approve" / "✕ Reject" | Fix: verify if icons needed
- [ ] **Priority pill** — Current: outline pill with priority color border ✅ (likely aligned)
- [ ] **Type dot + chip** — Current: colored dot + semi-transparent chip ✅ (likely aligned)

**Severity: MEDIUM** — Inherits admin nav issues.

---

### Reports Screen (Admin)
**Stitch:** `Reports Screen (Admin)` | **Repo:** `app/(admin)/reports.tsx`

Mismatches:
- [ ] **Admin bottom nav** — same issues
- [ ] **Table header bg** — Stitch: may use a different shade | Current: `Colors.primary` (navy) | Fix: verify
- [ ] **Export buttons** — Stitch: may have download icons | Current: text "⬇ Export PDF" / "⬇ Export Excel" with text arrows | Fix: replace with Material icons
- [ ] **Report type chips** — Current: pill chips with border ✅ (likely aligned)

**Severity: LOW** — Mostly aligned. Minor icon fixes.

---

### Admin Settings
**Stitch:** `Admin Settings` | **Repo:** `app/(admin)/settings.tsx`

Mismatches:
- [ ] **Admin bottom nav** — same issues
- [ ] **Section row icons** — Stitch: Material Symbols | Current: emoji (🏢, 👥, 📋, 🔔, ✉, ℹ, 📄, ⭐) | Fix: replace all with Material Symbols
- [ ] **Toggle switch colors** — Stitch: may differ | Current: amber track when on, border when off | Fix: verify
- [ ] **Logout button** — Current: outline with danger border ✅

**Severity: MEDIUM** — Inherits admin nav + icon issues.

---

## Step 5 — Master Alignment Checklist

### Priority 0 — Cross-Cutting Shared Components (fix these FIRST)

These affect multiple screens simultaneously. Fixing them first gives maximum alignment gain.

- [ ] **BottomNav (Employee)** — affects 8 screens — `src/components/ui/BottomNav.tsx`
  - Change from 4 tabs to 5 tabs (add Upload tab)
  - Replace all emoji icons with Material Symbols
  - Verify active/inactive colors match Stitch
- [ ] **AdminBottomNav** — affects 7 screens — `src/components/ui/AdminBottomNav.tsx`
  - Verify tab count matches Stitch admin spec
  - Replace all emoji icons with Material Symbols
  - Verify active/inactive colors match Stitch
- [ ] **Icon System** — affects ALL screens — project-wide
  - Install and configure `@expo/vector-icons` or `react-native-vector-icons` with Material Symbols
  - Replace every emoji/text glyph across all screens and components
- [ ] **Badge** — affects 6+ screens — `src/components/ui/Badge.tsx`
  - Verify text is ALL CAPS per Stitch label-sm spec
  - Tokenize hardcoded colors `#166534`, `#92400E`
- [ ] **Button** — affects 10+ screens — `src/components/ui/Button.tsx`
  - Verify font weight (Stitch spec says Medium 500, current uses `FontFamily.medium` ✅)
  - Verify label text matches Stitch button label styling
- [ ] **tokens.ts** — affects ALL — `src/constants/tokens.ts`
  - Add `FontWeight` constant (600 for headline-sm, 500 for labels)
  - Add `LineHeight` tokens per Stitch typography spec
  - Add `LetterSpacing` tokens
  - Add `onPrimary` alpha tokens to replace inline rgba strings
  - Add semantic color tokens (`successSubtle`, `warningSubtle`, `dangerSubtle`)
  - Add `withAlpha` helper function

---

### Priority 1 — HIGH severity screens (fix after shared components)

- [ ] **Employee Home** — 6 mismatches — `app/(employee)/index.tsx`
- [ ] **Admin Dashboard** — 7 mismatches — `app/(admin)/index.tsx`

### Priority 2 — MEDIUM severity screens

- [ ] **My Projects (Employee)** — 4 mismatches — `app/(employee)/projects.tsx`
- [ ] **Attendance Screen** — 5 mismatches — `app/(employee)/attendance.tsx`
- [ ] **Daily Work Progress** — 4 mismatches — `app/(employee)/progress.tsx`
- [ ] **Upload Screen** — 4 mismatches — `app/(employee)/upload.tsx`
- [ ] **Raise Request** — 4 mismatches — `app/(employee)/requests.tsx`
- [ ] **Employee Profile** — 5 mismatches — `app/(employee)/profile.tsx`
- [ ] **Projects Screen (Admin)** — 5 mismatches — `app/(admin)/projects/index.tsx`
- [ ] **Add New Project** — 5 mismatches — `app/(admin)/projects/new.tsx`
- [ ] **Admin Project Detail** — 4 mismatches — `app/(admin)/projects/[id].tsx`
- [ ] **Employees Screen** — 4 mismatches — `app/(admin)/employees/index.tsx`
- [ ] **Requests Management** — 3 mismatches — `app/(admin)/requests.tsx`
- [ ] **Admin Settings** — 3 mismatches — `app/(admin)/settings.tsx`

### Priority 3 — LOW severity screens

- [ ] **Login Screen** — 3 mismatches — `app/(auth)/login.tsx`
- [ ] **Reports Screen** — 3 mismatches — `app/(admin)/reports.tsx`

### MISSING screens (need to be built from scratch)

- [ ] **Splash Screen** — no repo file — build `app/splash.tsx` or handle via expo-splash-screen config
- [ ] **Project Detail (Employee)** — no repo file — build `app/(employee)/project/[id].tsx`
- [ ] **Assign Engineers (Admin)** — no repo file — build `app/(admin)/projects/assign.tsx` or integrate into existing new project flow

---

## Answers to Key Questions

### Q1: Are there Stitch screens with NO repo file yet?

**Yes — 3 screens:**

| Stitch Screen | Status | Action Needed |
|---|---|---|
| Splash Screen | MISSING | Build from Stitch spec or configure expo-splash-screen |
| Project Detail (Employee) | MISSING | Build new route `app/(employee)/project/[id].tsx` |
| Assign Engineers (Admin) | MISSING | Build separate screen or verify if embedded in new.tsx is acceptable |

### Q2: Are there repo screen files with no Stitch design?

**No** — Every repo screen file has a corresponding Stitch design. The three layout files (`_layout.tsx`) are infrastructure-only and don't need Stitch designs.

### Q3: Are there shared components whose mismatches affect more than 3 screens?

**Yes — 4 critical shared components:**

| Component | Screens Affected | Primary Issue |
|---|---|---|
| `BottomNav.tsx` | 8 employee screens | Wrong tab count (4 vs 5), emoji icons instead of Material Symbols |
| `AdminBottomNav.tsx` | 7 admin screens | Emoji icons instead of Material Symbols |
| `Badge.tsx` | 6+ screens | Missing ALL CAPS, hardcoded colors |
| `tokens.ts` | ALL 19 screens | Missing typography tokens (line-height, letter-spacing), missing semantic color variants |

> [!IMPORTANT]
> **Fix these 4 shared components BEFORE any individual screen** to avoid redundant per-screen work.
> The icon system migration alone (emoji → Material Symbols) will resolve ~40% of all listed mismatches.
