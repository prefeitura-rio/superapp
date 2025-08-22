// import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
// import { usePWA } from '@/providers/pwa-provider'
// import { sendGAEvent } from '@next/third-parties/google'
// import { Download } from 'lucide-react'
// import Image from 'next/image'
// import { useState } from 'react'
// import 'swiper/css'
// import 'swiper/css/pagination'
// import { Pagination } from 'swiper/modules'
// import { Swiper, SwiperSlide } from 'swiper/react'
// import { MenuItem } from './menu-item'

// const iosSlides = [
//   {
//     title: 'Passo 1',
//     description: 'Toque no ícone de compartilhamento no Safari.',
//     image: '/ios1.png',
//   },
//   {
//     title: 'Passo 2',
//     description: 'Selecione "Adicionar à Tela de Início".',
//     image: '/ios2.png',
//   },
//   {
//     title: 'Passo 3',
//     description: 'Confirme para adicionar o app à sua tela inicial.',
//     image: '/ios3.png',
//   },
// ]

// const isIOS = () => {
//   if (typeof window === 'undefined' || typeof navigator === 'undefined')
//     return false
//   return /iphone|ipad|ipod/i.test(navigator.userAgent)
// }

// const InstallPwaButton = () => {
//   const { deferredPrompt, isInstallable, clearPrompt } = usePWA()
//   const [showIosDialog, setShowIosDialog] = useState(false)

//   const handleInstallClick = async () => {
//     sendGAEvent('event', 'PWA_button_click', {
//       event_timestamp: new Date().toISOString(),
//     })
//     //    if (isIOS()) {
//     if (true) {
//       setShowIosDialog(true)
//       return
//     }

//     if (deferredPrompt) {
//       try {
//         deferredPrompt.prompt()
//         const { outcome } = await deferredPrompt.userChoice
//         console.log(`Manual install prompt result: ${outcome}`)
//         if (outcome === 'accepted') {
//           sendGAEvent('event', 'PWA_install_accept', {
//             event_timestamp: new Date().toISOString(),
//           })
//           clearPrompt()
//         } else {
//           sendGAEvent('event', 'PWA_install_reject', {
//             event_timestamp: new Date().toISOString(),
//           })
//         }
//       } catch (error) {
//         console.error('Error showing install prompt:', error)
//         // If there's an error with the deferred prompt, clear it
//         clearPrompt()
//       }
//     }
//   }

//   // Show install button if installable or if on iOS
//   const shouldShowButton = isInstallable || isIOS()

//   return (
//     <>
//       {shouldShowButton && (
//         <MenuItem
//           icon={<Download className="h-5 w-5" />}
//           label="Instalar App"
//           onClick={handleInstallClick}
//         />
//       )}
//       <Dialog open={showIosDialog} onOpenChange={setShowIosDialog}>
//         <DialogContent
//           showCloseButton
//           className="flex flex-col items-center justify-center"
//         >
//           <DialogTitle className="text-center w-full">
//             Como instalar no iPhone
//           </DialogTitle>
//           <Swiper
//             spaceBetween={30}
//             slidesPerView={1}
//             pagination={{ clickable: true }}
//             modules={[Pagination]}
//             className="w-full max-w-xs flex flex-col items-center justify-center"
//           >
//             {iosSlides.map((slide, idx) => (
//               <SwiperSlide key={idx}>
//                 <div className="flex flex-col items-center justify-center text-center w-full">
//                   <div
//                     className="mb-4 flex items-center justify-center rounded-lg"
//                     style={{ width: 300, height: 300, zIndex: 999 }}
//                   >
//                     <Image
//                       src={slide.image}
//                       alt={slide.title}
//                       unoptimized
//                       width={300}
//                       height={230}
//                       style={{
//                         objectFit: 'contain',
//                         width: '100%',
//                         height: '100%',
//                       }}
//                     />
//                   </div>
//                   <h2 className="text-lg text-foreground font-semibold mb-2">
//                     {slide.title}
//                   </h2>
//                   <p className="text-base text-black mb-6 pb-6">
//                     {slide.description}
//                   </p>
//                 </div>
//               </SwiperSlide>
//             ))}
//           </Swiper>
//           <style jsx global>{`
//             .swiper-pagination {
//               display: flex;
//               justify-content: center;
//               gap: 0.5rem;
//             }
//             .swiper-pagination-bullet {
//               width: 16px;
//               height: 3px;
//               border-radius: 9999px;
//               background: #19191b;
//               opacity: 1;
//               transition: background 0.2s;
//               margin: 0 !important;
//             }
//             .swiper-pagination-bullet-active {
//               background: #8ecaff;
//             }
//           `}</style>
//         </DialogContent>
//       </Dialog>
//     </>
//   )
// }

