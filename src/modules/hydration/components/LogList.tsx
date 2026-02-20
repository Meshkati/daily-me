import { useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { HydrationLog } from '../types'
import { formatTime } from '../../../shared/utils/date'
import { DRINK_TYPE_ICONS } from '../constants'

interface LogItemProps {
  entry: HydrationLog
  onDelete: (id: string) => void
}

function LogItem({ entry, onDelete }: LogItemProps) {
  const [swipeX, setSwipeX] = useState(0)
  const [swiping, setSwiping] = useState(false)
  const startXRef = useRef(0)
  const isDraggingRef = useRef(false)

  const handlePointerDown = (e: React.PointerEvent) => {
    startXRef.current = e.clientX
    isDraggingRef.current = false
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    const dx = e.clientX - startXRef.current
    if (Math.abs(dx) > 8) {
      isDraggingRef.current = true
      setSwiping(true)
      if (dx < 0) {
        setSwipeX(Math.max(dx, -80))
      } else {
        setSwipeX(Math.min(dx, 0))
      }
    }
  }

  const handlePointerUp = () => {
    if (swipeX < -60) {
      onDelete(entry.id)
    } else {
      setSwipeX(0)
    }
    setSwiping(false)
    isDraggingRef.current = false
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -80, height: 0 }}
      transition={{ duration: 0.2 }}
      className="relative overflow-hidden"
    >
      {/* Delete bg */}
      <div className="absolute inset-y-0 right-0 w-20 flex items-center justify-center bg-error/90 rounded-r-xl">
        <span className="text-white text-sm font-medium">Delete</span>
      </div>

      {/* Item */}
      <div
        className={`relative flex items-center gap-3 px-4 py-3 bg-white dark:bg-[#2b2930] transition-transform swipe-item ${swiping ? '' : 'transition-[transform] duration-200'}`}
        style={{ transform: `translateX(${swipeX}px)` }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      >
        <div className="text-xl w-8 text-center flex-shrink-0">
          {DRINK_TYPE_ICONS[entry.type]}
        </div>
        <div className="flex-1 min-w-0">
          <span className="text-sm font-semibold text-on-surface dark:text-on-surface-dark">
            +{entry.amount_ml} ml
          </span>
          <span className="text-xs text-on-surface-muted ml-2">
            {entry.type}
          </span>
        </div>
        <span className="text-xs text-on-surface-muted flex-shrink-0">
          {formatTime(entry.timestamp)}
        </span>
      </div>
    </motion.div>
  )
}

interface LogListProps {
  entries: HydrationLog[]
  onDelete: (id: string) => void
}

export function LogList({ entries, onDelete }: LogListProps) {
  if (entries.length === 0) {
    return (
      <div className="px-4 py-6 text-center text-on-surface-muted text-sm">
        No entries yet — tap a cup or use the quick actions below
      </div>
    )
  }

  const sorted = [...entries].sort((a, b) => b.timestamp - a.timestamp)

  return (
    <div className="px-4">
      <h2 className="text-xs font-semibold text-on-surface-muted uppercase tracking-wider mb-2">
        Today's Log
      </h2>
      <div className="bg-white dark:bg-[#2b2930] rounded-2xl overflow-hidden shadow-sm border border-black/5 dark:border-white/5 divide-y divide-black/5 dark:divide-white/5">
        <AnimatePresence initial={false}>
          {sorted.map((entry) => (
            <LogItem key={entry.id} entry={entry} onDelete={onDelete} />
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}
