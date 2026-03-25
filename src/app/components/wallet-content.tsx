'use client'

import { WalletCardsWrapper } from '@/app/components/wallet-cards-wrapper'
import { PetCard } from '@/app/components/wallet-cards/pet-wallet'
import { WalletTabs } from '@/app/components/wallet-tabs'
import petsEmptyImage from '@/assets/dog-pet.svg'
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
  const isPetsView = searchParams.get('pets') === 'true'

  return (
    <div className="pt-2">
      <WalletTabs activeTab={isPetsView ? 'pets' : 'cards'} />

      <div className="mt-6">
        {isPetsView ? (
          <div className="max-w-xl mx-auto pb-10">
            <div className="z-50">
              <div className="flex flex-col gap-4">
                {pets.length > 0 ? (
                  pets.map(pet => (
                    <PetCard
                      key={pet.id_animal}
                      petData={pet}
                      enableFlip={false}
                      asLink
                      showInitialShine
                      href={`/carteira/pet/${pet.id_animal}`}
                    />
                  ))
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
            </div>
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