// export default InstallPwaButton

// import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
// import { usePWA } from '@/providers/pwa-provider'
// import { sendGAEvent } from '@next/third-parties/google'
// import { Download } from 'lucide-react'
// import Image from 'next/image'
// import { useState } from 'react'
// import 'swiper/css'
// import 'swiper/css/pagination'
// import { Pagination } from 'swiper/modules'
// import { Swiper, SwiperSlide } from 'swiper/react'
// import { ChevronRightIcon } from '@/assets/icons'
// import { MenuItem } from './menu-item'

// const iosSlides = [
//   {
//     title: 'Passo 1',
//     description: 'Toque no ícone de compartilhamento no Safari.',
//     image: '/ios1.png',
//   },
//   {
//     title: 'Passo 2',
//     description: 'Selecione "Adicionar à Tela de Início".',
//     image: '/ios2.png',
//   },
//   {
//     title: 'Passo 3',
//     description: 'Confirme para adicionar o app à sua tela inicial.',
//     image: '/ios3.png',
//   },
// ]

// const isIOS = () => {
//   if (typeof window === 'undefined' || typeof navigator === 'undefined')
//     return false
//   return /iphone|ipad|ipod/i.test(navigator.userAgent)
// }

// const InstallPwaButton = () => {
//   const { deferredPrompt, isInstallable, clearPrompt } = usePWA()
//   const [showIosDialog, setShowIosDialog] = useState(false)

//   const handleInstallClick = async () => {
//     sendGAEvent('event', 'PWA_button_click', {
//       event_timestamp: new Date().toISOString(),
//     })
//     if (true) {
//       setShowIosDialog(true)
//       return
//     }

//     if (deferredPrompt) {
//       try {
//         deferredPrompt.prompt()
//         const { outcome } = await deferredPrompt.userChoice
//         if (outcome === 'accepted') {
//           sendGAEvent('event', 'PWA_install_accept', {
//             event_timestamp: new Date().toISOString(),
//           })
//           clearPrompt()
//         } else {
//           sendGAEvent('event', 'PWA_install_reject', {
//             event_timestamp: new Date().toISOString(),
//           })
//         }
//       } catch (error) {
//         console.error('Error showing install prompt:', error)
//         clearPrompt()
//       }
//     }
//   }

//   const shouldShowButton = isInstallable || isIOS()

//   return (
//     <>
//       {shouldShowButton && (
//         <MenuItem
//           icon={<Download className="h-5 w-5" />}
//           label="Instalar App"
//           onClick={handleInstallClick}
//         />
//       )}
//       <Dialog open={showIosDialog} onOpenChange={setShowIosDialog}>
//         <DialogContent
//           showCloseButton
//           className="flex flex-col items-center justify-center max-w-lg"
//         >
//           <DialogTitle className="text-center w-full text-2xl font-semibold tracking-tight mb-6">
//             Como instalar no iPhone
//           </DialogTitle>

//           <Swiper
//             spaceBetween={50}
//             slidesPerView={1}
//             pagination={{ clickable: true }}
//             modules={[Pagination]}
//             className="relative w-full h-full course__install-ios__slider"
//             allowTouchMove={true}
//           >
//             {iosSlides.map((slide, idx) => (
//               <SwiperSlide key={idx}>
//                 <div className="w-full flex flex-col items-center space-y-8 text-center">
//                   <div className="relative w-[280px] h-[280px] overflow-hidden rounded-xl border border-muted bg-muted">
//                     <Image
//                       src={slide.image}
//                       alt={slide.title}
//                       unoptimized
//                       fill
//                       style={{ objectFit: 'contain' }}
//                     />
//                   </div>

