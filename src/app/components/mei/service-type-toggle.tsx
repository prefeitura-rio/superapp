'use client'

import { cn } from '@/lib/utils'
import Link from 'next/link'

type ServiceType = 'mei' | 'cursos'

interface ServiceTypeToggleProps {
  activeType: ServiceType
}

export function ServiceTypeToggle({ activeType }: ServiceTypeToggleProps) {
  return (
    <div className="flex items-center bg-muted rounded-full p-1 w-full">
      <Link
        href="/servicos/mei"
        className={cn(
          'flex-1 py-2 rounded-full text-sm font-medium transition-colors text-center',
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
          'flex-1 py-2 rounded-full text-sm font-medium transition-colors text-center',
          activeType === 'cursos'
            ? 'bg-primary text-primary-foreground'
            : 'text-muted-foreground hover:text-foreground'
        )}
      >
        Cursos
      </Link>
    </div>
  )
}
