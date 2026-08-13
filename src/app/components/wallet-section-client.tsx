'use client'

import { ResponsiveWrapper } from '@/components/ui/custom/responsive-wrapper'
import { useCadmicroQueryErrorToast } from '@/hooks/cadmicro/use-cadmicro-query-error-toast'
import { useCadmicroVehicles } from '@/hooks/cadmicro/use-cadmicro-vehicles'
import { isFeatureEnabled } from '@/lib/feature-flags'
import { getHealthUnitRiskStatus } from '@/lib/health-unit-utils'
import { getMaintenanceRequestStats } from '@/lib/maintenance-requests-utils'
import {
  formatHealthOperatingHours,
  getHealthOperatingStatus,
} from '@/lib/operating-status'
import type { WalletApiResponse } from '@/lib/wallet-api-types'
import { getWalletDataInfo } from '@/lib/wallet-utils'
import { useAuthStatus } from '@/providers/auth-status-provider'
import { useQuery } from '@tanstack/react-query'
import CarteiraSection from './wallet-section'
import CarteiraSectionSwipe, {
  CarteiraSectionSwipeSkeleton,
} from './wallet-section-swipe'

async function fetchWalletData(): Promise<WalletApiResponse> {
  const res = await fetch('/api/user/wallet', { cache: 'no-store' })
  if (!res.ok) throw new Error('Failed to fetch wallet data')
  return res.json()
}

export default function WalletSectionClient() {
  const { isLoggedIn, isLoading: isAuthLoading } = useAuthStatus()
  const isAuthenticated = Boolean(isLoggedIn && !isAuthLoading)
  const cadmicroEnabled = isFeatureEnabled('cadmicro')

  const { data, isLoading } = useQuery({
    queryKey: ['wallet'],
    queryFn: fetchWalletData,
    staleTime: 5 * 60 * 1000,
    enabled: isAuthenticated,
  })
  const { data: vehicles = [], isError: isVehiclesError } = useCadmicroVehicles(
    {
      enabled: isAuthenticated && cadmicroEnabled,
    }
  )

  useCadmicroQueryErrorToast(
    isVehiclesError,
    'Não foi possível carregar os veículos',
    'cadmicro-vehicles-error'
  )

  if (isAuthLoading || !isLoggedIn) return null

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
  const walletInfo = getWalletDataInfo(
    walletData ?? undefined,
    maintenanceStats.total
  )
  const petsCount = Array.isArray(pets) ? pets.length : 0
  const walletVehicles = cadmicroEnabled ? vehicles : []

  if (!walletInfo.hasData && petsCount === 0 && walletVehicles.length === 0) {
    return null
  }

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
          walletData={walletData ?? undefined}
          maintenanceRequests={maintenanceRequests ?? undefined}
          healthCardData={healthCardData}
          pets={pets}
          vehicles={walletVehicles}
        />
      }
      desktopComponent={
        <CarteiraSectionSwipe
          walletData={walletData ?? undefined}
          maintenanceRequests={maintenanceRequests ?? undefined}
          healthCardData={healthCardData}
          pets={pets}
          vehicles={walletVehicles}
        />
      }
      desktopSkeletonComponent={<CarteiraSectionSwipeSkeleton />}
    />
  )
}
