# Design System — AS Associates Internal App

Single source of truth for UI implementation. Every value below is extracted from
`src/constants/tokens.ts` or from the component/screen source. Nothing here is invented.

Read this file before modifying any `.tsx`. If a screen needs a value that is not in
`tokens.ts`, add the token first — do not hardcode.

Token file: `src/constants/tokens.ts` (81 lines, 8 exports)
Header comment in that file says "mirrors tailwind.config.js exactly" — **[REVIEW NEEDED]**,
Tailwind/NativeWind is dead in this project and that comment is now misleading.

---

## 1. Color Palette

`Colors` — 13 values total. There is no dark mode and no color scale (no `primary-100..900`).

### Primary
| Token | Hex | Usage in code |
|---|---|---|
| `Colors.primary` | `#1A3C5E` | Stack headers, bottom-nav active state, avatars, progress fill, outline-button border/label |
| `Colors.primaryDark` | `#002645` | **Defined but never used in any screen or component** |

### Secondary / Accent
| Token | Hex | Usage in code |
|---|---|---|
| `Colors.accent` | `#F5A623` | Primary `Button` fill, loading spinner on non-primary buttons |

### Neutral / Gray
| Token | Hex | Usage in code |
|---|---|---|
| `Colors.border` | `#E5E7EB` | Card borders, input borders, bottom-nav top border, calendar weekend text |
| `Colors.track` | `#E4E2E4` | `ProgressBar` default track |

### Status
| Token | Hex | Usage in code |
|---|---|---|
| `Colors.success` | `#16A34A` | Ongoing/approved badges, present days |
| `Colors.warning` | `#F59E0B` | On-hold/pending badges, late days |
| `Colors.danger` | `#BA1A1A` | Rejected badges, absent days, input error border, error text, logout button |

There is no `info` token. `#1A73E8` is hardcoded in `RecentUploadItem.tsx` and is effectively
an undeclared info color — **[MISSING FROM TOKENS]**.

### Background & Surface
| Token | Hex | Usage in code |
|---|---|---|
| `Colors.background` | `#FCF8FB` | Screen backgrounds, stack `contentStyle` |
| `Colors.surface` | `#FFFFFF` | Cards, inputs, bottom nav, and **also used as on-primary text color** |

**[REVIEW NEEDED]** `Colors.surface` doubles as "white text on primary" throughout
(`Avatar` initials, `Button` label, calendar day text). There is no `onPrimary` token, so the
two concerns cannot be changed independently.

### Text
| Token | Hex | Usage in code |
|---|---|---|
| `Colors.textPrimary` | `#1B1B1D` | Body text, headings, input text, labels |
| `Colors.textSecondary` | `#43474E` | Muted body, dropdown placeholder, progress label, future calendar days |
| `Colors.textMuted` | `#73777F` | Bottom-nav inactive label, input placeholder, footers |

Missing text/UI colors used in the wild — see §8.

---

## 2. Typography

### Font families (`FontFamily`)
| Token | Value | Weight |
|---|---|---|
| `FontFamily.regular` | `Inter_400Regular` | 400 |
| `FontFamily.medium` | `Inter_500Medium` | 500 |
| `FontFamily.bold` | `Inter_700Bold` | 700 |
| `FontFamily.extraBold` | `Inter_800ExtraBold` | 800 |

Weight is carried by the family name, not a `fontWeight` prop. Never set `fontWeight` — it
will not apply to the loaded Inter faces. All four are loaded in `app/_layout.tsx`.

### Font sizes (`FontSize`)
| Token | px |
|---|---|
| `xs` | 12 |
| `sm` | 14 |
| `base` | 16 |
| `lg` | 18 |
| `xl` | 20 |
| `2xl` | 22 |
| `3xl` | 28 |
| `4xl` | 34 |

### Semantic mapping (as actually used)
`tokens.ts` defines no semantic type scale — no `Typography` export, no line-height tokens.
The table below is the observed convention, not a defined token set.

