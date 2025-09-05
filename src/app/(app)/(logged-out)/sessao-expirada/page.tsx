'use client'

import govbrLogo from '@/assets/govbr.svg'
import { ThemeAwareVideo } from '@/components/ui/custom/theme-aware-video'
import { REDIRECT_DIRECT_TO_GOVBR_ROUTE } from '@/constants/url'
import { VIDEO_SOURCES } from '@/constants/videos-sources'
import { useViewportHeight } from '@/hooks/useViewport'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function SessionExpired() {
  const { isBelowBreakpoint } = useViewportHeight(648)
  const router = useRouter()

  const handleNavigation = () => {
    // Check if the referrer is from the same domain (our website B)
    const currentDomain = window.location.origin
    const referrerDomain = document.referrer
      ? new URL(document.referrer).origin
      : null

    // Only go back if the referrer is from the same domain
    if (referrerDomain === currentDomain) {
      console.log('Same domain detected, using router.back()')
      try {
        router.back()
      } catch {
        router.push('/')
      }
    } else {
      //External domain or no referrer, navigating to home
      router.push('/')
    }
  }

  return (
    <div className="max-w-xl min-h-lvh mx-auto pt-16 md:pt-16 flex flex-col overflow-y-hidden">
      <div className="px-4">
        <ThemeAwareVideo
          source={VIDEO_SOURCES.sessionExpired}
          containerClassName="mb-4 md:mb-8 flex items-center justify-center h-[min(328px,50vh)] max-h-[328px]"
        />
        <h2 className="text-2xl text-center font-semibold text-foreground mb-1">
          Sessão Expirada
        </h2>
        <p
          className={`text-muted-foreground text-center text-sm md:text-base ${isBelowBreakpoint ? 'mb-6' : 'mb-10'}`}
        >
          Por questões de segurança, você foi deslogado do portal. Faça login
          novamente com o botão abaixo.
        </p>
        {/* Gov.br Login Section */}
        <div className="px-4 w-full space-y-1">
          <p className="text-center text-sm text-foreground-light font-normal">
            Entre com a sua conta gov.br
          </p>

          {/* Gov.br Button - Figma Specs */}
          <div className="flex justify-center pb-2">
            <Link
              href={REDIRECT_DIRECT_TO_GOVBR_ROUTE}
              className="flex w-[216px] h-[55px] px-6 py-4 justify-center items-center gap-3 rounded-2xl bg-card-gov transition-colors"
            >
              <Image
                src={govbrLogo}
                alt="Gov.br"
                width={80}
                height={30}
                className="object-contain"
              />
            </Link>
          </div>

          {/* Create Account Link */}
          <div className="text-center mb-8">
            <button
              type="button"
              onClick={handleNavigation}
              className="text-sm text-muted-foreground font-normal cursor-pointer"
            >
              Continuar sem fazer login
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