//                   <div className="space-y-3">
//                     <h2 className="text-xl font-semibold text-foreground leading-tight">
//                       {slide.title}
//                     </h2>
//                     <p className="text-base text-muted-foreground max-w-sm mx-auto leading-relaxed">
//                       {slide.description}
//                     </p>
//                   </div>
//                 </div>
//               </SwiperSlide>
//             ))}
//           </Swiper>

//           <style jsx global>{`
//             .course__install-ios__slider .swiper-pagination {
//               display: flex;
//               justify-content: center;
//               gap: 0.5rem;
//               margin-top: 1.5rem;
//               position: relative;
//             }
//             .course__install-ios__slider .swiper-pagination-bullet {
//               width: 4px;
//               height: 4px;
//               border-radius: 9999px;
//               background: #d4d4d8;
//               opacity: 1;
//               transition: background 0.2s, width 0.2s;
//               margin: 0 !important;
//             }
//             .course__install-ios__slider .swiper-pagination-bullet-active {
//               background: var(--foreground);
//               width: 28px;
//             }
//           `}</style>
//           <ChevronRightIcon
//             className="absolute right-4 bottom-4 h-6 w-6 text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
//             onClick={() => setShowIosDialog(false)}
//           />
//         </DialogContent>
//       </Dialog>
//     </>
//   )
// }

// export default InstallPwaButton

// import { ChevronLeftIcon, ChevronRightIcon } from '@/assets/icons'
// import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
// import { usePWA } from '@/providers/pwa-provider'
// import { sendGAEvent } from '@next/third-parties/google'
// import { Download } from 'lucide-react'
// import Image from 'next/image'
// import { useEffect, useRef, useState } from 'react'
// import 'swiper/css'
// import 'swiper/css/pagination'
// import { Pagination } from 'swiper/modules'
// import { Swiper, type SwiperRef, SwiperSlide } from 'swiper/react'
// import { MenuItem } from './menu-item'

// const iosSlides = [
//   {
//     title: 'Passo 1',
//     description: 'Toque no ícone de compartilhamento no Safari.',
//     image: '/ios1.png',
//   },
//   {
//     title: 'Passo 2',
//     description: 'Selecione "Adicionar à Tela de Início".',
//     image: '/ios2.png',
//   },
//   {
//     title: 'Passo 3',
//     description: 'Confirme para adicionar o app à sua tela inicial.',
//     image: '/ios3.png',
//   },
// ]

// const isIOS = () => {
//   if (typeof window === 'undefined' || typeof navigator === 'undefined')
//     return false
//   return /iphone|ipad|ipod/i.test(navigator.userAgent)
// }

// const IMG_W = 280
// const IMG_H = 280
// const GAP_OUTSIDE = 16 // distância para fora da imagem

// const InstallPwaButton = () => {
//   const { deferredPrompt, isInstallable, clearPrompt } = usePWA()
//   const [showIosDialog, setShowIosDialog] = useState(false)

//   const swiperRef = useRef<SwiperRef>(null)
//   const sliderWrapRef = useRef<HTMLDivElement>(null)

//   // posição dinâmica das setas (fixas) baseada na imagem do slide ativo
//   const [leftPos, setLeftPos] = useState<{ top: number; left: number }>({
//     top: 0,
//     left: 0,
//   })
//   const [rightPos, setRightPos] = useState<{ top: number; left: number }>({
//     top: 0,
//     left: 0,
//   })

//   const positionArrows = () => {
//     const wrap = sliderWrapRef.current
//     const swiper = swiperRef.current?.swiper
//     if (!wrap || !swiper) return
//     const active = swiper.slides[swiper.activeIndex] as HTMLElement | undefined
//     if (!active) return
//     const img = active.querySelector(
//       '[data-image-anchor]'
//     ) as HTMLElement | null
//     if (!img) return

//     const wrapRect = wrap.getBoundingClientRect()
//     const imgRect = img.getBoundingClientRect()
//     const top = imgRect.top - wrapRect.top + imgRect.height / 2

