'use client'

import { cn } from '@/lib/utils'
import Link from 'next/link'

type OportunidadesType = 'cursos' | 'empregabilidade'

interface OportunidadesTypeToggleProps {
  activeType: OportunidadesType
}

const TABS = [
  {
    id: 'cursos',
    label: 'Cursos',
    href: '/servicos/cursos',
  },
  {
    id: 'empregabilidade',
    label: 'Trabalho',
    href: '/servicos/trabalho/',
  },
] as const

export function OportunidadesTypeToggle({
  activeType,
}: OportunidadesTypeToggleProps) {
  return (
    <div className="flex items-center gap-1 w-full">
      {TABS.map(tab => {
        const isActive = activeType === tab.id
        return (
          <Link
            key={tab.id}
            href={tab.href}
            className={cn(
              'flex flex-1 items-center justify-center rounded-full p-3',
              'text-sm font-medium leading-4 tracking-normal text-center',
              isActive
                ? 'bg-primary text-primary-foreground shadow-[0_2px_12px_0_rgba(0,0,0,0.10)]'
                : 'bg-background text-foreground-light shadow-[0_2px_12px_0_rgba(0,0,0,0.10)]'
            )}
          >
            {tab.label}
          </Link>
        )
      })}
    </div>
  )
}
