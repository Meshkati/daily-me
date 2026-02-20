# Daily Hydration Tracker — PWA Implementation Plan

## Overview

Build a **Progressive Web App (PWA)** called **"Daily Me"** — starting with a hydration tracker module. The app should be installable on Android, work offline, and be architected to support future daily tracking modules (habits, mood, sleep, etc.).

**Target user:** Single user (SeyedMostafa), personal use only — no auth needed for Phase 1.

---

## Tech Stack

- **Framework:** React 18+ with TypeScript
- **Build tool:** Vite
- **Styling:** Tailwind CSS v4
- **UI Components:** Custom components following Material Design 3 guidelines (use `@material/web` web components OR build custom MD3-inspired components with Tailwind — prefer Tailwind-only for simplicity)
- **State management:** Zustand (lightweight, minimal boilerplate)
- **Local storage:** IndexedDB via `idb` library (for structured data + offline support)
- **PWA:** `vite-plugin-pwa` (auto-generates service worker + manifest)
- **Date handling:** `date-fns`
- **Charts (later):** Recharts
- **Testing:** Vitest + React Testing Library

---

## Project Structure

```
daily-me/
├── public/
│   ├── icons/                    # PWA icons (192x192, 512x512)
│   └── splash/                   # Splash screens
├── src/
│   ├── app/
│   │   ├── App.tsx               # Root component + router
│   │   └── Layout.tsx            # App shell (bottom nav, header)
│   ├── modules/
│   │   └── hydration/
│   │       ├── components/
│   │       │   ├── HydrationPage.tsx       # Main page
│   │       │   ├── CupButton.tsx           # 250ml cup tap target
│   │       │   ├── DailyProgress.tsx       # Circular/linear progress
│   │       │   ├── HydrationHistory.tsx    # Past 7 days mini chart
│   │       │   └── QuickActions.tsx        # +250ml, +500ml, custom, undo
│   │       ├── store/
│   │       │   └── hydrationStore.ts       # Zustand store
│   │       ├── hooks/
│   │       │   └── useHydration.ts         # Business logic hook
│   │       ├── types.ts
│   │       └── constants.ts               # DAILY_GOAL, CUP_SIZE, etc.
│   ├── shared/
│   │   ├── components/
│   │   │   ├── BottomNav.tsx
│   │   │   ├── Header.tsx
│   │   │   ├── ProgressRing.tsx
│   │   │   ├── FAB.tsx                    # Floating Action Button
│   │   │   └── Card.tsx
│   │   ├── db/
│   │   │   └── index.ts                   # IndexedDB setup via idb
│   │   ├── hooks/
│   │   │   └── useServiceWorker.ts
│   │   └── utils/
│   │       └── date.ts
│   ├── styles/
│   │   └── index.css                      # Tailwind directives + MD3 tokens
│   ├── main.tsx
│   └── vite-env.d.ts
├── index.html
├── vite.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── README.md
```

---

## Data Model

### IndexedDB Schema

**Database name:** `daily-me-db`

**Store: `hydration_logs`**

```typescript
interface HydrationLog {
  id: string;              // UUID
  date: string;            // ISO date "2026-02-20"
  timestamp: number;       // Unix ms — when the entry was logged
  amount_ml: number;       // 250, 500, or custom
  type: 'water' | 'tea' | 'coffee' | 'other';  // for future use, default 'water'
}
```

**Store: `daily_summaries`**

```typescript
interface DailySummary {
  date: string;            // ISO date (primary key)
  total_ml: number;        // Aggregated total
  goal_ml: number;         // Goal for that day (default 2500)
  entries_count: number;
  goal_reached: boolean;
  last_updated: number;    // Unix ms
}
```

**Store: `settings`**

```typescript
interface AppSettings {
  key: string;                    // primary key
  value: any;
}

// Initial settings:
// { key: 'daily_goal_ml', value: 2500 }
// { key: 'cup_size_ml', value: 250 }
// { key: 'theme', value: 'system' }  // 'light' | 'dark' | 'system'
```

---

## Feature Spec — Phase 1 (Hydration Tracker)

### Screen 1: Hydration Home (main screen)

**Layout (top to bottom):**

1. **Header:** "Daily Me" title + settings gear icon (top-right)
2. **Date display:** "Today, Feb 20" — tappable to browse history
3. **Progress ring:** Large circular progress indicator in center
   - Shows `current_ml / goal_ml`
   - Percentage text in center (e.g., "60%")
   - Below ring: "1500 / 2500 ml"
   - Animate fill on change
4. **Cup grid:** Row of tappable cup icons
   - Each cup represents 250ml
   - Filled cups = consumed, empty cups = remaining
   - Goal of 2500ml = 10 cups displayed
   - Tapping an empty cup fills it (logs +250ml)
   - Visual: use water glass/droplet icons with fill animation
5. **Quick action buttons:**
   - `+ Cup (250ml)` — primary FAB
   - `+ Glass (500ml)` — secondary
   - `Custom amount` — opens small input
   - `Undo last` — removes most recent entry for today
6. **Today's log:** Scrollable list of today's entries
   - Each entry: time (e.g., "2:30 PM"), amount ("250ml"), type icon
   - Swipe to delete individual entries
7. **Weekly mini-chart:** Bar chart showing last 7 days
   - Bars colored green if goal reached, blue otherwise
   - Tappable to see that day's detail

