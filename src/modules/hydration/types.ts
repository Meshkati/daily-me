export interface HydrationLog {
  id: string
  date: string       // ISO date "2026-02-20"
  timestamp: number  // Unix ms
  amount_ml: number
  type: 'water' | 'tea' | 'coffee' | 'other'
}

export interface DailySummary {
  date: string        // ISO date (primary key)
  total_ml: number
  goal_ml: number
  entries_count: number
  goal_reached: boolean
  last_updated: number
}

export interface AppSettings {
  key: string
  value: unknown
}

export type DrinkType = HydrationLog['type']
export type ThemeType = 'light' | 'dark' | 'system'
