import { motion } from 'framer-motion'

export type NavPage = 'home' | 'history' | 'settings'

interface NavItem {
  id: NavPage
  label: string
  icon: string
  activeIcon: string
}

const NAV_ITEMS: NavItem[] = [
  { id: 'home', label: 'Today', icon: '💧', activeIcon: '💧' },
  { id: 'history', label: 'History', icon: '📅', activeIcon: '📅' },
  { id: 'settings', label: 'Settings', icon: '⚙️', activeIcon: '⚙️' },
]

interface BottomNavProps {
  currentPage: NavPage
  onNavigate: (page: NavPage) => void
}

export function BottomNav({ currentPage, onNavigate }: BottomNavProps) {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 max-w-lg mx-auto bg-white/90 dark:bg-[#1c1b1f]/90 backdrop-blur-md border-t border-black/5 dark:border-white/5 pb-safe z-20"
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="flex items-stretch h-16">
        {NAV_ITEMS.map((item) => {
          const isActive = currentPage === item.id
          return (
            <button
              key={item.id}
              className="flex-1 flex flex-col items-center justify-center gap-0.5 relative transition-colors"
              onClick={() => onNavigate(item.id)}
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
            >
              {isActive && (
                <motion.div
                  layoutId="nav-indicator"
                  className="absolute top-1 left-1/2 -translate-x-1/2 w-12 h-1 rounded-full bg-primary"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <span className={`text-2xl leading-none transition-all duration-200 ${isActive ? 'scale-110' : 'opacity-60'}`}>
                {isActive ? item.activeIcon : item.icon}
              </span>
              <span
                className={`text-[10px] font-medium transition-colors duration-200 ${
                  isActive
                    ? 'text-primary'
                    : 'text-on-surface-muted'
                }`}
              >
                {item.label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
