'use client'

import { suggestedBanners } from '@/constants/banners'
import { sendGAEvent } from '@next/third-parties/google'

interface SuggestionCardsProps {
  isLoggedIn: boolean
}

export default function SuggestionCards({ isLoggedIn }: SuggestionCardsProps) {
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
      posicao: position,
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
              />
            )
          })}
        </div>
      </div>
    </div>
  )
}
