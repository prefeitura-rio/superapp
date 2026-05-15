'use client'

import { ResponsiveWrapper } from '@/components/ui/custom/responsive-wrapper'
import type {
  ModelsCitizenWallet,
  ModelsMaintenanceRequest,
  ModelsPet,
} from '@/http/models'
import { getHealthUnitRiskStatus } from '@/lib/health-unit-utils'
import { getMaintenanceRequestStats } from '@/lib/maintenance-requests-utils'
import {
  formatHealthOperatingHours,
  getHealthOperatingStatus,
} from '@/lib/operating-status'
import { getWalletDataInfo } from '@/lib/wallet-utils'
import { useQuery } from '@tanstack/react-query'
import CarteiraSection from './wallet-section'
import CarteiraSectionSwipe, {
  CarteiraSectionSwipeSkeleton,
} from './wallet-section-swipe'

type ApiWalletData = {
  walletData?: ModelsCitizenWallet
  maintenanceRequests?: ModelsMaintenanceRequest[]
  pets?: ModelsPet[]
  healthUnitData?: any
  healthUnitRiskData?: any
}

async function fetchWalletData(): Promise<ApiWalletData> {
  const res = await fetch('/api/user/wallet', { cache: 'no-store' })
  if (!res.ok) throw new Error('Failed to fetch wallet data')
  return res.json()
}

export default function WalletSectionClient() {
  const { data, isLoading } = useQuery({
    queryKey: ['wallet'],
    queryFn: fetchWalletData,
    staleTime: 5 * 60 * 1000,
  })

  if (isLoading) {
    return (
      <ResponsiveWrapper
        mobileComponent={null}
        desktopComponent={<CarteiraSectionSwipeSkeleton />}
        desktopSkeletonComponent={<CarteiraSectionSwipeSkeleton />}
      />
    )
  }

  if (!data) return null

  const {
    walletData,
    maintenanceRequests,
    pets,
    healthUnitData,
    healthUnitRiskData,
  } = data

  const maintenanceStats = getMaintenanceRequestStats(maintenanceRequests || [])
  const walletInfo = getWalletDataInfo(walletData, maintenanceStats.total)
  const petsCount = Array.isArray(pets) ? pets.length : 0

  if (!walletInfo.hasData && petsCount === 0) return null

  // Derive healthCardData from raw health unit data (used by CarteiraSection/CarteiraSectionSwipe)
  const riskStatus = healthUnitRiskData
    ? getHealthUnitRiskStatus(healthUnitRiskData)
    : null
  const healthCardData = {
    href: '/carteira/clinica-da-familia',
    title: 'CLÍNICA DA FAMÍLIA',
    statusLabel: 'Status',
    extraLabel: 'Horário de atendimento',
    statusValue: healthUnitData
      ? getHealthOperatingStatus(healthUnitData.funcionamento_dia_util)
      : 'Não informado',
    extraValue: healthUnitData
      ? formatHealthOperatingHours(healthUnitData.funcionamento_dia_util)
      : 'Não informado',
    risco: riskStatus?.risco,
  }

  return (
    <ResponsiveWrapper
      mobileComponent={
        <CarteiraSection
          walletData={walletData}
          maintenanceRequests={maintenanceRequests}
          healthCardData={healthCardData}
          pets={pets}
        />
      }
      desktopComponent={
        <CarteiraSectionSwipe
          walletData={walletData}
          maintenanceRequests={maintenanceRequests}
          healthCardData={healthCardData}
          pets={pets}
        />
      }
      desktopSkeletonComponent={<CarteiraSectionSwipeSkeleton />}
    />
  )
}
