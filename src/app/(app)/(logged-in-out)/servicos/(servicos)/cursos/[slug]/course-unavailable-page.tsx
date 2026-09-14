'use client'

import { SecondaryHeader } from '@/app/components/secondary-header'
import { CustomButton } from '@/components/ui/custom/custom-button'
import { ThemeAwareVideo } from '@/components/ui/custom/theme-aware-video'
import { VIDEO_SOURCES } from '@/constants/videos-sources'
import { useViewportHeight } from '@/hooks/useViewport'
import Link from 'next/link'

export function CourseUnavailablePage() {
  const { isBelowBreakpoint } = useViewportHeight(648)

  return (
    <div className="max-w-xl max-h-lvh mx-auto pt-20 flex flex-col overflow-y-hidden">
      <SecondaryHeader title="" />
      <div className="px-4">
        <ThemeAwareVideo
          source={VIDEO_SOURCES.notFound}
          containerClassName="mb-8 flex items-center justify-center h-[min(328px,50vh)] max-h-[328px]"
        />
        <h2 className="text-2xl font-semibold text-foreground mb-1">
          Curso temporariamente indisponível
        </h2>
        <p
          className={`text-muted-foreground ${isBelowBreakpoint ? 'mb-6' : 'mb-16'}`}
        >
          Este curso está passando por uma atualização e ficará disponível em
          breve. Sua inscrição não foi afetada.
        </p>
        <div className="space-y-4 mb-16">
          <Link href="/servicos/cursos">
            <CustomButton size="xl" variant="primary" fullWidth>
              Ir para Cursos
            </CustomButton>
          </Link>
        </div>
      </div>
    </div>
  )
}
