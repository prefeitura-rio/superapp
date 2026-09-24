'use client'

import { FloatNavigationWrapper } from '@/app/components/float-navigation-wrapper'
import { ServiceTypeToggle } from '@/app/components/mei/service-type-toggle'
import { OportunidadesSearchPlaceholder } from '@/app/components/oportunidades/oportunidades-search-placeholder'
import { OportunidadesSubHeader } from '@/app/components/oportunidades/oportunidades-sub-header'
import { OportunidadesTypeToggle } from '@/app/components/oportunidades/oportunidades-type-toggle'
import SearchPlaceholder from '@/app/components/search-placeholder'
import { AuthHeaderProvider } from '@/providers/auth-header-provider'
import { usePathname } from 'next/navigation'

export default function ServicosLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const pathname = usePathname()

  const activeType = pathname?.includes('/servicos/cursos')
    ? 'cursos'
    : pathname?.includes('/servicos/trabalho')
      ? 'empregabilidade'
      : 'mei'

  const shouldShowToggle =
    pathname === '/servicos/cursos' ||
    pathname === '/servicos/mei' ||
    pathname === '/servicos/trabalho' ||
    pathname === '/servicos/trabalho/'

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

  const menuHref =
    activeType === 'cursos'
      ? '/servicos/cursos/opcoes'
      : '/servicos/trabalho/menu'

  const logoHref =
    activeType === 'cursos' ? '/servicos/cursos' : '/servicos/trabalho'

  const isOportunidades =
    pathname === '/servicos/cursos' ||
    pathname === '/servicos/trabalho' ||
    pathname === '/servicos/trabalho/' ||
    pathname === '/servicos/trabalho/menu' ||
    pathname === '/servicos/trabalho/menu/' ||
    pathname === '/servicos/cursos/opcoes' ||
    pathname === '/servicos/cursos/opcoes/'

  if (isOportunidades) {
    return (
      <AuthHeaderProvider>
        <div>
          <OportunidadesSubHeader menuHref={menuHref} logoHref={logoHref} />
          <div
            style={{
              background: 'linear-gradient(180deg, var(--card) 0%, var(--background) 100%)',
              backgroundSize: '100% 210px',
              backgroundRepeat: 'no-repeat',
            }}
          >
            {shouldShowToggle &&
              (toggleHasMultipleTabs ? (
                <div className="max-w-4xl mx-auto pb-0">
                  <OportunidadesSearchPlaceholder searchUrl={searchUrl} />
                  <div className="mb-5 mt-5 px-4">
                    <OportunidadesTypeToggle activeType={activeType === 'empregabilidade' ? 'empregabilidade' : 'cursos'} />
                  </div>
                </div>
              ) : (
                <div className="h-20 sm:h-24" />
              ))}
            <main>{children}</main>
            {shouldShowToggle && <FloatNavigationWrapper />}
          </div>
        </div>
      </AuthHeaderProvider>
    )
  }

  return (
    <AuthHeaderProvider>
      <div>
        {shouldShowToggle &&
          (toggleHasMultipleTabs ? (
            <div className="max-w-4xl mx-auto pb-0">
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
