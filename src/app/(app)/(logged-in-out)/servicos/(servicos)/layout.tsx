'use client'

import { FloatNavigationWrapper } from '@/app/components/float-navigation-wrapper'
import { ServiceTypeToggle } from '@/app/components/mei/service-type-toggle'
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
    : pathname?.includes('/servicos/empregos')
      ? 'empregabilidade'
      : 'mei'

  // Só mostra o toggle e o float nav nas homes dos serviços
  const shouldShowToggle =
    pathname === '/servicos/cursos' ||
    pathname === '/servicos/mei' ||
    pathname === '/servicos/empregos' ||
    pathname === '/servicos/empregos/'

  // Determina se o toggle terá mais de 1 aba visível (staging sempre sim; produção
  // depende de quantos serviços estão listados na flag)
  const flag = process.env.NEXT_PUBLIC_FEATURE_FLAG ?? 'false'
  const isProduction = flag !== 'false'
  const enabledServicesCount = isProduction
    ? flag.split(',').filter(Boolean).length
    : 3
  const toggleHasMultipleTabs = enabledServicesCount > 1

  return (
    <AuthHeaderProvider>
      <div>
        {shouldShowToggle &&
          (toggleHasMultipleTabs ? (
            <div className="max-w-4xl mx-auto pt-12 pb-0 px-4">
              <div className="mb-5 mt-2">
                <ServiceTypeToggle activeType={activeType} />
              </div>
            </div>
          ) : (
            // Quando só há 1 serviço habilitado, o toggle não aparece mas ainda é
            // necessário um espaçamento para o conteúdo não ficar atrás do header fixo
            <div className="h-20 sm:h-24" />
          ))}
        <main>{children}</main>
        {shouldShowToggle && <FloatNavigationWrapper />}
      </div>
    </AuthHeaderProvider>
  )
}
