import { motion } from 'framer-motion'

interface ProgressRingProps {
  percentage: number
  totalMl: number
  goalMl: number
  size?: number
  strokeWidth?: number
}

export function ProgressRing({
  percentage,
  totalMl,
  goalMl,
  size = 220,
  strokeWidth = 14,
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const safePercent = Math.min(100, Math.max(0, percentage))
  const offset = circumference * (1 - safePercent / 100)

  const isGoalReached = totalMl >= goalMl
  const trackColor = isGoalReached ? '#2e7d32' : '#1976D2'
  const bgColor = isGoalReached ? '#c8e6c9' : '#d1e4ff'

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          aria-label={`Hydration progress: ${safePercent}%`}
          role="img"
        >
          {/* Background track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={bgColor}
            strokeWidth={strokeWidth}
          />
          {/* Progress arc */}
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={trackColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
            style={{ transformOrigin: 'center', rotate: '-90deg' }}
          />
        </svg>

        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            key={safePercent}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.25 }}
            className="text-4xl font-bold text-on-surface dark:text-on-surface-dark leading-none"
            style={{ color: trackColor }}
          >
            {safePercent}%
          </motion.span>
          <span className="text-sm text-on-surface-muted mt-1">hydrated</span>
        </div>
      </div>

      {/* ml label */}
      <motion.p
        key={totalMl}
        initial={{ y: 4, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-lg font-semibold text-on-surface dark:text-on-surface-dark"
      >
        <span style={{ color: trackColor }}>{totalMl.toLocaleString()}</span>
        <span className="text-on-surface-muted font-normal"> / {goalMl.toLocaleString()} ml</span>
      </motion.p>
    </div>
  )
}
