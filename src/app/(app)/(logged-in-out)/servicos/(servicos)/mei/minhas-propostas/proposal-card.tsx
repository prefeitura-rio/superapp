'use client'

import { cn } from '@/lib/utils'
import Image from 'next/image'
import Link from 'next/link'
import type { MeiProposal, ProposalStatus } from './types'

interface ProposalCardProps {
  proposal: MeiProposal
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

export function ProposalCard({ proposal }: ProposalCardProps) {
  return (
    <Link
      href={`/servicos/mei/${proposal.opportunitySlug}`}
      className="flex gap-3 py-4 group"
    >
      {/* Image container */}
      <div className="relative shrink-0 overflow-hidden rounded-xl bg-muted w-26 h-26">
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
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col justify-center min-w-0">
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
