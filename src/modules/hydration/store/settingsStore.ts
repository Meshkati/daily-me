import { create } from 'zustand'
import {
  getSetting,
  setSetting,
  initDefaultSettings,
} from '../../../shared/db'
import {
  DEFAULT_DAILY_GOAL_ML,
  DEFAULT_CUP_SIZE_ML,
} from '../constants'
import type { ThemeType } from '../types'

interface SettingsState {
  dailyGoal: number
  cupSize: number
  theme: ThemeType
  dayStartHour: number
  isLoaded: boolean

  loadSettings: () => Promise<void>
  setDailyGoal: (ml: number) => Promise<void>
  setCupSize: (ml: number) => Promise<void>
  setTheme: (theme: ThemeType) => Promise<void>
  setDayStartHour: (hour: number) => Promise<void>
}

export const useSettingsStore = create<SettingsState>((set) => ({
  dailyGoal: DEFAULT_DAILY_GOAL_ML,
  cupSize: DEFAULT_CUP_SIZE_ML,
  theme: 'system',
  dayStartHour: 0,
  isLoaded: false,

  loadSettings: async () => {
    await initDefaultSettings()
    const [dailyGoal, cupSize, theme, dayStartHour] = await Promise.all([
      getSetting<number>('daily_goal_ml'),
      getSetting<number>('cup_size_ml'),
      getSetting<ThemeType>('theme'),
      getSetting<number>('day_start_hour'),
    ])
    set({
      dailyGoal: dailyGoal ?? DEFAULT_DAILY_GOAL_ML,
      cupSize: cupSize ?? DEFAULT_CUP_SIZE_ML,
      theme: theme ?? 'system',
      dayStartHour: dayStartHour ?? 0,
      isLoaded: true,
    })
  },

  setDailyGoal: async (ml) => {
    set({ dailyGoal: ml })
    await setSetting('daily_goal_ml', ml)
  },

  setCupSize: async (ml) => {
    set({ cupSize: ml })
    await setSetting('cup_size_ml', ml)
  },

  setTheme: async (theme) => {
    set({ theme })
    await setSetting('theme', theme)
  },

  setDayStartHour: async (hour) => {
    set({ dayStartHour: hour })
    await setSetting('day_start_hour', hour)
  },
}))
