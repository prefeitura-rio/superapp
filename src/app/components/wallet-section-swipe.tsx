'use client'

import { SwiperWrapper } from '@/components/ui/custom/swiper-wrapper'
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

interface CartereiraSectionSwipeProps {
  walletData?: ModelsCitizenWallet
  maintenanceRequests?: ModelsMaintenanceRequest[]
  pets?: ModelsPet[]
  vehicles?: WalletVehicle[]
  healthCardData?: HomeWalletHealthCardData
}

export function CarteiraSectionSwipeSkeleton() {
  return (
    <section className="mt-4 w-full overflow-x-auto sm:mt-0">
      {/* Mobile */}
      <div className="sm:hidden">
        <div className="flex items-center px-4 justify-between mb-4">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-5 w-20" />
        </div>
        <div className="relative w-full overflow-x-auto pb-2 no-scrollbar">
          <div className="flex px-4 gap-2 w-max">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={`wallet-card-mobile-${i}`} className="min-w-[300px]">
                <Skeleton className="w-[310px] h-[188px] rounded-3xl" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Desktop */}
      <div className="hidden sm:block">
        <div className="flex items-center px-4 justify-between mb-4">
          <Skeleton className="h-5 w-16 rounded-3xl" />
          <Skeleton className="h-5 w-20 rounded-3xl" />
        </div>
        <div className="px-4 pb-2">
          <div className="grid grid-cols-2 gap-2 mb-0">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={`wallet-card-desktop-${i}`} className="w-full">
                <Skeleton className="w-full h-[188px] rounded-3xl" />
              </div>
            ))}
          </div>
          <div className="justify-center items-center h-12 flex">
            <div className="flex items-center gap-1.5">
              <Skeleton className="w-2 h-1.5 rounded-full" />
              <Skeleton className="w-2 h-1.5 rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default function CarteiraSectionSwipe({
  walletData,
  maintenanceRequests,
  healthCardData,
  pets = [],
  vehicles = [],
}: CartereiraSectionSwipeProps) {
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
    return <CarteiraSectionSwipeSkeleton />
  }

  return (
    <section className="mt-6 w-full overflow-x-auto">
      <div className="flex items-center px-4 justify-between mb-4">
        <h2 className="text-md font-medium text-foreground">Carteira</h2>
      </div>

      {walletCards.length > 0 ? (
        <div className="hidden sm:block px-4 pb-4  overflow-hidden">
          <SwiperWrapper
            showArrows={true}
            showPagination={true}
            arrowsVerticalPosition="top-[45%]"
          >
            {Array.from(
              { length: Math.ceil(walletCards.length / 2) },
              (_, slideIndex) => {
                const startIndex = slideIndex * 2
                const slideCards = walletCards.slice(startIndex, startIndex + 2)

                return (
                  <div
                    key={`slide-${slideIndex}`}
                    className="grid grid-cols-2 gap-2"
                  >
                    {slideCards.map((card, cardIndex) => (
                      <div
                        key={card.key ?? `card-${startIndex + cardIndex}`}
                        className="w-full"
                      >
                        {card}
                      </div>
                    ))}
                  </div>
                )
              }
            )}
          </SwiperWrapper>
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
