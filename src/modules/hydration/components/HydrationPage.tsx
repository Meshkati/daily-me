import { useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { Header, IconButton } from '../../../shared/components/Header'
import { DailyProgress } from './DailyProgress'
import { CupGrid } from './CupButton'
import { QuickActions } from './QuickActions'
import { LogList } from './LogList'
import { HydrationHistory } from './HydrationHistory'
import { Confetti } from './Confetti'
import { useHydration } from '../hooks/useHydration'
import { useSettingsStore } from '../store/settingsStore'
import { getTodayDateStr } from '../../../shared/utils/date'

interface HydrationPageProps {
  onOpenSettings: () => void
}

export function HydrationPage({ onOpenSettings }: HydrationPageProps) {
  const {
    entries,
    summary,
    weekHistory,
    selectedDate,
    isLoading,
    goalJustReached,
    loadDateData,
    loadWeekHistory,
    addEntry,
    removeEntry,
    undoLast,
    setSelectedDate,
    clearGoalReached,
    totalToday,
    percentage,
    totalCups,
    cupsConsumed,
    dailyGoal,
    cupSize,
    isToday,
    dayStartHour,
  } = useHydration()

  const { isLoaded } = useSettingsStore()

  // Pull-to-refresh
  const scrollRef = useRef<HTMLDivElement>(null)
  const [refreshing, setRefreshing] = useState(false)
  const pullStartY = useRef(0)
  const pulling = useRef(false)

  useEffect(() => {
    if (!isLoaded) return
    loadDateData(getTodayDateStr(dayStartHour))
    loadWeekHistory()
  }, [isLoaded]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleAddEntry = async (ml: number) => {
    const wasGoalReached = summary?.goal_reached ?? false
    await addEntry(ml)
    toast.success(`Added ${ml} ml`, { duration: 1500, icon: '💧' })
    if (!wasGoalReached && (totalToday + ml) >= dailyGoal) {
      toast.success('Daily goal reached! 🎉', { duration: 3000 })
    }
  }

  const handleRemoveEntry = async (id: string) => {
    await removeEntry(id)
    toast('Entry removed', { icon: '↩️', duration: 1500 })
  }

  const handleUndo = async () => {
    if (entries.length === 0) {
      toast('No entries to undo', { duration: 1500 })
      return
    }
    await undoLast()
    toast('Last entry removed', { icon: '↩️', duration: 1500 })
  }

  const handleRefresh = async () => {
    if (refreshing) return
    setRefreshing(true)
    if (navigator.vibrate) navigator.vibrate([30, 30, 30])
    await loadDateData(selectedDate)
    await loadWeekHistory()
    setRefreshing(false)
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    const scrollEl = scrollRef.current
    if (!scrollEl || scrollEl.scrollTop > 0) return
    pullStartY.current = e.touches[0].clientY
    pulling.current = true
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!pulling.current) return
    const dy = e.touches[0].clientY - pullStartY.current
    if (dy > 60) {
      handleRefresh()
      pulling.current = false
    }
  }

  const handleTouchEnd = () => {
    pulling.current = false
  }

  return (
    <div className="flex flex-col min-h-full">
      <Header
        title="Daily Me"
        rightAction={
          <IconButton
            icon="⚙️"
            label="Settings"
            onClick={onOpenSettings}
          />
        }
      />

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto pb-24"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Pull-to-refresh indicator */}
        {refreshing && (
          <div className="flex justify-center py-2">
            <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full spin" />
          </div>
        )}

        {/* Progress + date */}
        <DailyProgress
          totalMl={totalToday}
          goalMl={dailyGoal}
          percentage={percentage}
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
          dayStartHour={dayStartHour}
        />

        {/* Cup grid */}
        <div className="py-4">
          <CupGrid
            consumed={cupsConsumed}
            total={totalCups}
            onCupTap={() => isToday && handleAddEntry(cupSize)}
            disabled={isLoading || !isToday}
          />
        </div>

        <div className="flex flex-col gap-4">
          {/* Quick actions — only for today */}
          {isToday && (
            <QuickActions
              onAdd={handleAddEntry}
              onUndo={handleUndo}
              cupSize={cupSize}
              hasEntries={entries.length > 0}
              disabled={isLoading}
            />
          )}

          {/* Today's log */}
          <LogList entries={entries} onDelete={handleRemoveEntry} />

          {/* Weekly chart */}
          <HydrationHistory
            history={weekHistory}
            onDaySelect={setSelectedDate}
            selectedDate={selectedDate}
            dayStartHour={dayStartHour}
          />
        </div>

        <div className="h-4" />
      </div>

      {/* Goal confetti */}
      {goalJustReached && <Confetti onComplete={clearGoalReached} />}
    </div>
  )
}
