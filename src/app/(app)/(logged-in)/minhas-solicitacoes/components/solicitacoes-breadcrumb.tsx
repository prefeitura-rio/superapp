'use client'

import { Breadcrumb } from '@/app/components/breadcrumb'
import { useSearchParams } from 'next/navigation'
import { filterTabFromParam } from '../helpers'

const TAB_LABEL: Record<string, string> = {
  Todos: 'Todos',
  Serviços: 'Serviços',
  Ouvidoria: 'Ouvidoria',
  'Acesso à informação': 'Acesso à informação',
}

export function SolicitacoesBreadcrumb() {
  const searchParams = useSearchParams()
  const tab = filterTabFromParam(searchParams.get('filtro') ?? undefined)
  const label = (tab && TAB_LABEL[tab]) ?? 'Todos'

  return (
    <Breadcrumb
      items={[
        { label: 'Página inicial', href: '/' },
        { label: `Solicitações/${label}` },
      ]}
    />
  )
}
