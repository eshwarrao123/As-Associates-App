# DESIGN.md — AS Associates Internal Ops App
> Source: Stitch MCP project `7450523547241458564`
> Design System Name: **Architectural Utility Framework**
> Device: Mobile (390px) · Mode: Light · Font: Inter · Roundness: 8px base

---

## 1. Color System

### Brand Colors (Override / Actual UI Colors)
| Token | Hex | Usage |
|---|---|---|
| `color-primary` | `#1A3C5E` | Headers, nav, primary containers |
| `color-primary-deep` | `#002645` | Darkest navy, pressed states |
| `color-secondary` | `#F5A623` | Primary action buttons, amber accent |
| `color-tertiary-bg` | `#F4F6F9` | Subtle section backgrounds |
| `color-neutral` | `#1C1C1E` | Base text, dark labels |

### Material Color Roles (Named Colors)
| Token | Hex | Usage |
|---|---|---|
| `primary` | `#002645` | Primary role |
| `primary-container` | `#1A3C5E` | Primary container fills |
| `on-primary` | `#FFFFFF` | Text/icons on primary |
| `on-primary-container` | `#87A7CE` | Text/icons on primary container |
| `secondary` | `#835500` | Secondary role |
| `secondary-container` | `#FEAE2C` | Amber fills |
| `on-secondary` | `#FFFFFF` | Text on secondary |
| `on-secondary-container` | `#6B4500` | Text on amber |
| `tertiary` | `#222528` | Tertiary role |
| `tertiary-container` | `#373B3D` | Dark tertiary fills |
| `on-tertiary` | `#FFFFFF` | Text on tertiary |
| `on-tertiary-container` | `#A2A5A8` | Text on tertiary container |

### Surface Colors
| Token | Hex | Usage |
|---|---|---|
| `surface` | `#FCF8FB` | App background and cards |
| `surface-dim` | `#DCD9DC` | Dimmed backgrounds |
| `surface-bright` | `#FCF8FB` | Bright surface |
| `surface-container-lowest` | `#FFFFFF` | Pure white cards |
| `surface-container-low` | `#F6F3F5` | Subtle containers |
| `surface-container` | `#F0EDEF` | Default container |
| `surface-container-high` | `#EAE7EA` | Elevated containers |
| `surface-container-highest` | `#E4E2E4` | Highest elevation surface |
| `surface-variant` | `#E4E2E4` | Variant surface |
| `surface-tint` | `#416084` | Tint for surfaces |

### Text Colors
| Token | Hex | Usage |
|---|---|---|
| `on-surface` | `#1B1B1D` | Primary body text |
| `on-surface-variant` | `#43474E` | Secondary/muted text |
| `on-background` | `#1B1B1D` | Text on background |
| `inverse-on-surface` | `#F3F0F2` | Text on dark surfaces |
| `inverse-surface` | `#303032` | Dark inverse surface |

### Semantic Colors
| Token | Hex | Usage |
|---|---|---|
| `error` | `#BA1A1A` | Error states, danger badges |
| `error-container` | `#FFD8D6` | Error background fills |
| `on-error` | `#FFFFFF` | Text on error |
| `on-error-container` | `#93000A` | Text on error container |
| `success` | `#16A34A` | Success states *(from design spec)* |
| `warning` | `#F59E0B` | Warning states *(from design spec)* |

### Border & Divider Colors
| Token | Hex | Usage |
|---|---|---|
| `outline` | `#73777F` | Input borders, dividers |
| `outline-variant` | `#C3C6CF` | Subtle borders, list dividers |
| `border-default` | `#E5E7EB` | Card and input border *(from design spec)* |

### Disabled Colors
| Token | Value | Usage |
|---|---|---|
| `disabled-surface` | `#E4E2E4` | Disabled input/button fills |
| `disabled-text` | `#73777F` at 50% | Disabled text |
| `disabled-border` | `#C3C6CF` | Disabled borders |

---

## 2. Typography

