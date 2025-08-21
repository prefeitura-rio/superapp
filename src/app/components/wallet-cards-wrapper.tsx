'use client'

import type { ModelsCitizenWallet } from '@/http/models'
import { formatRecadastramentoDate } from '@/lib/cadunico-utils'
import { getHealthUnitRiskStatus } from '@/lib/health-unit-utils'
import {
  formatMaintenanceRequestsCount,
  getMaintenanceRequestStats,
} from '@/lib/maintenance-requests-utils'
import {
  formatEducationOperatingHours,
  formatHealthOperatingHours,
  getHealthOperatingStatus,
  getOperatingStatus,
} from '@/lib/operating-status'
import {
  WALLET_CARD_TYPES,
  getCardPosition,
  sendWalletCardGAEvent,
} from '@/lib/wallet-tracking-utils'
import { CaretakerCard } from './wallet-cards/caretaker-card'
import { EducationCard } from './wallet-cards/education-card'
import { HealthCard } from './wallet-cards/health-card'
import { SocialAssistanceCard } from './wallet-cards/social-assistance-card'

interface WalletCardsWrapperProps {
  walletData?: ModelsCitizenWallet
  maintenanceRequests?: any[]
  healthUnitData?: any
  healthUnitRiskData?: any
}

export function WalletCardsWrapper({
  walletData,
  maintenanceRequests,
  healthUnitData,
  healthUnitRiskData,
}: WalletCardsWrapperProps) {
  // Calculate maintenance requests statistics
  const maintenanceStats = getMaintenanceRequestStats(maintenanceRequests)

  // Prepare health card data - only show if clinica_familia exists and indicador is true
  const hasHealthData =
    walletData?.saude?.clinica_familia &&
    walletData?.saude?.clinica_familia?.indicador === true

  // Only use health unit API for operating hours and risk status
  let healthStatusValue = 'Não informado'
  let healthOperatingHours = 'Não informado'
  let riskStatus = null

  if (healthUnitData) {
    healthStatusValue = getHealthOperatingStatus(
      healthUnitData.funcionamento_dia_util
    )
    healthOperatingHours = formatHealthOperatingHours(
      healthUnitData.funcionamento_dia_util
    )
  }

  if (healthUnitRiskData) {
    riskStatus = getHealthUnitRiskStatus(healthUnitRiskData)
  }

  return (
    <div className="grid w-full gap-2">
      {/* Health Card - only show if wallet has health data */}
      {hasHealthData && (
        <div>
          <HealthCard
            title="CLÍNICA DA FAMÍLIA"
            name={
              walletData!.saude!.clinica_familia!.nome || 'Nome não disponível'
            }
            primaryLabel="Status"
            primaryValue={healthStatusValue}
            secondaryLabel="Horário de Atendimento"
            secondaryValue={healthOperatingHours}
            address={walletData!.saude!.clinica_familia!.endereco}
            phone={walletData!.saude!.clinica_familia!.telefone}
            email={walletData!.saude!.clinica_familia!.email}
            riskStatus={riskStatus?.risco}
            enableFlip={false}
            asLink
            href="/carteira/clinica-da-familia"
            showInitialShine={false}
            onClick={() =>
              sendWalletCardGAEvent(
                'CLÍNICA DA FAMÍLIA',
                walletData!.saude!.clinica_familia!.nome ||
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
        <div>
          <EducationCard
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
            asLink
            enableFlip={false}
            href="/carteira/escola-de-jovens-e-adultos"
            showInitialShine={false}
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
        <div>
          <SocialAssistanceCard
            title="CADÚNICO"
            number={
              walletData?.assistencia_social?.cras?.nome || 'Não disponível'
            }
            primaryLabel="Data de recadastramento"
            primaryValue={formatRecadastramentoDate(
              walletData?.assistencia_social?.cadunico
                ?.data_limite_cadastro_atual
            )}
            unitName={walletData?.assistencia_social?.cras?.nome}
            address={walletData?.assistencia_social?.cras?.endereco}
            phone={walletData?.assistencia_social?.cras?.telefone}
            asLink
            enableFlip={false}
            href="/carteira/cadunico"
            showInitialShine={false}
            onClick={() =>
              sendWalletCardGAEvent(
                'CADÚNICO',
                walletData?.assistencia_social?.cras?.nome || 'Não disponível',
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
        <div>
          <CaretakerCard
            title="CUIDADOS COM A CIDADE"
            name={formatMaintenanceRequestsCount(maintenanceStats.aberto)}
            primaryLabel="Total de chamados"
            primaryValue={maintenanceStats.total.toString()}
            secondaryLabel="Fechados"
            secondaryValue={maintenanceStats.fechados.toString()}
            showInitialShine={false}
            enableFlip={false}
            asLink
            href="/carteira/cuidados-com-a-cidade"
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
  )
}
