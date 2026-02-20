import type { DailySummary } from '../types'
import { formatDayLabel } from '../../../shared/utils/date'
import { motion } from 'framer-motion'

interface HydrationHistoryProps {
  history: (DailySummary | null)[]
  onDaySelect: (date: string) => void
  selectedDate: string
  dayStartHour: number
}

export function HydrationHistory({
  history,
  onDaySelect,
  selectedDate,
  dayStartHour,
}: HydrationHistoryProps) {
  if (history.length === 0) return null

  const maxMl = Math.max(...history.map((s) => s?.total_ml ?? 0), 1)

  return (
    <div className="px-4">
      <h2 className="text-xs font-semibold text-on-surface-muted uppercase tracking-wider mb-3">
        Last 7 Days
      </h2>
      <div className="flex items-end gap-1.5 h-20" role="list" aria-label="Weekly hydration history">
        {history.map((summary, i) => {
          if (!summary) return null
          const heightPct = Math.round((summary.total_ml / maxMl) * 100)
          const isGoalReached = summary.goal_reached
          const isSelected = summary.date === selectedDate

          return (
            <motion.button
              key={summary.date}
              initial={{ scaleY: 0 }}
              animate={{ scaleY: 1 }}
              transition={{ delay: i * 0.05, duration: 0.3, ease: 'easeOut' }}
              style={{ transformOrigin: 'bottom' }}
              className="flex-1 flex flex-col items-center gap-1 group"
              onClick={() => onDaySelect(summary.date)}
              aria-label={`${formatDayLabel(summary.date, dayStartHour)}: ${summary.total_ml}ml`}
              role="listitem"
            >
              {/* Bar */}
              <div className="w-full flex items-end justify-center" style={{ height: 64 }}>
                <div
                  className={`
                    w-full rounded-t-md transition-all duration-300
                    ${isGoalReached
                      ? 'bg-success opacity-90'
                      : 'bg-primary opacity-70'
                    }
                    ${isSelected ? 'opacity-100 ring-2 ring-offset-1 ring-primary' : ''}
                    group-hover:opacity-100
                  `}
                  style={{ height: `${Math.max(heightPct, summary.total_ml > 0 ? 4 : 0)}%` }}
                />
              </div>

              {/* Day label */}
              <span
                className={`text-[9px] font-medium ${
                  isSelected
                    ? 'text-primary font-bold'
                    : 'text-on-surface-muted'
                }`}
              >
                {formatDayLabel(summary.date, dayStartHour)}
              </span>
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
