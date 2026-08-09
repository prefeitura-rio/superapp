'use client'

import { riomobVehiclesQueryOptions } from '@/hooks/riomob/riomob-fetch'
import type { WalletVehicle } from '@/lib/riomob/types'
import { useQuery } from '@tanstack/react-query'

export function useRiomobVehicles(options?: {
  initialData?: WalletVehicle[]
  enabled?: boolean
}) {
  return useQuery({
    ...riomobVehiclesQueryOptions(),
    initialData: options?.initialData,
    enabled: options?.enabled ?? true,
  })
}