| Semantic | Family | Size | Line height in code |
|---|---|---|---|
| Display | `extraBold` | 32 (hardcoded in login logo) / `4xl` 34 | not set |
| H1 | `bold` | `2xl` 22 | 28 (hardcoded in login heading) |
| H2 | `bold` | `lg` 18 | not set |
| Body | `regular` | `base` 16 | not set |
| Label (form) | `medium` | `sm` 14 | not set |
| Button label | `medium` | `sm` 14 | 18 |
| Caption | `regular` | `xs` 12 | not set |
| Overline / section label | `medium` or `bold` | `xs` 12 | 16, letterSpacing 0.24 |

**[MISSING FROM TOKENS]** line heights and letter spacings. Every one is inline:
`lineHeight: 28` (login H1), `18` (button), `16`/`letterSpacing: 0.24` (nav label),
`letterSpacing: 0.5` (brand, avatar), `0.2` (badge), `0.14` (button).
**[REVIEW NEEDED]** no `Typography` object exists, so type styles are re-declared in every
`StyleSheet.create()` — 16 screens each repeat their own heading style.

---

## 3. Spacing Scale

`Spacing` — 4px base, Tailwind-style keys (numeric, `1` = 4px).

| Token | px |
|---|---|
| `Spacing[0]` | 0 |
| `Spacing[1]` | 4 |
| `Spacing[2]` | 8 |
| `Spacing[3]` | 12 |
| `Spacing[4]` | 16 |
| `Spacing[5]` | 20 |
| `Spacing[6]` | 24 |
| `Spacing[7]` | 28 |
| `Spacing[8]` | 32 |
| `Spacing[10]` | 40 |
| `Spacing[12]` | 48 |
| `Spacing[16]` | 64 |

Gaps in the scale: `9`, `11`, `13`, `14`, `15` are absent. Anything needing 36px or 44px
has to hardcode.

**[REVIEW NEEDED]** the shared components largely bypass `Spacing` and hardcode equivalent
numbers: `Card` uses `padding: 16`, `Button` uses `paddingHorizontal: 24`, `Input`/`Dropdown`
use `paddingHorizontal: 14` and `marginBottom: 6`. `14` and `6` are not on the scale at all.

---

## 4. Border Radius

`BorderRadius` — semantic keys, not a t-shirt scale.

| Token | px | Semantic | Applied to |
|---|---|---|---|
| `none` | 0 | — | never used |
| `sm` | 4 | sm | small chips/inner elements |
| `btn` | 8 | md | `Button`, `Input`, `Dropdown` trigger |
| `card` | 12 | lg | `Card`, `Dropdown` sheet, login card |
| `lg` | 16 | xl | login logo tile |
| `badge` | 999 | full / pill | `Badge` |

**[REVIEW NEEDED]** the naming mixes semantic (`btn`, `card`, `badge`) with scalar (`sm`,
`lg`), so `lg` (16) is larger than `card` (12) — confusing at call sites.
**[MISSING FROM TOKENS]** `ProgressBar` hardcodes `borderRadius: 999` twice instead of using
`BorderRadius.badge`. `Avatar` computes `container / 2` for a circle; there is no `full` token.

---

## 5. Shadows / Elevation

`Shadow` — two presets only.

### `Shadow.card`
| Property | Value |
|---|---|
| `elevation` | 2 |
| `shadowColor` | `#000` |
| `shadowOffset` | `{ width: 0, height: 2 }` |
| `shadowOpacity` | 0.08 |
| `shadowRadius` | 8 |

Used by: `Card`, login card.

### `Shadow.modal`
| Property | Value |
|---|---|
| `elevation` | 8 |
| `shadowColor` | `#000` |
| `shadowOffset` | `{ width: 0, height: 8 }` |
| `shadowOpacity` | 0.15 |
| `shadowRadius` | 24 |

**Used by: nothing.** `Dropdown.tsx` inlines its own near-duplicate
(`elevation: 8, offset height 4, opacity 0.15, radius 12`) inside a pointless spread —
**[REVIEW NEEDED]**, it should consume `Shadow.modal`.

There is no `Shadow.none` and no pressed/hover elevation. Bottom navs use a
`borderTopWidth: 1` hairline instead of elevation.

### Fixed dimensions
| Token | Value | Used by |
|---|---|---|
| `InputHeight` | 48 | `Input`, `Dropdown` trigger |
| `ButtonHeight` | 48 | `Button` |

**[MISSING FROM TOKENS]** bottom-nav `height: 64` is hardcoded in both nav components;
`Avatar` sizes (32/44/60) and `ProgressBar` `height: 6` are component-local constants.

