interface HeaderProps {
  title: string
  subtitle?: string
  leftAction?: React.ReactNode
  rightAction?: React.ReactNode
}

export function Header({ title, subtitle, leftAction, rightAction }: HeaderProps) {
  return (
    <header className="flex items-center justify-between px-4 pt-safe pb-2 bg-white/80 dark:bg-[#1c1b1f]/80 backdrop-blur-sm sticky top-0 z-10 min-h-14">
      <div className="flex items-center gap-2">
        {leftAction}
        <div>
          <h1 className="text-lg font-semibold text-on-surface dark:text-on-surface-dark leading-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="text-xs text-on-surface-muted">{subtitle}</p>
          )}
        </div>
      </div>
      {rightAction && (
        <div className="flex items-center gap-1">{rightAction}</div>
      )}
    </header>
  )
}

interface IconButtonProps {
  icon: string
  label: string
  onClick: () => void
  badge?: boolean
}

export function IconButton({ icon, label, onClick, badge = false }: IconButtonProps) {
  return (
    <button
      className="relative w-10 h-10 flex items-center justify-center rounded-full hover:bg-black/5 dark:hover:bg-white/10 active:bg-black/10 dark:active:bg-white/20 transition-colors text-xl"
      onClick={onClick}
      aria-label={label}
    >
      {icon}
      {badge && (
        <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary" />
      )}
    </button>
  )
}
