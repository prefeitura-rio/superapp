'use client'
import { MenuItem } from '@/app/(private)/components/menu-item'
import { Download } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

export function InstallPWAButton() {
  const deferredPrompt = useRef<any>(null)
  const [isInstalled, setIsInstalled] = useState(false)
  const [canInstall, setCanInstall] = useState(false)

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
      deferredPrompt.current = e
      setCanInstall(true)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => {
      window.removeEventListener('beforeinstallprompt', handler)
    }
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt.current) return
    deferredPrompt.current.prompt()
    const { outcome } = await deferredPrompt.current.userChoice
    if (outcome === 'accepted') {
      deferredPrompt.current = null
      setCanInstall(false)
    }
  }

  if (isInstalled || !canInstall) return null

  return (
    <MenuItem
      icon={<Download className="h-5 w-5" />}
      label="Instalar aplicativo"
      onClick={handleInstall}
    />
  )
}
