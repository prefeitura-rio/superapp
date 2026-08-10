'use client'

import { VehicleCardsLoadingSkeleton } from '@/app/components/wallet-cards/vehicle-card'
import { WalletTabs } from '@/app/components/wallet-tabs'
import { isFeatureEnabled } from '@/lib/feature-flags'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function WalletContentLoadingBody({
  activeTab,
}: {
  activeTab: 'cards' | 'pets' | 'riomob'
}) {
  return (
    <div className="pt-2">
      <WalletTabs activeTab={activeTab} />
      <div className="mt-8">
        <VehicleCardsLoadingSkeleton />
      </div>
    </div>
  )
}

function WalletContentLoadingSkeletonWithParams() {
  const searchParams = useSearchParams()
  const riomobEnabled = isFeatureEnabled('riomob')
  const isRiomobView = riomobEnabled && searchParams.get('riomob') === 'true'
  const isPetsView = !isRiomobView && searchParams.get('pets') === 'true'
  const activeTab = isRiomobView ? 'riomob' : isPetsView ? 'pets' : 'cards'

  return <WalletContentLoadingBody activeTab={activeTab} />
}

/** Real [`WalletTabs`] + 3 vehicle card skeletons — matches [`WalletContent`] spacing. */
export function WalletContentLoadingSkeleton() {
  return (
    <Suspense fallback={<WalletContentLoadingBody activeTab="cards" />}>
      <WalletContentLoadingSkeletonWithParams />
    </Suspense>
  )
}
