'use client'

import { SearchButton } from '@/app/components/search-button'
import { WalletContent } from '@/app/components/wallet-content'
import { WalletContentLoadingSkeleton } from '@/app/components/wallet-page-loading-skeleton'
import type { WalletApiResponse } from '@/lib/wallet-api-types'
import { useQuery } from '@tanstack/react-query'
import { Suspense } from 'react'

async function fetchWalletData(): Promise<WalletApiResponse> {
  const res = await fetch('/api/user/wallet', { cache: 'no-store' })
  if (!res.ok) throw new Error('Failed to fetch wallet data')
  return res.json()
}

export function WalletPageClient() {
  const { data, isLoading: isLoadingWallet } = useQuery({
    queryKey: ['wallet'],
    queryFn: fetchWalletData,
    staleTime: 5 * 60 * 1000,
  })

  if (isLoadingWallet) {
    return (
      <section className="pb-30 relative h-full px-4">
        <div className="flex items-center justify-between pt-6 pb-4">
          <h2 className="relative z-10 bg-background text-2xl font-bold text-foreground">
            Carteira
          </h2>
          <SearchButton />
        </div>
        <WalletContentLoadingSkeleton />
      </section>
    )
  }

  const {
    walletData,
    maintenanceRequests,
    healthUnitData,
    healthUnitRiskData,
    pets,
  } = data ?? {
    walletData: undefined,
    maintenanceRequests: [],
    healthUnitData: undefined,
    healthUnitRiskData: undefined,
    pets: [],
  }

  return (
    <section className="pb-30 relative h-full px-4">
      <div className="flex items-center justify-between pt-6 pb-4">
        <h2 className="relative z-10 bg-background text-2xl font-bold text-foreground">
          Carteira
        </h2>
        <SearchButton />
      </div>

      <Suspense>
        <WalletContent
          pets={pets ?? []}
          walletData={walletData ?? undefined}
          maintenanceRequests={maintenanceRequests ?? undefined}
          healthUnitData={healthUnitData ?? undefined}
          healthUnitRiskData={healthUnitRiskData ?? undefined}
        />
      </Suspense>
    </section>
  )
}
