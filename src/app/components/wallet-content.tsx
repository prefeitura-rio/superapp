'use client'

import { PendingInviteAccordion } from '@/app/(app)/(logged-in)/carteira/riomob/components/pending-invite-accordion'
import { MOCK_VEHICLES } from '@/app/(app)/(logged-in)/carteira/riomob/mocks/vehicles'
import { WalletCardsWrapper } from '@/app/components/wallet-cards-wrapper'
import { PetCard } from '@/app/components/wallet-cards/pet-wallet'
import { VehicleCard } from '@/app/components/wallet-cards/vehicle-card'
import { WalletTabs } from '@/app/components/wallet-tabs'
import petsEmptyImage from '@/assets/dog-pet.svg'
import { PlusIcon } from '@/assets/icons'
import riomobEmptyImage from '@/assets/riomob-empty-vehicle.svg'
import type { ModelsPet } from '@/http/models'
import Image from 'next/image'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

interface WalletContentProps {
  pets: ModelsPet[]
  walletData: any
  maintenanceRequests: any[] | undefined
  healthUnitData: any
  healthUnitRiskData: any
}

export function WalletContent({
  pets,
  walletData,
  maintenanceRequests,
  healthUnitData,
  healthUnitRiskData,
}: WalletContentProps) {
  const searchParams = useSearchParams()
  const isRiomobView = searchParams.get('riomob') === 'true'
  const isPetsView = !isRiomobView && searchParams.get('pets') === 'true'
  const activeTab = isRiomobView ? 'riomob' : isPetsView ? 'pets' : 'cards'

  return (
    <div className="pt-2">
      <WalletTabs activeTab={activeTab} />

      <div className="mt-6">
        {isRiomobView ? (
          <div className="pb-10 w-full">
            <PendingInviteAccordion className="mb-6" />

            {MOCK_VEHICLES.length > 0 ? (
              <div className="flex w-full flex-col items-center gap-6">
                <div className="grid w-full grid-cols-1 gap-2 min-[896px]:grid-cols-2">
                  {MOCK_VEHICLES.map(vehicle => (
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
                  <span className="flex size-11.5 items-center justify-center rounded-full bg-card transition-colors group-hover:bg-secondary">
                    <PlusIcon className="size-5.5 text-foreground" />
                  </span>
                  <span className="text-center text-sm font-medium leading-4 text-card-foreground">
                    Adicionar
                    <br />
                    veículo
                  </span>
                </Link>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <div className="bg-card rounded-2xl p-4 w-full">
                  <p className="text-sm font-medium leading-4 text-foreground text-left md:text-center">
                    Bem vindo ao <span className="text-primary">RioMob</span>, o
                    Registro de Veículos de Micromobilidade do Rio
                  </p>
                </div>

                <Image
                  src={riomobEmptyImage}
                  alt="Nenhum veículo cadastrado"
                  width={150}
                  height={200}
                  className="mt-8 object-contain"
                  priority
                />

                <p className="mt-2 w-full text-sm font-medium text-foreground text-center leading-4">
                  Você ainda não possui
                  <br />
                  veículos registrados
                </p>

                <Link
                  href="/carteira/riomob/adicionar-veiculo"
                  className="group mt-6 flex flex-col items-center gap-1"
                >
                  <span className="flex size-11.5 items-center justify-center rounded-full bg-card transition-colors group-hover:bg-secondary">
                    <PlusIcon className="size-5.5 text-foreground" />
                  </span>
                  <span className="text-sm font-medium text-card-foreground text-center leading-4">
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
                  {/* <p className="mt-2 text-sm font-normal text-muted-foreground leading-5">
                        Adicione as informações do seu bichinho para visualizar
                        a carteira dele.
                      </p> */}
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

                {/* <div className="mt-6 px-4 w-full">
                      <Link
                        href="/carteira/pet/adicionar"
                        className="flex items-center justify-center w-full py-4 px-6 rounded-full bg-primary text-white text-sm"
                      >
                        Adicionar animal
                      </Link>
                    </div> */}
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
