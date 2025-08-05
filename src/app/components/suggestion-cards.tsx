'use client'

import { suggestedBanners } from '@/constants/banners'

interface SuggestionCardsProps {
  isLoggedIn: boolean
}

export default function SuggestionCards({ isLoggedIn }: SuggestionCardsProps) {
  // Filter out LoginBanner for logged-out users
  const filteredBanners = !isLoggedIn
    ? suggestedBanners.filter(banner => banner.id !== 'update')
    : suggestedBanners.filter(banner => banner.id !== 'login')

  return (
    <div className="relative w-full overflow-x-auto overflow-y-hidden pb-3 no-scrollbar">
      <div className="overflow-x-auto no-scrollbar">
        <div className="flex gap-2 px-4 py-2 w-max">
          {filteredBanners.map(banner => {
            const BannerComponent = banner.component
            return <BannerComponent key={banner.id} />
          })}
        </div>
      </div>
    </div>
  )
}
