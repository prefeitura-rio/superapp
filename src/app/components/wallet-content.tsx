'use client'

import { PendingInviteAccordion } from '@/app/components/riomob/pending-invite-accordion'
import { WalletCardsWrapper } from '@/app/components/wallet-cards-wrapper'
import { PetCard } from '@/app/components/wallet-cards/pet-wallet'
import {
  VehicleCard,
  VehicleCardsLoadingSkeleton,
} from '@/app/components/wallet-cards/vehicle-card'
import { WalletTabs } from '@/app/components/wallet-tabs'
import petsEmptyImage from '@/assets/dog-pet.svg'
import { PlusIcon } from '@/assets/icons'
import riomobEmptyImage from '@/assets/riomob-empty-vehicle.svg'
import { useRiomobInvitations } from '@/hooks/riomob/use-riomob-invitations'
import { useRiomobQueryErrorToast } from '@/hooks/riomob/use-riomob-query-error-toast'
import { useRiomobVehicles } from '@/hooks/riomob/use-riomob-vehicles'
import type {
  ModelsCitizenWallet,
  ModelsMaintenanceRequest,
  ModelsPet,
} from '@/http/models'
import { isFeatureEnabled } from '@/lib/feature-flags'
import type { HealthUnitInfo, HealthUnitRisk } from '@/lib/health-unit'
import { cn } from '@/lib/utils'
import Image from 'next/image'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useCallback, useState } from 'react'

interface WalletContentProps {
  pets: ModelsPet[]
  walletData?: ModelsCitizenWallet
  maintenanceRequests?: ModelsMaintenanceRequest[]
  healthUnitData?: HealthUnitInfo
  healthUnitRiskData?: HealthUnitRisk
}

export function WalletContent({
  pets,
  walletData,
  maintenanceRequests,
  healthUnitData,
  healthUnitRiskData,
}: WalletContentProps) {
  const searchParams = useSearchParams()
  const riomobEnabled = isFeatureEnabled('riomob')
  const isRiomobView = riomobEnabled && searchParams.get('riomob') === 'true'
  const isPetsView = !isRiomobView && searchParams.get('pets') === 'true'
  const activeTab = isRiomobView ? 'riomob' : isPetsView ? 'pets' : 'cards'

  const {
    data: vehicles = [],
    isLoading: isLoadingVehicles,
    isError: isVehiclesError,
  } = useRiomobVehicles({ enabled: isRiomobView })
  const { data: invitations = [], isError: isInvitationsError } =
    useRiomobInvitations({
      enabled: isRiomobView,
    })

  useRiomobQueryErrorToast(
    isVehiclesError,
    'Não foi possível carregar os veículos',
    'riomob-vehicles-error'
  )
  useRiomobQueryErrorToast(
    isInvitationsError,
    'Não foi possível carregar os convites',
    'riomob-invitations-error'
  )

  const [pendingInviteCount, setPendingInviteCount] = useState(0)
  const handleInvitesChange = useCallback((count: number) => {
    setPendingInviteCount(count)
  }, [])

  const showWelcomeCard = pendingInviteCount === 0
  const showEmptyVehicleCopy = pendingInviteCount <= 1

  return (
    <div className="pt-2">
      <WalletTabs activeTab={activeTab} />

      <div className="mt-8">
        {isRiomobView ? (
          <div className="pb-10 w-full">
            <PendingInviteAccordion
              className="mb-6"
              invitations={invitations}
              onInvitesChange={handleInvitesChange}
            />

            {isLoadingVehicles ? (
              <VehicleCardsLoadingSkeleton />
            ) : vehicles.length > 0 ? (
              <div className="flex w-full flex-col items-center gap-6">
                <div className="grid w-full grid-cols-1 gap-2 min-[896px]:grid-cols-2">
                  {vehicles.map(vehicle => (
                    <VehicleCard
                      key={vehicle.id}
                      vehicle={vehicle}
                      href={`/carteira/riomob/${vehicle.id}`}
                    />
                  ))}
                </div>

                <Link
                  href="/carteira/riomob/adicionar-veiculo"
                  className="group flex flex-col items-center gap-1"
                >
                  <span className="flex size-11.5 shrink-0 items-center justify-center rounded-full bg-card transition-colors group-hover:bg-secondary">
                    <PlusIcon className="size-5.5 shrink-0 text-foreground" />
                  </span>
                  <span className="text-center text-sm font-medium leading-4 text-card-foreground">
                    Adicionar
                    <br />
                    Veículo
                  </span>
                </Link>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                {showWelcomeCard && (
                  <div className="bg-card rounded-2xl p-4 w-full">
                    <p className="text-sm font-medium leading-4 text-foreground text-left md:text-center">
                      Bem vindo ao <span className="text-primary">RioMob</span>,
                      o Registro de Veículos de Micromobilidade do Rio
                    </p>
                  </div>
                )}

                {showEmptyVehicleCopy && (
                  <>
                    <Image
                      src={riomobEmptyImage}
                      alt="Nenhum veículo cadastrado"
                      width={150}
                      height={200}
                      className={
                        showWelcomeCard
                          ? 'mt-8 object-contain'
                          : 'mt-2 object-contain'
                      }
                      priority
                    />

                    <p className="mt-2 w-full text-sm font-medium text-foreground text-center leading-4">
                      Você ainda não possui
                      <br />
                      veículos registrados
                    </p>
                  </>
                )}

                <Link
                  href="/carteira/riomob/adicionar-veiculo"
                  className={cn(
                    'group flex flex-col items-center gap-1',
                    pendingInviteCount > 1
                      ? 'mt-12 sm:mt-16'
                      : pendingInviteCount === 1
                        ? 'mt-4'
                        : 'mt-6'
                  )}
                >
                  <span className="flex size-11.5 shrink-0 items-center justify-center rounded-full bg-card transition-colors group-hover:bg-secondary">
                    <PlusIcon className="size-5.5 shrink-0 text-foreground" />
                  </span>
                  <span className="text-center text-sm font-medium leading-4 text-card-foreground">
                    Adicionar
                    <br />
                    Veículo
                  </span>
                </Link>
              </div>
            )}
          </div>
        ) : isPetsView ? (
          <div className="pb-10 w-full">
            {pets.length > 0 ? (
              <div className="grid w-full grid-cols-1 gap-2 min-[896px]:grid-cols-2">
                {pets.map(pet => (
                  <PetCard
                    key={pet.id_animal}
                    petData={pet}
                    enableFlip={false}
                    asLink
                    showInitialShine
                    href={`/carteira/pet/${pet.id_animal}`}
                    className="w-full"
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center pt-6">
                <Image
                  src={petsEmptyImage}
                  alt="Nenhum pet cadastrado"
                  width={112}
                  height={200}
                  className="object-contain"
                  priority
                />

                <div className="mt-4 px-4 text-left w-full">
                  <h2 className="text-3xl font-medium text-foreground leading-9">
                    Você ainda não tem um animal cadastrado
                  </h2>
                  <p className="mt-2 text-sm font-normal text-muted-foreground leading-5">
                    Conheça o{' '}
                    <Link
                      href="/servicos/categoria/animais/cadastro-de-animais-no-sisbicho-b5ad2d27"
                      target="_blank"
                      className="text-primary"
                    >
                      SISBICHO
                    </Link>
                  </p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <WalletCardsWrapper
            walletData={walletData}
            maintenanceRequests={maintenanceRequests}
            healthUnitData={healthUnitData}
            healthUnitRiskData={healthUnitRiskData}
          />
        )}
      </div>
    </div>
  )
}
