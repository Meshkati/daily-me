# Daily Me — Implementation Document

## Tech Stack

| Layer | Library | Version | Notes |
|---|---|---|---|
| Framework | React | ^18.3.1 | StrictMode enabled |
| Language | TypeScript | ~5.7.2 | strict mode, noUnusedLocals |
| Build | Vite | ^6.1.0 | |
| Styling | Tailwind CSS | ^4.0.6 | v4 CSS-based config, no tailwind.config.ts |
| Animations | Framer Motion | ^11.18.2 | user preference over CSS-only |
| State | Zustand | ^5.0.3 | manual IndexedDB sync, no persist middleware |
| Storage | idb | ^8.0.2 | IndexedDB wrapper |
| Dates | date-fns | ^4.1.0 | |
| Toasts | react-hot-toast | ^2.5.2 | |
| PWA | vite-plugin-pwa | ^0.21.1 | Workbox, autoUpdate |

---

## Project Structure

```
src/
├── app/
│   ├── App.tsx               # Root: theme, routing, SW bootstrap
│   └── Layout.tsx            # App shell (main + BottomNav)
├── modules/
│   └── hydration/
│       ├── components/
│       │   ├── HydrationPage.tsx   # Main screen
│       │   ├── DailyProgress.tsx   # Date nav + ProgressRing wrapper
│       │   ├── CupButton.tsx       # CupButton + CupGrid
│       │   ├── QuickActions.tsx    # FABs + custom input
│       │   ├── LogList.tsx         # Swipe-to-delete log
│       │   ├── HydrationHistory.tsx # 7-day bar chart
│       │   └── Confetti.tsx        # Celebration animation
│       ├── store/
│       │   ├── hydrationStore.ts   # Zustand store (entries, summary, history)
│       │   └── settingsStore.ts    # Zustand store (goal, cupSize, theme)
│       ├── hooks/
│       │   └── useHydration.ts     # Derived state hook
│       ├── types.ts                # HydrationLog, DailySummary, AppSettings
│       └── constants.ts            # DEFAULT_DAILY_GOAL_ML, presets
├── modules/
│   └── settings/
│       └── SettingsPage.tsx
├── shared/
│   ├── components/
│   │   ├── BottomNav.tsx     # NavPage type exported here
│   │   ├── Card.tsx
│   │   ├── FAB.tsx
│   │   ├── Header.tsx        # Header + IconButton
│   │   └── ProgressRing.tsx  # SVG ring with Framer Motion
│   ├── db/
│   │   └── index.ts          # All IndexedDB operations
│   ├── hooks/
│   │   └── useServiceWorker.ts
│   └── utils/
│       └── date.ts           # date-fns wrappers
└── styles/
    └── index.css             # Tailwind v4 @import + @theme + @custom-variant
```

---

## Data Model

### IndexedDB — `daily-me-db` (version 1)

**`hydration_logs`**
```typescript
interface HydrationLog {
  id: string              // crypto.randomUUID()
  date: string            // "2026-02-21" (index key)
  timestamp: number       // Date.now()
  amount_ml: number
  type: 'water' | 'tea' | 'coffee' | 'other'
}
// index: 'by-date' on `date` field
```

**`daily_summaries`**
```typescript
interface DailySummary {
  date: string            // primary key "2026-02-21"
  total_ml: number
  goal_ml: number
  entries_count: number
  goal_reached: boolean
  last_updated: number
}
```

**`settings`**
```typescript
interface AppSettings {
  key: string             // primary key
  value: unknown
}
// keys: 'daily_goal_ml' (2500), 'cup_size_ml' (250), 'theme' ('system')
```

### DB Helper Functions (`src/shared/db/index.ts`)

```typescript
// Logs
addHydrationLog(entry)
deleteHydrationLog(id)
getLogsByDate(date)           // returns sorted by timestamp asc
getAllLogs()                  // for JSON export
deleteAllLogsForDate(date)

// Summaries
upsertDailySummary(summary)
getDailySummary(date)
getDailySummaries(dates[])    // batch read for week history

// Settings
getSetting<T>(key)
setSetting(key, value)
initDefaultSettings()         // called once on first load

// Aggregation
recalculateSummary(date, goalMl)  // reads logs → computes → upserts summary → returns it
```

---

## State Management

### Pattern
Zustand stores hold in-memory state. Every mutation hits IndexedDB first (or simultaneously), then updates Zustand state. No Zustand persist middleware — sync is manual and explicit.

### `useHydrationStore`

```typescript
interface HydrationState {
  entries: HydrationLog[]       // today's (or selected date's) entries
  summary: DailySummary | null
  weekHistory: DailySummary[]   // last 7 days
  selectedDate: string          // currently viewed date
  isLoading: boolean
  goalJustReached: boolean      // triggers confetti, cleared via clearGoalReached()

  loadDateData(date)     // loads entries + computes summary for any date
  loadWeekHistory()      // fetches/fills last 7 DailySummary objects
  addEntry(ml, type?)    // write to DB → recalculate → update state
  removeEntry(id)        // delete from DB → recalculate → update state
  undoLast()             // removeEntry(entries.last)
  resetToday()           // deleteAllLogsForDate + recalculate
  setSelectedDate(date)  // calls loadDateData internally
  clearGoalReached()     // sets goalJustReached = false
}
```

**Goal celebration detection** (in `addEntry`):
```typescript
const wasGoalReached = summary?.goal_reached ?? false
// ... write to DB, recalculate ...
const goalJustReached = !wasGoalReached && newSummary.goal_reached
set({ goalJustReached })
```

### `useSettingsStore`

