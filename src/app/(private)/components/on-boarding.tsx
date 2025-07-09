'use client'

import { useRef, useState, useTransition } from 'react'
import 'swiper/css'
import 'swiper/css/pagination'
import { Pagination } from 'swiper/modules'
import { Swiper, type SwiperRef, SwiperSlide } from 'swiper/react'

import { ChevronLeftIcon } from '@/assets/icons'
import { Button } from '@/components/ui/button'
import { CustomButton } from '@/components/ui/custom/custom-button'
import { onboardingSlides } from '@/constants/onboarding-slides'
import { WelcomeMessage } from './welcome-message'

interface OnboardingProps {
  userInfo: {
    cpf: string
    name: string
  }
  setFirstLoginFalse: (cpf: string) => Promise<any>
}

const TRANSITIONS = {
  FADE: 600,
  WELCOME: 4000,
} as const

export default function Onboarding({
  userInfo,
  setFirstLoginFalse,
}: OnboardingProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showSlides, setShowSlides] = useState(true)
  const [slidesFadingOut, setSlidesFadingOut] = useState(false)
  const [showWelcome, setShowWelcome] = useState(false)
  const [fadeOutWelcome, setFadeOutWelcome] = useState(false)
  const swiperRef = useRef<SwiperRef>(null)
  const [isPending, startTransition] = useTransition()

  const handleNext = () => {
    swiperRef.current?.swiper?.slideNext()
  }

  const handleBack = () => {
    swiperRef.current?.swiper?.slidePrev()
  }

  // Shows slides, then fades it out and show WelcomeMessage for 4 seconds
  const goToWelcome = () => {
    setSlidesFadingOut(true)

    setTimeout(() => {
      setShowSlides(false)
      setShowWelcome(true)

      setTimeout(() => {
        setFadeOutWelcome(true)
        setTimeout(() => {
          startTransition(async () => {
            await setFirstLoginFalse(userInfo.cpf)
            // TODO: revalidate rather than reload
            setTimeout(() => window.location.reload(), TRANSITIONS.FADE)
          })
        }, TRANSITIONS.FADE)
      }, TRANSITIONS.WELCOME)
    }, TRANSITIONS.FADE)
  }

  const showBackButton = currentIndex > 0
  const showFinishButton = currentIndex === onboardingSlides.length - 1
  const showSkipButton = currentIndex < onboardingSlides.length - 1

  return (
    <div className="relative min-h-lvh w-full mx-auto px-4 py-5 bg-white text-foreground flex flex-col justify-center overflow-hidden">
      {/* Slides container - shows first */}
      {showSlides && (
        <>
          {showBackButton && (
            <CustomButton
              className="absolute top-4 left-4 z-10 bg-[#F1F1F4] text-muted-foreground rounded-full w-11 h-11 hover:bg-[#F1F1F4]/80 outline-none focus:ring-0"
              onClick={handleBack}
              disabled={isPending}
            >
              <ChevronLeftIcon className="text-black" />
            </CustomButton>
          )}
          <div
            className={`transition-opacity duration-600 ${
              slidesFadingOut ? 'opacity-0' : 'opacity-100'
            }`}
            style={{
              animation:
                showSlides && !slidesFadingOut
                  ? 'fadeIn 600ms ease-in-out'
                  : undefined,
            }}
          >
            <Swiper
              ref={swiperRef}
              spaceBetween={50}
              slidesPerView={1}
              onSlideChange={swiper => setCurrentIndex(swiper.activeIndex)}
              pagination={{ clickable: true }}
              modules={[Pagination]}
              className="h-full"
            >
              {onboardingSlides.map((slide, idx) => (
                <SwiperSlide key={idx}>
                  <div className="flex flex-col items-start justify-center text-left h-full">
                    <div className="mb-4" style={{ width: 350, height: 350 }}>
                      <video
                        src={slide.video}
                        width={350}
                        height={350}
                        style={{
                          objectFit: 'contain',
                          width: '100%',
                          height: '100%',
                        }}
                        loop
                        autoPlay
                        muted
                        playsInline
                      />
                    </div>
                    <h2 className="text-4xl text-[#09090B] font-medium mb-2 text-left">
                      {slide.title}
                    </h2>
                    <p className="text-left text-[#A1A1A1] mb-6 pb-6 text-sm">
                      {slide.description}
                    </p>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
            <div className="pt-16">
              <CustomButton
                className="w-full text-white px-8 py-3 rounded-full shadow-md bg-[#13335A] hover:bg-[#13335A]/80"
                size="lg"
                onClick={showFinishButton ? goToWelcome : handleNext}
                variant="primary"
                disabled={isPending}
              >
                {showFinishButton ? 'Concluir' : 'Próximo'}
              </CustomButton>
              <Button
                className={`w-full text-muted-foreground bg-transparent px-8 py-3 rounded-lg shadow-none cursor-pointer hover:bg-transparent transition-opacity duration-300 ${
                  showSkipButton
                    ? 'opacity-100'
                    : 'opacity-0 pointer-events-none'
                }`}
                size="lg"
                onClick={goToWelcome}
                disabled={isPending}
              >
                Pular
              </Button>
            </div>
          </div>
        </>
      )}

      {/* Welcome message - shows after slides */}
      <WelcomeMessage
        userInfo={userInfo}
        show={showWelcome}
        fadeOut={fadeOutWelcome}
      />

      {/* Custom Swiper pagination styles */}
      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .swiper-pagination {
          display: flex;
          justify-content: left;
          gap: 0.5rem;
        }
        .swiper-pagination-bullet {
          width: 6px;
          height: 6px;
          border-radius: 9999px;
          background: #D4D4D8;
          opacity: 1;
          transition: background 0.2s;
          margin: 0 !important;
        }
        .swiper-pagination-bullet-active {
          background: #09090B;
          width: 24px;
        }
      `}</style>
    </div>
  )
}
