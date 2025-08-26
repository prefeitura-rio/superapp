import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { usePWA } from '@/providers/pwa-provider'
import { sendGAEvent } from '@next/third-parties/google'
import { Download } from 'lucide-react'
import Image from 'next/image'
import { useState } from 'react'
import 'swiper/css'
import 'swiper/css/pagination'
import { SwiperSlide } from 'swiper/react'
import { SwiperWrapper } from '../../components/ui/custom/swiper-wrapper'
import { MenuItem } from './menu-item'

const iosSlides = [
  {
    title: 'Passo 1',
    description: 'Toque no ícone de compartilhamento no Safari.',
    image: '/safari-1.png',
  },
  {
    title: 'Passo 2',
    description: 'Selecione "Adicionar à Tela de Início".',
    image: '/safari-2.png',
  },
  {
    title: 'Passo 3',
    description: 'Confirme para adicionar o app à sua tela inicial.',
    image: '/ios-add.png',
  },
]

const chromeSlides = [
  {
    title: 'Passo 1',
    description: 'Toque no ícone de compartilhamento no Chrome.',
    image: '/chrome-1.png',
  },
  {
    title: 'Passo 2',
    description: 'Selecione "Adicionar à Tela de Início".',
    image: '/chrome-2.png',
  },
  {
    title: 'Passo 3',
    description: 'Confirme para adicionar o app à sua tela inicial.',
    image: '/ios-add.png',
  },
]

const isIOS = () => {
  if (typeof window === 'undefined' || typeof navigator === 'undefined')
    return false
  return /iphone|ipad|ipod/i.test(navigator.userAgent)
}

const isSafariIOS = () => {
  if (typeof window === 'undefined' || typeof navigator === 'undefined')
    return false

  const userAgent = navigator.userAgent.toLowerCase()
  const isIOSDevice = /iphone|ipad|ipod/i.test(userAgent)
  const isSafari =
    /safari/i.test(userAgent) && !/chrome|crios|fxios|opios/i.test(userAgent)

  return isIOSDevice && isSafari
}

const isChromeIOS = () => {
  if (typeof window === 'undefined' || typeof navigator === 'undefined')
    return false

  const userAgent = navigator.userAgent.toLowerCase()
  const isIOSDevice = /iphone|ipad|ipod/i.test(userAgent)
  const isChrome = /crios/i.test(userAgent)

  return isIOSDevice && isChrome
}

const InstallPwaButton = () => {
  const { deferredPrompt, isInstallable, clearPrompt } = usePWA()
  const [showIosDialog, setShowIosDialog] = useState(false)

  const handleInstallClick = async () => {
    sendGAEvent('event', 'PWA_button_click', {
      event_timestamp: new Date().toISOString(),
    })

    if (isChromeIOS() || isSafariIOS()) {
      setShowIosDialog(true)
      return
    }

    if (deferredPrompt) {
      try {
        deferredPrompt.prompt()
        const { outcome } = await deferredPrompt.userChoice
        console.log(`Manual install prompt result: ${outcome}`)
        if (outcome === 'accepted') {
          sendGAEvent('event', 'PWA_install_accept', {
            event_timestamp: new Date().toISOString(),
          })
          clearPrompt()
        } else {
          sendGAEvent('event', 'PWA_install_reject', {
            event_timestamp: new Date().toISOString(),
          })
        }
      } catch (error) {
        console.error('Error showing install prompt:', error)
        clearPrompt()
      }
    }
  }

  const shouldShowButton = isInstallable || isIOS()

  const getSlides = () => {
    if (isSafariIOS()) {
      return iosSlides
    }
    if (isChromeIOS()) {
      return chromeSlides
    }
    return chromeSlides
  }

  return (
    <>
      {shouldShowButton && (
        <MenuItem
          icon={<Download className="h-5 w-5" />}
          label="Instalar App"
          onClick={handleInstallClick}
        />
      )}

      <Dialog open={showIosDialog} onOpenChange={setShowIosDialog}>
        <DialogContent
          showCloseButton
          className="flex flex-col items-center justify-center mx-1"
        >
          <DialogTitle className="w-full text-center text-2xl font-semibold tracking-tight mb-0">
            Como instalar no iPhone
          </DialogTitle>

          <div className="relative w-full">
            <SwiperWrapper
              spaceBetween={30}
              slidesPerView={1}
              showArrows={true}
              className="flex flex-col items-center justify-center course__install-ios__slider"
            >
              {getSlides().map((slide, idx) => (
                <SwiperSlide key={idx}>
                  <div className="w-full flex justify-center">
                    <div className="w-[280px] text-center">
                      <div className="w-full flex justify-center items-center h-6 mb-3">
                        <span className="inline-flex h-6 items-center rounded-full bg-card px-2 text-[11px] font-medium text-muted-foreground ring-1 ring-border">
                          {slide.title}
                        </span>
                      </div>

                      <div className="relative w-[280px] h-[280px] overflow-hidden rounded-xl border border-muted bg-muted mx-auto">
                        <Image
                          src={slide.image}
                          alt={slide.title}
                          unoptimized
                          fill
                          style={{ objectFit: 'contain' }}
                        />
                      </div>

                      <p className="mt-4 text-base text-muted-foreground leading-relaxed">
                        {slide.description}
                      </p>
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </SwiperWrapper>
          </div>

          <style jsx global>{`
            .course__install-ios__slider .swiper-pagination {
              display: flex;
              justify-content: center;
              gap: 0.5rem;
              margin-top: 1.5rem;
              position: relative;
            }
            .course__install-ios__slider .swiper-pagination-bullet {
              width: 4px;
              height: 4px;
              border-radius: 9999px;
              background: #d4d4d8;
              opacity: 1;
              transition: background 0.2s, width 0.2s;
              margin: 0 !important;
            }
            .course__install-ios__slider .swiper-pagination-bullet-active {
              background: var(--foreground);
              width: 28px;
            }
          `}</style>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default InstallPwaButton
