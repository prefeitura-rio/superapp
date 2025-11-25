'use client'

import { useEffect, useState } from 'react'
import CarteiraSection from './wallet-section'
import CarteiraSectionSwipe, {
  CarteiraSectionSwipeSkeleton,
} from './wallet-section-swipe'
import { ResponsiveWrapper } from '@/components/ui/custom/responsive-wrapper'
import type {
  ModelsCitizenWallet,
  ModelsMaintenanceRequest,
} from '@/http/models'
import type { RiskStatusProps } from '@/types/health'
import { getMaintenanceRequestStats } from '@/lib/maintenance-requests-utils'
import { getWalletDataInfo } from '@/lib/wallet-utils'

interface WalletData {
  walletData?: ModelsCitizenWallet
  maintenanceRequests?: ModelsMaintenanceRequest[]
  healthCardData?: {
    href: string
    title: string
    name?: string
    statusLabel: string
    statusValue: string
    extraLabel: string
    extraValue: string
    address?: string
    phone?: string
    email?: string
    risco?: RiskStatusProps
  }
}

export default function WalletSectionClient() {
  const [walletData, setWalletData] = useState<WalletData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [shouldShowWallet, setShouldShowWallet] = useState(false)

  useEffect(() => {
    async function fetchWalletData() {
      try {
        const response = await fetch('/api/user/wallet', {
          cache: 'no-store',
        })
        if (response.ok) {
          const data = await response.json()
          setWalletData(data)

          // Calculate if wallet should be shown
          const maintenanceStats = getMaintenanceRequestStats(
            data.maintenanceRequests || []
          )
          const walletInfo = getWalletDataInfo(
            data.walletData,
            maintenanceStats.total
          )
          setShouldShowWallet(walletInfo.hasData)
        } else {
          console.error('Failed to fetch wallet data:', response.status)
        }
      } catch (error) {
        console.error('Error fetching wallet data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchWalletData()
  }, [])

  if (isLoading) {
    return (
      <ResponsiveWrapper
        mobileComponent={null}
        desktopComponent={<CarteiraSectionSwipeSkeleton />}
        desktopSkeletonComponent={<CarteiraSectionSwipeSkeleton />}
      />
    )
  }

  if (!shouldShowWallet || !walletData) {
    return null
  }

  return (
    <ResponsiveWrapper
      mobileComponent={
        <CarteiraSection
          walletData={walletData.walletData}
          maintenanceRequests={walletData.maintenanceRequests}
          healthCardData={walletData.healthCardData}
        />
      }
      desktopComponent={
        <CarteiraSectionSwipe
          walletData={walletData.walletData}
          maintenanceRequests={walletData.maintenanceRequests}
          healthCardData={walletData.healthCardData}
        />
      }
      desktopSkeletonComponent={<CarteiraSectionSwipeSkeleton />}
    />
  )
}

