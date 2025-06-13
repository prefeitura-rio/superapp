import { Download } from 'lucide-react'
import { useEffect, useState } from 'react'
import { MenuItem } from './menu-item'

const InstallPwaButton = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<Event | null>(null)
  const [isInstallable, setIsInstallable] = useState(false)

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setIsInstallable(true)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    return () =>
      window.removeEventListener(
        'beforeinstallprompt',
        handleBeforeInstallPrompt
      )
  }, [])

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      ;(deferredPrompt as any).prompt()
      const { outcome } = await (deferredPrompt as any).userChoice
      setDeferredPrompt(null)
      setIsInstallable(false)
      console.log(`User response to the install prompt: ${outcome}`)
    }
  }

  return (
    <>
      {isInstallable && (
        <MenuItem
          icon={<Download className="h-5 w-5" />}
          label="Instalar App"
          onClick={handleInstallClick}
        />
      )}
    </>
  )
}

export default InstallPwaButton