---

## 6. Reusable Components (current state)

Status legend: `[MATCHES STITCH]` verified against `DESIGN.md` · `[PARTIAL]` renders correctly
but has token/behaviour gaps · `[NEEDS FIX]` known defect or unused/unwired.

### `src/components/ui/` — 9 shared components

| Component | File | Props | Status |
|---|---|---|---|
| `Button` | `ui/Button.tsx` | `label`, `onPress`, `loading?`, `variant?: primary\|outline\|ghost`, `fullWidth?` (default `true`), `disabled?`, `style?`, + `TouchableOpacityProps` | [PARTIAL] — amber `accent` fill matches Stitch; `paddingHorizontal: 24` hardcoded; no `danger` variant, so logout screens pass `borderColor` overrides via `style` |
| `Input` | `ui/Input.tsx` | `label?`, `error?`, `containerStyle?`, `secureToggle?`, + `TextInputProps` | [PARTIAL] — `paddingHorizontal: 14`, `marginBottom: 6`, `marginTop: 4` off-scale; Show/Hide toggle is text, not an icon |
| `Dropdown` | `ui/Dropdown.tsx` | `label?`, `placeholder?` (default `Select…`), `value`, `options: string[]`, `onSelect`, `containerStyle?` | [NEEDS FIX] — inlines its own shadow instead of `Shadow.modal`; backdrop `rgba(0,0,0,0.40)` hardcoded; `options` is `string[]` only, no value/label pairs |
| `Card` | `ui/Card.tsx` | `children`, `style?`, `noPadding?` | [PARTIAL] — `padding: 16` hardcoded instead of `Spacing[4]` |
| `Badge` | `ui/Badge.tsx` | `variant: BadgeVariant`, `label?`, `style?` | [NEEDS FIX] — two hardcoded text colors `#166534`, `#92400E`; 15% alpha built via string concat `${Colors.success}26` |
| `Avatar` | `ui/Avatar.tsx` | `initials`, `size?: sm\|md\|lg`, `style?`, `bgColor?` | [PARTIAL] — sizes 32/44/60 are component-local; imports `FontSize` but never uses it (dead import) |
| `ProgressBar` | `ui/ProgressBar.tsx` | `value: 0–100`, `showLabel?` (default `true`), `style?`, `trackColor?`, `fillColor?` | [PARTIAL] — `borderRadius: 999` and `height: 6` hardcoded |
| `BottomNav` | `ui/BottomNav.tsx` | none | [NEEDS FIX] — tab icons are emoji/unicode glyphs (`⌂ 📁 📅 👤`), not an icon set; `height: 64` hardcoded |
| `AdminBottomNav` | `ui/AdminBottomNav.tsx` | `activeIndex?` | [NEEDS FIX] — same emoji-icon problem (`▦ 📁 👥 ⚙`); duplicates ~90% of `BottomNav`; hardcodes `fontSize: 12` instead of `FontSize.xs` |

### `src/components/employee/` — 9 feature components

| Component | File | Props | Status |
|---|---|---|---|
| `ProjectCard` | `employee/ProjectCard.tsx` | `project: Project`, `onPress`, `style?` | [PARTIAL] — in use on 2 screens |
| `AttendanceSummaryCard` | `employee/AttendanceSummaryCard.tsx` | `summary: AttendanceSummary` | [PARTIAL] — in use on employee dashboard |
| `QuickActionButton` | `employee/QuickActionButton.tsx` | `label`, `icon`, `onPress` (see file for exact shape) | [PARTIAL] — in use, but its `onPress` handlers on the dashboard are commented-out stubs |
| `RecentUploadItem` | `employee/RecentUploadItem.tsx` | `upload: RecentUpload`, `onPress` | [NEEDS FIX] — hardcoded `#1A73E8` |
| `AttendanceCalendar` | `employee/AttendanceCalendar.tsx` | `year`, `month` (0-indexed), `data: AttendanceDayData[]` | [NEEDS FIX] — **imported by no screen**; `app/(employee)/attendance.tsx` renders its own inline calendar instead |
| `CategoryPicker` | `employee/CategoryPicker.tsx` | `selected: WorkCategory\|null`, `onSelect` (exports `WORK_CATEGORIES`) | [NEEDS FIX] — **imported by no screen** |
| `WorkStagePicker` | `employee/WorkStagePicker.tsx` | `selected: WorkStage\|null`, `onSelect` (exports `WORK_STAGES`) | [NEEDS FIX] — **imported by no screen**; `progress.tsx` uses a `Dropdown` instead |
| `PhotoPickerGrid` | `employee/PhotoPickerGrid.tsx` | `photos: PickedPhoto[]`, `onAdd`, `onRemove`, `maxPhotos?` | [NEEDS FIX] — **imported by no screen**; this is the missing half of the upload flow; hardcodes `rgba(0,0,0,0.55)` |
| `RequestControls` | `employee/RequestControls.tsx` | exports `RequestTypePicker` (`selected`, `onSelect`) and `PrioritySelector` (`selected`, `onSelect`) | [NEEDS FIX] — **imported by no screen**; hardcodes `#DCFCE7`, `#FEF9C3`, `#FEE2E2` |