**Font Family:** `Inter` — used exclusively across all text roles.

| Scale Token | Size | Weight | Line Height | Letter Spacing | Usage |
|---|---|---|---|---|---|
| `headline-lg` | 24px | 700 | 32px | — | Page headings (tablet+) |
| `headline-lg-mobile` | 22px | 700 | 28px | — | Page headings (mobile 390px) |
| `headline-md` | 20px | 700 | 28px | — | Section headings |
| `headline-sm` | 18px | 600 | 24px | — | Card titles, sub-sections |
| `body-lg` | 16px | 400 | 24px | — | Primary body text |
| `body-md` | 14px | 400 | 20px | — | Secondary body, descriptions |
| `label-md` | 14px | 500 | 18px | 0.01em | Buttons, input labels, tabs |
| `label-sm` | 12px | 500 | 16px | 0.02em | Badges, captions, metadata |

### Font Rendering Notes
- Headline weights (700) are used for content section anchors only.
- Regular (400) used for all long-form copy and descriptions.
- Medium (500) distinguishes UI controls from general text.
- Mobile headings scale down from 24px → 22px to prevent line breaks on 390px width.

---

## 3. Spacing System

**Base unit:** 4px

| Token | Value | Usage |
|---|---|---|
| `spacing-base` | 4px | Minimum gap unit |
| `spacing-xs` | 8px | Tight internal gaps, icon margins |
| `spacing-sm` | 12px | Internal card padding, list item vertical padding |
| `spacing-md` | 16px | Standard content padding, card-to-card gap |
| `spacing-lg` | 24px | Section vertical spacing |
| `spacing-xl` | 32px | Major section separators |
| `mobile-margin` | 16px | Screen edge margin (all screens) |
| `gutter` | 12px | Column gutters inside content |

### Grid & Layout
- **Mobile breakpoint:** 390px
- **Single-column layout** for all card stacks
- **Outer margin:** 16px on all screen edges
- **Card internal padding:** 16px
- **Gap between cards:** 12px

---

## 4. Border Radius

| Token | Value (rem) | Value (px) | Usage |
|---|---|---|---|
| `radius-sm` | 0.25rem | 4px | Small tags, checkboxes |
| `radius-default` | 0.5rem | 8px | Buttons, input fields |
| `radius-md` | 0.75rem | 12px | Cards, modals |
| `radius-lg` | 1rem | 16px | Large containers |
| `radius-xl` | 1.5rem | 24px | Hero sections, promotional banners |
| `radius-full` | 9999px | pill | Status badges, chips |

---

## 5. Shadows & Elevation

### Card Shadow (Primary)
```
box-shadow: 0px 2px 8px rgba(0, 0, 0, 0.08)
```
Applied to: White cards on `#FCF8FB` background.

### Interactive Elevation
Buttons and input fields use **no shadow**. They rely on high-contrast fills and borders for depth — flat, "anchored" appearance.

### Overlay Elevation (Bottom Sheets / Modals)
```
box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15)
```
Applied to: Bottom sheets, confirmation dialogs, urgent alerts.

### Elevation Strategy
| Level | Surface | Separator | Usage |
|---|---|---|---|
| 0 — Base | `#FCF8FB` | — | App background |
| 1 — Cards | `#FFFFFF` | 1px `#E5E7EB` border + card shadow | Content cards |
| 2 — Overlays | `#FFFFFF` | Overlay shadow | Dialogs, bottom sheets |

---

## 6. Button Styles

### Primary Button
```
Background:   #F5A623  (amber)
Text:         #FFFFFF  (white)
Height:       48px
Border-radius: 8px
Font:         label-md (14px / 500 / 0.01em)
Padding:      0 24px
Shadow:       none
Active state: darken fill (no gradient)
```

### Secondary / Outline Button
```
Background:   transparent
Border:       1px solid #1A3C5E
Text:         #1A3C5E
Height:       48px
Border-radius: 8px
```

