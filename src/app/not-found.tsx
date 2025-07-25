'use client'

import { CustomButton } from '@/components/ui/custom/custom-button'
import Link from 'next/link'
import { ThemeAwareVideo } from '../components/ui/custom/theme-aware-video'
import { VIDEO_SOURCES } from '../constants/videos-sources'
import { useViewportHeight } from '../hooks/useViewport'
import { SecondaryHeader } from './components/secondary-header'

export default function NotFound() {
  const { isBelowBreakpoint } = useViewportHeight(648)

  return (
    <div className="max-w-md max-h-lvh mx-auto pt-20 flex flex-col overflow-y-hidden">
      <SecondaryHeader title="" />
      <div className="px-4">
        <ThemeAwareVideo
          source={VIDEO_SOURCES.notFound}
          containerClassName="mb-8 flex items-center justify-center h-[min(328px,50vh)] max-h-[328px]"
        />
        <h2 className="text-2xl font-semibold text-foreground mb-1">
          Página não encontrada
        </h2>
        <p
          className={`text-muted-foreground ${isBelowBreakpoint ? 'mb-6' : 'mb-16'}`}
        >
          Não encontramos a página que você tentou acessar. Por favor, verifique
          o link ou retorne à pagina inicial.
        </p>
        <div className="space-y-4 mb-16">
          <CustomButton
            size="xl"
            className="rounded-full"
            variant="primary"
            fullWidth
          >
            <Link href="/">Voltar para a Home</Link>
          </CustomButton>
        </div>
      </div>
    </div>
  )
}
