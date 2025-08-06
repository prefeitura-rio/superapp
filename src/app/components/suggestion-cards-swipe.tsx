'use client'

import { SwiperWrapper } from '@/components/ui/custom/swiper-wrapper'
import { Skeleton } from '@/components/ui/skeleton'
import { suggestedBanners } from '@/constants/banners'
import { useEffect, useState } from 'react'

interface SuggestionCardsProps {
  isLoggedIn: boolean
  userName?: string
}

export function SuggestionCardsSwipeSkeleton() {
  return (
    <>
      {/* Mobile */}
      <div className="relative w-full overflow-x-auto overflow-y-hidden pb-3 no-scrollbar sm:hidden">
        <div className="overflow-x-auto no-scrollbar">
          <div className="flex gap-2 px-4 py-2 w-max">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={`mobile-${i}`} className="flex flex-col">
                <Skeleton className="w-full h-[104px] rounded-xl min-w-[328px]" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Desktop */}
      <div className="px-4 pb-0 mb-0 overflow-x-hidden mt-2 hidden sm:block">
        <div className="grid grid-cols-2 gap-2">
          <div className="flex flex-col">
            <Skeleton className="w-full h-[104px] rounded-xl min-w-[328px]" />
          </div>
          <div className="flex flex-col">
            <Skeleton className="w-full h-[104px] rounded-xl min-w-[328px]" />
          </div>
        </div>
        <div className="justify-center items-center h-12 w-full flex">
          <div className="flex items-center gap-1.5">
            <Skeleton className="w-2 h-1.5 rounded-full" />
            <Skeleton className="w-2 h-1.5 rounded-full" />
            <Skeleton className="w-2 h-1.5 rounded-full" />
          </div>
        </div>
      </div>
    </>
  )
}

export function SuggestionCardsSwipe({
  isLoggedIn,
  userName,
}: SuggestionCardsProps) {
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    setIsLoaded(true)
  }, [])

  // Filter out LoginBanner for logged-out users
  const filteredBanners = !isLoggedIn
    ? suggestedBanners.filter(banner => banner.id !== 'update')
    : suggestedBanners.filter(banner => banner.id !== 'login')

  if (!isLoaded) {
    return <SuggestionCardsSwipeSkeleton />
  }

  return (
    <div className="px-4 pb-3 overflow-x-hidden">
      <div className="pb-0">
        <SwiperWrapper showArrows={true} showPagination={true}>
          {Array.from(
            { length: Math.ceil(filteredBanners.length / 2) },
            (_, slideIndex) => {
              const startIndex = slideIndex * 2
              const slideBanners = filteredBanners.slice(
                startIndex,
                startIndex + 2
              )

              return (
                <div
                  key={`slide-${slideIndex}`}
                  className="grid grid-cols-2 gap-2 py-2"
                >
                  {slideBanners.map(banner => {
                    const BannerComponent = banner.component as React.FC<{
                      userName?: string
                    }>

                    return (
                      <BannerComponent
                        key={banner.id}
                        {...(userName && { userName })}
                      />
                    )
                  })}

                  {/* Placeholder para slides com apenas 1 banner */}
                  {slideBanners.length === 1 && (
                    <div className="flex items-center justify-center opacity-0" />
                  )}
                </div>
              )
            }
          )}
        </SwiperWrapper>
      </div>
    </div>
  )
}
