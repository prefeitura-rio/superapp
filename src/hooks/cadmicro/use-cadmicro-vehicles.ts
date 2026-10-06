'use client'

import { cadmicroVehiclesQueryOptions } from '@/hooks/cadmicro/cadmicro-fetch'
import type { WalletVehicle } from '@/lib/cadmicro/types'
import { useQuery } from '@tanstack/react-query'

export function useCadmicroVehicles(options?: {
  initialData?: WalletVehicle[]
  enabled?: boolean
}) {
  return useQuery({
    ...cadmicroVehiclesQueryOptions(),
    initialData: options?.initialData,
    enabled: options?.enabled ?? true,
  })
}
