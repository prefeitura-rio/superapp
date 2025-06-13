import { Button } from '@/components/ui/button'
import { useEffect, useState } from 'react'

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
        <Button onClick={handleInstallClick} className="bg-black">
          Install App
        </Button>
      )}
    </>
  )
}

export default InstallPwaButton
