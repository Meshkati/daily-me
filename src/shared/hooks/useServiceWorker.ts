import { useRegisterSW } from 'virtual:pwa-register/react'
import { useEffect } from 'react'
import toast from 'react-hot-toast'

export function useServiceWorker() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      if (r) console.log('[SW] Registered:', r.scope)
    },
    onRegisterError(error) {
      console.error('[SW] Registration error:', error)
    },
  })

  useEffect(() => {
    if (!needRefresh) return

    const toastId = toast('New version available — tap to update', {
      duration: Infinity,
      icon: '🔄',
      style: { cursor: 'pointer' },
    })

    const handleClick = () => {
      updateServiceWorker(true)
      toast.dismiss(toastId)
    }

    document.addEventListener('click', handleClick, { once: true })
    return () => {
      document.removeEventListener('click', handleClick)
      setNeedRefresh(false)
    }
  }, [needRefresh, updateServiceWorker, setNeedRefresh])

  return { needRefresh }
}
