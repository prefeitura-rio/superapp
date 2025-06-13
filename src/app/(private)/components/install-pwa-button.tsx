import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import 'swiper/css'
import 'swiper/css/pagination'
import { Pagination } from 'swiper/modules'
import { Swiper, SwiperSlide } from 'swiper/react'

const iosSlides = [
  {
    title: 'Passo 1',
    description: 'Toque no ícone de compartilhamento no Safari.',
    image: '/ios1.png',
  },
  {
    title: 'Passo 2',
    description: 'Selecione "Adicionar à Tela de Início".',
    image: '/ios2.png',
  },
  {
    title: 'Passo 3',
    description: 'Confirme para adicionar o app à sua tela inicial.',
    image: '/ios3.png',
  },
]

const isIOS = () => {
  if (typeof window === 'undefined' || typeof navigator === 'undefined')
    return false
  return /iphone|ipad|ipod/i.test(navigator.userAgent)
}

const InstallPwaButton = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<Event | null>(null)
  const [isInstallable, setIsInstallable] = useState(false)
  const [showIosDialog, setShowIosDialog] = useState(false)

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
    if (isIOS()) {
      setShowIosDialog(true)
      return
    }
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
        <Button
          // icon={<Download className="h-5 w-5" />}
          // label="Instalar App"
          onClick={handleInstallClick}
        />
      )}
      <Dialog open={showIosDialog} onOpenChange={setShowIosDialog}>
        <DialogContent
          showCloseButton
          className="flex flex-col items-center justify-center"
        >
          <DialogTitle className="text-center w-full">
            Como instalar no iPhone
          </DialogTitle>
          <Swiper
            spaceBetween={30}
            slidesPerView={1}
            pagination={{ clickable: true }}
            modules={[Pagination]}
            className="w-full max-w-xs flex flex-col items-center justify-center"
          >
            {iosSlides.map((slide, idx) => (
              <SwiperSlide key={idx}>
                <div className="flex flex-col items-center justify-center text-center w-full">
                  <div
                    className="mb-4 flex items-center justify-center rounded-lg"
                    style={{ width: 300, height: 300, zIndex: 999 }}
                  >
                    <Image
                      src={slide.image}
                      alt={slide.title}
                      width={300}
                      height={230}
                      style={{
                        objectFit: 'contain',
                        width: '100%',
                        height: '100%',
                      }}
                    />
                  </div>
                  <h2 className="text-lg text-foreground font-semibold mb-2">
                    {slide.title}
                  </h2>
                  <p className="text-base text-black mb-6 pb-6">
                    {slide.description}
                  </p>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
          <style jsx global>{`
            .swiper-pagination {
              display: flex;
              justify-content: center;
              gap: 0.5rem;
            }
            .swiper-pagination-bullet {
              width: 16px;
              height: 3px;
              border-radius: 9999px;
              background: #19191b;
              opacity: 1;
              transition: background 0.2s;
              margin: 0 !important;
            }
            .swiper-pagination-bullet-active {
              background: #8ecaff;
            }
          `}</style>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default InstallPwaButton
