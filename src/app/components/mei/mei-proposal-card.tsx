'use client'

import type {
  MeiProposal,
  ProposalStatus,
} from '@/app/(app)/(logged-in-out)/servicos/(servicos)/mei/minhas-propostas/types'
import { cn } from '@/lib/utils'
import Image from 'next/image'
import Link from 'next/link'

// Re-exportar tipos para manter compatibilidade com imports existentes
export type { MeiProposal, ProposalStatus }

interface MeiProposalCardProps {
  proposal: MeiProposal
  className?: string
}

function getStatusText(status: ProposalStatus): string {
  const texts: Record<ProposalStatus, string> = {
    aprovada: 'Proposta aprovada',
    em_analise: 'Proposta em análise',
    recusada: 'Proposta recusada',
    concluida: 'Serviço concluído',
  }
  return texts[status]
}

function getStatusColor(status: ProposalStatus): string {
  const colors: Record<ProposalStatus, string> = {
    aprovada: 'text-success',
    em_analise: 'text-chart-1',
    recusada: 'text-destructive',
    concluida: 'text-muted-foreground',
  }
  return colors[status]
}

export function MeiProposalCard({ proposal, className }: MeiProposalCardProps) {
  return (
    <Link
      href={`/servicos/mei/${proposal.opportunitySlug}`}
      className={cn(
        'w-full rounded-xl overflow-hidden bg-background cursor-pointer group',
        // Mobile: horizontal layout
        'flex gap-3',
        // Desktop (>=576px): vertical layout
        'sm:flex-col sm:gap-0',
        className
      )}
    >
      {/* Image container */}
      <div
        className={cn(
          'relative shrink-0 overflow-hidden rounded-xl bg-muted',
          // Mobile: fixed size square
          'w-26 h-26',
          // Desktop: full width, fixed height
          'sm:w-full sm:h-[120px]'
        )}
      >
        {proposal.coverImage ? (
          <Image
            src={proposal.coverImage}
            alt={proposal.title}
            fill
            className="object-cover transition-transform duration-300 ease-in-out group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-primary/10">
            <span className="text-2xl font-bold text-primary">
              {proposal.title.charAt(0)}
            </span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      {/* Content */}
      <div
        className={cn(
          'flex-1 flex flex-col justify-center min-w-0',
          // Mobile
          'py-2',
          // Desktop
          'sm:py-2'
        )}
      >
        <h3 className="text-sm font-medium text-foreground line-clamp-2">
          {proposal.title}
        </h3>
        <p className={cn('text-xs mt-1', getStatusColor(proposal.status))}>
          {getStatusText(proposal.status)}
        </p>
      </div>
    </Link>
  )
}
