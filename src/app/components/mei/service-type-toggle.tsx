'use client'

import { cn } from '@/lib/utils'
import Link from 'next/link'

type ServiceType = 'empregabilidade' | 'mei' | 'cursos'

interface ServiceTypeToggleProps {
  activeType: ServiceType
}

export function ServiceTypeToggle({ activeType }: ServiceTypeToggleProps) {
  const isProduction = process.env.NEXT_PUBLIC_FEATURE_FLAG === 'true'

  // Em produção, não mostra o toggle
  if (isProduction) {
    return null
  }

  // Em staging, mostra toggle com Empregabilidade, MEI e Cursos
  return (
    <div className="flex mt-12 items-center bg-card rounded-full p-1 w-full">
      <Link
        href="/servicos/empregos/"
        className={cn(
          'flex-1 py-3 leading-5 rounded-full text-sm font-normal transition-colors text-center',
          activeType === 'empregabilidade'
            ? 'bg-primary text-primary-foreground'
            : 'text-muted-foreground hover:text-foreground'
        )}
      >
        Empregos
      </Link>
      <Link
        href="/servicos/mei"
        className={cn(
          'flex-1 py-3 leading-5 rounded-full text-sm font-normal transition-colors text-center',
          activeType === 'mei'
            ? 'bg-primary text-primary-foreground'
            : 'text-muted-foreground hover:text-foreground'
        )}
      >
        MEI
      </Link>
      <Link
        href="/servicos/cursos"
        className={cn(
          'flex-1 py-3 rounded-full leading-5 text-sm font-normal transition-colors text-center',
          activeType === 'cursos'
            ? 'bg-primary text-primary-foreground'
            : 'text-foreground hover:text-foreground'
        )}
      >
        Cursos
      </Link>
    </div>
  )
}
