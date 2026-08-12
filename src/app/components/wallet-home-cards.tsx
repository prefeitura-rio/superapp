'use client'

import type {
  ModelsCitizenWallet,
  ModelsMaintenanceRequest,
  ModelsPet,
} from '@/http/models'
import type { WalletVehicle } from '@/lib/cadmicro/types'
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
import type { RiskStatusProps } from '@/types/health'
import type { ReactElement } from 'react'
import { CaretakerCard } from './wallet-cards/caretaker-card'
import { EducationCard } from './wallet-cards/education-card'
import { HealthCard } from './wallet-cards/health-card'
import { PetCard } from './wallet-cards/pet-wallet'
import { SocialAssistanceCard } from './wallet-cards/social-assistance-card'
import { VehicleCard } from './wallet-cards/vehicle-card'

export type HomeWalletHealthCardData = {
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

export type BuildHomeWalletCardsInput = {
  walletData?: ModelsCitizenWallet
  maintenanceRequests?: ModelsMaintenanceRequest[]
  pets?: ModelsPet[]
  vehicles?: WalletVehicle[]
  healthCardData?: HomeWalletHealthCardData
}

function isDisplayablePet(pet: ModelsPet): boolean {
  return Boolean(
    pet.id_animal &&
      pet.animal_nome &&
      pet.especie_nome &&
      pet.sexo_sigla &&
      pet.raca_nome
  )
}

/** Shared card list for home Carteira (mobile strip + desktop swiper). */
export function buildHomeWalletCards({
  walletData,
  maintenanceRequests,
  pets = [],
  vehicles = [],
  healthCardData,
}: BuildHomeWalletCardsInput): ReactElement[] {
  const cards: ReactElement[] = []
  const maintenanceStats = getMaintenanceRequestStats(maintenanceRequests)

  if (walletData?.saude?.clinica_familia?.indicador) {
    const isNormalRiskStatus = healthCardData?.risco === 'Verde'
    const position = getCardPosition(
      WALLET_CARD_TYPES.HEALTH,
      walletData,
      maintenanceStats
    )

    cards.push(
      <HealthCard
        key="health"
        href="/carteira/clinica-da-familia"
        title="CLÍNICA DA FAMÍLIA"
        name={walletData.saude.clinica_familia.nome || 'Nome não disponível'}
        primaryLabel="Status"
        primaryValue={healthCardData?.statusValue || 'Não informado'}
        secondaryLabel="Horário de Atendimento"
        secondaryValue={healthCardData?.extraValue || 'Não informado'}
        address={walletData.saude.clinica_familia.endereco}
        phone={walletData.saude.clinica_familia.telefone}
        email={walletData.saude.clinica_familia.email}
        origin={walletData.saude?.clinica_familia?.fonte}
        riskStatus={!isNormalRiskStatus ? healthCardData?.risco : undefined}
        enableFlip={false}
        showInitialShine={false}
        asLink
        onClick={() =>
          sendWalletCardGAEvent(
            'CLÍNICA DA FAMÍLIA',
            walletData?.saude?.clinica_familia?.nome || 'Nome não disponível',
            position
          )
        }
      />
    )
  }

  if (walletData?.educacao?.aluno?.indicador) {
    const position = getCardPosition(
      WALLET_CARD_TYPES.EDUCATION,
      walletData,
      maintenanceStats
    )

    cards.push(
      <EducationCard
        key="education"
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
            position
          )
        }
      />
    )
  }

  if (walletData?.assistencia_social?.cadunico?.indicador) {
    const position = getCardPosition(
      WALLET_CARD_TYPES.SOCIAL,
      walletData,
      maintenanceStats
    )

    cards.push(
      <SocialAssistanceCard
        key="social"
        href="/carteira/cadunico"
        title="CADÚNICO"
        number={walletData?.assistencia_social?.cras?.nome || 'Não disponível'}
        primaryLabel="Data de recadastramento"
        primaryValue={formatRecadastramentoDate(
          walletData?.assistencia_social?.cadunico?.data_limite_cadastro_atual
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
            walletData?.assistencia_social?.cras?.nome || 'Não disponível',
            position
          )
        }
      />
    )
  }

  if (maintenanceStats.total > 0) {
    const position = getCardPosition(
      WALLET_CARD_TYPES.CARETAKER,
      walletData,
      maintenanceStats
    )

    cards.push(
      <CaretakerCard
        key="caretaker"
        href="/carteira/cuidados-com-a-cidade"
        title="CUIDADOS COM A CIDADE"
        name={formatMaintenanceRequestsCount(maintenanceStats.aberto)}
        primaryLabel="Total de chamados"
        primaryValue={maintenanceStats.total.toString()}
        secondaryLabel="Fechados"
        secondaryValue={maintenanceStats.fechados.toString()}
        enableFlip={false}
        showInitialShine={false}
        asLink
        onClick={() =>
          sendWalletCardGAEvent(
            'CUIDADOS COM A CIDADE',
            formatMaintenanceRequestsCount(maintenanceStats.aberto),
            position
          )
        }
      />
    )
  }

  for (const pet of pets.filter(isDisplayablePet)) {
    cards.push(
      <PetCard
        key={pet.id_animal}
        petData={pet}
        enableFlip={false}
        asLink
        showInitialShine={false}
        href={`/carteira/pet/${pet.id_animal}`}
      />
    )
  }

  for (const vehicle of vehicles) {
    cards.push(
      <VehicleCard
        key={vehicle.id}
        vehicle={vehicle}
        href={`/carteira/cadmicro/${vehicle.id}`}
      />
    )
  }

  return cards
}
