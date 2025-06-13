'use client'
import { MenuItem } from '@/app/(private)/components/menu-item'
import { Download } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

function isIOS() {
  if (typeof window === 'undefined') return false
  return /iPhone|iPad|iPod/i.test(window.navigator.userAgent)
}

function isStandalone() {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone
  )
}

export function InstallPWAButton() {
  const deferredPrompt = useRef<BeforeInstallPromptEvent | null>(null)
  const [showInstallButton, setShowInstallButton] = useState(false)
  const [showIOSInstructions, setShowIOSInstructions] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Type for the BeforeInstallPromptEvent
  interface BeforeInstallPromptEvent extends Event {
    readonly platforms: string[]
    readonly userChoice: Promise<{
      outcome: 'accepted' | 'dismissed'
      platform: string
    }>
    prompt(): Promise<void>
  }

  useEffect(() => {
    // Check if already installed
    if (isStandalone()) {
      setIsInstalled(true)
      return
    }

    // iOS specific handling
    if (isIOS()) {
      setShowIOSInstructions(true)
      return
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault()
      // Stash the event so it can be triggered later
      deferredPrompt.current = e as BeforeInstallPromptEvent
      setShowInstallButton(true)
    }

    const handleAppInstalled = () => {
      setIsInstalled(true)
      setShowInstallButton(false)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    // For browsers that don't support beforeinstallprompt but might be installable
    const timer = setTimeout(() => {
      if (!deferredPrompt.current && !isStandalone() && !isIOS()) {
        // Check if we meet PWA criteria
        if (
          window.matchMedia('(display-mode: standalone)').matches ||
          (window.navigator as any).standalone
        ) {
          setIsInstalled(true)
        } else {
          // Last chance - some browsers might not fire the event immediately
          setShowInstallButton(true)
        }
      }
    }, 3000)

    return () => {
      window.removeEventListener(
        'beforeinstallprompt',
        handleBeforeInstallPrompt
      )
      window.removeEventListener('appinstalled', handleAppInstalled)
      clearTimeout(timer)
    }
  }, [])

  const handleInstallClick = async () => {
    if (!deferredPrompt.current) {
      console.log('No deferred prompt available')
      return
    }

    setIsLoading(true)
    try {
      console.log('Showing install prompt')
      // Show the install prompt
      await deferredPrompt.current.prompt()

      // Wait for the user to respond to the prompt
      const { outcome } = await deferredPrompt.current.userChoice

      console.log(`User response to the install prompt: ${outcome}`)

      // We've used the prompt, and can't use it again
      deferredPrompt.current = null
      setShowInstallButton(false)
    } catch (error) {
      console.error('Error showing install prompt:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isInstalled) return null

  if (showIOSInstructions) {
    return (
      <div className="p-4 border rounded-md bg-background text-foreground mb-4">
        <div className="flex items-center gap-2 mb-2">
          <Download className="h-5 w-5 text-primary" />
          <span className="font-semibold">Instalar aplicativo</span>
        </div>
        <ol className="list-decimal list-inside text-sm mb-2">
          <li>
            Toque no botão <b>Compartilhar</b> no Safari.
          </li>
          <li>
            Role para baixo e selecione <b>Adicionar à Tela de Início</b>.
          </li>
          <li>Siga as instruções na tela.</li>
        </ol>
        <button
          type="button"
          className="mt-2 px-3 py-1 bg-primary text-white rounded"
          onClick={() => setShowIOSInstructions(false)}
        >
          Entendi
        </button>
      </div>
    )
  }

  if (!showInstallButton) return null

  return (
    <MenuItem
      icon={<Download className="h-5 w-5" />}
      label="Instalar aplicativo"
      onClick={handleInstallClick}
    />
  )
}
