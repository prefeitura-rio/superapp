'use client'
import { MenuItem } from '@/app/(private)/components/menu-item'
import { Download } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

function isIOS() {
  if (typeof window === 'undefined') return false
  return /iPhone|iPad|iPod/i.test(window.navigator.userAgent)
}

export function InstallPWAButton() {
  const deferredPrompt = useRef<any>(null)
  const [isInstalled, setIsInstalled] = useState(false)
  const [canInstall, setCanInstall] = useState(false)
  const [showIOSInstructions, setShowIOSInstructions] = useState(false)

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
    window.addEventListener('appinstalled', () => setIsInstalled(true))
    return () => {
      window.removeEventListener('appinstalled', () => setIsInstalled(true))
    }
  }, [])

  useEffect(() => {
    if (isIOS()) {
      setShowIOSInstructions(true)
      return
    }
    const handler = (e: any) => {
      e.preventDefault()
      deferredPrompt.current = e
      setCanInstall(true)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => {
      window.removeEventListener('beforeinstallprompt', handler)
    }
  }, [])

  // Use a direct user gesture and do not update state until after prompt resolves
  const handleInstall = () => {
    if (!deferredPrompt.current) return
    deferredPrompt.current.prompt()
    deferredPrompt.current.userChoice.then(({ outcome }: any) => {
      if (outcome === 'accepted') {
        setTimeout(() => {
          deferredPrompt.current = null
          setCanInstall(false)
        }, 1000) // Delay state update to avoid closing dialog
      }
    })
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
    />
  )
}
