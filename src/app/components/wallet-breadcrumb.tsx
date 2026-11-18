'use client'

import { Breadcrumb } from '@/app/components/breadcrumb'
import { isFeatureEnabled } from '@/lib/feature-flags'
import { useSearchParams } from 'next/navigation'

export function WalletBreadcrumb() {
  const searchParams = useSearchParams()
  const cadmicroEnabled = isFeatureEnabled('cadmicro')
  const isCadmicroView =
    cadmicroEnabled && searchParams.get('mobilidade') === 'true'
  const isPetsView = !isCadmicroView && searchParams.get('pets') === 'true'

  const section = isCadmicroView ? 'Veículos' : isPetsView ? 'Pets' : 'Cartões'

  return (
    <Breadcrumb
      items={[
        { label: 'Página inicial', href: '/' },
        { label: `Documentos/${section}` },
      ]}
    />
  )
}
