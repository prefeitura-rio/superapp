'use client'

import { useRouter } from 'next/navigation'
import { useRef, useState, useTransition } from 'react'
import 'swiper/css'
import 'swiper/css/pagination'
import type { SwiperRef } from 'swiper/react'

import { ChevronLeftIcon } from '@/assets/icons'
import { CustomButton } from '@/components/ui/custom/custom-button'
import { onboardingSlides } from '@/constants/onboarding-slides'
import { useViewportHeight } from '@/hooks/useViewport'
import { OnboardingControls } from './onboarding-controls'
import { OnboardingSlider } from './onboarding-slider'
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

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export default function Onboarding({
  userInfo,
  setFirstLoginFalse,
}: OnboardingProps) {
  const router = useRouter()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showSlides, setShowSlides] = useState(true)
  const [slidesFadingOut, setSlidesFadingOut] = useState(false)
  const [showWelcome, setShowWelcome] = useState(false)
  const [fadeOutWelcome, setFadeOutWelcome] = useState(false)
  const swiperRef = useRef<SwiperRef>(null)
  const [isPending, startTransition] = useTransition()

  const { isBelowBreakpoint } = useViewportHeight(670)

  const handleNext = () => {
    swiperRef.current?.swiper?.slideNext()
  }

  const handleBack = () => {
    swiperRef.current?.swiper?.slidePrev()
  }

  // Shows slides, then fades it out and show WelcomeMessage for 4 seconds
  const goToWelcome = async () => {
    setSlidesFadingOut(true)

    await delay(TRANSITIONS.FADE)
    setShowSlides(false)
    setShowWelcome(true)

    await delay(TRANSITIONS.WELCOME)
    setFadeOutWelcome(true)

    await delay(TRANSITIONS.FADE)
    startTransition(async () => {
      await setFirstLoginFalse(userInfo.cpf)
      // Revalidate and refresh to show the main app
      router.refresh()
    })
  }

  const showBackButton = currentIndex > 0 && showSlides && !showWelcome
  const showFinishButton = currentIndex === onboardingSlides.length - 1
  const showSkipButton = currentIndex < onboardingSlides.length - 1

  return (
    <div className="relative min-h-lvh w-full px-4 mx-auto justify-center bg-background text-foreground flex flex-col overflow-hidden">
      <div className="relative h-11 flex-shrink-0 pt-8 justify-self-start self-start w-full flex items-center">
        <CustomButton
          className={` bg-card text-muted-foreground rounded-full w-11 h-11 hover:bg-card/80 outline-none focus:ring-0 transition-all duration-300 ease-out ${
            showBackButton
              ? 'opacity-100 translate-x-0'
              : 'opacity-0 -translate-x-2 pointer-events-none'
          }`}
          onClick={handleBack}
          disabled={isPending}
        >
          <ChevronLeftIcon className="text-foreground" />
        </CustomButton>
      </div>

      <div className="flex-1 flex flex-col justify-center">
        {/* Slides container - shows first */}
        {showSlides && (
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
            <OnboardingSlider
              ref={swiperRef}
              slides={onboardingSlides}
              onSlideChange={index => setCurrentIndex(index)}
              isBelowBreakpoint={isBelowBreakpoint}
            />

            <OnboardingControls
              showFinishButton={showFinishButton}
              showSkipButton={showSkipButton}
              onNext={handleNext}
              onFinish={goToWelcome}
              onSkip={goToWelcome}
              isBelowBreakpoint={isBelowBreakpoint}
              disabled={isPending}
            />
          </div>
        )}

        {/* Welcome message - shows after slides */}
        <WelcomeMessage
          userInfo={userInfo}
          show={showWelcome}
          fadeOut={fadeOutWelcome}
        />
      </div>
    </div>
  )
}