### Ghost / Text Button
```
Background:   transparent
Text:         #1A3C5E or #73777F
No border, no shadow
Used for: "Forgot password?", "Cancel", inline actions
```

### Disabled Button
```
Background:   #E4E2E4
Text:         #73777F (50% opacity)
Not interactive
```

---

## 7. Input Styles

### Default Input Field
```
Background:     #FFFFFF
Border:         1px solid #E5E7EB
Border-radius:  8px
Height:         48px
Padding:        0 14px
Font:           body-lg (16px / 400)
Placeholder:    #73777F
Label:          label-md (14px/500) — positioned above field
```

### Focused State
```
Border-color:   #1A3C5E (Deep Navy)
```

### Error State
```
Border-color:   #BA1A1A
Error text:     label-sm (12px) in #BA1A1A, below field
```

### Dropdown / Select
```
Same dimensions as input (48px height)
Trailing chevron icon (outline, 20px)
```

### Text Area
```
Min-height: 120px
Same border, radius, padding as input
Vertical resize only
```

---

## 8. Card Styles

### Default Content Card
```
Background:     #FFFFFF
Border:         1px solid #E5E7EB
Border-radius:  12px
Padding:        16px
Shadow:         0 2px 8px rgba(0,0,0,0.08)
```

### Project Card (Employee & Admin)
```
Same as default card
Header: project name in headline-sm
Subtext: department/location in body-md / #43474E
Progress bar row at bottom
Status badge top-right
```

### Stat Card (Admin Dashboard)
```
Background:   #FFFFFF
Border-radius: 12px
Padding:      16px
Contains: large numeric label + caption text
Arranged in 2-column grid
```

### Header Banner Card (Employee Home)
```
Background:   #1A3C5E (navy)
Text:         #FFFFFF
Border-radius: 12px
Padding:      20px 16px
Contains: greeting + summary stats
```

---

## 9. Badge & Status Variants

All badges use **pill shape** (`border-radius: 9999px`), `label-sm` (12px/500) text, and a **15% opacity background** of the status color with **100% opacity text**.

| Variant | Background | Text | Label |
|---|---|---|---|
| `ongoing` | `#16A34A` 15% | `#16A34A` | Ongoing |
| `completed` | `#16A34A` 15% | `#166534` | Completed |
| `on-hold` | `#F59E0B` 15% | `#92400E` | On Hold |
| `pending` | `#F59E0B` 15% | `#92400E` | Pending |
| `approved` | `#16A34A` 15% | `#166534` | Approved |
| `rejected` | `#BA1A1A` 15% | `#BA1A1A` | Rejected |

---

## 10. Bottom Navigation

Observed across Employee and Admin flows:

### Employee Bottom Nav (4 tabs)
| Icon | Label | Route |
|---|---|---|
| Home | Home | Employee Home |
| Folder | My Projects | Projects list |
| Clock | Attendance | Attendance screen |
| Person | Profile | Employee Profile |

### Admin Bottom Nav (4 tabs)
| Icon | Label | Route |
|---|---|---|
| Dashboard | Dashboard | Admin Dashboard |
| Folder | Projects | Projects Screen |
| People | Employees | Employees Screen |
| Settings | Settings | Admin Settings |

### Bottom Nav Style
```
Background:       #FFFFFF
Border-top:       1px solid #E5E7EB
Height:           64px
Active icon/text: #1A3C5E (navy)
Inactive:         #73777F
Icon size:        24px (outline style)
Label:            label-sm (12px/500)
```

---

## 11. Top App Bar

```
Background:       #1A3C5E (navy)
Height:           56px
Title:            headline-sm (18px/600) — #FFFFFF
Leading icon:     Back arrow or hamburger — #FFFFFF — 24px
Trailing icons:   Notification bell, search, avatar — #FFFFFF — 24px
Elevation:        none (flat, no shadow)
```

---

## 12. Navigation Patterns

### Auth Flow
```
Splash Screen → Login Screen → [Role check]
  Admin  → Admin Dashboard
  Employee → Employee Home
```

