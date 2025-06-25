'use client'

import {
  type ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react'

interface PWAContextType {
  deferredPrompt: any | null
  isInstallable: boolean
  clearPrompt: () => void
}

const PWAContext = createContext<PWAContextType>({
  deferredPrompt: null,
  isInstallable: false,
  clearPrompt: () => {},
})

export const usePWA = () => useContext(PWAContext)

export function PWAProvider({ children }: { children: ReactNode }) {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [isInstallable, setIsInstallable] = useState(false)

  useEffect(() => {
    // Check if app is already installed
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true

    if (isStandalone) {
      // App is already installed
      return
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setIsInstallable(true)
    }

    const handleAppInstalled = () => {
      setDeferredPrompt(null)
      setIsInstallable(false)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener(
        'beforeinstallprompt',
        handleBeforeInstallPrompt
      )
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  const clearPrompt = () => {
    setDeferredPrompt(null)
    setIsInstallable(false)
  }

  return (
    <PWAContext.Provider value={{ deferredPrompt, isInstallable, clearPrompt }}>
      {children}
    </PWAContext.Provider>
  )
}
