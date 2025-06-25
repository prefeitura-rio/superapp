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
      e.preventDefault()
      setDeferredPrompt(e)
      setIsInstallable(true)

      // Automatically show install prompt after a short delay
      // Only if we haven't shown it automatically yet in this session
      if (!hasShownAutoPrompt) {
        setTimeout(() => {
          if (!hasShownAutoPrompt) {
            setHasShownAutoPrompt(true)

            // Check if we're on iOS
            const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent)

            if (!isIOS && e && typeof (e as any).prompt === 'function') {
              // Show native install prompt for supported browsers
              ;(e as any).prompt()
              ;(e as any).userChoice.then((choiceResult: any) => {
                console.log(
                  `Auto-install prompt result: ${choiceResult.outcome}`
                )
                if (choiceResult.outcome === 'accepted') {
                  setDeferredPrompt(null)
                  setIsInstallable(false)
                }
              })
            }
            // For iOS, we'll let the manual button handle the custom dialog
          }
        }, 2000) // Show after 2 seconds
      }
    }

    const handleAppInstalled = () => {
      setDeferredPrompt(null)
      setIsInstallable(false)
      setHasShownAutoPrompt(true)
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