### Employee Navigation
```
Employee Home
  └── My Projects → Project Detail (Employee)
        └── Daily Work Progress
        └── Upload Screen
  └── Attendance Screen
  └── Raise Request
  └── Employee Profile
```

### Admin Navigation
```
Admin Dashboard
  └── Projects Screen → Admin Project Detail
        └── Assign Engineers
        └── Add New Project
  └── Employees Screen
  └── Requests Management
  └── Reports Screen
  └── Admin Settings
```

---

## 13. Icon System

- **Style:** Outline icons only
- **Stroke width:** 1.5px – 2px (consistent with architectural precision theme)
- **Default color:** `#73777F` (on-surface-variant)
- **Active/primary color:** `#1A3C5E`
- **Amber accent icon:** `#F5A623` for action-triggering icons

| Context | Size |
|---|---|
| Bottom navigation | 24px |
| Top bar actions | 24px |
| Inline/list | 20px |
| Badges / chips | 16px |
| Avatar placeholder | 20px |

---

## 14. List Item Patterns

```
Border-bottom:    1px solid #E5E7EB
Vertical padding: 12px (top and bottom per item)
Leading:          Avatar (circular, 40px) OR icon (24px)
Title:            body-lg (16px/400) — #1B1B1D
Subtitle:         body-md (14px/400) — #43474E
Trailing:         Badge, chevron, or action icon
```

---

## 15. Progress Bar

```
Track:        #E4E2E4  (6px height, full radius)
Fill:         #1A3C5E  (navy, same height)
Border-radius: 9999px
Label:        label-sm right-aligned showing percentage
```

---

## 16. Avatar

```
Shape:        Circle
Sizes:        sm=32px, md=44px, lg=60px
Default bg:   #1A3C5E (navy)
Text:         Initials — label-md — #FFFFFF
Image:        object-fit: cover when photo available
```

---

## 17. Loading States

- **Inline spinner:** `ActivityIndicator` style, `#1A3C5E` color
- **Button loading:** Replace label with spinner inside button bounds
- **Screen loading:** Full-screen centered spinner on `#FCF8FB` background
- **Skeleton:** `#E4E2E4` placeholder blocks matching component shape

*(Note: Exact animation values not available through MCP metadata alone)*

---

## 18. Empty States

Observed pattern across Projects and Employees screens:

```
Icon:     48px outline icon — #C3C6CF
Heading:  headline-sm — #1B1B1D
Body:     body-md — #43474E — centered, max ~240px wide
CTA:      Primary amber button (if action exists)
Alignment: vertically and horizontally centered
```

---

## 19. Dialog & Modal Styles

```
Overlay:       rgba(0, 0, 0, 0.40) scrim
Container bg:  #FFFFFF
Border-radius: 12px
Padding:       24px
Max-width:     ~340px (mobile)
Shadow:        0 8px 24px rgba(0,0,0,0.15)
Title:         headline-sm
Body:          body-md — #43474E
Actions:       Row of 2 buttons (ghost + primary), right-aligned
```

---

## 20. Screen Layout Pattern

All screens follow this consistent structure:

```
┌─────────────────────────┐
│  Top App Bar (56px)     │  ← #1A3C5E bg
├─────────────────────────┤
│                         │
│  Scrollable Content     │  ← 16px outer margin
│  (cards, lists, forms)  │     12px card gaps
│                         │
├─────────────────────────┤
│  Bottom Nav (64px)      │  ← #FFFFFF bg
└─────────────────────────┘
```

- **Content area padding:** 16px left/right
- **Between-card spacing:** 12px
- **Section headers:** headline-sm + optional "View All" ghost link
- **FAB (Admin only):** Amber `#F5A623` circle 56px, bottom-right, trailing the nav bar

---

## 21. Reusable Design Tokens (Quick Reference)

