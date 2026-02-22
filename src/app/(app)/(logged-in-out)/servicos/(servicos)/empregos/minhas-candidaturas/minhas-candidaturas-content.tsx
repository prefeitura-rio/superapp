'use client'

import { SecondaryHeader } from '@/app/components/secondary-header'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import Link from 'next/link'
import * as React from 'react'
import type { CandidaturaCardData, StatusUi } from './minhas-candidaturas-utils'

const STATUS_CONFIG: Record<StatusUi, { label: string; className: string }> = {
  vaga_encerrada: {
    label: 'Vaga encerrada',
    className: 'bg-foreground-light/20 text-foreground',
  },
  vaga_descontinuada: {
    label: 'Vaga descontinuada',
    className: 'bg-foreground-light/20 text-foreground',
  },
  em_analise: {
    label: 'Em análise',
    className: 'bg-primary-focused text-white',
  },
  aprovado: {
    label: 'Aprovado',
    className: 'bg-wallet-2b text-white',
  },
  nao_selecionado: {
    label: 'Não selecionado',
    className: 'bg-foreground-light/20 text-foreground',
  },
}

function CandidaturaCard({
  candidatura,
}: { candidatura: CandidaturaCardData }) {
  const [progress, setProgress] = React.useState(0)
  const statusConfig = STATUS_CONFIG[candidatura.status]
  const hasEtapas = candidatura.totalEtapas > 0
  const etapaAtualComEnvio = candidatura.etapaAtual + 1
  const totalEtapasComEnvio = candidatura.totalEtapas + 1
  const targetProgress = hasEtapas
    ? (etapaAtualComEnvio / totalEtapasComEnvio) * 100
    : 0

  React.useEffect(() => {
    const timer = setTimeout(() => setProgress(targetProgress), 300)
    return () => clearTimeout(timer)
  }, [targetProgress])

  const href = candidatura.idVaga
    ? `/servicos/empregos/${candidatura.idVaga}`
    : undefined

  const cardContent = (
    <>
      <div>
        <Badge
          className={`${statusConfig.className} text-xs font-normal rounded-full px-3 py-1`}
        >
          {statusConfig.label}
        </Badge>
      </div>

      <div className="flex-1 flex flex-col justify-center">
        <h3 className="text-base font-medium leading-5 line-clamp-1 text-foreground">
          {candidatura.titulo}
        </h3>
        <p className="text-foreground text-xs font-normal leading-4 line-clamp-1 mt-0.5">
          {candidatura.empresa}
        </p>
      </div>

      {hasEtapas ? (
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-foreground-light font-normal">
              Seu Progresso
            </span>
            <span className="text-xs text-foreground-light font-normal">
              {etapaAtualComEnvio}/{totalEtapasComEnvio} Etapas
            </span>
          </div>
          <Progress value={progress} className="h-1.5 bg-popover-line" />
        </div>
      ) : (
        <p className="text-xs text-foreground-light font-normal">
          Esta vaga não possui etapas.
        </p>
      )}
    </>
  )

  if (href) {
    return (
      <Link
        href={href}
        className="bg-card rounded-3xl p-4 flex flex-col gap-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ring-offset-2"
      >
        {cardContent}
      </Link>
    )
  }

  return (
    <div className="bg-card rounded-3xl p-4 flex flex-col gap-4">
      {cardContent}
    </div>
  )
}

interface MinhasCandidaturasContentProps {
  candidaturas: CandidaturaCardData[]
  hasError: boolean
}

export function MinhasCandidaturasContent({
  candidaturas,
  hasError,
}: MinhasCandidaturasContentProps) {
  const hasCandidaturas = candidaturas.length > 0

  return (
    <main className="max-w-4xl min-h-lvh mx-auto text-foreground pb-10">
      <SecondaryHeader fixed={false} title="Minhas candidaturas" />

      <div className="px-4">
        {hasError ? (
          <p className="text-foreground font-medium">
            Não foi possível carregar suas candidaturas. Tente novamente.
          </p>
        ) : !hasCandidaturas ? (
          <p className="text-3xl text-foreground font-medium leading-9 text-left">
            Você ainda não possui candidaturas enviadas
          </p>
        ) : (
          <div className="flex flex-col gap-2 md:grid md:grid-cols-2">
            {candidaturas.map(candidatura => (
              <CandidaturaCard key={candidatura.id} candidatura={candidatura} />
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
