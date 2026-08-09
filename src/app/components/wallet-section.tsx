'use client'

import { Skeleton } from '@/components/ui/skeleton'
import type {
  ModelsCitizenWallet,
  ModelsMaintenanceRequest,
  ModelsPet,
} from '@/http/models'
import type { WalletVehicle } from '@/lib/riomob/types'
import { useEffect, useState } from 'react'
import {
  type HomeWalletHealthCardData,
  buildHomeWalletCards,
} from './wallet-home-cards'

interface CartereiraSectionProps {
  walletData?: ModelsCitizenWallet
  maintenanceRequests?: ModelsMaintenanceRequest[]
  pets?: ModelsPet[]
  vehicles?: WalletVehicle[]
  healthCardData?: HomeWalletHealthCardData
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
  pets = [],
  vehicles = [],
}: CartereiraSectionProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const walletCards = buildHomeWalletCards({
    walletData,
    maintenanceRequests,
    healthCardData,
    pets,
    vehicles,
  })

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
      </div>

      {walletCards.length > 0 ? (
        <div className="relative w-full overflow-x-auto pb-2 no-scrollbar">
          <div className="flex px-4 gap-2 w-max">
            {walletCards.map(card => (
              <div key={card.key} className="min-w-[300px]">
                {card}
              </div>
            ))}
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