```css
/* Colors */
--color-primary:        #1A3C5E;
--color-primary-deep:   #002645;
--color-accent:         #F5A623;
--color-background:     #FCF8FB;
--color-surface:        #FFFFFF;
--color-border:         #E5E7EB;
--color-text-primary:   #1B1B1D;
--color-text-secondary: #43474E;
--color-text-muted:     #73777F;
--color-success:        #16A34A;
--color-warning:        #F59E0B;
--color-error:          #BA1A1A;

/* Typography */
--font-family:          'Inter', sans-serif;
--text-headline-lg:     22px / 700 / 28px;
--text-headline-md:     20px / 700 / 28px;
--text-headline-sm:     18px / 600 / 24px;
--text-body-lg:         16px / 400 / 24px;
--text-body-md:         14px / 400 / 20px;
--text-label-md:        14px / 500 / 18px / 0.01em;
--text-label-sm:        12px / 500 / 16px / 0.02em;

/* Spacing */
--space-xs:    8px;
--space-sm:    12px;
--space-md:    16px;
--space-lg:    24px;
--space-xl:    32px;

/* Border Radius */
--radius-btn:    8px;
--radius-card:   12px;
--radius-badge:  9999px;

/* Shadows */
--shadow-card:    0 2px 8px rgba(0,0,0,0.08);
--shadow-overlay: 0 8px 24px rgba(0,0,0,0.15);

/* Sizes */
--height-button:  48px;
--height-input:   48px;
--height-topbar:  56px;
--height-bottomnav: 64px;
--icon-size-md:   24px;
--icon-size-sm:   20px;
```

---

## 22. Screen Inventory (18 Screens)

| Screen | Role | ID |
|---|---|---|
| Splash Screen | Both | `b86dd3751f8348aba12dea99359ebd03` |
| Login Screen | Both | `25dbce082eba4689855a3c5a1146d3a0` |
| Employee Home | Employee | `8f61e085ab254727817bd803952923d5` |
| My Projects | Employee | `31645368469b4c34a7ca629631e4d5f6` |
| Project Detail | Employee | `0257445eeb1a4ab890d06bcc5c28749d` |
| Daily Work Progress | Employee | `f948bb4b07404545bb651d4c9748ac8a` |
| Upload Screen | Employee | `132af8ac83c1402181a7c39ea7a18767` |
| Attendance Screen | Employee | `ce93025379b14833b8550b0cb0555ebb` |
| Raise Request | Employee | `08b91d9a848d44898e294fbabf00dc6d` |
| Employee Profile | Employee | `7486f09058314a83962d1ec60855ba15` |
| Admin Dashboard | Admin | `90033664eaec4f35aa8ee2aac3935845` |
| Admin Project Detail | Admin | `69e8817a49084cd8b89669f26259320b` |
| Assign Engineers | Admin | `29eac48e7d064c1fadbb1be259f47bdf` |
| Employees Screen | Admin | `07173d634a2444dbb7ed9b422b83d668` |
| Projects Screen | Admin | `54c0f349a1634ce1838fe297c3c97658` |
| Add New Project | Admin | `d2d4b1e9d7c548a98fba7c557d5756cc` |
| Admin Settings | Admin | `d8e2fa50f14541a69861accdf9d971b1` |
| Requests Management | Admin | `dbbcbfed1e6143ce876903d582e596cb` |
| Reports Screen | Admin | `3fc194c318c74e74800c31ce652517b4` |

---

## 23. Data Unavailable via MCP Metadata

The following could not be determined from Stitch project metadata alone (would require HTML source inspection):

- Exact animation durations and easing curves
- Precise transition types (fade, slide, scale)
- Specific icon library name (e.g., Lucide, Heroicons, Material)
- Exact skeleton loader animation timing
- Scroll behavior specifics (sticky headers, parallax)
- Exact touch feedback ripple implementation

---

*Generated from Stitch MCP project metadata — `projects/7450523547241458564`*
*Design System: Architectural Utility Framework · Last updated: 2026-07-16*
