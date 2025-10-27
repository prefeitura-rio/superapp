'use client'

import { useSearchParams } from 'next/navigation'
import { WalletCardsWrapper } from '@/app/components/wallet-cards-wrapper'
import { WalletTabs } from '@/app/components/wallet-tabs'
import { PetCard } from '@/app/components/wallet-cards/pet-wallet'

interface WalletContentProps {
  hasPets: boolean
  pets: any[]
  walletData: any
  maintenanceRequests: any[] | undefined
  healthUnitData: any
  healthUnitRiskData: any
}

export function WalletContent({
  hasPets,
  pets,
  walletData,
  maintenanceRequests,
  healthUnitData,
  healthUnitRiskData,
}: WalletContentProps) {
  const searchParams = useSearchParams()
  const isPetsView = searchParams.get('pets') === 'true'

  return (
    <>
      {hasPets && <WalletTabs activeTab={isPetsView ? 'pets' : 'cards'} />}

      <div className="mt-6">
        {isPetsView ? (
          <div className="min-h-lvh max-w-xl mx-auto pb-10">
            <div className="z-50">
              <div className="flex flex-col gap-4">
                {pets.length > 0 ? (
                  pets.map(pet => (
                    <PetCard
                      key={pet.id_animal}
                      petData={{ ...pet }}
                      enableFlip={false}
                      asLink
                      showInitialShine
                      href={`/carteira/pet/${pet.id_animal}`}
                    />
                  ))
                ) : (
                  <div className="flex items-center justify-center py-16">
                    <div className="text-center">
                      <p className="text-lg text-muted-foreground">
                        Nenhum pet cadastrado ainda
                      </p>
                    </div>
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
    </>
  )
}
