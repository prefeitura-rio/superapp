'use client'

import { CustomButton } from '@/components/ui/custom/custom-button'
import { ThemeAwareVideo } from '@/components/ui/custom/theme-aware-video'
import { VIDEO_SOURCES } from '@/constants/videos-sources'
import confetti from 'canvas-confetti'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

interface SuccessSlideProps {
  onFinish: () => void
}

export const SuccessSlide = ({ onFinish }: SuccessSlideProps) => {
  const [visible, setVisible] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const timerShow = setTimeout(() => setVisible(true), 50)

    const timerConfetti = setTimeout(() => {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.7 },
      })
    }, 1000)

    return () => {
      clearTimeout(timerShow)
      clearTimeout(timerConfetti)
    }
  }, [])

  const handleFinish = () => {
    onFinish()
  }

  return (
    <div
      className={`flex flex-col justify-between w-full space-y-20 text-center transform transition-all duration-700 ease-out ${
        visible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'
      }`}
    >
      <div className="space-y-8">
        <ThemeAwareVideo
          source={VIDEO_SOURCES.course}
          containerClassName="mb-15 mt-10 flex items-center justify-center h-[min(328px,40vh)] max-h-[328px]"
        />

        <div className="space-y-2 text-left">
          <h2 className="text-3xl font-medium text-foreground mb-2 leading-9 tracking-tight">
            Inscrição enviada
          </h2>
          <p className="text-foreground-light text-sm max-w-sm font-normal leading-5 tracking-normal">
            Obrigado por submeter sua inscrição! Ela será analisada e você
            receberá uma resposta por email
          </p>
        </div>
      </div>

      <CustomButton
        onClick={handleFinish}
        className="w-full py-3 bg-primary text-background rounded-full font-medium hover:bg-primary/90"
      >
        Finalizar
      </CustomButton>
    </div>
  )
}
