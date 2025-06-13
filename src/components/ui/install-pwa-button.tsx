'use client'
import { MenuItem } from '@/app/(private)/components/menu-item'
import { Download } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

function isIOS() {
  if (typeof window === 'undefined') return false
  return /iPhone|iPad|iPod/i.test(window.navigator.userAgent)
}

function isFirefox() {
  if (typeof window === 'undefined') return false
  return /firefox/i.test(window.navigator.userAgent)
}

export function InstallPWAButton() {
  const deferredPrompt = useRef<any>(null)
  const [isInstalled, setIsInstalled] = useState(false)
  const [canInstall, setCanInstall] = useState(false)
  const [showIOSInstructions, setShowIOSInstructions] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // Check if app is already installed
    const checkInstalled = () => {
      if (
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone
      ) {
        setIsInstalled(true)
      }
    }

    checkInstalled()

    const installedListener = () => setIsInstalled(true)
    window.addEventListener('appinstalled', installedListener)

    return () => {
      window.removeEventListener('appinstalled', installedListener)
    }
  }, [])

  useEffect(() => {
    if (isIOS()) {
      setShowIOSInstructions(true)
      return
    }

    const handler = (e: any) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault()
      // Stash the event so it can be triggered later
      deferredPrompt.current = e
      // Update UI to notify the user they can install the PWA
      setCanInstall(true)
    }

    window.addEventListener('beforeinstallprompt', handler)

    // For Firefox, we need to check if the PWA meets installation criteria
    if (isFirefox()) {
      // Firefox may not trigger beforeinstallprompt, so we check directly
      const checkInstallable = async () => {
        try {
          // @ts-ignore - Firefox has this method
          const result = await window.navigator.getInstalledRelatedApps()
          if (result.length === 0) {
            setCanInstall(true)
          }
        } catch (error) {
          console.log('Firefox install check failed', error)
          // If the check fails, we'll still show the button
          setCanInstall(true)
        }
      }
      checkInstallable()
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handler)
    }
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt.current) {
      // For browsers that don't support beforeinstallprompt
      // or when the event isn't fired (like Firefox sometimes)
      if (isFirefox()) {
        // Firefox has its own installation prompt
        // @ts-ignore
        window.navigator.mozApps?.install()
        return
      }
      return
    }

    setIsLoading(true)
    try {
      // Show the install prompt
      deferredPrompt.current.prompt()

      // Wait for the user to respond to the prompt
      const { outcome } = await deferredPrompt.current.userChoice

      if (outcome === 'accepted') {
        console.log('User accepted the install prompt')
      } else {
        console.log('User dismissed the install prompt')
      }

      // We've used the prompt, and can't use it again
      deferredPrompt.current = null
      setCanInstall(false)
    } catch (error) {
      console.error('Error during installation:', error)
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

  if (!canInstall) return null

  return (
    <MenuItem
      icon={<Download className="h-5 w-5" />}
      label="Instalar aplicativo"
      onClick={handleInstall}
      // disabled={isLoading}
    />
  )
}