### Screen 2: Settings

- Daily goal (ml) — number input with preset buttons (2000, 2500, 3000, 3500)
- Default cup size (ml) — 200, 250, 300, 330, 500
- Theme toggle (Light / Dark / System)
- Reset today's data (with confirmation)
- Export data (JSON) — nice to have

### Interactions & UX

- **Haptic feedback** on cup tap (via `navigator.vibrate(50)`)
- **Confetti/celebration animation** when daily goal is reached
- **Smooth transitions** between states (Framer Motion or CSS transitions)
- **Pull to refresh** gesture — recalculates today's total
- **Toast notifications** for actions: "Added 250ml", "Entry removed"

### PWA Requirements

- **Manifest:** App name "Daily Me", theme color `#1976D2` (MD3 blue), background `#FAFAFA`
- **Icons:** Generate at 192x192 and 512x512 (use a simple water droplet icon)
- **Service worker:** Cache app shell + assets for full offline support
- **Install prompt:** Show custom "Add to Home Screen" banner on first visit
- **Offline:** App must work 100% offline. All data in IndexedDB.

---

## Design Tokens (Material Design 3 Inspired)

```css
/* Colors — use Tailwind custom theme */
--md-primary: #1976D2;          /* Blue */
--md-on-primary: #FFFFFF;
--md-primary-container: #D1E4FF;
--md-secondary: #00ACC1;        /* Cyan accent */
--md-surface: #FAFAFA;
--md-surface-variant: #E7E0EC;
--md-on-surface: #1C1B1F;
--md-error: #B3261E;
--md-success: #2E7D32;          /* Goal reached green */

/* Dark mode overrides */
--md-surface-dark: #1C1B1F;
--md-on-surface-dark: #E6E1E5;

/* Elevation — use Tailwind shadow utilities */
/* Typography — use Inter or Roboto font */
/* Border radius — rounded-xl (16px) for cards, rounded-full for FABs */
```

---

## Implementation Steps (for Claude Code)

### Step 1: Project Setup
1. `npm create vite@latest daily-me -- --template react-ts`
2. Install dependencies:
   ```
   npm install zustand idb date-fns
   npm install -D tailwindcss @tailwindcss/vite vite-plugin-pwa
   ```
3. Configure Tailwind with custom MD3 theme tokens
4. Configure `vite-plugin-pwa` in `vite.config.ts`
5. Set up project structure as defined above

### Step 2: Shared Foundation
1. Build IndexedDB wrapper (`shared/db/index.ts`) — create DB, stores, CRUD helpers
2. Build shared UI components: `Card`, `ProgressRing`, `FAB`, `Header`, `BottomNav`
3. Set up `Layout.tsx` app shell
4. Implement theme (light/dark/system) with CSS variables + Tailwind dark mode
5. Add Inter/Roboto font via Google Fonts CDN or bundled

### Step 3: Hydration Store & Logic
1. Create Zustand store with IndexedDB persistence
2. Actions: `addEntry(amount_ml)`, `removeEntry(id)`, `undoLast()`, `getDailySummary(date)`, `getWeekHistory()`
3. On app load: hydrate store from IndexedDB for current day
4. Auto-aggregate `daily_summaries` when entries change
5. Settings store: `getGoal()`, `setGoal()`, `getCupSize()`, etc.

### Step 4: Hydration UI
1. Build `HydrationPage.tsx` with the layout described above
2. Build `ProgressRing` — SVG circle with animated stroke-dashoffset
3. Build `CupButton` grid — dynamic based on goal / cup size
4. Build quick action buttons with FAB component
5. Build today's log list with swipe-to-delete
6. Build weekly mini bar chart (use simple divs or Recharts)
7. Add celebration animation on goal completion (CSS confetti or canvas)

### Step 5: Settings
1. Build settings page with all controls
2. Wire up to settings store
3. Theme switching logic

### Step 6: PWA Polish
1. Generate PWA icons (can use a simple SVG water drop rendered to PNG)
2. Configure manifest (name, colors, icons, display: standalone)
3. Test service worker caching — verify full offline functionality
4. Add install prompt banner
5. Test on Android Chrome — install to home screen

### Step 7: Final Polish
1. Add `navigator.vibrate()` haptic feedback
2. Add toast notification system (build simple one or use `react-hot-toast`)
3. Smooth animations and transitions
4. Responsive design check (works on phone widths 360px-428px primarily)
5. Lighthouse audit — target 95+ PWA score
6. Write README with setup instructions

---

## Future Modules (Phase 2+, don't implement now)

Just keep the architecture ready for these:
- **Habits tracker** — daily checkbox habits
- **Mood logger** — emoji-based mood tracking
- **Sleep tracker** — bedtime/wake time logging
- **Notes / Journal** — daily quick notes
- **Dashboard** — unified daily overview across all modules

The `modules/` folder structure and bottom navigation should anticipate these, but only hydration gets built now.

---

## Constraints & Notes

- **No backend** — everything local in IndexedDB
- **No auth** — single user personal app
- **Mobile-first** — design for 360-428px width, but don't break on desktop
- **Performance** — keep bundle small, lazy load charts
- **Accessibility** — proper aria labels on interactive elements, good contrast ratios
- **No external UI library** — build MD3-inspired components with Tailwind (keeps bundle small and gives full control)