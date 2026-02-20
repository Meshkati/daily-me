import { motion } from 'framer-motion'

interface FABProps {
  label: string
  icon?: string
  onClick: () => void
  variant?: 'primary' | 'secondary' | 'surface'
  size?: 'normal' | 'small'
  disabled?: boolean
  className?: string
}

const variantStyles = {
  primary: 'bg-primary text-on-primary shadow-lg hover:shadow-xl',
  secondary: 'bg-primary-container text-on-primary-container shadow-md hover:shadow-lg',
  surface: 'bg-white dark:bg-[#2b2930] text-on-surface dark:text-on-surface-dark shadow-md hover:shadow-lg border border-black/10 dark:border-white/10',
}

const sizeStyles = {
  normal: 'h-14 px-5 gap-2 text-sm font-semibold rounded-2xl',
  small: 'h-10 px-4 gap-1.5 text-xs font-semibold rounded-xl',
}

export function FAB({
  label,
  icon,
  onClick,
  variant = 'primary',
  size = 'normal',
  disabled = false,
  className = '',
}: FABProps) {
  return (
    <motion.button
      whileTap={{ scale: 0.94 }}
      transition={{ duration: 0.1 }}
      className={`
        inline-flex items-center justify-center
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        transition-shadow duration-200
        disabled:opacity-40 disabled:cursor-not-allowed
        select-none cursor-pointer
        ${className}
      `}
      onClick={() => {
        if (!disabled) {
          if (navigator.vibrate) navigator.vibrate(50)
          onClick()
        }
      }}
      disabled={disabled}
      aria-label={label}
    >
      {icon && <span className="text-base leading-none">{icon}</span>}
      <span>{label}</span>
    </motion.button>
  )
}
