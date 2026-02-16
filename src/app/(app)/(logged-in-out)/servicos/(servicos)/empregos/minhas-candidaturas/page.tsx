'use client'

import { SecondaryHeader } from '@/app/components/secondary-header'
import { ChevronLeftIcon } from '@/assets/icons'
import { Badge } from '@/components/ui/badge'
import { IconButton } from '@/components/ui/custom/icon-button'
import { Progress } from '@/components/ui/progress'
import { useRouter } from 'next/navigation'
import * as React from 'react'

interface Candidatura {
  id: string
  titulo: string
  empresa: string
  status:
    | 'vaga_encerrada'
    | 'vaga_descontinuada'
    | 'em_analise'
    | 'aprovado'
    | 'nao_selecionado'
  etapaAtual: number
  totalEtapas: number
}

const STATUS_CONFIG = {
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

function CandidaturaCard({ candidatura }: { candidatura: Candidatura }) {
  const [progress, setProgress] = React.useState(0)
  const statusConfig = STATUS_CONFIG[candidatura.status]
  const targetProgress =
    (candidatura.etapaAtual / candidatura.totalEtapas) * 100

  React.useEffect(() => {
    const timer = setTimeout(() => setProgress(targetProgress), 300)
    return () => clearTimeout(timer)
  }, [targetProgress])

  return (
    <div className="bg-card rounded-3xl p-4 flex flex-col gap-4">
      {/* Badge de status */}
      <div>
        <Badge
          className={`${statusConfig.className} text-xs font-normal rounded-full px-3 py-1`}
        >
          {statusConfig.label}
        </Badge>
      </div>

      {/* Título e empresa - centralizados verticalmente e crescem para ocupar o espaço */}
      <div className="flex-1 flex flex-col justify-center">
        <h3 className="text-base font-medium leading-5 line-clamp-1 text-foreground">
          {candidatura.titulo}
        </h3>
        <p className="text-foreground text-xs font-normal leading-4 line-clamp-1 mt-0.5">
          {candidatura.empresa}
        </p>
      </div>

      {/* Barra de progresso */}
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-xs text-foreground-light font-normal">
            Seu Progresso
          </span>
          <span className="text-xs text-foreground-light font-normal">
            {candidatura.etapaAtual}/{candidatura.totalEtapas} Etapas
          </span>
        </div>
        <Progress value={progress} className="h-1.5 bg-popover-line" />
      </div>
    </div>
  )
}

export default function MinhasCandidaturasPage() {
  const router = useRouter()

  const handleBack = () => {
    router.push('/servicos/empregos/menu')
  }

  // Mock data - substituir por dados reais da API
  const candidaturas: Candidatura[] = [
    {
      id: '1',
      titulo: 'Técnico de Manutenção Industrial',
      empresa: 'CSN (Companhia Siderúrgica Nacional)',
      status: 'vaga_encerrada',
      etapaAtual: 3,
      totalEtapas: 5,
    },
    {
      id: '2',
      titulo: 'Técnico de Manutenção Industrial',
      empresa: 'CSN (Companhia Siderúrgica Nacional)',
      status: 'vaga_descontinuada',
      etapaAtual: 3,
      totalEtapas: 5,
    },
    {
      id: '3',
      titulo: 'Engenheiro de Processos Sênior (Con...',
      empresa: 'Petrobrás S.A.',
      status: 'em_analise',
      etapaAtual: 1,
      totalEtapas: 5,
    },
    {
      id: '4',
      titulo: 'Guia de Turismo Bilíngue',
      empresa: 'Prefeitura Municipal do Rio de Janeiro',
      status: 'aprovado',
      etapaAtual: 5,
      totalEtapas: 5,
    },
    {
      id: '5',
      titulo: 'Técnico de Manutenção Industrial',
      empresa: 'CSN (Companhia Siderúrgica Nacional)',
      status: 'nao_selecionado',
      etapaAtual: 1,
      totalEtapas: 5,
    },
  ]

  const hasCandidaturas = candidaturas.length > 0

  return (
    <main className="max-w-4xl min-h-lvh mx-auto text-foreground pb-10">
      <SecondaryHeader fixed={false} title="Minhas candidaturas" />

      <div className="px-4">
        {!hasCandidaturas ? (
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
