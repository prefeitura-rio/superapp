'use client'

import { PendingInviteAccordion } from '@/app/components/cadmicro/pending-invite-accordion'
import { WalletCardsWrapper } from '@/app/components/wallet-cards-wrapper'
import { PetCard } from '@/app/components/wallet-cards/pet-wallet'
import {
  VehicleCard,
  VehicleCardsLoadingSkeleton,
} from '@/app/components/wallet-cards/vehicle-card'
import { WalletTabs } from '@/app/components/wallet-tabs'
import cadmicroEmptyImage from '@/assets/cadmicro-empty-vehicle.svg'
import petsEmptyImage from '@/assets/dog-pet.svg'
import { PlusIcon } from '@/assets/icons'
import { useCadmicroInvitations } from '@/hooks/cadmicro/use-cadmicro-invitations'
import { useCadmicroQueryErrorToast } from '@/hooks/cadmicro/use-cadmicro-query-error-toast'
import { useCadmicroVehicles } from '@/hooks/cadmicro/use-cadmicro-vehicles'
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
  const cadmicroEnabled = isFeatureEnabled('cadmicro')
  const isCadmicroView =
    cadmicroEnabled && searchParams.get('mobilidade') === 'true'
  const isPetsView = !isCadmicroView && searchParams.get('pets') === 'true'
  const activeTab = isCadmicroView ? 'cadmicro' : isPetsView ? 'pets' : 'cards'

  const {
    data: vehicles = [],
    isLoading: isLoadingVehicles,
    isError: isVehiclesError,
  } = useCadmicroVehicles({ enabled: isCadmicroView })
  const { data: invitations = [], isError: isInvitationsError } =
    useCadmicroInvitations({
      enabled: isCadmicroView,
    })

  useCadmicroQueryErrorToast(
    isVehiclesError,
    'Não foi possível carregar os veículos',
    'cadmicro-vehicles-error'
  )
  useCadmicroQueryErrorToast(
    isInvitationsError,
    'Não foi possível carregar os convites',
    'cadmicro-invitations-error'
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
        {isCadmicroView ? (
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
                      href={`/carteira/cadmicro/${vehicle.id}`}
                    />
                  ))}
                </div>

                <Link
                  href="/carteira/cadmicro/adicionar-veiculo"
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
                      Bem vindo ao{' '}
                      <span className="text-primary">CadMicro</span>, o Registro
                      de Veículos de Micromobilidade do Rio
                    </p>
                  </div>
                )}

                {showEmptyVehicleCopy && (
                  <>
                    <Image
                      src={cadmicroEmptyImage}
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
                  href="/carteira/cadmicro/adicionar-veiculo"
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
