'use client'

import { suggestedBanners } from '@/constants/banners'

interface SuggestionCardsProps {
  isLoggedIn: boolean
}

export default function SuggestionCards({ isLoggedIn }: SuggestionCardsProps) {
  // Filter out LoginBanner for logged-out users
  const filteredBanners = !isLoggedIn
    ? suggestedBanners
    : suggestedBanners.filter(banner => banner.id !== 'login')

  return (
    <div className="relative w-full overflow-x-auto overflow-y-hidden pb-3 no-scrollbar">
      <div className="flex gap-2 px-4 w-max py-2">
        {filteredBanners.map(banner => {
          const BannerComponent = banner.component
          return <BannerComponent key={banner.id} />
        })}
      </div>
    </div>
  )
}
