# Daily Me — Design Document

## Product

Personal daily tracking PWA. Phase 1: hydration tracker. Single user (SeyedMostafa), no auth, fully offline.

---

## Design System

### Philosophy
Material Design 3 (MD3) inspired, built entirely with Tailwind — no external UI library. Prioritises mobile feel: rounded surfaces, subtle elevation, smooth Framer Motion transitions.

### Design Tokens (defined in `src/styles/index.css` via `@theme {}`)

| Token | Value | Usage |
|---|---|---|
| `--color-primary` | `#1976D2` | Buttons, progress ring, active states |
| `--color-on-primary` | `#ffffff` | Text on primary |
| `--color-primary-container` | `#d1e4ff` | Secondary button bg, highlight |
| `--color-secondary` | `#00acc1` | Accent (reserved for future use) |
| `--color-surface` | `#fafafa` | Page/card backgrounds |
| `--color-surface-dark` | `#1c1b1f` | Dark mode page bg |
| `--color-surface-variant` | `#e7e0ec` | Input backgrounds, chip backgrounds |
| `--color-surface-variant-dark` | `#2b2930` | Dark mode card bg |
| `--color-on-surface` | `#1c1b1f` | Body text |
| `--color-on-surface-dark` | `#e6e1e5` | Dark mode body text |
| `--color-on-surface-muted` | `#6e6e73` | Secondary text, labels |
| `--color-success` | `#2e7d32` | Goal-reached state (ring, chart bars) |
| `--color-success-container` | `#c8e6c9` | Goal-reached ring background |
| `--color-error` | `#b3261e` | Delete actions, error states |

### Typography
- **Font:** Inter (Google Fonts, preloaded)
- Fallback: `system-ui, sans-serif`
- Sizes: Tailwind defaults (`text-xs` = 12px, `text-sm` = 14px, `text-base` = 16px, `text-lg` = 18px)

### Dark Mode
Class-based via `.dark` on `<html>`. Applied by `App.tsx` based on settings store.
```css
@custom-variant dark (&:where(.dark, .dark *));
```
Supports `light | dark | system` — system mode listens to `prefers-color-scheme` media query.

### Border Radius
- Cards, containers: `rounded-2xl` (16px)
- Buttons/FABs: `rounded-2xl` for normal, `rounded-xl` for small
- Pills/chips: `rounded-full`

### Elevation
- Default card: `shadow-sm` + subtle border (`border-black/5`)
- Elevated card: `shadow-lg`
- Bottom nav / header: `backdrop-blur-md` / `backdrop-blur-sm` for glass effect
- FAB primary: `shadow-lg hover:shadow-xl`

---

## Navigation

Bottom navigation bar with 3 tabs. State-based — no react-router.

