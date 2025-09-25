'use client'

import { Skeleton } from '@/components/ui/skeleton'
import type {
  ModelsCitizenWallet,
  ModelsMaintenanceRequest,
} from '@/http/models'
import { formatRecadastramentoDate } from '@/lib/cadunico-utils'
import {
  formatMaintenanceRequestsCount,
  getMaintenanceRequestStats,
} from '@/lib/maintenance-requests-utils'
import {
  formatEducationOperatingHours,
  getOperatingStatus,
} from '@/lib/operating-status'
import {
  WALLET_CARD_TYPES,
  getCardPosition,
  sendWalletCardGAEvent,
} from '@/lib/wallet-tracking-utils'
import { getWalletDataInfo } from '@/lib/wallet-utils'
import type { RiskStatusProps } from '@/types/health'
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

  const isNormalRiskStatus = healthCardData?.risco === 'Verde'

  if (!isLoaded) {
    return <CarteiraSectionSkeleton />
  }

  return (
    <section className="mt-6 w-full overflow-x-auto">
      <div className="flex items-center px-4 justify-between mb-4">
        <h2 className="text-md font-medium text-foreground">Carteira</h2>
      </div>

      {walletInfo.hasData ? (
        <div className="relative w-full overflow-x-auto pb-2 no-scrollbar">
          <div className="flex px-4 gap-2 w-max">
            {/* Health Card - only show if wallet has health data */}
            {walletData?.saude?.clinica_familia?.indicador && (
              <div className="min-w-[300px]">
                <HealthCard
                  href="/carteira/clinica-da-familia"
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
                  riskStatus={
                    !isNormalRiskStatus ? healthCardData?.risco : undefined
                  }
                  enableFlip={false}
                  showInitialShine={false}
                  asLink
                  onClick={() =>
                    sendWalletCardGAEvent(
                      'CLÍNICA DA FAMÍLIA',
                      walletData?.saude?.clinica_familia?.nome ||
                        'Nome não disponível',
                      getCardPosition(
                        WALLET_CARD_TYPES.HEALTH,
                        walletData,
                        maintenanceStats
                      )
                    )
                  }
                />
              </div>
            )}

            {/* Card 2: Educação */}
            {walletData?.educacao?.aluno?.indicador && (
              <div className="min-w-[300px]">
                <EducationCard
                  href="/carteira/escola-de-jovens-e-adultos"
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
                  onClick={() =>
                    sendWalletCardGAEvent(
                      'ESCOLA DE JOVENS E ADULTOS',
                      walletData?.educacao?.escola?.nome || 'Não disponível',
                      getCardPosition(
                        WALLET_CARD_TYPES.EDUCATION,
                        walletData,
                        maintenanceStats
                      )
                    )
                  }
                />
              </div>
            )}

            {/* Card 3: Assistência social */}
            {walletData?.assistencia_social?.cadunico?.indicador && (
              <div className="min-w-[300px]">
                <SocialAssistanceCard
                  href="/carteira/cadunico"
                  title="CADÚNICO"
                  number={
                    walletData?.assistencia_social?.cras?.nome ||
                    'Não disponível'
                  }
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
                  onClick={() =>
                    sendWalletCardGAEvent(
                      'CADÚNICO',
                      walletData?.assistencia_social?.cras?.nome ||
                        'Não disponível',
                      getCardPosition(
                        WALLET_CARD_TYPES.SOCIAL,
                        walletData,
                        maintenanceStats
                      )
                    )
                  }
                />
              </div>
            )}

            {/* Card 4: Cuidados com a Cidade (1746) */}
            {maintenanceStats.total > 0 && (
              <div className="min-w-[300px]">
                <CaretakerCard
                  href="/carteira/cuidados-com-a-cidade"
                  title="CUIDADOS COM A CIDADE"
                  name={formatMaintenanceRequestsCount(maintenanceStats.aberto)}
                  primaryLabel="Total de chamados"
                  primaryValue={maintenanceStats.total.toString()}
                  secondaryLabel="Fechados"
                  secondaryValue={maintenanceStats.fechados.toString()}
                  showInitialShine={false}
                  enableFlip={false}
                  asLink
                  onClick={() =>
                    sendWalletCardGAEvent(
                      'CUIDADOS COM A CIDADE',
                      formatMaintenanceRequestsCount(maintenanceStats.aberto),
                      getCardPosition(
                        WALLET_CARD_TYPES.CARETAKER,
                        walletData,
                        maintenanceStats
                      )
                    )
                  }
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
