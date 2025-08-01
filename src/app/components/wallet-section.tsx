'use client'

import { Skeleton } from '@/components/ui/skeleton'
import type {
  ModelsCitizenWallet,
  ModelsMaintenanceRequest,
} from '@/http/models'
import {
  formatRecadastramentoDate,
  getCadUnicoStatus,
} from '@/lib/cadunico-utils'
import {
  formatMaintenanceRequestsCount,
  getMaintenanceRequestStats,
} from '@/lib/maintenance-requests-utils'
import {
  formatEducationOperatingHours,
  getOperatingStatus,
} from '@/lib/operating-status'
import { getWalletDataInfo } from '@/lib/wallet-utils'
import type { RiskStatusProps } from '@/types/health'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { CaretakerCard } from './wallet-cards/caretaker-card'
import { EducationCard } from './wallet-cards/education-card'
import { HealthCard } from './wallet-cards/health-card'
import { SocialAssistanceCard } from './wallet-cards/social-assistance-card'

interface CartereiraSectionProps {
  walletData?: ModelsCitizenWallet
  maintenanceRequests?: ModelsMaintenanceRequest[]
  healthCardData?: {
    href: string
    title: string
    name?: string
    statusLabel: string
    statusValue: string
    extraLabel: string
    extraValue: string
    address?: string
    phone?: string
    email?: string
    risco?: RiskStatusProps
  }
}

export function CarteiraSectionSkeleton() {
  return (
    <section className="mt-4 w-full overflow-x-auto sm:mt-0">
      <div className="flex items-center px-4 justify-between mb-4">
        <Skeleton className="h-5 w-16" />
        <Skeleton className="h-5 w-20" />
      </div>

      <div className="relative w-full overflow-x-auto pb-2 no-scrollbar">
        <div className="flex px-4 gap-2 w-max">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={`wallet-card-${i}`} className="min-w-[300px]">
              <Skeleton className="w-full h-[200px] rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default function CarteiraSection({
  walletData,
  maintenanceRequests,
  healthCardData,
}: CartereiraSectionProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  // Calculate maintenance requests statistics
  const maintenanceStats = getMaintenanceRequestStats(maintenanceRequests)

  // Get wallet data info (count and hasData)
  const walletInfo = getWalletDataInfo(walletData, maintenanceStats.total)

  useEffect(() => {
    setIsLoaded(true)
  }, [])

  if (!isLoaded) {
    return <CarteiraSectionSkeleton />
  }

  return (
    <section className="mt-6 w-full overflow-x-auto">
      <div className="flex items-center px-4 justify-between mb-4">
        <h2 className="text-md font-medium text-foreground">Carteira</h2>
        {walletInfo.hasData && (
          <Link
            href="/wallet"
            className="text-md text-muted-foreground cursor-pointer font-normal"
          >
            Ver mais
          </Link>
        )}
      </div>

      {walletInfo.hasData ? (
        <div className="relative w-full overflow-x-auto pb-2 no-scrollbar">
          <div className="flex px-4 gap-2 w-max">
            {/* Health Card - only show if wallet has health data */}
            {walletData?.saude?.clinica_familia && (
              <div className="min-w-[300px]">
                <HealthCard
                  href="/wallet/health"
                  title="CLÍNICA DA FAMÍLIA"
                  name={
                    walletData.saude.clinica_familia.nome ||
                    'Nome não disponível'
                  }
                  primaryLabel="Status"
                  primaryValue={healthCardData?.statusValue || 'Não informado'}
                  secondaryLabel="Horário de Atendimento"
                  secondaryValue={healthCardData?.extraValue || 'Não informado'}
                  address={walletData.saude.clinica_familia.endereco}
                  phone={walletData.saude.clinica_familia.telefone}
                  email={walletData.saude.clinica_familia.email}
                  riskStatus={healthCardData?.risco}
                  enableFlip={false}
                  showInitialShine={false}
                  asLink
                />
              </div>
            )}

            {/* Card 2: Educação */}
            {walletData?.educacao?.escola?.nome && (
              <div className="min-w-[300px]">
                <EducationCard
                  href="/wallet/education"
                  title="ESCOLA DE JOVENS E ADULTOS"
                  name={walletData?.educacao?.escola?.nome || 'Não disponível'}
                  primaryLabel="Status"
                  primaryValue={getOperatingStatus(
                    walletData?.educacao?.escola?.horario_funcionamento
                  )}
                  secondaryLabel="Horário de Atendimento"
                  secondaryValue={formatEducationOperatingHours(
                    walletData?.educacao?.escola?.horario_funcionamento
                  )}
                  address={walletData?.educacao?.escola?.endereco}
                  phone={walletData?.educacao?.escola?.telefone}
                  email={walletData?.educacao?.escola?.email}
                  enableFlip={false}
                  showInitialShine={false}
                  asLink
                />
              </div>
            )}

            {/* Card 3: Assistência social */}
            {walletData?.assistencia_social?.cras?.nome && (
              <div className="min-w-[300px]">
                <SocialAssistanceCard
                  href="/wallet/social-assistance"
                  title="CADÚNICO"
                  number={
                    walletData?.assistencia_social?.cras?.nome ||
                    'Não disponível'
                  }
                  badgeStatus={getCadUnicoStatus(
                    walletData?.assistencia_social?.cadunico
                  )}
                  primaryLabel="Data de recadastramento"
                  primaryValue={formatRecadastramentoDate(
                    walletData?.assistencia_social?.cadunico
                      ?.data_limite_cadastro_atual
                  )}
                  unitName={walletData?.assistencia_social?.cras?.nome}
                  address={walletData?.assistencia_social?.cras?.endereco}
                  phone={walletData?.assistencia_social?.cras?.telefone}
                  showInitialShine={false}
                  enableFlip={false}
                  asLink
                />
              </div>
            )}

            {/* Card 4: Cuidados com a Cidade (1746) */}
            {maintenanceStats.total > 0 && (
              <div className="min-w-[300px]">
                <CaretakerCard
                  href="/wallet/caretaker"
                  title="CUIDADOS COM A CIDADE"
                  name={formatMaintenanceRequestsCount(maintenanceStats.aberto)}
                  primaryLabel="Total de chamados"
                  primaryValue={maintenanceStats.total.toString()}
                  secondaryLabel="Fechados"
                  secondaryValue={maintenanceStats.fechados.toString()}
                  enableFlip={false}
                  showInitialShine={false}
                  asLink
                />
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center py-6">
          <p className="text-muted-foreground text-center">
            No momento sua carteira está vazia.
          </p>
        </div>
      )}
    </section>
  )
}
