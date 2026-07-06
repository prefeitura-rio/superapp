'use client'

import { FloatNavigationWrapper } from '@/app/components/float-navigation-wrapper'
import { ServiceTypeToggle } from '@/app/components/mei/service-type-toggle'
import SearchPlaceholder from '@/app/components/search-placeholder'
import { AuthHeaderProvider } from '@/providers/auth-header-provider'
import { usePathname } from 'next/navigation'

export default function ServicosLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const pathname = usePathname()

  // Determina qual tipo está ativo baseado na rota
  const activeType = pathname?.includes('/servicos/cursos')
    ? 'cursos'
    : pathname?.includes('/servicos/trabalho')
      ? 'empregabilidade'
      : 'mei'

  // Só mostra o toggle e o float nav nas homes dos serviços
  const shouldShowToggle =
    pathname === '/servicos/cursos' ||
    pathname === '/servicos/mei' ||
    pathname === '/servicos/trabalho' ||
    pathname === '/servicos/trabalho/'

  // Determina se o toggle terá mais de 1 aba visível (staging sempre sim; produção
  // depende de quantos serviços estão listados na flag)
  const flag = process.env.NEXT_PUBLIC_FEATURE_FLAG ?? 'false'
  const isProduction = flag !== 'false'
  const enabledServicesCount = isProduction
    ? flag.split(',').filter(Boolean).length
    : 3
  const toggleHasMultipleTabs = enabledServicesCount > 1

  const searchUrl =
    activeType === 'cursos'
      ? '/servicos/cursos/busca'
      : activeType === 'mei'
        ? '/busca?tipo=mei'
        : '/busca?tipo=empregos'

  return (
    <AuthHeaderProvider>
      <div>
        {shouldShowToggle &&
          (toggleHasMultipleTabs ? (
            <div className="max-w-4xl mx-auto pt-[74px] pb-0">
              <SearchPlaceholder searchUrl={searchUrl} />
              <div className="mb-5 mt-2 px-4">
                <ServiceTypeToggle activeType={activeType} />
              </div>
            </div>
          ) : (
            <div className="h-20 sm:h-24" />
          ))}
        <main>{children}</main>
        {shouldShowToggle && <FloatNavigationWrapper />}
      </div>
    </AuthHeaderProvider>
  )
}
