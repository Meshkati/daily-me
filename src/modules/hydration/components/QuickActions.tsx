import { useState } from 'react'
import { FAB } from '../../../shared/components/FAB'
import { motion, AnimatePresence } from 'framer-motion'

interface QuickActionsProps {
  onAdd: (ml: number) => void
  onUndo: () => void
  cupSize: number
  hasEntries: boolean
  disabled?: boolean
}

export function QuickActions({
  onAdd,
  onUndo,
  cupSize,
  hasEntries,
  disabled = false,
}: QuickActionsProps) {
  const [showCustom, setShowCustom] = useState(false)
  const [customValue, setCustomValue] = useState('')

  const handleCustomSubmit = () => {
    const ml = parseInt(customValue, 10)
    if (!isNaN(ml) && ml > 0 && ml <= 5000) {
      onAdd(ml)
      setCustomValue('')
      setShowCustom(false)
    }
  }

  return (
    <div className="px-4 flex flex-col gap-3">
      {/* Primary actions row */}
      <div className="flex gap-2 flex-wrap">
        <FAB
          label={`+ Cup (${cupSize}ml)`}
          icon="💧"
          onClick={() => onAdd(cupSize)}
          variant="primary"
          disabled={disabled}
          className="flex-1 min-w-0"
        />
        <FAB
          label="+ Glass (500ml)"
          icon="🥛"
          onClick={() => onAdd(500)}
          variant="secondary"
          disabled={disabled}
          className="flex-1 min-w-0"
        />
      </div>

      {/* Secondary actions row */}
      <div className="flex gap-2">
        <FAB
          label="Custom"
          icon="✏️"
          onClick={() => setShowCustom(!showCustom)}
          variant="surface"
          size="small"
          className="flex-1"
        />
        <FAB
          label="Undo last"
          icon="↩️"
          onClick={onUndo}
          variant="surface"
          size="small"
          disabled={!hasEntries}
          className="flex-1"
        />
      </div>

      {/* Custom amount input */}
      <AnimatePresence>
        {showCustom && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="flex gap-2 items-center bg-white dark:bg-[#2b2930] rounded-2xl p-3 shadow-sm border border-black/5 dark:border-white/5">
              <input
                type="number"
                value={customValue}
                onChange={(e) => setCustomValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCustomSubmit()}
                placeholder="Amount in ml..."
                min={1}
                max={5000}
                className="flex-1 bg-transparent text-sm text-on-surface dark:text-on-surface-dark placeholder:text-on-surface-muted outline-none"
                autoFocus
                aria-label="Custom amount in ml"
              />
              <span className="text-sm text-on-surface-muted">ml</span>
              <button
                className="px-3 py-1.5 bg-primary text-on-primary text-sm font-semibold rounded-xl active:opacity-80 transition-opacity"
                onClick={handleCustomSubmit}
              >
                Add
              </button>
              <button
                className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-on-surface-muted"
                onClick={() => {
                  setShowCustom(false)
                  setCustomValue('')
                }}
                aria-label="Cancel"
              >
                ✕
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
