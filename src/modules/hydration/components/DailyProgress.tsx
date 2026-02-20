import { ProgressRing } from '../../../shared/components/ProgressRing'
import { formatDisplayDate, navigateDate, getTodayDateStr } from '../../../shared/utils/date'
import { motion } from 'framer-motion'

interface DailyProgressProps {
  totalMl: number
  goalMl: number
  percentage: number
  selectedDate: string
  onDateChange: (date: string) => void
  dayStartHour: number
}

export function DailyProgress({
  totalMl,
  goalMl,
  percentage,
  selectedDate,
  onDateChange,
  dayStartHour,
}: DailyProgressProps) {
  const isToday = selectedDate === getTodayDateStr(dayStartHour)

  return (
    <div className="flex flex-col items-center gap-4 px-4 py-2">
      {/* Date navigator */}
      <div className="flex items-center gap-3">
        <button
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-black/5 dark:hover:bg-white/10 active:bg-black/10 transition-colors text-lg"
          onClick={() => onDateChange(navigateDate(selectedDate, -1))}
          aria-label="Previous day"
        >
          ‹
        </button>

        <motion.button
          key={selectedDate}
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-base font-semibold text-on-surface dark:text-on-surface-dark px-2 py-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
          onClick={() => onDateChange(getTodayDateStr(dayStartHour))}
          aria-label="Go to today"
        >
          {formatDisplayDate(selectedDate, dayStartHour)}
        </motion.button>

        <button
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-black/5 dark:hover:bg-white/10 active:bg-black/10 transition-colors text-lg disabled:opacity-30"
          onClick={() => onDateChange(navigateDate(selectedDate, 1))}
          disabled={isToday}
          aria-label="Next day"
        >
          ›
        </button>
      </div>

      {/* Progress ring */}
      <ProgressRing
        percentage={percentage}
        totalMl={totalMl}
        goalMl={goalMl}
      />
    </div>
  )
}