| Tab | Icon | Route key | Content |
|---|---|---|---|
| Today | 💧 | `home` | HydrationPage (today's date) |
| History | 📅 | `history` | HydrationPage (date browseable) |
| Settings | ⚙️ | `settings` | SettingsPage |

Page transitions: Framer Motion `AnimatePresence` — slides horizontally based on tab order (left-to-right index).

Active tab indicator: `layoutId="nav-indicator"` animated underline pill.

---

## Screens

### Screen 1: Hydration Home (`home` + `history`)

```
┌─────────────────────────────────┐
│  Header: "Daily Me"        [⚙️]  │  ← sticky, backdrop-blur
├─────────────────────────────────┤
│  ‹  Today, Feb 21  ›            │  ← date navigator (tap to nav days)
│                                 │
│         ┌───────────┐           │
│         │    60%    │           │  ← ProgressRing (SVG, Framer Motion)
│         │  hydrated │           │
│         └───────────┘           │
│      1500 / 2500 ml             │
│                                 │
│  🥛🥛🥛🥛🥛🥛⬜⬜⬜⬜         │  ← CupGrid (10 cups = 2500ml ÷ 250ml)
│                                 │
│  [💧 + Cup (250ml)] [🥛 +500ml] │  ← FAB row (primary + secondary)
│  [✏️ Custom] [↩️ Undo last]     │  ← surface FAB row (small)
│  ┌──────────────────────────┐   │  ← expandable custom input
│  │ 300 ml  [Add]  [✕]       │   │
│  └──────────────────────────┘   │
│                                 │
│  TODAY'S LOG                    │
│  ┌──────────────────────────┐   │
│  │ 💧  +250 ml  water  2:30 │   │  ← swipe left to delete
│  │ 💧  +500 ml  water  1:15 │   │
│  └──────────────────────────┘   │
│                                 │
│  LAST 7 DAYS                    │
│  ┌──────────────────────────┐   │
│  │ ▇ ▅ ▇ ▃ ▇ ▇ ▂           │   │  ← bar chart (green=goal, blue=partial)
│  │ M T W T F S T            │   │
│  └──────────────────────────┘   │
└─────────────────────────────────┘
│  [Today]  [History]  [Settings] │  ← BottomNav (fixed)
```

**Interactions:**
- Tap empty cup → adds `cupSize` ml, haptic feedback, toast
- Swipe log item left ≥ 60px → delete with confirmation reveal
- Pull down from top → refresh (recalculates today's total)
- Tap date ‹ / › → navigate one day at a time
- Tap date label → jumps back to today
- Tap bar in weekly chart → loads that day's data
- Goal reached → Confetti (60 Framer Motion particles, auto-dismiss)

### Screen 2: Settings

Sections (as `Card` components):
1. **Daily Goal** — preset buttons (2000 / 2500 / 3000 / 3500 ml) + number input
2. **Cup Size** — preset buttons (200 / 250 / 300 / 330 / 500 ml)
3. **Theme** — Light / Dark / System toggle
4. **Data** — Export JSON, Reset today (two-tap confirmation)
5. **About** — Version string

---

## Component Hierarchy

```
App
├── Layout
│   ├── main (page content)
│   │   ├── HydrationPage
│   │   │   ├── Header
│   │   │   ├── DailyProgress
│   │   │   │   └── ProgressRing
│   │   │   ├── CupGrid
│   │   │   │   └── CupButton (×N)
│   │   │   ├── QuickActions
│   │   │   ├── LogList
│   │   │   │   └── LogItem (×N)
│   │   │   ├── HydrationHistory
│   │   │   └── Confetti (conditional)
│   │   └── SettingsPage
│   │       └── Card (×5)
│   └── BottomNav
└── Toaster (react-hot-toast, portal)
```

---

## Animations

All via Framer Motion:

| Element | Animation |
|---|---|
| Progress ring arc | `strokeDashoffset` tween, 0.6s cubic-bezier |
| Percentage text | Scale + opacity on value change |
| Cup fill | `scaleY` from 0→1, `transformOrigin: bottom` |
| Page transition | Horizontal slide + opacity, 0.2s |
| Nav indicator | `layoutId` spring (stiffness 400, damping 30) |
| Log entry enter/exit | Fade + translate / fade + slide left + height collapse |
| Weekly bar enter | `scaleY` from 0, staggered 50ms delay per bar |
| Custom input expand | Height + opacity, 0.2s |
| Confetti particles | 60 particles, `y: 0→115vh`, random rotation, 2.2–3.7s |

---

## Responsive Design

- **Primary target:** 360–428px width (Android phones)
- **Max width:** `max-w-lg` (512px) centered on desktop
- **Safe area:** `env(safe-area-inset-*)` via custom `.pt-safe` / `.pb-safe` utilities
- Bottom nav: fixed, `pb-safe` for notched devices
- Header: sticky, `pt-safe`

---

## PWA

- **Manifest:** name="Daily Me", theme_color="#1976D2", display="standalone"
- **Icons:** SVG (maskable + regular) in `public/icons/`
- **Service Worker:** Workbox (auto-generated by `vite-plugin-pwa`), `registerType: 'autoUpdate'`
- **Caching strategy:** Pre-cache all built assets; Cache-First for Google Fonts
- **Offline:** 100% — all data in IndexedDB, no network calls at runtime
- **Install prompt:** Browser-native (Android Chrome shows banner after criteria met)
- **Update flow:** `useServiceWorker` hook shows a toast when new version is available; clicking it triggers `updateServiceWorker(true)`

---

## Future Modules (Phase 2+)

Architecture is ready — add new folders under `src/modules/` and new tabs in `src/shared/components/BottomNav.tsx`.

Planned modules: Habits, Mood, Sleep, Notes/Journal, Dashboard.
