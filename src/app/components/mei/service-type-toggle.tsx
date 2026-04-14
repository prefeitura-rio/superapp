'use client'

import { cn } from '@/lib/utils'
import Link from 'next/link'

type ServiceType = 'empregabilidade' | 'mei' | 'cursos'

interface ServiceTypeToggleProps {
  activeType: ServiceType
}

const ALL_TABS = [
  { id: 'empregabilidade', label: 'Empregos', href: '/servicos/empregos/' },
  { id: 'mei', label: 'MEI', href: '/servicos/mei' },
  { id: 'cursos', label: 'Cursos', href: '/servicos/cursos' },
] as const

export function ServiceTypeToggle({ activeType }: ServiceTypeToggleProps) {
  const flag = process.env.NEXT_PUBLIC_FEATURE_FLAG ?? 'false'
  const isProduction = flag !== 'false'

  // Em staging, mostra toggle com todos os serviços
  if (!isProduction) {
    return (
      <div className="flex mt-8 items-center bg-card rounded-full p-1 w-full">
        {ALL_TABS.map(tab => (
          <Link
            key={tab.id}
            href={tab.href}
            className={cn(
              'flex-1 py-3 leading-5 rounded-full text-sm font-normal transition-colors text-center',
              activeType === tab.id
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {tab.label}
          </Link>
        ))}
      </div>
    )
  }

  // Em produção, calcula quais abas estão habilitadas
  const enabled = flag.split(',').map(s => s.trim())
  const visibleTabs = ALL_TABS.filter(tab =>
    tab.id === 'empregabilidade'
      ? enabled.includes('empregos')
      : enabled.includes(tab.id)
  )

  // Com apenas 1 serviço habilitado não há necessidade de toggle
  if (visibleTabs.length <= 1) return null

  return (
    <div className="flex mt-8 items-center bg-card rounded-full p-1 w-full">
      {visibleTabs.map(tab => (
        <Link
          key={tab.id}
          href={tab.href}
          className={cn(
            'flex-1 py-3 leading-5 rounded-full text-sm font-normal transition-colors text-center',
            activeType === tab.id
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          {tab.label}
        </Link>
      ))}
    </div>
  )
}
