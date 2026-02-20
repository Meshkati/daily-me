interface CardProps {
  children: React.ReactNode
  className?: string
  onClick?: () => void
  elevated?: boolean
}

export function Card({ children, className = '', onClick, elevated = false }: CardProps) {
  const base =
    'bg-white dark:bg-[#2b2930] rounded-2xl overflow-hidden'
  const shadow = elevated
    ? 'shadow-lg'
    : 'shadow-sm border border-black/5 dark:border-white/5'
  const interactive = onClick
    ? 'cursor-pointer active:scale-[0.98] transition-transform duration-100'
    : ''

  return (
    <div
      className={`${base} ${shadow} ${interactive} ${className}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
    >
      {children}
    </div>
  )
}
