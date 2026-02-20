import { useEffect, useState } from 'react'
import { Toaster } from 'react-hot-toast'
import { AnimatePresence, motion } from 'framer-motion'
import { Layout } from './Layout'
import type { NavPage } from '../shared/components/BottomNav'
import { HydrationPage } from '../modules/hydration/components/HydrationPage'
import { SettingsPage } from '../modules/settings/SettingsPage'
import { useSettingsStore } from '../modules/hydration/store/settingsStore'
import { useServiceWorker } from '../shared/hooks/useServiceWorker'

const PAGE_ORDER: NavPage[] = ['home', 'history', 'settings']

export function App() {
  const [currentPage, setCurrentPage] = useState<NavPage>('home')
  const [prevPage, setPrevPage] = useState<NavPage>('home')

  const { theme, loadSettings } = useSettingsStore()

  useServiceWorker()

  // Load settings on boot; HydrationPage handles its own data loading
  useEffect(() => {
    loadSettings()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Apply theme
  useEffect(() => {
    const root = document.documentElement
    if (theme === 'dark') {
      root.classList.add('dark')
    } else if (theme === 'light') {
      root.classList.remove('dark')
    } else {
      // system
      const mq = window.matchMedia('(prefers-color-scheme: dark)')
      root.classList.toggle('dark', mq.matches)
      const handler = (e: MediaQueryListEvent) =>
        root.classList.toggle('dark', e.matches)
      mq.addEventListener('change', handler)
      return () => mq.removeEventListener('change', handler)
    }
  }, [theme])

  const handleNavigate = (page: NavPage) => {
    setPrevPage(currentPage)
    setCurrentPage(page)
  }

  const handleOpenSettings = () => handleNavigate('settings')
  const handleBack = () => handleNavigate('home')

  // Slide direction
  const currentIdx = PAGE_ORDER.indexOf(currentPage)
  const prevIdx = PAGE_ORDER.indexOf(prevPage)
  const direction = currentIdx >= prevIdx ? 1 : -1

  return (
    <>
      <Layout currentPage={currentPage} onNavigate={handleNavigate}>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={currentPage}
            className="flex-1 flex flex-col"
            initial={{ x: direction * 30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: direction * -30, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
          >
            {currentPage === 'home' && (
              <HydrationPage onOpenSettings={handleOpenSettings} />
            )}
            {currentPage === 'history' && (
              <HydrationPage onOpenSettings={handleOpenSettings} />
            )}
            {currentPage === 'settings' && (
              <SettingsPage onBack={handleBack} />
            )}
          </motion.div>
        </AnimatePresence>
      </Layout>

      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            borderRadius: '12px',
            fontSize: '14px',
            fontWeight: 500,
            maxWidth: '320px',
          },
          success: {
            style: {
              background: '#2E7D32',
              color: '#fff',
            },
          },
          error: {
            style: {
              background: '#B3261E',
              color: '#fff',
            },
          },
        }}
      />
    </>
  )
}
