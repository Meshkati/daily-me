import { useHydrationStore } from '../store/hydrationStore'
import { useSettingsStore } from '../store/settingsStore'
import { getTodayDateStr } from '../../../shared/utils/date'

export function useHydration() {
  const store = useHydrationStore()
  const { dailyGoal, cupSize, dayStartHour } = useSettingsStore()

  const totalToday = store.summary?.total_ml ?? 0
  const percentage = Math.min(100, Math.round((totalToday / dailyGoal) * 100))

  const totalCups = Math.ceil(dailyGoal / cupSize)
  const cupsConsumed = Math.min(totalCups, Math.floor(totalToday / cupSize))
  const isToday = store.selectedDate === getTodayDateStr(dayStartHour)

  return {
    ...store,
    totalToday,
    percentage,
    totalCups,
    cupsConsumed,
    dailyGoal,
    cupSize,
    dayStartHour,
    isToday,
  }
}