//     // setas fora da imagem (GAP_OUTSIDE px)
//     setLeftPos({ top, left: imgRect.left - wrapRect.left - GAP_OUTSIDE })
//     setRightPos({ top, left: imgRect.right - wrapRect.left + GAP_OUTSIDE })
//   }

//   const handleInstallClick = async () => {
//     sendGAEvent('event', 'PWA_button_click', {
//       event_timestamp: new Date().toISOString(),
//     })
//     setShowIosDialog(true)
//   }

//   useEffect(() => {
//     if (!showIosDialog) return
//     const onResize = () => positionArrows()
//     window.addEventListener('resize', onResize)
//     // pequeno tick para garantir layout após abrir o diálogo
//     const t = setTimeout(positionArrows, 0)
//     return () => {
//       window.removeEventListener('resize', onResize)
//       clearTimeout(t)
//     }
//   }, [showIosDialog])

//   const shouldShowButton = isInstallable || isIOS()

//   return (
//     <>
//       {shouldShowButton && (
//         <MenuItem
//           icon={<Download className="h-5 w-5" />}
//           label="Instalar App"
//           onClick={handleInstallClick}
//         />
//       )}

//       <Dialog open={showIosDialog} onOpenChange={setShowIosDialog}>
//         <DialogContent
//           showCloseButton
//           className="flex flex-col items-center justify-center max-w-lg"
//         >
//           <DialogTitle className="w-full text-center text-2xl font-semibold tracking-tight mb-6">
//             Como instalar no iPhone
//           </DialogTitle>

//           {/* wrapper usado como referência para posicionar as setas FIXAS */}
//           <div ref={sliderWrapRef} className="relative w-full">
//             <Swiper
//               ref={swiperRef}
//               spaceBetween={50}
//               slidesPerView={1}
//               pagination={{ clickable: true }}
//               modules={[Pagination]}
//               className="relative w-full h-full course__install-ios__slider"
//               allowTouchMove
//               onSwiper={() => setTimeout(positionArrows, 0)}
//               onSlideChange={() => positionArrows()}
//             >
//               {iosSlides.map((slide, idx) => (
//                 <SwiperSlide key={idx}>
//                   {/* bloco centralizado; textos centralizados */}
//                   <div className="w-full flex justify-center">
//                     <div className="w-[280px] text-center">
//                       {/* badge centralizada */}
//                       <div className="w-full flex justify-center mb-3">
//                         <span className="inline-flex items-center rounded-full bg-card px-2 py-0.5 text-[11px] font-medium text-muted-foreground ring-1 ring-border">
//                           {slide.title}
//                         </span>
//                       </div>

//                       {/* imagem (âncora para as setas) */}
//                       <div
//                         data-image-anchor
//                         className="relative w-[280px] h-[280px] overflow-hidden rounded-xl border border-muted bg-muted mx-auto"
//                       >
//                         <Image
//                           src={slide.image}
//                           alt={slide.title}
//                           unoptimized
//                           fill
//                           style={{ objectFit: 'contain' }}
//                         />
//                       </div>

//                       {/* descrição centralizada */}
//                       <p className="mt-4 text-base text-muted-foreground leading-relaxed">
//                         {slide.description}
//                       </p>
//                     </div>
//                   </div>
//                 </SwiperSlide>
//               ))}
//             </Swiper>

//             {/* SETAS FIXAS (fora da imagem) */}
//             <button
//               type="button"
//               aria-label="Slide anterior"
//               // onClick={() => swiperRef.current?.swiper.slidePrev()}
//               className="absolute -translate-y-1/2 z-10 p-1 text-muted-foreground hover:text-foreground transition-colors"
//               // style={{ top: leftPos.top, left: leftPos.left }}
//             >
//               <ChevronLeftIcon className="h-6 w-6" />
//             </button>

