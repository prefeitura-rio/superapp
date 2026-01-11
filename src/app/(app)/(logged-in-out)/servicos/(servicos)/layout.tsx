'use client'

import { ServiceTypeToggle } from '@/app/components/mei/service-type-toggle'
import { usePathname } from 'next/navigation'

export default function ServicosLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const pathname = usePathname()

  // Determina qual tipo está ativo baseado na rota
  const activeType = pathname?.includes('/servicos/cursos') ? 'cursos' : 'mei'

  // Só mostra o toggle nas rotas específicas
  const shouldShowToggle =
    pathname === '/servicos/cursos' || pathname === '/servicos/mei'

  return (
    <div>
      {shouldShowToggle && (
        <div className="max-w-4xl mx-auto pt-12 pb-0 px-4">
          <div className="mb-12 mt-2">
            <ServiceTypeToggle activeType={activeType} />
          </div>
        </div>
      )}
      <main>{children}</main>
    </div>
  )
}
