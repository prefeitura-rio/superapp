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

  return (
    <AuthHeaderProvider>
      <div>
        {shouldShowToggle && (
          <div className="max-w-4xl mx-auto pt-12 pb-0 px-4">
            <div className="mb-5 mt-2">
              <ServiceTypeToggle activeType={activeType} />
            </div>
          </div>
        )}
        <main>{children}</main>
        {shouldShowToggle && <FloatNavigationWrapper />}
      </div>
    </AuthHeaderProvider>
  )
}