```typescript
interface SettingsState {
  dailyGoal: number       // default 2500
  cupSize: number         // default 250
  theme: 'light' | 'dark' | 'system'
  isLoaded: boolean

  loadSettings()          // reads from IndexedDB, sets defaults if first run
  setDailyGoal(ml)        // set state + persist
  setCupSize(ml)          // set state + persist
  setTheme(theme)         // set state + persist
}
```

### `useHydration` hook (`src/modules/hydration/hooks/useHydration.ts`)

Thin derived-state layer over both stores:
```typescript
const { totalToday, percentage, totalCups, cupsConsumed, isToday, ... } = useHydration()
// totalToday   = summary?.total_ml ?? 0
// percentage   = min(100, round(totalToday / dailyGoal * 100))
// totalCups    = ceil(dailyGoal / cupSize)
// cupsConsumed = min(totalCups, floor(totalToday / cupSize))
// isToday      = selectedDate === getTodayDateStr()
```

---

## Routing

State-based, no react-router. Managed in `App.tsx`:

```typescript
type NavPage = 'home' | 'history' | 'settings'
const [currentPage, setCurrentPage] = useState<NavPage>('home')
```

Page slide direction is derived from `PAGE_ORDER = ['home', 'history', 'settings']` index comparison. Framer Motion `AnimatePresence mode="wait"` wraps the active page.

**Note:** `history` and `home` both render `HydrationPage`. The difference is semantic (tab highlight). Date navigation within the page handles actual history browsing.

---

## Boot Sequence

```
App mounts
  → useServiceWorker() registers SW
  → loadSettings() from IndexedDB (sets dailyGoal, cupSize, theme)
  → theme effect applies .dark class to <html>

HydrationPage mounts (via App render)
  → loadDateData(today) → fetch logs → recalculate → set entries + summary
  → loadWeekHistory() → fetch last 7 summaries → set weekHistory
```

---

## Key Patterns

### Adding an entry (full flow)
```
user tap (CupButton or FAB)
  → handleAddEntry(ml) in HydrationPage
  → addEntry(ml) in hydrationStore
      → addHydrationLog({ id: randomUUID(), date, timestamp, amount_ml, type })
      → recalculateSummary(date, goalMl)
          → getLogsByDate(date) → sum → upsertDailySummary
      → getLogsByDate(date) → update entries
      → check goalJustReached
      → loadWeekHistory() (background, no await)
  → toast.success(`Added ${ml} ml`)
  → <Confetti /> rendered if goalJustReached
```

### Theme switching
```
user picks theme in SettingsPage
  → setTheme(t) → setState + setSetting('theme', t)
  → useEffect in App.tsx reacts to theme change
      → adds/removes .dark from document.documentElement
      → for 'system': registers matchMedia listener, cleans up on change
```

### Swipe to delete (LogItem)
```
pointerdown → record startX
pointerMove → dx = clientX - startX; if dx < 0: setSwipeX(max(dx, -80))
pointerUp   → if swipeX < -60: onDelete(entry.id); else: setSwipeX(0)
```
Uses CSS `translateX` (not Framer Motion) for the drag feel; Framer Motion handles the exit animation.

---

## Tailwind v4 Notes

- No `tailwind.config.ts` — everything in `src/styles/index.css`
- `@import "tailwindcss"` replaces `@tailwind base/components/utilities`
- `@theme { --color-primary: #1976D2; ... }` → generates `bg-primary`, `text-primary`, `border-primary`, etc.
- Custom dark variant: `@custom-variant dark (&:where(.dark, .dark *))`
- Safe area utilities (`.pt-safe`, `.pb-safe`) are hand-written CSS, not Tailwind

---

## PWA Config (`vite.config.ts`)

```typescript
VitePWA({
  registerType: 'autoUpdate',
  manifest: { name: 'Daily Me', theme_color: '#1976D2', display: 'standalone', ... },
  workbox: {
    globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
    runtimeCaching: [CacheFirst for Google Fonts]
  }
})
```

Service worker update notification: `useServiceWorker` hook shows a toast; clicking anywhere triggers `updateServiceWorker(true)` and reloads.

---

## TypeScript Config

- `strict: true`
- `noUnusedLocals: true`, `noUnusedParameters: true`
- `moduleResolution: "bundler"` (Vite-compatible)
- `types: ["vite/client", "vite-plugin-pwa/react"]` — needed for `virtual:pwa-register/react`
- Composite project: `tsconfig.json` → `tsconfig.app.json` + `tsconfig.node.json`

---

## Adding a New Module (Phase 2 Guide)

1. Create `src/modules/<name>/` with `components/`, `store/`, `hooks/`, `types.ts`
2. Add a new `NavPage` value to `BottomNav.tsx` (`NavPage` type + `NAV_ITEMS` array)
3. Add the new page component to the `App.tsx` render switch
4. Add a new IndexedDB store in `src/shared/db/index.ts` (bump DB version, add `upgrade` block)
5. Follow the existing Zustand store pattern: manual sync, `loadX()` on mount, async actions

---

## Known Limitations / TODOs

- **PNG icons:** Manifest uses SVG icons. For maximum Android compatibility, generate 192×192 and 512×512 PNGs from `public/icons/icon.svg` and add to manifest.
- **History page:** Currently identical to home tab — a dedicated calendar/list view would improve the UX.
- **`noUncheckedSideEffectImports`:** Omitted from tsconfig (strict template includes it but it causes noise with `idb` and side-effect-only imports).
- **Custom `daily_goal_ml` per day:** Summary always recalculates with current goal, not the goal at time of entry. Fine for personal use.
- **Export:** JSON only; no import/restore flow yet.
