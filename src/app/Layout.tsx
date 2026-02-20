import { BottomNav, type NavPage } from '../shared/components/BottomNav'

interface LayoutProps {
  currentPage: NavPage
  onNavigate: (page: NavPage) => void
  children: React.ReactNode
}

export function Layout({ currentPage, onNavigate, children }: LayoutProps) {
  return (
    <div className="relative flex flex-col min-h-dvh max-w-lg mx-auto bg-surface dark:bg-surface-dark">
      <main className="flex-1 flex flex-col">{children}</main>
      <BottomNav currentPage={currentPage} onNavigate={onNavigate} />
    </div>
  )
}
