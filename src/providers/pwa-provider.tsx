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
  const [hasShownAutoPrompt, setHasShownAutoPrompt] = useState(false)

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
      // Check if we want to show automatically and haven't shown yet
      const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent)

      if (!hasShownAutoPrompt && !isIOS) {
        // Don't prevent default, let the browser show it automatically
        setHasShownAutoPrompt(true)
        setIsInstallable(true)
        console.log('Allowing browser to show automatic install prompt')
        return
      }

      // For subsequent times or manual control, prevent default and store
      e.preventDefault()
      setDeferredPrompt(e)
      setIsInstallable(true)
      console.log('Install prompt deferred for manual triggering')
    }

    const handleAppInstalled = () => {
      setDeferredPrompt(null)
      setIsInstallable(false)
      setHasShownAutoPrompt(true)
      console.log('App installed successfully')
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
  }, [hasShownAutoPrompt])

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
