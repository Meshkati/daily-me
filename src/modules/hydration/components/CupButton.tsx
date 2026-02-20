import { motion } from 'framer-motion'

interface CupButtonProps {
  filled: boolean
  index: number
  onTap: () => void
  disabled?: boolean
}

export function CupButton({ filled, index, onTap, disabled = false }: CupButtonProps) {
  return (
    <motion.button
      className="relative flex flex-col items-center justify-end cursor-pointer select-none disabled:cursor-not-allowed"
      whileTap={{ scale: filled ? 1 : 0.85 }}
      transition={{ duration: 0.1 }}
      onClick={() => {
        if (!filled && !disabled) {
          if (navigator.vibrate) navigator.vibrate(40)
          onTap()
        }
      }}
      disabled={disabled}
      aria-label={filled ? `Cup ${index + 1} filled` : `Tap to fill cup ${index + 1}`}
      style={{ width: 36, height: 44 }}
    >
      {/* Cup shape */}
      <div className="relative w-8 h-9 overflow-hidden">
        {/* Cup outline */}
        <svg
          viewBox="0 0 32 36"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="absolute inset-0 w-full h-full"
        >
          {/* Cup body */}
          <path
            d="M4 2 L6 34 Q6 34 16 34 Q26 34 26 34 L28 2 Z"
            stroke={filled ? '#1976D2' : '#c0c4cc'}
            strokeWidth="2"
            fill={filled ? '#d1e4ff' : 'transparent'}
            strokeLinejoin="round"
          />
          {/* Water fill */}
          {filled && (
            <motion.path
              d="M6.5 34 Q6.5 34 16 34 Q25.5 34 25.5 34 L22 12 Q16 10 10 12 Z"
              fill="#1976D2"
              initial={{ scaleY: 0, originY: '100%' }}
              animate={{ scaleY: 1 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              style={{ transformOrigin: 'bottom center' }}
            />
          )}
        </svg>
      </div>
    </motion.button>
  )
}

interface CupGridProps {
  consumed: number
  total: number
  onCupTap: () => void
  disabled?: boolean
}

export function CupGrid({ consumed, total, onCupTap, disabled = false }: CupGridProps) {
  const cups = Math.max(total, consumed)

  return (
    <div
      className="flex flex-wrap justify-center gap-2 px-4"
      role="group"
      aria-label={`${consumed} of ${total} cups consumed`}
    >
      {Array.from({ length: cups }, (_, i) => (
        <CupButton
          key={i}
          index={i}
          filled={i < consumed}
          onTap={onCupTap}
          disabled={disabled || i < consumed}
        />
      ))}
    </div>
  )
}
