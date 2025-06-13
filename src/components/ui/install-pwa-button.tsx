'use client'
import { MenuItem } from '@/app/(private)/components/menu-item'
import { Download } from 'lucide-react'
import { useEffect, useState } from 'react'

export function InstallPWAButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<null | any>(null)
  const [isInstalled, setIsInstalled] = useState(false)

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
    const handler = (e: any) => {
      e.preventDefault()
      setDeferredPrompt(e)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => {
      window.removeEventListener('beforeinstallprompt', handler)
    }
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') {
      setDeferredPrompt(null)
    }
  }

  if (isInstalled || !deferredPrompt) return null

  return (
    <MenuItem
      icon={<Download className="h-5 w-5" />}
      label="Instalar aplicativo"
      onClick={handleInstall}
    />
  )
}
