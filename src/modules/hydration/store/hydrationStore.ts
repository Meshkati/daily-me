import { create } from 'zustand'
import {
  addHydrationLog,
  deleteHydrationLog,
  getLogsByDate,
  getDailySummaries,
  recalculateSummary,
  deleteAllLogsForDate,
} from '../../../shared/db'
import { getTodayDateStr, getLast7Days } from '../../../shared/utils/date'
import type { HydrationLog, DailySummary } from '../types'
import { useSettingsStore } from './settingsStore'

interface HydrationState {
  entries: HydrationLog[]
  summary: DailySummary | null
  weekHistory: (DailySummary | null)[]
  selectedDate: string
  isLoading: boolean
  goalJustReached: boolean

  loadDateData: (date: string) => Promise<void>
  loadWeekHistory: () => Promise<void>
  addEntry: (amount_ml: number, type?: HydrationLog['type']) => Promise<void>
  removeEntry: (id: string) => Promise<void>
  undoLast: () => Promise<void>
  resetToday: () => Promise<void>
  setSelectedDate: (date: string) => void
  clearGoalReached: () => void
}

export const useHydrationStore = create<HydrationState>((set, get) => ({
  entries: [],
  summary: null,
  weekHistory: [],
  selectedDate: getTodayDateStr(),
  isLoading: false,
  goalJustReached: false,

  loadDateData: async (date) => {
    set({ isLoading: true, selectedDate: date })
    try {
      const { dailyGoal } = useSettingsStore.getState()
      const entries = await getLogsByDate(date)
      const total_ml = entries.reduce((sum, e) => sum + e.amount_ml, 0)
      const summary: DailySummary = {
        date,
        total_ml,
        goal_ml: dailyGoal,
        entries_count: entries.length,
        goal_reached: total_ml >= dailyGoal,
        last_updated: Date.now(),
      }
      set({ entries, summary, isLoading: false })
    } catch (e) {
      console.error('Failed to load date data', e)
      set({ isLoading: false })
    }
  },

  loadWeekHistory: async () => {
    try {
      const dates = getLast7Days()
      const summaries = await getDailySummaries(dates)
      const { dailyGoal } = useSettingsStore.getState()
      const weekHistory = dates.map((date, i) => {
        const s = summaries[i]
        return s
          ? s
          : {
              date,
              total_ml: 0,
              goal_ml: dailyGoal,
              entries_count: 0,
              goal_reached: false,
              last_updated: 0,
            }
      })
      set({ weekHistory })
    } catch (e) {
      console.error('Failed to load week history', e)
    }
  },

  addEntry: async (amount_ml, type = 'water') => {
    const { selectedDate, summary } = get()
    const { dailyGoal } = useSettingsStore.getState()
    const wasGoalReached = summary?.goal_reached ?? false

    const entry: HydrationLog = {
      id: crypto.randomUUID(),
      date: selectedDate,
      timestamp: Date.now(),
      amount_ml,
      type,
    }

    await addHydrationLog(entry)
    const newSummary = await recalculateSummary(selectedDate, dailyGoal)
    const entries = await getLogsByDate(selectedDate)

    const goalJustReached = !wasGoalReached && newSummary.goal_reached

    set({ entries, summary: newSummary, goalJustReached })

    // Refresh week history silently
    get().loadWeekHistory()
  },

  removeEntry: async (id) => {
    const { selectedDate } = get()
    const { dailyGoal } = useSettingsStore.getState()

    await deleteHydrationLog(id)
    const newSummary = await recalculateSummary(selectedDate, dailyGoal)
    const entries = await getLogsByDate(selectedDate)

    set({ entries, summary: newSummary })
    get().loadWeekHistory()
  },

  undoLast: async () => {
    const { entries } = get()
    if (entries.length === 0) return
    const last = entries[entries.length - 1]
    await get().removeEntry(last.id)
  },

  resetToday: async () => {
    const today = getTodayDateStr()
    const { dailyGoal } = useSettingsStore.getState()

    await deleteAllLogsForDate(today)
    const newSummary = await recalculateSummary(today, dailyGoal)

    set({ entries: [], summary: newSummary, goalJustReached: false })
    get().loadWeekHistory()
  },

  setSelectedDate: (date) => {
    get().loadDateData(date)
  },

  clearGoalReached: () => {
    set({ goalJustReached: false })
  },
}))
