'use client'

import { SearchButton } from '@/app/components/search-button'
import { WalletContent } from '@/app/components/wallet-content'
import { WalletContentLoadingSkeleton } from '@/app/components/wallet-page-loading-skeleton'
import { getWalletDataInfo } from '@/lib/wallet-utils'
import { useQuery } from '@tanstack/react-query'
import { Suspense } from 'react'
import EmptyWallet from './empty-wallet'

type WalletData = {
  walletData: any
  maintenanceRequests: any[] | null
  healthUnitData: any
  healthUnitRiskData: any
  pets: any[]
}

async function fetchWalletData(): Promise<WalletData> {
  const res = await fetch('/api/user/wallet', { cache: 'no-store' })
  if (!res.ok) throw new Error('Failed to fetch wallet data')
  return res.json()
}

export function WalletPageClient() {
  const { data, isLoading } = useQuery({
    queryKey: ['wallet'],
    queryFn: fetchWalletData,
    staleTime: 5 * 60 * 1000, // 5 minutes — won't refetch on route change while fresh
  })

  if (isLoading) {
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

  const walletInfo = getWalletDataInfo(
    walletData,
    maintenanceRequests?.length ?? 0
  )

  if (!walletInfo?.hasData && pets.length === 0) {
    return <EmptyWallet />
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
          pets={pets}
          walletData={walletData}
          maintenanceRequests={maintenanceRequests ?? undefined}
          healthUnitData={healthUnitData}
          healthUnitRiskData={healthUnitRiskData}
        />
      </Suspense>
    </section>
  )
}
