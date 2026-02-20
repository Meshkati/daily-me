import { useMemo, useEffect } from 'react'
import { motion } from 'framer-motion'

interface Particle {
  id: number
  left: number
  delay: number
  duration: number
  width: number
  height: number
  color: string
  rotation: number
}

interface ConfettiProps {
  onComplete?: () => void
}

const COLORS = [
  '#1976D2', '#00ACC1', '#2E7D32', '#F9A825', '#E91E63',
  '#9C27B0', '#FF5722', '#4CAF50', '#03A9F4', '#FFC107',
]

export function Confetti({ onComplete }: ConfettiProps) {
  const particles = useMemo<Particle[]>(() =>
    Array.from({ length: 60 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 1.2,
      duration: 2.2 + Math.random() * 1.5,
      width: 6 + Math.random() * 8,
      height: 4 + Math.random() * 6,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      rotation: Math.random() * 360,
    })),
    []
  )

  const maxDuration = Math.max(...particles.map((p) => p.delay + p.duration))

  useEffect(() => {
    if (!onComplete) return
    const timer = setTimeout(onComplete, (maxDuration + 0.5) * 1000)
    return () => clearTimeout(timer)
  }, [onComplete, maxDuration])

  return (
    <div
      className="fixed inset-0 pointer-events-none overflow-hidden z-50"
      aria-hidden="true"
    >
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-sm"
          style={{
            left: `${p.left}%`,
            top: -20,
            width: p.width,
            height: p.height,
            backgroundColor: p.color,
          }}
          animate={{
            y: ['0vh', '115vh'],
            rotate: [p.rotation, p.rotation + 540 + Math.random() * 360],
            opacity: [1, 1, 0.8, 0],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            ease: 'easeIn',
          }}
        />
      ))}
    </div>
  )
}