Five built components are wired to nothing. Reconnecting them is cheaper than rewriting the
inline versions currently in the screens.

---

## 7. Screen-to-Component Map

Blast radius per component — how many screens a fix touches.

| Component | Screens | Files |
|---|---|---|
| `Card` | 9 | admin dashboard, admin projects list, project detail, project new, reports, admin requests, admin settings, admin employees, employee attendance/profile/progress/requests/upload |
| `BottomNav` | 7 | all `(employee)` screens except none — index, projects, attendance, profile, progress, requests, upload |
| `Button` | 7 | login, project new, reports, admin settings, employee profile, progress, requests, upload |
| `AdminBottomNav` | 4 | admin dashboard, projects list, employees, reports, requests, settings |
| `Avatar` | 4 (+3 admin) | admin dashboard, employees, projects list, project detail, project new, admin settings, employee dashboard, employee profile |
| `Dropdown` | 4 | project new, reports, employee progress, requests, upload |
| `Badge` | 3 (+3) | admin dashboard, employees, projects list, project detail, admin requests, employee requests |
| `ProgressBar` | 1 (+2) | admin dashboard, projects list, project detail |
| `Input` | 2 | login, project new, employee requests |
| `ProjectCard` | 2 | employee dashboard, employee projects |
| `AttendanceSummaryCard` / `QuickActionButton` / `RecentUploadItem` | 1 | employee dashboard |
| `AttendanceCalendar` / `CategoryPicker` / `WorkStagePicker` / `PhotoPickerGrid` / `RequestControls` | 0 | — |

Highest leverage: fixing `Card`, `BottomNav`, and `Button` covers most of the app's surface.
Note `Card` is imported by 9 files but each screen still declares its own padding/heading
styles on top of it, so a `Card` change alone will not normalize those screens.

---

## 8. Known Token Gaps

Highest-priority cleanup. Every entry is a real occurrence found in the source.

### Hardcoded colors (must become tokens)
| Value | Where | Suggested token |
|---|---|---|
| `#166534` | `ui/Badge.tsx` (completed, approved text) | `successText` |
| `#92400E` | `ui/Badge.tsx` (onhold, pending text), `(admin)/index.tsx` | `warningText` |
| `#9CA3AF` | `(employee)/attendance.tsx` ×2, `(employee)/requests.tsx`, `(admin)/projects/index.tsx` | `textDisabled` / `icon` |
| `#C3C6CF` | `(employee)/projects.tsx` | same family as above — two greys for one job |
| `#1A73E8` | `employee/RecentUploadItem.tsx` | `info` (no info color exists) |
| `#DCFCE7`, `#FEF9C3`, `#FEE2E2` | `employee/RequestControls.tsx` | `successBg`, `warningBg`, `dangerBg` |
| `#000` | `ui/Dropdown.tsx` | `shadowColor` (tokens use `#000` too, but inline here) |
| `#fff` | `app/_layout.tsx` error-boundary button | `Colors.surface` |
| `rgba(0,0,0,0.40)` | `ui/Dropdown.tsx` backdrop | `overlay` |
| `rgba(0,0,0,0.55)` | `employee/PhotoPickerGrid.tsx` | `overlayStrong` |
| `rgba(255,255,255,0.15/0.20/0.55/0.65/0.70)` | `(employee)/index.tsx` banner | `onPrimaryAlpha` scale — five ad-hoc alphas on one screen |
| `rgba(255,255,255,0.80)` | `(employee)/profile.tsx` | same |
| `rgba(255,255,255,0.2)` | `(admin)/projects/[id].tsx` | same |

