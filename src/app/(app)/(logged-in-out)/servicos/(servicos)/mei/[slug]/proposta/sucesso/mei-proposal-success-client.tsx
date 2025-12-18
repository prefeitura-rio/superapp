'use client'

import { ChevronLeftIcon } from '@/assets/icons'
import { CustomButton } from '@/components/ui/custom/custom-button'
import { ThemeAwareVideo } from '@/components/ui/custom/theme-aware-video'
import { VIDEO_SOURCES } from '@/constants/videos-sources'
import confetti from 'canvas-confetti'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

interface MeiProposalSuccessClientProps {
  slug: string
}

export function MeiProposalSuccessClient({
  slug,
}: MeiProposalSuccessClientProps) {
  const router = useRouter()
  const [visible, setVisible] = useState(false)
  const [isValidAccess, setIsValidAccess] = useState(false)

  useEffect(() => {
    // Verify that user came from proposal flow
    const submitted = sessionStorage.getItem('mei_proposal_submitted')
    if (!submitted) {
      router.replace('/servicos/mei')
      return
    }
    setIsValidAccess(true)

    // Animations
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
  }, [router])

  const handleGoHome = () => {
    sessionStorage.removeItem('mei_proposal_submitted')
    router.push('/servicos/mei')
  }

  if (!isValidAccess) {
    return null
  }

  return (
    <div className="fixed inset-0 w-full bg-background flex flex-col overflow-hidden">
      <div className="w-full max-w-xl mx-auto px-4 flex flex-col h-full">
        {/* Header with back button */}
        <div className="flex-shrink-0 pt-8 pb-4">
          <CustomButton
            className="bg-card text-muted-foreground rounded-full w-11! h-11! min-h-0! p-0! hover:bg-card/80 outline-none focus:ring-0"
            onClick={handleGoHome}
          >
            <ChevronLeftIcon className="text-foreground" />
          </CustomButton>
        </div>

        {/* Content */}
        <div
          className={`flex-1 flex flex-col justify-center transform transition-all duration-700 ease-out ${
            visible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'
          }`}
        >
          <ThemeAwareVideo
            source={VIDEO_SOURCES.meiProposalSuccess}
            containerClassName="flex items-center justify-center h-[min(328px,40vh)] max-h-[328px] mb-8"
          />

          <div className="space-y-2">
            <h1 className="text-3xl font-medium text-foreground leading-tight">
              Proposta enviada!
            </h1>
            <p className="text-foreground-light text-sm leading-relaxed">
              Obrigado por submeter sua proposta! Ela será analisada e você
              receberá uma resposta por email
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 pb-12">
          <CustomButton
            onClick={handleGoHome}
            className="w-full rounded-full h-[46px] bg-primary text-background"
          >
            Voltar para Home
          </CustomButton>
        </div>
      </div>
    </div>
  )
}