//             <button
//               type="button"
//               aria-label="Próximo slide"
//               // onClick={() => swiperRef.current?.swiper.slideNext()}
//               className="absolute -translate-y-1/2 z-10 p-1 text-muted-foreground hover:text-foreground transition-colors"
//               // style={{ top: rightPos.top, left: rightPos.left }}
//             >
//               <ChevronRightIcon className="h-6 w-6" />
//             </button>
//           </div>

//           <style jsx global>{`
//             .course__install-ios__slider .swiper-pagination {
//               display: flex;
//               justify-content: center;
//               gap: 0.5rem;
//               margin-top: 1.5rem;
//               position: relative;
//             }
//             .course__install-ios__slider .swiper-pagination-bullet {
//               width: 4px;
//               height: 4px;
//               border-radius: 9999px;
//               background: #d4d4d8;
//               opacity: 1;
//               transition: background 0.2s, width 0.2s;
//               margin: 0 !important;
//             }
//             .course__install-ios__slider .swiper-pagination-bullet-active {
//               background: var(--foreground);
//               width: 28px;
//             }
//           `}</style>
//         </DialogContent>
//       </Dialog>
//     </>
//   )
// }

// export default InstallPwaButton
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { usePWA } from '@/providers/pwa-provider'
import { sendGAEvent } from '@next/third-parties/google'
import { Download } from 'lucide-react'
import Image from 'next/image'
import { useRef, useState } from 'react'
import 'swiper/css'
import 'swiper/css/pagination'
import { type SwiperRef, SwiperSlide } from 'swiper/react'
import type { Swiper } from 'swiper/types'
import { SwiperWrapper } from '../../components/ui/custom/swiper-wrapper'
import { MenuItem } from './menu-item'

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

// Layout fixo para posicionar setas sem JS
const IMG_W = 280
const IMG_H = 280
const GAP_OUTSIDE = 16 // distância para fora da imagem
const BADGE_H = 24 // h-6
const BADGE_MB = 12 // mb-3
const IMAGE_CENTER_TOP = BADGE_H + BADGE_MB + IMG_H / 2 // 176px

const isIOS = () => {
  if (typeof window === 'undefined' || typeof navigator === 'undefined')
    return false
  return /iphone|ipad|ipod/i.test(navigator.userAgent)
}

const InstallPwaButton = () => {
  const { deferredPrompt, isInstallable, clearPrompt } = usePWA()
  const [showIosDialog, setShowIosDialog] = useState(false)
  const swiperRef = useRef<SwiperRef>(null)

  const handleInstallClick = async () => {
    sendGAEvent('event', 'PWA_button_click', {
      event_timestamp: new Date().toISOString(),
    })

    // === Mantido do componente antigo (forçando instruções iOS) ===
    // if (isIOS()) {
    if (true) {
      setShowIosDialog(true)
      return
    }
    // =============================================================

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

  // Mesma lógica do componente antigo
  const shouldShowButton = isInstallable || isIOS()

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

          {/* Wrapper relativo: as setas são irmãs do Swiper (fixas) */}
          <div className="relative w-full">
            <SwiperWrapper
              ref={swiperRef as unknown as React.RefObject<Swiper>}
              spaceBetween={30}
              slidesPerView={1}
              // pagination={{ clickable: true }}
              // modules={[Pagination]}
              showArrows={true}
              className="w-full flex flex-col items-center justify-center course__install-ios__slider"
              // allowTouchMove
            >
              {iosSlides.map((slide, idx) => (
                <SwiperSlide key={idx}>
                  <div className="w-full flex justify-center">
                    <div className="w-[280px] text-center">
                      {/* Badge “Passo X” */}
                      <div className="w-full flex justify-center items-center h-6 mb-3">
                        <span className="inline-flex h-6 items-center rounded-full bg-card px-2 text-[11px] font-medium text-muted-foreground ring-1 ring-border">
                          {slide.title}
                        </span>
                      </div>

                      {/* Imagem 280x280 */}
                      <div className="relative w-[280px] h-[280px] overflow-hidden rounded-xl border border-muted bg-muted mx-auto">
                        <Image
                          src={slide.image}
                          alt={slide.title}
                          unoptimized
                          fill
                          style={{ objectFit: 'contain' }}
                        />
                      </div>

                      {/* Descrição */}
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