The `rgba(255,255,255,x)` family is the worst offender: seven distinct alpha values across
three screens for the same "text/fill on navy header" purpose.

### Alpha-by-string-concat
`Badge.tsx` and `(auth)/login.tsx` build translucent fills as `` `${Colors.danger}26` ``.
This works only because tokens are 6-digit hex, and it breaks silently if any token becomes
`rgba()` or 3-digit. **[REVIEW NEEDED]** — needs a `withAlpha(color, pct)` helper or
pre-computed `*Subtle` tokens.

### Magic numbers not on the spacing scale
- `padding: 16` in `Card` (should be `Spacing[4]`)
- `paddingHorizontal: 24` in `Button` (should be `Spacing[6]`)
- `paddingHorizontal: 14` in `Input` and `Dropdown` — not on scale
- `marginBottom: 6`, `marginTop: 4`, `marginBottom: 4` in `Input`/`Dropdown`
- `paddingHorizontal: 10`, `paddingVertical: 4` in `Badge`
- `paddingHorizontal: 32` (Dropdown backdrop), `paddingVertical: 8`, `paddingVertical: 14`
- `height: 64` in both bottom navs
- `height: 6` in `ProgressBar`
- `gap: 2` in nav tabs, `gap: 8` in `ProgressBar`
- `fontSize: 32` (login logo), `fontSize: 20` / `18` / `16` (nav + dropdown glyphs)
- `fontSize: 12` in `AdminBottomNav` where `BottomNav` correctly uses `FontSize.xs`

### Missing token categories entirely
- No `Typography` object — no line-height or letter-spacing tokens (§2)
- No `onPrimary` / `onSurface` semantic text tokens (§1)
- No `info` status color
- No `overlay` / scrim colors
- No `disabled` color — components use `opacity: 0.5` / `0.45` inline
- No icon system — nav and picker icons are emoji string literals
- No `BorderWidth` token — `borderWidth: 1` repeated everywhere
- No z-index or animation/duration tokens

### Structural
- `app/_layout.tsx` imports `../global.css` and `nativewind`/`tailwindcss` are still installed
  while no screen uses `className`. Dead dependency — remove in a dedicated cleanup task.
- `app/_layout.tsx`, `(auth)/login.tsx`, and `Avatar.tsx` import `FontSize`/`FontFamily`
  without using them, or use raw `'Inter_700Bold'` strings instead of `FontFamily.bold`.

Priority order: hardcoded `rgba(255,255,255,x)` → `Badge` text colors → `Card`/`Button`
spacing tokens → `Typography` object → icon system → NativeWind removal.

---

## 9. Stitch Design Rules

TODO: After running Stitch MCP in Antigravity IDE, paste extracted design tokens here.
These values should be reconciled with tokens.ts and any gaps resolved.

Interim source: `DESIGN.md` at the repo root, sourced from Stitch project
`7450523547241458564` ("Architectural Utility Framework", mobile 390px, light mode, Inter,
8px roundness). Known divergences already visible between `DESIGN.md` and `tokens.ts`:

| Concern | `DESIGN.md` (Stitch) | `tokens.ts` |
|---|---|---|
| `surface` | `#FCF8FB` | `#FFFFFF` (Stitch's `#FCF8FB` is used as `background` instead) |
| Primary role | `primary #002645`, `primary-container #1A3C5E` | `primary #1A3C5E`, `primaryDark #002645` — roles inverted |
| Secondary | `secondary #835500`, `secondary-container #FEAE2C` | single `accent #F5A623` |
| Surface scale | 9 levels (`lowest`→`highest`, `variant`, `tint`) | 2 (`background`, `surface`) |
| Tertiary role | `#222528` / `#373B3D` / `#A2A5A8` | absent |
| Text | `on-surface #1B1B1D`, `on-surface-variant #43474E` | matches (`textPrimary`, `textSecondary`) |

Resolve these before doing per-screen alignment work — screen fixes against the wrong
`surface`/`primary` mapping will have to be redone.
