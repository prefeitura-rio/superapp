'use client'

import { Skeleton } from '@/components/ui/skeleton'
import { suggestedBanners } from '@/constants/banners'
import { useAuthStatus } from '@/providers/auth-status-provider'
import { sendGAEvent } from '@next/third-parties/google'

export default function SuggestionCards() {
  const { isLoggedIn, isLoading } = useAuthStatus()

  // Show skeleton while loading to reserve space and avoid layout shift
  if (isLoading || isLoggedIn === null) {
    return (
      <div className="relative w-full overflow-x-auto overflow-y-hidden pb-3 no-scrollbar">
        <div className="overflow-x-auto no-scrollbar">
          <div className="flex gap-2 px-4 py-2 w-max">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={`mobile-skeleton-${i}`} className="flex flex-col">
                <Skeleton className="w-full h-[120px] rounded-xl min-w-[328px]" />
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Filter out LoginBanner for logged-out users
  const filteredBanners = !isLoggedIn
    ? suggestedBanners.filter(banner => banner.id !== 'update')
    : suggestedBanners.filter(banner => banner.id !== 'login')

  const handleBannerClick = (
    banner: (typeof suggestedBanners)[0],
    position: number
  ) => {
    const ehFixo = banner.id !== 'update' && banner.id !== 'login'

    sendGAEvent('event', 'banner_click', {
      isLoggedIn,
      event_timestamp: new Date().toISOString(),
      title: banner.title,
      subtitle: banner.subtitle,
      id: banner.id,
      link: banner.route,
      position: position,
      ehFixo,
    })
  }

  return (
    <div className="relative w-full overflow-x-auto overflow-y-hidden pb-3 no-scrollbar">
      <div className="overflow-x-auto no-scrollbar">
        <div className="flex gap-2 px-4 py-2 w-max">
          {filteredBanners.map((banner, index) => {
            const BannerComponent = banner.component

            return (
              <BannerComponent
                key={banner.id}
                onBannerClick={() => handleBannerClick(banner, index + 1)}
                title={banner.title}
                subtitle={banner.subtitle}
                route={banner.route}
              />
            )
          })}
        </div>
      </div>
    </div>
  )
}
